import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Home, RotateCcw, Trophy, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MathContent } from "@/components/math/MathContent";
import { supabase } from "@/integrations/supabase/client";
import type { DtmBlock, ExamKind } from "@/lib/domain";

export type SecureExamSubject = {
  id: string;
  name: string;
  icon: LucideIcon;
  block?: DtmBlock;
  pointsPerQuestion: number;
  questionCount: number;
};

type PublicQuestion = {
  id: string;
  subject_id: string;
  kind: ExamKind;
  block?: DtmBlock | null;
  points?: number | null;
  image_url?: string | null;
  text: string;
  options?: string[] | null;
  question_type?: string | null;
  passage_text?: string | null;
  group_id?: string | null;
  group_intro?: string | null;
};

type Props = {
  title: string;
  kind: ExamKind;
  subjects: SecureExamSubject[];
  durationMinutes: number;
  onExit: () => void;
};

type Result = { attempt_id: string; total: number; correct: number; incorrect: number; unanswered: number; percent: number };

export function SecureExamRunner({ title, kind, subjects, durationMinutes, onExit }: Props) {
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const start = async () => {
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("start-exam", {
      body: {
        exam_key: `${kind}:${title}`,
        exam_title: title,
        kind,
        duration_minutes: durationMinutes,
        subjects: subjects.map((s) => ({ id: s.id, block: s.block ?? null, questionCount: s.questionCount })),
      },
    });
    if (fnError || !data?.attempt_id) {
      setError(fnError?.message ?? data?.error ?? "Imtihonni boshlashda xatolik");
      return;
    }
    setAttemptId(data.attempt_id);
    setExpiresAt(data.expires_at);
    setQuestions(Array.isArray(data.questions) ? data.questions : []);
  };

  useEffect(() => {
    void start();
  }, []);

  const orderedQuestions = useMemo(() => {
    if (!questions) return [];
    const result: PublicQuestion[] = [];
    for (const subject of subjects) {
      result.push(...questions.filter((q) => q.subject_id === subject.id && (kind !== "dtm" || (q.block ?? null) === (subject.block ?? null))));
    }
    return result;
  }, [questions, subjects, kind]);

  useEffect(() => {
    if (!expiresAt || result) return;
    const tick = () => {
      if (Date.now() >= new Date(expiresAt).getTime()) void submit(true);
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, result]);

  const submit = async (_auto = false) => {
    if (!attemptId || submitting || result) return;
    setSubmitting(true);
    setError(null);
    const payload = Object.entries(answers).map(([question_id, answer_index]) => ({ question_id, answer_index }));
    const { data, error: fnError } = await supabase.functions.invoke("submit-exam", {
      body: { attempt_id: attemptId, answers: payload },
    });
    if (fnError || !data?.attempt_id) {
      setSubmitting(false);
      setError(fnError?.message ?? data?.error ?? "Natijani yuborishda xatolik");
      return;
    }
    setResult(data as Result);
    setSubmitting(false);
  };

  if (error && !questions) {
    return <section className="mx-auto max-w-3xl px-4 py-12"><div className="glass rounded-2xl p-8 text-center"><p className="text-destructive">{error}</p><Button className="mt-5" onClick={() => void start()}>Qayta urinish</Button></div></section>;
  }

  if (!questions) {
    return <section className="mx-auto max-w-3xl px-4 py-12"><div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">Imtihon tayyorlanmoqda...</div></section>;
  }

  if (result) {
    return <ResultCard title={title} result={result} onRestart={() => window.location.reload()} onExit={onExit} />;
  }

  const current = orderedQuestions[activeIndex];
  const answered = Object.keys(answers).length;
  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)) : durationMinutes * 60;
  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const selected = current ? answers[current.id] : undefined;

  if (!current) {
    return <section className="mx-auto max-w-3xl px-4 py-12"><div className="glass rounded-2xl p-8 text-center"><p className="text-muted-foreground">Bu imtihon uchun hozircha savollar mavjud emas.</p><Button className="mt-5" onClick={onExit}>Bosh menuga</Button></div></section>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6">
      <div className="glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}><X className="mr-1 h-4 w-4" /> Chiqish</Button>
        <div className="text-sm text-muted-foreground">{title} · {activeIndex + 1}/{orderedQuestions.length}</div>
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm ${secondsLeft < 300 ? "border-destructive/40 text-destructive" : "border-border bg-muted"}`}><Clock className="h-4 w-4" />{hh}:{mm}:{ss}</div>
        <Button size="sm" disabled={submitting} onClick={() => setConfirmOpen(true)} className="gradient-bg text-primary-foreground">Yakunlash</Button>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Javob berilgan: {answered}/{orderedQuestions.length}</span><span>{orderedQuestions.length ? Math.round(answered / orderedQuestions.length * 100) : 0}%</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full gradient-bg" style={{ width: `${orderedQuestions.length ? answered / orderedQuestions.length * 100 : 0}%` }} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="glass rounded-2xl p-5 md:p-8">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground"><span>{current.subject_id} · Savol {activeIndex + 1}/{orderedQuestions.length}</span><span>{Number(current.points ?? 0).toFixed(1)} ball</span></div>
          <div className="rounded-xl border border-border bg-muted/40 p-6">
            {current.image_url && <img src={current.image_url} alt="Savol rasmi" className="mx-auto mb-4 max-h-72 rounded-lg" />}
            <MathContent latex={current.text} className="text-base leading-relaxed" />
          </div>
          <div className="mt-5 grid gap-2">
            {(["A", "B", "C", "D"] as const).map((label, idx) => (
              <button key={label} onClick={() => setAnswers((a) => ({ ...a, [current.id]: idx }))} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${selected === idx ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:bg-muted"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${selected === idx ? "gradient-bg text-primary-foreground" : "bg-muted"}`}>{label}</span>
                <span className="text-sm">{current.options?.[idx] ? <MathContent latex={current.options[idx]} inline /> : `Variant ${label}`}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" disabled={activeIndex === 0} onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}><ArrowLeft className="mr-2 h-4 w-4" /> Oldingi</Button>
            <Button disabled={activeIndex === orderedQuestions.length - 1} onClick={() => setActiveIndex((i) => Math.min(orderedQuestions.length - 1, i + 1))} className="gradient-bg text-primary-foreground">Keyingi <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>

        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold">Savollar</div><div className="text-xs text-muted-foreground">{answered}/{orderedQuestions.length}</div></div>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {orderedQuestions.map((q, i) => <button key={q.id} onClick={() => setActiveIndex(i)} className={`aspect-square rounded-lg text-xs font-medium ${i === activeIndex ? "gradient-bg text-primary-foreground" : answers[q.id] !== undefined ? "bg-primary/20" : "bg-muted text-muted-foreground"}`}>{i + 1}</button>)}
          </div>
        </aside>
      </div>

      {error && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="glass border-border"><DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-accent" /> Imtihonni yakunlash</DialogTitle><DialogDescription>{answered}/{orderedQuestions.length} ta savolga javob berdingiz. Yakunlangach, javoblarni o'zgartirib bo'lmaydi.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Davom etish</Button><Button disabled={submitting} onClick={() => { setConfirmOpen(false); void submit(); }} className="gradient-bg text-primary-foreground">{submitting ? "Yuborilmoqda..." : "Ha, yakunlash"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </section>
  );
}

