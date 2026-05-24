import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Atom,
  FlaskConical,
  Leaf,
  Globe2,
  Languages,
  BookOpen,
  Cpu,
  Landmark,
  Scale,
  PenTool,
  Lock,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
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

export const Route = createFileRoute("/dtm")({
  component: DtmPage,
  head: () => ({
    meta: [
      { title: "DTM imtihoni — GrantX" },
      {
        name: "description",
        content:
          "DTM imtihoniga real formatda tayyorlov. Asosiy fanlarni tanlang va majburiy fanlar bilan birga imtihonni boshlang.",
      },
    ],
  }),
});

type Subject = {
  id: string;
  name: string;
  icon: typeof Atom;
  hint: string;
};

const MANDATORY: Subject[] = [
  { id: "ona-tili", name: "Ona tili", icon: BookOpen, hint: "Majburiy" },
  { id: "matematika-m", name: "Matematika", icon: PenTool, hint: "Majburiy" },
  { id: "tarix-m", name: "Tarix", icon: Landmark, hint: "Majburiy" },
];

const MAIN_POOL: Subject[] = [
  { id: "matematika", name: "Matematika", icon: PenTool, hint: "Aniq fanlar" },
  { id: "fizika", name: "Fizika", icon: Atom, hint: "Aniq fanlar" },
  { id: "kimyo", name: "Kimyo", icon: FlaskConical, hint: "Tabiiy fanlar" },
  { id: "biologiya", name: "Biologiya", icon: Leaf, hint: "Tabiiy fanlar" },
  { id: "geografiya", name: "Geografiya", icon: Globe2, hint: "Tabiiy fanlar" },
  { id: "ingliz", name: "Ingliz tili", icon: Languages, hint: "Tillar" },
  { id: "adabiyot", name: "Adabiyot", icon: BookOpen, hint: "Gumanitar" },
  { id: "tarix", name: "Tarix", icon: Landmark, hint: "Gumanitar" },
  { id: "huquq", name: "Huquq", icon: Scale, hint: "Ijtimoiy" },
  { id: "informatika", name: "Informatika", icon: Cpu, hint: "Aniq fanlar" },
];

const QUESTIONS_PER_SUBJECT = 30;
const EXAM_MINUTES = 180;

