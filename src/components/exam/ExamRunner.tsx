import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  X,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Trophy,
  RotateCcw,
  Sparkles,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type ExamSubject = {
  id: string;
  name: string;
  icon: LucideIcon;
  questions: number;
};

type Props = {
  title: string;
  subjects: ExamSubject[];
  durationMinutes: number;
  onExit: () => void;
};

// Deterministic placeholder "correct" answer per question — used only because
// real questions will be added manually later. Replace with real grading then.
function placeholderCorrect(subjectId: string, qIndex: number) {
  let h = 0;
  const s = `${subjectId}:${qIndex}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 4;
}

export function ExamRunner({ title, subjects, durationMinutes, onExit }: Props) {
  const QPS = subjects[0]?.questions ?? 0;
  const useFallback = QPS === 0;
  // When real questions don't exist yet, render 10 placeholder slots so the
  // exam interface is fully usable for layout/UX purposes.
  const effectiveQ = useFallback ? 10 : QPS;

  const [activeSubject, setActiveSubject] = useState(0);
  const [activeQ, setActiveQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const current = subjects[activeSubject];
  const subjectAnswers = answers[current.id] ?? {};
  const totalQuestions = subjects.length * effectiveQ;
  const answeredCount = Object.values(answers).reduce(
    (acc, m) => acc + Object.keys(m).length,
    0
  );
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft < 5 * 60;

  const setAnswer = (opt: number) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { ...(prev[current.id] ?? {}), [activeQ]: opt },
    }));
  };

  const goPrev = () => {
    if (activeQ > 0) setActiveQ(activeQ - 1);
    else if (activeSubject > 0) {
      setActiveSubject(activeSubject - 1);
      setActiveQ(effectiveQ - 1);
    }
  };
  const goNext = () => {
    if (activeQ < effectiveQ - 1) setActiveQ(activeQ + 1);
    else if (activeSubject < subjects.length - 1) {
      setActiveSubject(activeSubject + 1);
      setActiveQ(0);
    }
  };

  const restart = () => {
    setAnswers({});
    setActiveSubject(0);
    setActiveQ(0);
    setSecondsLeft(durationMinutes * 60);
    setSubmitted(false);
  };

  if (submitted) {
    // Grade
    let correct = 0;
    let incorrect = 0;
    subjects.forEach((s) => {
      const subj = answers[s.id] ?? {};
      for (let i = 0; i < effectiveQ; i++) {
        const a = subj[i];
        if (a === undefined) continue;
        if (a === placeholderCorrect(s.id, i)) correct++;
        else incorrect++;
      }
    });
    const unanswered = totalQuestions - correct - incorrect;
    const percent = totalQuestions
      ? Math.round((correct / totalQuestions) * 100)
      : 0;
    const grade =
      percent >= 85
        ? { label: "A'lo", tone: "text-emerald-400" }
        : percent >= 70
        ? { label: "Yaxshi", tone: "text-primary" }
        : percent >= 50
        ? { label: "Qoniqarli", tone: "text-amber-400" }
        : { label: "Yetarli emas", tone: "text-rose-400" };

    return (
      <ResultView
        title={title}
        correct={correct}
        incorrect={incorrect}
        unanswered={unanswered}
        total={totalQuestions}
        percent={percent}
        grade={grade}
        subjects={subjects}
        answers={answers}
        effectiveQ={effectiveQ}
        onRestart={restart}
        onExit={onExit}
      />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6">
      {/* Exam topbar */}
      <div className="glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="hover:bg-white/10"
          >
            <X className="mr-1 h-4 w-4" /> Chiqish
          </Button>
          <div className="hidden text-sm text-muted-foreground md:block">
            {title} · {subjects.length} fan · {totalQuestions} savol
          </div>
        </div>
        <div
          className={[
            "flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm tabular-nums",
            lowTime
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-white/10 bg-white/5",
          ].join(" ")}
        >
          <Clock className="h-4 w-4" />
          {hh}:{mm}:{ss}
        </div>
        <Button
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="gradient-bg text-primary-foreground hover:opacity-90"
        >
          Yakunlash
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>
            Javob berilgan: {answeredCount}/{totalQuestions}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full gradient-bg transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Subject tabs (only if multi-subject) */}
      {subjects.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {subjects.map((s, i) => {
            const active = i === activeSubject;
            const ans = Object.keys(answers[s.id] ?? {}).length;
            const Icon = s.icon;
            return (
              <button
                key={s.id + i}
                onClick={() => {
                  setActiveSubject(i);
                  setActiveQ(0);
                }}
                className={[
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "gradient-bg text-primary-foreground"
                    : "glass hover:bg-white/10",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{s.name}</span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px]",
                    active ? "bg-white/20" : "bg-white/10 text-muted-foreground",
                  ].join(" ")}
                >
                  {ans}/{effectiveQ}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Question area */}
        <div className="glass rounded-2xl p-5 md:p-8">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {current.name} · Savol {activeQ + 1}/{effectiveQ}
            </span>
            <span>{useFallback ? "Demo" : "5 ball"}</span>
          </div>

          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-3 text-sm text-muted-foreground">
              Savol matni tez orada qo'shiladi.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Bu joyga {current.name} fanidan {activeQ + 1}-savol kiritiladi.
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            {(["A", "B", "C", "D"] as const).map((label, idx) => {
              const selected = subjectAnswers[activeQ] === idx;
              return (
                <button
                  key={label}
                  onClick={() => setAnswer(idx)}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition",
                      selected
                        ? "gradient-bg text-primary-foreground"
                        : "bg-white/5",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Variant {label} — matn keyinroq qo'shiladi
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              className="glass border-white/15 hover:bg-white/10"
              disabled={activeSubject === 0 && activeQ === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Oldingi
            </Button>
            <Button
              onClick={goNext}
              className="gradient-bg text-primary-foreground hover:opacity-90"
              disabled={
                activeSubject === subjects.length - 1 &&
                activeQ === effectiveQ - 1
              }
            >
              Keyingi <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation panel */}
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">{current.name}</div>
            <div className="text-xs text-muted-foreground">
              {Object.keys(subjectAnswers).length}/{effectiveQ}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {Array.from({ length: effectiveQ }).map((_, i) => {
              const answered = subjectAnswers[i] !== undefined;
              const isActive = i === activeQ;
              return (
                <button
                  key={i}
                  onClick={() => setActiveQ(i)}
                  className={[
                    "aspect-square rounded-lg text-xs font-medium transition",
                    isActive
                      ? "gradient-bg text-primary-foreground glow"
                      : answered
                      ? "bg-primary/20 text-foreground"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <Legend color="gradient-bg" label="Joriy savol" />
            <Legend color="bg-primary/20" label="Javob berilgan" />
            <Legend color="bg-white/5" label="Javobsiz" />
          </div>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Imtihonni yakunlash
            </DialogTitle>
            <DialogDescription>
              Siz {answeredCount}/{totalQuestions} ta savolga javob berdingiz.
              Yakunlangach, javoblarni o'zgartirib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="glass border-white/15 hover:bg-white/10"
              onClick={() => setConfirmOpen(false)}
            >
              Davom etish
            </Button>
            <Button
              className="gradient-bg text-primary-foreground hover:opacity-90"
              onClick={() => {
                setConfirmOpen(false);
                setSubmitted(true);
              }}
            >
              Ha, yakunlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}

function ResultView({
  title,
  correct,
  incorrect,
  unanswered,
  total,
  percent,
  grade,
  subjects,
  answers,
  effectiveQ,
  onRestart,
  onExit,
}: {
  title: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  grade: { label: string; tone: string };
  subjects: ExamSubject[];
  answers: Record<string, Record<number, number>>;
  effectiveQ: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  const ringDeg = (percent / 100) * 360;
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 pt-10">
      <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
          {/* Score ring */}
          <div className="mx-auto">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${ringDeg}deg, color-mix(in oklab, var(--foreground) 8%, transparent) ${ringDeg}deg)`,
              }}
            >
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-background">
                <span className="text-4xl font-bold gradient-text">{percent}%</span>
                <span className={`mt-1 text-xs font-semibold ${grade.tone}`}>
                  {grade.label}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-accent" /> Natija tayyor
            </div>
            <h2 className="mt-3 text-2xl font-bold md:text-4xl">{title} — yakunlandi</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Quyida sizning natijalaringiz va har bir fan bo'yicha qisqacha
              hisobot keltirilgan.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-start">
              <Button
                size="lg"
                onClick={onRestart}
                className="gradient-bg text-primary-foreground hover:opacity-90 glow"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Qayta urinish
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onExit}
                className="glass border-white/15 hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" /> Bosh menuga
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Target}
            label="Umumiy ball"
            value={`${correct * 5}/${total * 5}`}
            tone="text-foreground"
          />
          <StatCard
            icon={CheckCircle2}
            label="To'g'ri javoblar"
            value={String(correct)}
            tone="text-emerald-400"
          />
          <StatCard
            icon={XCircle}
            label="Noto'g'ri javoblar"
            value={String(incorrect)}
            tone="text-rose-400"
          />
          <StatCard
            icon={AlertTriangle}
            label="Javobsiz"
            value={String(unanswered)}
            tone="text-amber-400"
          />
        </div>
      </div>

      {/* Per-subject breakdown */}
      <div className="mt-6 grid gap-3">
        {subjects.map((s) => {
          const subj = answers[s.id] ?? {};
          let c = 0;
          let w = 0;
          for (let i = 0; i < effectiveQ; i++) {
            const a = subj[i];
            if (a === undefined) continue;
            if (a === placeholderCorrect(s.id, i)) c++;
            else w++;
          }
          const pct = effectiveQ ? Math.round((c / effectiveQ) * 100) : 0;
          const Icon = s.icon;
          return (
            <div key={s.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c} to'g'ri · {w} noto'g'ri · {effectiveQ - c - w} javobsiz
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold gradient-text">{pct}%</div>
                  <div className="text-xs text-muted-foreground">
                    {c}/{effectiveQ}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full gradient-bg transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className={`mt-2 text-2xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}