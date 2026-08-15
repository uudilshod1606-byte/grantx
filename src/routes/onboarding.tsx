import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock3,
  FlaskConical,
  GraduationCap,
  Languages,
  Pencil,
  Sigma,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Shaxsiy reja — INTIL" },
      { name: "description", content: "INTIL AI siz uchun individual tayyorgarlik rejasini tuzadi." },
    ],
  }),
});

type ExamType = "milliy" | "dtm";
type TimeOption = "15-30" | "30-60" | "1-2" | "2+";
type SubjectId = "matematika" | "fizika" | "kimyo" | "biologiya" | "ona_tili" | "ingliz_tili";
type Subject = { id: SubjectId; title: string; icon: typeof Sigma; topics: string[] };

type WeakPoints = Record<SubjectId, string[]>;

const subjects: Subject[] = [
  {
    id: "matematika",
    title: "Matematika",
    icon: Sigma,
    topics: ["Algebra", "Funksiya", "Tenglamalar va tengsizliklar", "Trigonometriya", "Geometriya", "Hosila", "Ehtimollik", "Logarifm"],
  },
  {
    id: "fizika",
    title: "Fizika",
    icon: Zap,
    topics: ["Mexanika", "Molekulyar fizika", "Termodinamika", "Elektr", "Magnit maydon", "Optika", "Formulalarni qo'llash", "Masala yechish"],
  },
  {
    id: "kimyo",
    title: "Kimyo",
    icon: FlaskConical,
    topics: ["Umumiy kimyo", "Anorganik kimyo", "Organik kimyo", "Reaksiyalar", "Hisoblash masalalari", "Davriy jadval", "Eritmalar", "Elektrokimyo"],
  },
  {
    id: "biologiya",
    title: "Biologiya",
    icon: BookOpen,
    topics: ["Hujayra", "Genetika", "Odam anatomiyasi", "Botanika", "Zoologiya", "Ekologiya", "Evolyutsiya", "Biologik masalalar"],
  },
  {
    id: "ona_tili",
    title: "Ona tili",
    icon: Languages,
    topics: ["Grammatika", "Imlo", "Punktuatsiya", "Leksikologiya", "Sintaksis", "Matn tahlili", "Insho / esse", "Adabiyot"],
  },
  {
    id: "ingliz_tili",
    title: "Ingliz tili",
    icon: GraduationCap,
    topics: ["Grammar", "Vocabulary", "Reading", "Listening", "Writing", "Speaking", "Use of English", "Test strategiyasi"],
  },
];

const timeOptions: { id: TimeOption; title: string; subtitle: string; icon: typeof Timer }[] = [
  { id: "15-30", title: "15–30 daqiqa", subtitle: "Qisqa, lekin muntazam", icon: Timer },
  { id: "30-60", title: "30–60 daqiqa", subtitle: "Kuniga bir to'liq mashg'ulot", icon: Clock3 },
  { id: "1-2", title: "1–2 soat", subtitle: "Jiddiy va muvozanatli", icon: Brain },
  { id: "2+", title: "2+ soat", subtitle: "Intensiv tayyorgarlik", icon: Trophy },
];

const steps = ["Imtihon", "Sana", "Fanlar", "Kuchsiz joylar", "Vaqt"];
const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

