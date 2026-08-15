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
  ShieldCheck,
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
type WeakPoints = Partial<Record<SubjectId, string[]>>;

const subjects: Subject[] = [
  { id: "matematika", title: "Matematika", icon: Sigma, topics: ["Algebra", "Funksiya", "Tenglamalar va tengsizliklar", "Trigonometriya", "Geometriya", "Hosila", "Ehtimollik", "Logarifm"] },
  { id: "fizika", title: "Fizika", icon: Zap, topics: ["Mexanika", "Molekulyar fizika", "Termodinamika", "Elektr", "Magnit maydon", "Optika", "Formulalarni qo'llash", "Masala yechish"] },
  { id: "kimyo", title: "Kimyo", icon: FlaskConical, topics: ["Umumiy kimyo", "Anorganik kimyo", "Organik kimyo", "Reaksiyalar", "Hisoblash masalalari", "Davriy jadval", "Eritmalar", "Elektrokimyo"] },
  { id: "biologiya", title: "Biologiya", icon: BookOpen, topics: ["Hujayra", "Genetika", "Odam anatomiyasi", "Botanika", "Zoologiya", "Ekologiya", "Evolyutsiya", "Biologik masalalar"] },
  { id: "ona_tili", title: "Ona tili", icon: Languages, topics: ["Grammatika", "Imlo", "Punktuatsiya", "Leksikologiya", "Sintaksis", "Matn tahlili", "Insho / esse", "Adabiyot"] },
  { id: "ingliz_tili", title: "Ingliz tili", icon: GraduationCap, topics: ["Grammar", "Vocabulary", "Reading", "Listening", "Writing", "Speaking", "Use of English", "Test strategiyasi"] },
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
  transition: { duration: 0.34, ease: "easeOut" as const },
};

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoints>({});
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
        setWeakPoints((points) => {
          const next = { ...points };
          delete next[id];
          return next;
        });
        return current.filter((item) => item !== id);
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
        [subjectId]: selected.includes(topic) ? selected.filter((item) => item !== topic) : [...selected, topic],
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
      JSON.stringify({ examType, examDate, subjects: selectedSubjects, weakPoints, dailyTime: time, createdAt: new Date().toISOString() }),
    );
    navigate({ to: "/signup" });
  };

  const back = () => {
    if (step > 1) setStep((value) => value - 1);
    else navigate({ to: "/" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F3ECDF] text-[#211A14] selection:bg-[#D6A03D]/25">
      <AmbientBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1560px] items-center p-2 sm:p-4 lg:p-6">
        <div className="grid min-h-[calc(100vh-16px)] w-full overflow-hidden rounded-[28px] border border-[#211A14]/10 bg-[#FBF9F4] shadow-[0_40px_120px_rgba(33,26,20,.20)] sm:min-h-[calc(100vh-32px)] sm:rounded-[34px] lg:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(390px,.86fr)_minmax(650px,1.64fr)] lg:rounded-[40px]">
          <VisualPanel step={step} selectedSubjects={selectedSubjects} />

          <section className="flex min-h-0 min-w-0 flex-col bg-[#FFFEFC]">
            <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-12 lg:pt-8">
              <button onClick={back} className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-[#211A14]/55 transition hover:bg-[#F4EBDD] hover:text-[#211A14]">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Orqaga
              </button>
              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-1.5 sm:flex">
                  {steps.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 === step ? "w-8 bg-[#C9922C]" : index + 1 < step ? "w-3 bg-[#C9922C]/50" : "w-3 bg-[#211A14]/10"}`} />)}
                </div>
                <div className="rounded-full border border-[#211A14]/8 bg-white px-3.5 py-2 text-xs font-bold tabular-nums text-[#211A14]/55 shadow-[0_4px_15px_rgba(33,26,20,.05)]">0{step} / 05</div>
              </div>
            </div>

            <div className="px-5 pt-5 sm:px-8 lg:px-12 lg:pt-6">
              <div className="h-1 overflow-hidden rounded-full bg-[#211A14]/7"><motion.div className="h-full rounded-full bg-[#C9922C]" animate={{ width: `${step * 20}%` }} transition={{ duration: .5, ease: "easeOut" }} /></div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-8 sm:px-8 sm:pb-7 lg:px-12 lg:pt-9">
              <AnimatePresence mode="wait">
                {step === 1 && <motion.div key="one" {...pageMotion}>
                  <StepHeader eyebrow="01 · BOSHLAYMIZ" icon={<Target />} title={<>Qaysi imtihonga<br className="hidden sm:block" /> <em>tayyorlanyapsiz?</em></>} subtitle="Siz haqingizdagi bir nechta ma'lumotni bilsak, AI rejangizni ancha aniq va samarali tuzadi." />
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <ExamChoice selected={examType === "milliy"} onClick={() => setExamType("milliy")} type="milliy" />
                    <ExamChoice selected={examType === "dtm"} onClick={() => setExamType("dtm")} type="dtm" />
                  </div>
                </motion.div>}

                {step === 2 && <motion.div key="two" {...pageMotion}>
                  <StepHeader eyebrow="02 · TIMELINE" icon={<Target />} title={<>Imtihoningiz<br className="hidden sm:block" /> <em>qachon?</em></>} subtitle="Qancha vaqt qolganini bilish AI'ga yuklamani to'g'ri taqsimlashga yordam beradi." />
                  <div className="mt-8 max-w-2xl">
                    <label className="block"><span className="mb-3 block text-sm font-bold">Imtihon sanasi</span><input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} min={new Date().toISOString().split("T")[0]} className="h-16 w-full rounded-2xl border border-[#211A14]/10 bg-[#FAF7F0] px-5 text-lg font-semibold outline-none transition focus:border-[#C9922C] focus:ring-4 focus:ring-[#C9922C]/10" /></label>
                    <InfoBox title="Aniq sana = aniqroq reja" text="AI qolgan kunlarni bosqichlarga bo'lib, oxirgi kunlarda takrorlash va sinovlarni ko'paytiradi." />
                  </div>
                </motion.div>}

                {step === 3 && <motion.div key="three" {...pageMotion}>
                  <StepHeader eyebrow="03 · FOCUS" icon={<BookOpen />} title={<>Qaysi fanlarga<br className="hidden sm:block" /> <em>e'tibor beramiz?</em></>} subtitle="Eng muhim 2 ta fanni tanlang. Keyin AI har bir fan bo'yicha alohida kuchsiz mavzularni aniqlaydi." />
                  <div className="mt-7 flex items-center justify-between rounded-2xl border border-[#211A14]/6 bg-[#F8F2E8] px-4 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#211A14] text-[#F5D58A]"><Sparkles className="h-4 w-4" /></div><span className="text-sm font-semibold">Asosiy fanlar</span></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">{selectedSubjects.length} / 2</span></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{subjects.map((subject, index) => { const Icon = subject.icon; return <ChoiceCard key={subject.id} compact selected={selectedSubjects.includes(subject.id)} onClick={() => toggleSubject(subject.id)} icon={<Icon />} title={subject.title} subtitle={selectedSubjects.includes(subject.id) ? "Asosiy fan" : "Tanlash"} badge={String(index + 1).padStart(2, "0")} />; })}</div>
                </motion.div>}

                {step === 4 && <motion.div key="four" {...pageMotion}>
                  <StepHeader eyebrow="04 · DIAGNOSIS" icon={<Pencil />} title={<>Kuchsiz joylarni<br className="hidden sm:block" /> <em>aniqlaymiz.</em></>} subtitle="Tanlagan ikkala faningiz uchun ham alohida mavzular mavjud. Qiynalayotganlaringizni belgilang — AI aynan shu joylarga ko'proq vaqt ajratadi." />
                  <div className="mt-7 space-y-4">{selectedSubjects.map((id, index) => { const subject = subjects.find((item) => item.id === id); if (!subject) return null; return <WeakPointPanel key={id} subject={subject} number={index + 1} selected={weakPoints[id] ?? []} onToggle={(topic) => toggleWeakPoint(id, topic)} />; })}</div>
                </motion.div>}

                {step === 5 && <motion.div key="five" {...pageMotion}>
                  <StepHeader eyebrow="05 · RHYTHM" icon={<Timer />} title={<>Sizning <em>ritmingiz</em> qanday?</>} subtitle="Ko'p vaqt emas — sizga mos va davom ettira oladigan ritm muhim." />
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">{timeOptions.map((option) => { const Icon = option.icon; return <ChoiceCard key={option.id} selected={time === option.id} onClick={() => setTime(option.id)} icon={<Icon />} title={option.title} subtitle={option.subtitle} />; })}</div>
                  <div className="relative mt-6 overflow-hidden rounded-[26px] bg-[#211A14] p-6 text-white shadow-[0_20px_50px_rgba(33,26,20,.18)]"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#D6A03D]/20 blur-3xl" /><div className="relative flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D6A03D] text-[#211A14]"><Sparkles className="h-5 w-5" /></div><div><p className="font-bold">AI rejangiz tayyorlanadi</p><p className="mt-1.5 max-w-xl text-sm leading-6 text-white/60">Siz bergan ma'lumotlar asosida kunlik maqsadlar, mavzular va takrorlashlar tartiblanadi.</p></div></div></div>
                </motion.div>}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 border-t border-[#211A14]/7 bg-white/80 px-5 py-4 sm:px-8 lg:px-12 lg:py-5">
              <div className="hidden min-w-0 items-center gap-2 text-xs text-[#211A14]/38 sm:flex"><ShieldCheck className="h-4 w-4 text-[#C9922C]" /> Ma'lumotlaringiz xavfsiz saqlanadi</div>
              <button onClick={next} disabled={!canContinue} className="group ml-auto inline-flex min-h-12 min-w-[190px] items-center justify-center gap-3 rounded-2xl bg-[#D39A2E] px-6 text-sm font-bold text-[#211A14] shadow-[0_14px_32px_rgba(201,146,44,.25)] transition hover:-translate-y-0.5 hover:bg-[#E0AD4C] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none">{step === 5 ? "Rejani boshlash" : "Davom etish"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AmbientBackground() {
  return <><div className="pointer-events-none absolute -left-52 -top-52 h-[620px] w-[620px] rounded-full bg-[#D6A03D]/10 blur-3xl" /><div className="pointer-events-none absolute -bottom-64 -right-56 h-[680px] w-[680px] rounded-full bg-[#8A5D2F]/10 blur-3xl" /><div className="pointer-events-none absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(33,26,20,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(33,26,20,.12)_1px,transparent_1px)] [background-size:58px_58px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" /></>;
}

function VisualPanel({ step, selectedSubjects }: { step: number; selectedSubjects: SubjectId[] }) {
  const copy = [
    ["Maqsadingiz aniq,", "rejangiz shaxsiy."],
    ["Vaqtingizni", "natijaga aylantiramiz."],
    ["Fokusni", "eng muhim fanlarga beramiz."],
    ["Kuchsiz mavzularni", "AI bilan kuchaytiramiz."],
    ["Reja tayyor.", "Endi natija sari."],
  ][step - 1];

  return <aside className="relative hidden overflow-hidden bg-[#17110D] text-white lg:block">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_34%,rgba(214,160,61,.18),transparent_29%),radial-gradient(circle_at_5%_85%,rgba(214,160,61,.09),transparent_31%)]" />
    <div className="absolute inset-5 rounded-[28px] border border-[#D6A03D]/10" />
    <div className="relative flex h-full flex-col p-8 xl:p-11">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F3C65B] via-[#C9922C] to-[#80520E] font-serif text-xl font-bold text-[#211A14] shadow-[0_8px_30px_rgba(214,160,61,.28)]">I</div><div><div className="font-serif text-[22px] tracking-[-.04em]">INTIL</div><div className="text-[8px] font-bold tracking-[.28em] text-[#D6A03D]">AI · TA'LIM · NATIJA</div></div></div>

      <div className="relative flex min-h-[360px] flex-1 items-center justify-center [perspective:1200px] xl:min-h-[430px]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} className="absolute h-[330px] w-[330px] rounded-full border border-[#D6A03D]/15 [transform:rotateX(64deg)]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-[#D6A03D]/20 [transform:rotateX(67deg)_rotateY(12deg)]" />
        <motion.div animate={{ rotateZ: [0, 2, 0, -2, 0], y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="relative h-56 w-56 [transform-style:preserve-3d]">
          <div className="absolute inset-0 rounded-[42px] border border-[#F8D989]/45 bg-gradient-to-br from-[#F6D477]/85 via-[#C9922C]/75 to-[#5A3309]/95 shadow-[inset_18px_18px_30px_rgba(255,255,255,.22),inset_-25px_-28px_40px_rgba(25,9,0,.42),0_38px_80px_rgba(0,0,0,.45)] [transform:translateZ(38px)_rotate(45deg)]" />
          <div className="absolute inset-7 rounded-[32px] border border-white/20 bg-[#F5D58A]/10 backdrop-blur-sm [transform:translateZ(62px)_rotate(45deg)]" />
          <div className="absolute -inset-5 rounded-[50px] border border-[#D6A03D]/20 [transform:translateZ(-20px)_rotate(45deg)]" />
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/20 bg-white/[.08] text-[#F8D989] shadow-[0_0_45px_rgba(214,160,61,.25)] backdrop-blur-xl [transform:translateZ(78px)]"><Sparkles className="h-9 w-9" /></div>
          <div className="absolute -left-4 top-12 h-5 w-24 rounded-full bg-white/30 blur-xl [transform:translateZ(90px)_rotate(-35deg)]" />
        </motion.div>
        <OrbitDot className="left-[12%] top-[30%]" delay={0} /><OrbitDot className="right-[11%] top-[22%]" delay={1.2} /><OrbitDot className="right-[20%] bottom-[24%]" delay={2.1} />
        <FloatingCard className="left-0 top-[21%]" title="AI ANALYSIS" value="97%" icon={<Brain />} />
        <FloatingCard className="right-0 bottom-[20%]" title="FOCUS" value={selectedSubjects.length ? `${selectedSubjects.length} fan` : "SMART"} icon={<Target />} />
      </div>

      <div className="relative max-w-md"><AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .28 }}><p className="mb-3 text-[10px] font-bold uppercase tracking-[.26em] text-[#D6A03D]">INTIL AI · SHAXSIY REJA</p><h2 className="font-serif text-[2.45rem] leading-[.98] tracking-[-.045em] xl:text-[3.15rem]">{copy[0]}<br /><span className="text-white/42">{copy[1]}</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/45">Har bir javobingiz keyingi bosqichni sizga moslashtiradi.</p></motion.div></AnimatePresence></div>

      <div className="relative mt-7 flex items-center gap-2">{steps.map((label, index) => <div key={label} className="flex items-center gap-2"><div className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 <= step ? "w-9 bg-[#D6A03D]" : "w-2 bg-white/15"}`} /><span className="hidden text-[9px] font-medium text-white/30 xl:block">{index + 1 === step ? label : ""}</span></div>)}</div>
      <div className="relative mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-white/8 bg-white/[.035] p-3"><MiniStat value="10 000+" label="o'quvchi" /><MiniStat value="95%" label="muvaffaqiyat" /><MiniStat value="24/7" label="AI mentor" /></div>
    </div>
  </aside>;
}

