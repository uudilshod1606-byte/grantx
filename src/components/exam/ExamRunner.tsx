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
import {
  questionsRepo,
  type DtmBlock,
  type ExamKind,
  type Question,
} from "@/lib/domain";
import { MathContent } from "@/components/math/MathContent";

export type ExamSubject = {
  id: string;
  name: string;
  icon: LucideIcon;
  /** DTM block (mandatory / main1 / main2). Omit for Milliy. */
  block?: DtmBlock;
  /** Points awarded per correct answer for this subject. */
  pointsPerQuestion: number;
  /** Number of questions for this subject. */
  questionCount: number;
};

type Props = {
  title: string;
  kind: ExamKind;
  subjects: ExamSubject[];
  durationMinutes: number;
  onExit: () => void;
};

export function ExamRunner({ title, kind, subjects, durationMinutes, onExit }: Props) {
  // Pull real questions from Supabase once, on mount.
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    questionsRepo
      .list()
      .then((qs) => {
        if (!cancelled) setAllQuestions(qs);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group loaded questions by subject (filtered by kind + block).
  const subjectQuestions = useMemo(() => {
    const all = allQuestions ?? [];
    const map: Record<string, Question[]> = {};
    for (const s of subjects) {
      map[s.id] = all.filter(
        (q) =>
          q.subjectId === s.id &&
          q.kind === kind &&
          (kind !== "dtm" || (q.block ?? null) === (s.block ?? null))
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions]);

  // Per-subject question count — real questions if any, otherwise planned count.
  const subjectSlots = useMemo(() => {
    return subjects.map((s) => {
      const real = subjectQuestions[s.id] ?? [];
      const count = real.length > 0 ? Math.min(real.length, s.questionCount) : s.questionCount;
      return { ...s, count };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectQuestions]);

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

  if (allQuestions === null) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          {loadError ? `Savollarni yuklashda xatolik: ${loadError}` : "Savollar yuklanmoqda..."}
        </div>
      </section>
    );
  }

  const current = subjectSlots[activeSubject];
  const currentReal = subjectQuestions[current.id] ?? [];
  const currentQuestion: Question | undefined = currentReal[activeQ];
  const subjectAnswers = answers[current.id] ?? {};
  const totalQuestions = subjectSlots.reduce((acc, s) => acc + s.count, 0);
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
      const prev = activeSubject - 1;
      setActiveSubject(prev);
      setActiveQ(subjectSlots[prev].count - 1);
    }
  };
  const goNext = () => {
    if (activeQ < current.count - 1) setActiveQ(activeQ + 1);
    else if (activeSubject < subjectSlots.length - 1) {
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
    // Grade per subject using real questions + admin-defined points.
    const breakdown = subjectSlots.map((s) => {
      const real = subjectQuestions[s.id] ?? [];
      const subj = answers[s.id] ?? {};
      let c = 0;
      let w = 0;
      let score = 0;
      let maxScore = 0;
      for (let i = 0; i < s.count; i++) {
        const q = real[i];
        const pts = q?.points ?? s.pointsPerQuestion;
        maxScore += pts;
        const a = subj[i];
        if (a === undefined) continue;
        if (q && a === q.correctIndex) {
          c++;
          score += pts;
        } else {
          w++;
        }
      }
      return { subject: s, correct: c, wrong: w, unanswered: s.count - c - w, score, maxScore };
    });

    const correct = breakdown.reduce((a, b) => a + b.correct, 0);
    const incorrect = breakdown.reduce((a, b) => a + b.wrong, 0);
    const unanswered = totalQuestions - correct - incorrect;
    const totalScore = Math.round(breakdown.reduce((a, b) => a + b.score, 0) * 10) / 10;
    const maxScore = Math.round(breakdown.reduce((a, b) => a + b.maxScore, 0) * 10) / 10;
    const percent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
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
        kind={kind}
        correct={correct}
        incorrect={incorrect}
        unanswered={unanswered}
        total={totalQuestions}
        percent={percent}
        totalScore={totalScore}
        maxScore={maxScore}
        grade={grade}
        breakdown={breakdown}
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
            {title} · {subjectSlots.length} fan · {totalQuestions} savol
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
      {subjectSlots.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {subjectSlots.map((s, i) => {
            const active = i === activeSubject;
            const ans = Object.keys(answers[s.id] ?? {}).length;
            const Icon = s.icon;
            const blockLabel =
              s.block === "mandatory"
                ? "Majburiy"
                : s.block === "main1"
                ? "1-asosiy"
                : s.block === "main2"
                ? "2-asosiy"
                : null;
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
                {blockLabel && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase ${active ? "bg-white/20" : "bg-white/10 text-muted-foreground"}`}>
                    {blockLabel}
                  </span>
                )}
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px]",
                    active ? "bg-white/20" : "bg-white/10 text-muted-foreground",
                  ].join(" ")}
                >
                  {ans}/{s.count}
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
              {current.name} · Savol {activeQ + 1}/{current.count}
            </span>
            <span>
              {(currentQuestion?.points ?? current.pointsPerQuestion).toFixed(1)} ball
            </span>
          </div>

          {currentQuestion ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              {currentQuestion.imageUrl && (
                <img
                  src={currentQuestion.imageUrl}
                  alt="Savol rasmi"
                  className="mx-auto mb-4 max-h-72 rounded-lg border border-white/10"
                />
              )}
              <MathContent
                latex={currentQuestion.text}
                className="text-base leading-relaxed"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-accent" />
              <p className="mt-3 text-sm text-muted-foreground">
                Savol matni tez orada qo'shiladi.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Bu joyga {current.name} fanidan {activeQ + 1}-savol kiritiladi.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-2">
            {(["A", "B", "C", "D"] as const).map((label, idx) => {
              const selected = subjectAnswers[activeQ] === idx;
              const optionText = currentQuestion?.options[idx];
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
                  <span className={`text-sm ${optionText ? "text-foreground" : "text-muted-foreground"}`}>
                    {optionText ? (
                      <MathContent latex={optionText} inline />
                    ) : (
                      `Variant ${label} — matn keyinroq qo'shiladi`
                    )}
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
                activeSubject === subjectSlots.length - 1 &&
                activeQ === current.count - 1
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
              {Object.keys(subjectAnswers).length}/{current.count}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {Array.from({ length: current.count }).map((_, i) => {
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

type Breakdown = {
  subject: ExamSubject & { count: number };
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  maxScore: number;
};

function ResultView({
  title,
  kind,
  correct,
  incorrect,
  unanswered,
  total,
  percent,
  totalScore,
  maxScore,
  grade,
  breakdown,
  onRestart,
  onExit,
}: {
  title: string;
  kind: ExamKind;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  totalScore: number;
  maxScore: number;
  grade: { label: string; tone: string };
  breakdown: Breakdown[];
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
                <span className="text-3xl font-bold gradient-text">{totalScore}</span>
                <span className="text-[10px] text-muted-foreground">/ {maxScore} ball</span>
                <span className={`mt-1 text-xs font-semibold ${grade.tone}`}>
                  {percent}% · {grade.label}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-accent" />
              {kind === "dtm" ? "DTM natija" : "Natija tayyor"}
            </div>
            <h2 className="mt-3 text-2xl font-bold md:text-4xl">{title} — yakunlandi</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {kind === "dtm"
                ? `Real DTM formuli bo'yicha hisoblangan ball: ${totalScore} / ${maxScore}`
                : "Har bir fan bo'yicha qisqacha hisobot quyida keltirilgan."}
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
            value={`${totalScore} / ${maxScore}`}
            tone="text-foreground"
          />
          <StatCard
            icon={CheckCircle2}
            label="To'g'ri javoblar"
            value={`${correct} / ${total}`}
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
        {breakdown.map(({ subject: s, correct: c, wrong: w, unanswered: u, score, maxScore: mx }) => {
          const pct = s.count ? Math.round((c / s.count) * 100) : 0;
          const Icon = s.icon;
          const blockLabel =
            s.block === "mandatory"
              ? "Majburiy"
              : s.block === "main1"
              ? "1-asosiy"
              : s.block === "main2"
              ? "2-asosiy"
              : null;
          return (
            <div key={s.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.name}</span>
                    {blockLabel && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {blockLabel} · {s.pointsPerQuestion} ball/savol
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c} to'g'ri · {w} noto'g'ri · {u} javobsiz
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold gradient-text">
                    {Math.round(score * 10) / 10} / {Math.round(mx * 10) / 10}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pct}% · {c}/{s.count}
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