function emptyWeakPoints(): WeakPoints {
  return {} as WeakPoints;
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoints>(emptyWeakPoints);
  const [time, setTime] = useState<TimeOption | null>(null);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(examType);
    if (step === 2) return Boolean(examDate);
    if (step === 3) return selectedSubjects.length === 2;
    if (step === 4) return selectedSubjects.every((id) => (weakPoints[id] ?? []).length > 0);
    return Boolean(time);
  }, [step, examType, examDate, selectedSubjects, weakPoints, time]);

  const toggleSubject = (id: SubjectId) => {
    setSelectedSubjects((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        setWeakPoints((points) => {
          const copy = { ...points };
          delete copy[id];
          return copy;
        });
        return next;
      }
      if (current.length >= 2) return current;
      return [...current, id];
    });
  };

  const toggleWeakPoint = (subjectId: SubjectId, topic: string) => {
    setWeakPoints((current) => {
      const selected = current[subjectId] ?? [];
      return {
        ...current,
        [subjectId]: selected.includes(topic)
          ? selected.filter((item) => item !== topic)
          : [...selected, topic],
      };
    });
  };

  const next = () => {
    if (!canContinue) return;
    if (step < 5) {
      setStep((value) => value + 1);
      return;
    }

    localStorage.setItem(
      "intil_onboarding",
      JSON.stringify({
        examType,
        examDate,
        subjects: selectedSubjects,
        weakPoints,
        dailyTime: time,
        createdAt: new Date().toISOString(),
      }),
    );
    navigate({ to: "/signup" });
  };

  const back = () => {
    if (step > 1) setStep((value) => value - 1);
    else navigate({ to: "/" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4ECDD] text-[#241A12] selection:bg-[#D6A03D]/25">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1520px] items-center p-3 sm:p-5 lg:p-7">
        <div className="grid min-h-[calc(100vh-24px)] w-full overflow-hidden rounded-[30px] border border-[#241A12]/10 bg-[#FCFAF6]/95 shadow-[0_35px_110px_rgba(36,26,18,0.16)] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[0.88fr_1.42fr] lg:rounded-[40px]">
          <VisualPanel step={step} selectedSubjects={selectedSubjects} />

          <section className="flex min-h-0 min-w-0 flex-col bg-white/75">
            <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-12 lg:pt-8">
              <button
                onClick={back}
                className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-[#241A12]/55 transition hover:bg-[#F4ECDD] hover:text-[#241A12]"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Orqaga
              </button>
              <div className="flex items-center gap-2 rounded-full border border-[#241A12]/8 bg-white px-3.5 py-2 text-xs font-bold text-[#241A12]/50 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#C18A24]" />
                {step} / 5
              </div>
            </div>

            <div className="px-5 pt-5 sm:px-8 lg:px-12 lg:pt-6">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#241A12]/7">
                <motion.div
                  className="h-full rounded-full bg-[#C9922C]"
                  animate={{ width: `${step * 20}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-8 sm:px-8 sm:pb-7 lg:px-12 lg:pt-9">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step-1" {...pageMotion}>
                    <StepHeader
                      eyebrow="01 · START"
                      icon={<Target />}
                      title="Qaysi imtihonga tayyorlanyapsiz?"
                      subtitle="Siz haqingizdagi bir nechta ma'lumotni bilsak, AI rejangizni ancha aniq tuzadi."
                    />
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <ChoiceCard selected={examType === "milliy"} onClick={() => setExamType("milliy")} icon={<GraduationCap />} title="Milliy Sertifikat" subtitle="Fan bo'yicha chuqur tayyorgarlik" badge="01" />
                      <ChoiceCard selected={examType === "dtm"} onClick={() => setExamType("dtm")} icon={<Trophy />} title="DTM" subtitle="Kirish imtihoniga tayyorgarlik" badge="02" />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" {...pageMotion}>
                    <StepHeader
                      eyebrow="02 · TIMELINE"
                      icon={<Target />}
                      title="Imtihoningiz qachon?"
                      subtitle="Qancha vaqt qolganini bilish AI'ga yuklamani to'g'ri taqsimlashga yordam beradi."
                    />
                    <div className="mt-8 max-w-2xl">
                      <label className="block">
                        <span className="mb-3 block text-sm font-bold">Imtihon sanasi</span>
                        <input
                          type="date"
                          value={examDate}
                          onChange={(event) => setExamDate(event.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="h-16 w-full rounded-2xl border border-[#241A12]/10 bg-[#FAF7F0] px-5 text-lg font-semibold outline-none transition focus:border-[#C9922C] focus:ring-4 focus:ring-[#C9922C]/10"
                        />
                      </label>
                      <InfoBox title="Aniq sana = aniqroq reja" text="AI qolgan kunlarni bosqichlarga bo'lib, oxirgi kunlarda takrorlash va sinovlarni ko'paytiradi." />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step-3" {...pageMotion}>
                    <StepHeader
                      eyebrow="03 · FOCUS"
                      icon={<BookOpen />}
                      title="Qaysi fanlarga e'tibor beramiz?"
                      subtitle="Eng muhim 2 ta fanni tanlang. Keyin AI har bir fan bo'yicha alohida kuchsiz mavzularni aniqlaydi."
                    />
                    <div className="mt-7 flex items-center justify-between rounded-2xl bg-[#F7F2E8] px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#241A12] text-white"><Sparkles className="h-4 w-4" /></div>
                        <span className="text-sm font-semibold">Asosiy fanlar</span>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">{selectedSubjects.length} / 2</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {subjects.map((subject, index) => {
                        const Icon = subject.icon;
                        return (
                          <ChoiceCard
                            key={subject.id}
                            compact
                            selected={selectedSubjects.includes(subject.id)}
                            onClick={() => toggleSubject(subject.id)}
                            icon={<Icon />}
                            title={subject.title}
                            subtitle={selectedSubjects.includes(subject.id) ? "Asosiy fan" : "Tanlash"}
                            badge={String(index + 1).padStart(2, "0")}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step-4" {...pageMotion}>
                    <StepHeader
                      eyebrow="04 · DIAGNOSIS"
                      icon={<Pencil />}
                      title="Har bir fan bo'yicha kuchsiz mavzular"
                      subtitle="Tanlagan ikkala faningiz uchun ham alohida mavzular bor. Qiynalayotganlaringizni belgilang — AI aynan shu joylarga ko'proq vaqt ajratadi."
                    />

                    <div className="mt-7 space-y-4">
                      {selectedSubjects.map((id, index) => {
                        const subject = subjects.find((item) => item.id === id);
                        if (!subject) return null;
                        return (
                          <WeakPointPanel
                            key={id}
                            subject={subject}
                            number={index + 1}
                            selected={weakPoints[id] ?? []}
                            onToggle={(topic) => toggleWeakPoint(id, topic)}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {selectedSubjects.map((id) => {
                        const subject = subjects.find((item) => item.id === id);
                        const count = weakPoints[id]?.length ?? 0;
                        return (
                          <div key={id} className="flex items-center gap-2 rounded-xl bg-[#F7F2E8] px-3 py-2.5 text-xs font-medium text-[#241A12]/55">
                            <Check className={`h-4 w-4 ${count ? "text-[#C9922C]" : "text-[#241A12]/20"}`} />
                            {subject?.title}: {count ? `${count} ta mavzu belgilandi` : "hali tanlanmagan"}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step-5" {...pageMotion}>
                    <StepHeader
                      eyebrow="05 · RHYTHM"
                      icon={<Timer />}
                      title="Kuniga qancha vaqt ajrata olasiz?"
                      subtitle="Ko'p vaqt emas — sizga mos va davom ettira oladigan ritm muhim."
                    />
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {timeOptions.map((option) => {
                        const Icon = option.icon;
                        return <ChoiceCard key={option.id} selected={time === option.id} onClick={() => setTime(option.id)} icon={<Icon />} title={option.title} subtitle={option.subtitle} />;
                      })}
                    </div>
                    <div className="relative mt-6 overflow-hidden rounded-[26px] bg-[#241A12] p-6 text-white shadow-[0_20px_50px_rgba(36,26,18,0.18)]">
                      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D6A03D]/20 blur-2xl" />
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D6A03D] text-[#241A12]"><Sparkles className="h-5 w-5" /></div>
                        <div><p className="font-bold">AI rejangiz tayyorlanadi</p><p className="mt-1.5 max-w-xl text-sm leading-6 text-white/60">Siz bergan ma'lumotlar asosida kunlik maqsadlar, mavzular va takrorlashlar tartiblanadi.</p></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-[#241A12]/7 px-5 py-4 sm:px-8 lg:px-12 lg:py-5">
              <div className="hidden items-center gap-2 text-xs text-[#241A12]/35 sm:flex"><div className="h-1.5 w-1.5 rounded-full bg-[#C9922C]" /> Ma'lumotlaringiz xavfsiz saqlanadi</div>
              <button
                onClick={next}
                disabled={!canContinue}
                className="group ml-auto inline-flex min-h-12 min-w-[175px] items-center justify-center gap-3 rounded-2xl bg-[#D6A03D] px-6 text-sm font-bold text-[#241A12] shadow-[0_12px_28px_rgba(201,146,44,0.22)] transition hover:-translate-y-0.5 hover:bg-[#E0AD4C] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
              >
                {step === 5 ? "Rejani boshlash" : "Davom etish"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AmbientBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-48 -top-48 h-[560px] w-[560px] rounded-full bg-[#D6A03D]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 -right-48 h-[620px] w-[620px] rounded-full bg-[#8B5E34]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(36,26,18,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(36,26,18,.15)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
    </>
  );
}

function VisualPanel({ step, selectedSubjects }: { step: number; selectedSubjects: SubjectId[] }) {
  const copy = [
    ["Maqsadingizni", "aniq rejaga aylantiramiz."],
    ["Vaqtingizni", "natijaga aylantiramiz."],
    ["Fokusni", "eng muhim fanlarga beramiz."],
    ["Kuchsiz mavzularni", "AI bilan kuchaytiramiz."],
    ["Reja tayyor.", "Endi natija sari."],
  ][step - 1];

  return (
    <aside className="relative hidden overflow-hidden bg-[#241A12] text-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_34%,rgba(214,160,61,.18),transparent_32%),radial-gradient(circle_at_15%_90%,rgba(214,160,61,.10),transparent_30%)]" />
      <div className="relative flex h-full flex-col p-8 xl:p-11">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6A03D] font-serif text-lg font-bold text-[#241A12] shadow-[0_8px_24px_rgba(214,160,61,.22)]">I</div>
          <div className="font-serif text-xl tracking-[-0.04em]">INT<i className="text-[#D6A03D]">i</i>L</div>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-8 [perspective:1000px]">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute h-[360px] w-[360px] rounded-full border border-[#D6A03D]/15"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute h-[290px] w-[290px] rounded-full border border-dashed border-[#D6A03D]/20"
          />

          <motion.div
            animate={{ rotateX: [0, 8, 0, -8, 0], rotateY: [0, -10, 0, 10, 0], y: [0, -7, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-48 w-48 [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 rounded-[34px] border border-[#F5D58A]/45 bg-gradient-to-br from-[#F9D77F]/80 via-[#C9922C]/75 to-[#6F430D]/90 shadow-[inset_18px_18px_30px_rgba(255,255,255,.28),inset_-20px_-25px_35px_rgba(35,15,0,.34),0_30px_70px_rgba(0,0,0,.38)] [transform:translateZ(34px)]" />
            <div className="absolute inset-5 rounded-[25px] border border-white/20 bg-white/[0.06] backdrop-blur-sm [transform:translateZ(54px)]" />
            <div className="absolute -inset-3 rounded-[42px] border border-[#D6A03D]/20 [transform:translateZ(-12px)]" />
            <div className="absolute left-8 top-7 h-7 w-20 rounded-full bg-white/30 blur-xl [transform:translateZ(70px)_rotate(-28deg)]" />
            <div className="absolute bottom-7 right-7 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#F5D58A] backdrop-blur-md [transform:translateZ(78px)]"><Sparkles className="h-5 w-5" /></div>
          </motion.div>

          <FloatingCard className="left-0 top-[23%]" title="AI ANALYSIS" value="97%" icon={<Brain />} />
          <FloatingCard className="right-0 bottom-[22%]" title="FOCUS" value={selectedSubjects.length ? `${selectedSubjects.length} fan` : "SMART"} icon={<Target />} />
        </div>

        <div className="relative max-w-md">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A03D]">INTIL AI · SHAXSIY REJA</p>
              <h2 className="font-serif text-4xl leading-[1.04] tracking-[-0.035em] xl:text-5xl">{copy[0]}<br /><span className="text-white/45">{copy[1]}</span></h2>
              <p className="mt-5 text-sm leading-6 text-white/45">Har bir javobingiz keyingi bosqichni sizga moslashtiradi.</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative mt-8 flex items-center gap-2">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 <= step ? "w-9 bg-[#D6A03D]" : "w-2 bg-white/15"}`} />
              <span className="hidden text-[10px] font-medium text-white/25 xl:block">{index + 1 === step ? label : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function FloatingCard({ className, title, value, icon }: { className: string; title: string; value: string; icon: ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute z-20 rounded-2xl border border-white/10 bg-white/[0.07] px-3.5 py-3 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D6A03D]/15 text-[#D6A03D]">{icon}</div>
        <div><p className="text-[9px] font-medium uppercase tracking-wider text-white/35">{title}</p><p className="text-sm font-bold text-white/90">{value}</p></div>
      </div>
    </motion.div>
  );
}

function StepHeader({ eyebrow, icon, title, subtitle }: { eyebrow: string; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6A03D]/12 text-[#A97419] shadow-sm">{icon}</div>
        <span className="text-[10px] font-black tracking-[0.22em] text-[#A97419]">{eyebrow}</span>
      </div>
      <h1 className="font-serif text-[2.35rem] leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-[3.35rem]">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#241A12]/50 sm:text-base">{subtitle}</p>
    </div>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#C9922C]/15 bg-[#C9922C]/6 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9922C]/12 text-[#A36F18]"><Clock3 className="h-4 w-4" /></div>
      <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-[#241A12]/55">{text}</p></div>
    </div>
  );
}

function ChoiceCard({ selected, onClick, icon, title, subtitle, badge, compact = false }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; subtitle: string; badge?: string; compact?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border text-left transition duration-300 ${compact ? "min-h-[88px] p-4" : "min-h-[112px] p-5"} ${selected ? "border-[#C9922C] bg-[#C9922C]/7 shadow-[0_14px_35px_rgba(201,146,44,.14)]" : "border-[#241A12]/9 bg-white/80 hover:border-[#241A12]/20 hover:bg-[#FCFAF6]"}`}
    >
      {selected && <motion.div layoutId="selected-glow" className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#D6A03D]/15 blur-2xl" />}
      {badge && <span className={`absolute right-4 top-3 text-[9px] font-black tracking-widest ${selected ? "text-[#A97419]" : "text-[#241A12]/20"}`}>{badge}</span>}
      <span className={`relative flex shrink-0 items-center justify-center rounded-2xl transition ${compact ? "h-11 w-11" : "h-12 w-12"} ${selected ? "bg-[#D6A03D] text-[#241A12] shadow-lg" : "bg-[#F5EEE1] text-[#241A12]/55 group-hover:bg-[#EEE4D2]"}`}>{icon}</span>
      <span className="relative min-w-0 flex-1"><span className="block font-bold tracking-[-0.01em]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#241A12]/45">{subtitle}</span></span>
      <span className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${selected ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#241A12]/12 text-transparent"}`}><Check className="h-3.5 w-3.5" /></span>
    </motion.button>
  );
}

function WeakPointPanel({ subject, selected, onToggle, number }: { subject: Subject; selected: string[]; onToggle: (topic: string) => void; number: number }) {
  const Icon = subject.icon;
  return (
    <section className="rounded-[24px] border border-[#241A12]/8 bg-white/80 p-4 shadow-[0_10px_30px_rgba(36,26,18,.05)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE1] text-[#A97419]"><Icon className="h-5 w-5" /></div>
          <div><div className="flex items-center gap-2"><p className="font-bold">{subject.title}</p><span className="rounded-full bg-[#F7F2E8] px-2 py-0.5 text-[9px] font-black text-[#A97419]">FAN {number}</span></div><p className="mt-0.5 text-xs text-[#241A12]/40">Qiynalayotgan barcha mavzularni belgilang</p></div>
        </div>
        <span className="shrink-0 rounded-full bg-[#241A12] px-2.5 py-1 text-[10px] font-bold text-white">{selected.length} ta</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {subject.topics.map((topic) => {
          const active = selected.includes(topic);
          return (
            <motion.button
              key={topic}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(topic)}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${active ? "border-[#C9922C] bg-[#C9922C]/8 font-semibold shadow-sm" : "border-[#241A12]/8 bg-[#FCFAF6] hover:border-[#C9922C]/35 hover:bg-[#FAF7F0]"}`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#241A12]/12"}`}>{active && <Check className="h-3 w-3" />}</span>
              <span className="flex-1">{topic}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