function OrbitDot({ className, delay }: { className: string; delay: number }) { return <motion.span animate={{ y: [0, -8, 0], opacity: [.55, 1, .55] }} transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" }} className={`absolute h-3 w-3 rounded-full bg-[#D6A03D] shadow-[0_0_18px_rgba(214,160,61,.8)] ${className}`} />; }

function FloatingCard({ className, title, value, icon }: { className: string; title: string; value: string; icon: ReactNode }) { return <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute z-30 rounded-2xl border border-white/10 bg-[#241A14]/75 px-3.5 py-3 shadow-2xl backdrop-blur-xl ${className}`}><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D6A03D]/15 text-[#D6A03D]">{icon}</div><div><p className="text-[8px] font-medium uppercase tracking-wider text-white/35">{title}</p><p className="text-sm font-bold text-white/90">{value}</p></div></div></motion.div>; }

function MiniStat({ value, label }: { value: string; label: string }) { return <div className="text-center"><div className="text-sm font-bold text-[#D6A03D]">{value}</div><div className="mt-0.5 text-[9px] text-white/35">{label}</div></div>; }

function StepHeader({ eyebrow, icon, title, subtitle }: { eyebrow: string; icon: ReactNode; title: ReactNode; subtitle: string }) { return <div className="max-w-3xl"><div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6A03D]/12 text-[#A97419] shadow-sm">{icon}</div><span className="text-[10px] font-black tracking-[.22em] text-[#A97419]">{eyebrow}</span></div><h1 className="font-serif text-[2.35rem] leading-[1.02] tracking-[-.05em] sm:text-5xl lg:text-[3.35rem]">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#211A14]/50 sm:text-base">{subtitle}</p></div>; }

function ExamChoice({ selected, onClick, type }: { selected: boolean; onClick: () => void; type: ExamType }) { const milliy = type === "milliy"; return <motion.button type="button" onClick={onClick} whileHover={{ y: -4 }} whileTap={{ scale: .985 }} className={`group relative min-h-[300px] overflow-hidden rounded-[28px] border text-left transition duration-300 ${selected ? "border-[#C9922C] bg-[#FFF9ED] shadow-[0_20px_55px_rgba(201,146,44,.16)]" : "border-[#211A14]/9 bg-white hover:border-[#C9922C]/40 hover:shadow-[0_16px_45px_rgba(33,26,20,.08)]"}`}><div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border border-[#211A14]/15">{selected && <span className="h-3.5 w-3.5 rounded-full bg-[#C9922C] shadow-[0_0_0_4px_rgba(201,146,44,.12)]" />}</div><div className="flex h-[190px] items-center justify-center bg-[radial-gradient(circle_at_center,rgba(214,160,61,.16),transparent_58%)]"><PremiumExamVisual type={type} /></div><div className="px-7 pb-7"><div className="text-xl font-bold tracking-[-.02em]">{milliy ? "Milliy Sertifikat" : "DTM"}</div><p className="mt-1 text-sm text-[#211A14]/50">{milliy ? "Fan bo'yicha chuqur tayyorgarlik" : "Kirish imtihoniga tayyorgarlik"}</p><span className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${selected ? "bg-[#D6A03D]/20 text-[#946514]" : "bg-[#F5EEE1] text-[#6D5A3E]"}`}>{milliy ? "Fan bilimini oshirish" : "Imtihonga kirish"}</span></div></motion.button>; }

function PremiumExamVisual({ type }: { type: ExamType }) { if (type === "dtm") return <div className="relative h-32 w-36 [transform-style:preserve-3d]"><div className="absolute bottom-1 left-1/2 h-6 w-28 -translate-x-1/2 rounded-[50%] bg-[#B97812]/20 blur-xl" /><div className="absolute bottom-3 left-1/2 h-5 w-28 -translate-x-1/2 rounded-[50%] border border-[#B97812]/40 bg-gradient-to-b from-[#E9B94D] to-[#8A510B] shadow-[0_18px_28px_rgba(137,81,11,.22)]" /><div className="absolute left-1/2 top-6 h-20 w-20 -translate-x-1/2 rounded-b-[45%] rounded-t-[28%] border border-[#F3D486] bg-gradient-to-br from-[#F9D878] via-[#C98A22] to-[#754309] shadow-[inset_8px_6px_10px_rgba(255,255,255,.28),inset_-8px_-10px_16px_rgba(50,20,0,.28),0_16px_24px_rgba(137,81,11,.2)]" /><div className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 rounded-[50%] border border-[#F3D486] bg-gradient-to-b from-[#F8D77B] to-[#B8730F]" /><div className="absolute left-1/2 top-8 h-14 w-2 -translate-x-1/2 rounded-full bg-[#F8DA85]/70" /><div className="absolute left-[18%] top-10 h-10 w-4 rounded-full border border-[#D79B36]" /><div className="absolute right-[18%] top-10 h-10 w-4 rounded-full border border-[#D79B36]" /></div>;
  return <div className="relative h-32 w-40 [transform-style:preserve-3d]"><div className="absolute bottom-2 left-1/2 h-5 w-32 -translate-x-1/2 rounded-[50%] bg-[#B97812]/20 blur-xl" /><div className="absolute bottom-3 left-1/2 h-6 w-32 -translate-x-1/2 rounded-[50%] border border-[#B97812]/40 bg-gradient-to-b from-[#F2CF79] to-[#9A5D0D] shadow-[0_16px_26px_rgba(137,81,11,.22)]" /><div className="absolute bottom-9 left-1/2 h-14 w-24 -translate-x-1/2 rounded-md border border-[#D6B46B] bg-gradient-to-b from-[#FBF8EF] to-[#D9C8A7] shadow-[inset_-8px_0_12px_rgba(80,50,10,.08)]" /><div className="absolute bottom-14 left-1/2 h-14 w-14 -translate-x-1/2 -rotate-45 rounded-[4px] border border-[#F4D47B] bg-gradient-to-br from-[#F8D77B] via-[#C98A21] to-[#704008] shadow-[0_10px_20px_rgba(137,81,11,.25)]" /><div className="absolute bottom-[4.2rem] left-[calc(50%-28px)] h-7 w-28 rounded-full border-2 border-[#D8A33C]" /></div>; }

function InfoBox({ title, text }: { title: string; text: string }) { return <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#C9922C]/15 bg-[#C9922C]/6 p-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9922C]/12 text-[#A36F18]"><Clock3 className="h-4 w-4" /></div><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-[#211A14]/55">{text}</p></div></div>; }

function ChoiceCard({ selected, onClick, icon, title, subtitle, badge, compact = false }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; subtitle: string; badge?: string; compact?: boolean }) { return <motion.button type="button" onClick={onClick} whileHover={{ y: -3 }} whileTap={{ scale: .985 }} className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border text-left transition duration-300 ${compact ? "min-h-[88px] p-4" : "min-h-[112px] p-5"} ${selected ? "border-[#C9922C] bg-[#FFF9ED] shadow-[0_14px_35px_rgba(201,146,44,.14)]" : "border-[#211A14]/9 bg-white/90 hover:border-[#C9922C]/35 hover:bg-[#FCFAF6]"}`}>{selected && <motion.div layoutId="choice-glow" className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#D6A03D]/15 blur-2xl" />}{badge && <span className={`absolute right-4 top-3 text-[9px] font-black tracking-widest ${selected ? "text-[#A97419]" : "text-[#211A14]/20"}`}>{badge}</span>}<span className={`relative flex shrink-0 items-center justify-center rounded-2xl transition ${compact ? "h-11 w-11" : "h-12 w-12"} ${selected ? "bg-[#D6A03D] text-[#211A14] shadow-lg" : "bg-[#F5EEE1] text-[#211A14]/55 group-hover:bg-[#EEE4D2]"}`}>{icon}</span><span className="relative min-w-0 flex-1"><span className="block font-bold tracking-[-.01em]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#211A14]/45">{subtitle}</span></span><span className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${selected ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#211A14]/12 text-transparent"}`}><Check className="h-3.5 w-3.5" /></span></motion.button>; }

function WeakPointPanel({ subject, selected, onToggle, number }: { subject: Subject; selected: string[]; onToggle: (topic: string) => void; number: number }) { const Icon = subject.icon; return <section className="rounded-[24px] border border-[#211A14]/8 bg-white/85 p-4 shadow-[0_10px_30px_rgba(33,26,20,.05)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE1] text-[#A97419]"><Icon className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><p className="font-bold">{subject.title}</p><span className="rounded-full bg-[#F7F2E8] px-2 py-0.5 text-[9px] font-black text-[#A97419]">FAN {number}</span></div><p className="mt-0.5 text-xs text-[#211A14]/40">Qiynalayotgan barcha mavzularni belgilang</p></div></div><span className="shrink-0 rounded-full bg-[#211A14] px-2.5 py-1 text-[10px] font-bold text-white">{selected.length} ta</span></div><div className="grid gap-2 sm:grid-cols-2">{subject.topics.map((topic) => { const active = selected.includes(topic); return <motion.button key={topic} type="button" whileTap={{ scale: .98 }} onClick={() => onToggle(topic)} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${active ? "border-[#C9922C] bg-[#C9922C]/8 font-semibold shadow-sm" : "border-[#211A14]/8 bg-[#FCFAF6] hover:border-[#C9922C]/35 hover:bg-[#FAF7F0]"}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#211A14]/12"}`}>{active && <Check className="h-3 w-3" />}</span><span className="flex-1">{topic}</span></motion.button>; })}</div></section>; }