function DtmPage() {
  const [step, setStep] = useState<"select" | "exam">("select");
  const [picked, setPicked] = useState<string[]>([]);

  const pickedSubjects = useMemo(
    () => picked.map((id) => MAIN_POOL.find((s) => s.id === id)!).filter(Boolean),
    [picked]
  );

  const togglePick = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <TopBar />

      {step === "select" ? (
        <SelectStep
          picked={picked}
          pickedSubjects={pickedSubjects}
          togglePick={togglePick}
          onStart={() => setStep("exam")}
        />
      ) : (
        <ExamScreen
          subjects={[...MANDATORY, ...pickedSubjects]}
          onExit={() => setStep("select")}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Grant<span className="gradient-text">X</span>
          </span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-foreground hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Bosh sahifa
          </Button>
        </Link>
      </nav>
    </header>
  );
}

function SelectStep({
  picked,
  pickedSubjects,
  togglePick,
  onStart,
}: {
  picked: string[];
  pickedSubjects: Subject[];
  togglePick: (id: string) => void;
  onStart: () => void;
}) {
  const ready = picked.length === 2;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-accent" /> DTM imtihoni
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
          Ikkita <span className="gradient-text">asosiy fan</span>ni tanlang
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          DTM formatiga muvofiq Ona tili, Matematika va Tarix avtomatik qo'shiladi.
          Siz faqat ikkita asosiy blok fanini tanlaysiz.
        </p>
      </div>

      {/* Mandatory */}
      <div className="mt-10">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" /> Majburiy fanlar
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {MANDATORY.map((s) => (
            <div
              key={s.id}
              className="glass relative flex items-center gap-3 rounded-2xl p-4 opacity-90"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-bg">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Pool */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Asosiy blok fanlari</span>
          <span className="text-muted-foreground">
            Tanlangan: <span className="text-foreground">{picked.length}</span>/2
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_POOL.map((s) => {
            const active = picked.includes(s.id);
            const disabled = !active && picked.length >= 2;
            return (
              <button
                key={s.id}
                onClick={() => togglePick(s.id)}
                disabled={disabled}
                className={[
                  "group relative flex items-center gap-3 rounded-2xl p-4 text-left transition",
                  "glass",
                  active
                    ? "ring-2 ring-primary glow -translate-y-0.5"
                    : disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:-translate-y-0.5 hover:bg-white/10",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl transition",
                    active ? "gradient-bg" : "bg-white/5 group-hover:bg-white/10",
                  ].join(" ")}
                >
                  <s.icon
                    className={[
                      "h-5 w-5",
                      active ? "text-primary-foreground" : "text-accent",
                    ].join(" ")}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.hint}</div>
                </div>
                <div
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full border transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/20",
                  ].join(" ")}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="glass sticky bottom-4 mt-10 flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Imtihon tuzilmasi:</span>
          {[...MANDATORY, ...pickedSubjects].map((s, i) => (
            <span
              key={s.id + i}
              className="rounded-full bg-white/5 px-3 py-1 text-xs"
            >
              {s.name}
            </span>
          ))}
          {pickedSubjects.length < 2 &&
            Array.from({ length: 2 - pickedSubjects.length }).map((_, i) => (
              <span
                key={"empty" + i}
                className="rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-muted-foreground"
              >
                Tanlanmagan
              </span>
            ))}
        </div>
        <Button
          size="lg"
          disabled={!ready}
          onClick={onStart}
          className="gradient-bg text-primary-foreground hover:opacity-90 glow disabled:opacity-40"
        >
          Imtihonni boshlash <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function ExamScreen({
  subjects,
  onExit,
}: {
  subjects: Subject[];
  onExit: () => void;
}) {
  const [activeSubject, setActiveSubject] = useState(0);
  const [activeQ, setActiveQ] = useState(0);
  // answers: subjectId -> qIndex -> optionIndex
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);
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
  const totalQuestions = subjects.length * QUESTIONS_PER_SUBJECT;
  const answeredCount = Object.values(answers).reduce(
    (acc, m) => acc + Object.keys(m).length,
    0
  );
  const progress = Math.round((answeredCount / totalQuestions) * 100);

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
      setActiveQ(QUESTIONS_PER_SUBJECT - 1);
    }
  };
  const goNext = () => {
    if (activeQ < QUESTIONS_PER_SUBJECT - 1) setActiveQ(activeQ + 1);
    else if (activeSubject < subjects.length - 1) {
      setActiveSubject(activeSubject + 1);
      setActiveQ(0);
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-4 pb-24 pt-16 text-center">
        <div className="glass rounded-3xl p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg glow">
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold">Imtihon topshirildi</h2>
          <p className="mt-3 text-muted-foreground">
            Javoblaringiz qabul qilindi. Natijalar tez orada e'lon qilinadi.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-left">
            <Stat label="Javoblar" value={`${answeredCount}/${totalQuestions}`} />
            <Stat label="Fanlar" value={`${subjects.length}`} />
            <Stat label="Progress" value={`${progress}%`} />
          </div>
          <Button
            className="mt-8 gradient-bg text-primary-foreground hover:opacity-90"
            onClick={onExit}
          >
            Bosh menuga qaytish
          </Button>
        </div>
      </section>
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
            DTM imtihoni · {subjects.length} fan · {totalQuestions} savol
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
            className="h-full gradient-bg transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Subject tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.map((s, i) => {
          const active = i === activeSubject;
          const ans = Object.keys(answers[s.id] ?? {}).length;
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
              <s.icon className="h-4 w-4" />
              <span>{s.name}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px]",
                  active ? "bg-white/20" : "bg-white/10 text-muted-foreground",
                ].join(" ")}
              >
                {ans}/{QUESTIONS_PER_SUBJECT}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Question area */}
        <div className="glass rounded-2xl p-5 md:p-8">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {current.name} · Savol {activeQ + 1}/{QUESTIONS_PER_SUBJECT}
            </span>
            <span>5 ball</span>
          </div>

          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Savol matni tez orada qo'shiladi.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Bu joyga {current.name} fanidan savol kiritiladi.
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
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold",
                      selected ? "gradient-bg text-primary-foreground" : "bg-white/5",
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
                activeQ === QUESTIONS_PER_SUBJECT - 1
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
              {Object.keys(subjectAnswers).length}/{QUESTIONS_PER_SUBJECT}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {Array.from({ length: QUESTIONS_PER_SUBJECT }).map((_, i) => {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}