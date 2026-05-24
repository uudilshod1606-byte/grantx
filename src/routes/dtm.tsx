import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamRunner } from "@/components/exam/ExamRunner";

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
  icon: LucideIcon;
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
        <ExamRunner
          title="DTM imtihoni"
          subjects={[...MANDATORY, ...pickedSubjects].map((s) => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            questions: 0,
          }))}
          durationMinutes={180}
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

      <div className="glass sticky bottom-4 mt-10 flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Imtihon tuzilmasi:</span>
          {[...MANDATORY, ...pickedSubjects].map((s, i) => (
            <span key={s.id + i} className="rounded-full bg-white/5 px-3 py-1 text-xs">
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