function ResultCard({ title, result, onRestart, onExit }: { title: string; result: Result; onRestart: () => void; onExit: () => void }) {
  const grade = result.percent >= 85 ? "A'lo" : result.percent >= 70 ? "Yaxshi" : result.percent >= 50 ? "Qoniqarli" : "Yetarli emas";
  return <section className="mx-auto max-w-4xl px-4 py-10"><div className="glass rounded-3xl p-8 text-center md:p-12"><Trophy className="mx-auto h-12 w-12 text-accent" /><h2 className="mt-4 text-3xl font-bold">{title} — yakunlandi</h2><div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4"><Stat icon={CheckCircle2} label="To'g'ri" value={String(result.correct)} /><Stat icon={XCircle} label="Noto'g'ri" value={String(result.incorrect)} /><Stat icon={AlertTriangle} label="Javobsiz" value={String(result.unanswered)} /><Stat icon={Trophy} label="Natija" value={`${result.percent}%`} /></div><p className="mt-6 text-lg text-muted-foreground">{grade}</p><div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row"><Button onClick={onRestart} className="gradient-bg text-primary-foreground"><RotateCcw className="mr-2 h-4 w-4" /> Qayta urinish</Button><Button variant="outline" onClick={onExit}><Home className="mr-2 h-4 w-4" /> Bosh menuga</Button></div></div></section>;
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-muted/50 p-4"><Icon className="mx-auto h-4 w-4 text-accent" /><div className="mt-2 text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>;
}
