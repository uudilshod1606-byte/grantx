import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeOut" as const },
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
    <main className="relative min-h-screen overflow-hidden bg-[#120E0A] text-[#211A14] selection:bg-[#D6A03D]/25">
      <AmbientBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] items-center p-0 sm:p-3 lg:p-5">
        <div className="grid min-h-screen w-full overflow-hidden bg-[#FBF8F1] shadow-[0_45px_140px_rgba(0,0,0,.34)] sm:min-h-[calc(100vh-24px)] sm:rounded-[30px] lg:min-h-[calc(100vh-40px)] lg:grid-cols-[minmax(430px,.78fr)_minmax(720px,1.55fr)] lg:rounded-[38px]">
          <VisualPanel step={step} selectedSubjects={selectedSubjects} />

          <section className="flex min-h-0 min-w-0 flex-col bg-[#FCFBF8]">
            <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-12 lg:pt-8">
              <button onClick={back} className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-[#211A14]/55 transition hover:bg-[#F3EBDD] hover:text-[#211A14]">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Orqaga
              </button>
              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-1.5 sm:flex">{steps.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 === step ? "w-9 bg-[#C9922C]" : index + 1 < step ? "w-3 bg-[#C9922C]/45" : "w-3 bg-[#211A14]/9"}`} />)}</div>
                <div className="rounded-full border border-[#211A14]/8 bg-white px-3.5 py-2 text-xs font-bold tabular-nums text-[#211A14]/55 shadow-[0_5px_18px_rgba(33,26,20,.05)]">0{step} / 05</div>
              </div>
            </div>

            <div className="px-5 pt-5 sm:px-8 lg:px-12 lg:pt-6"><div className="h-1 overflow-hidden rounded-full bg-[#211A14]/7"><motion.div className="h-full rounded-full bg-[#C9922C]" animate={{ width: `${step * 20}%` }} transition={{ duration: .45, ease: "easeOut" }} /></div></div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-8 sm:px-8 sm:pb-7 lg:px-12 lg:pt-9">
              <AnimatePresence mode="wait">
                {step === 1 && <motion.div key="one" {...pageMotion}><StepHeader eyebrow="01 · BOSHLAYMIZ" icon={<Target />} title={<>Qaysi imtihonga<br className="hidden sm:block" /> <em>tayyorlanyapsiz?</em></>} subtitle="Siz haqingizdagi bir nechta ma'lumotni bilsak, AI rejangizni ancha aniq va samarali tuzadi." /><div className="mt-8 grid gap-4 sm:grid-cols-2"><ExamChoice selected={examType === "milliy"} onClick={() => setExamType("milliy")} type="milliy" /><ExamChoice selected={examType === "dtm"} onClick={() => setExamType("dtm")} type="dtm" /></div></motion.div>}
                {step === 2 && <motion.div key="two" {...pageMotion}><StepHeader eyebrow="02 · TIMELINE" icon={<CalendarDays />} title={<>Imtihoningiz<br className="hidden sm:block" /> <em>qachon?</em></>} subtitle="Qancha vaqt qolganini bilish AI'ga yuklamani to'g'ri taqsimlashga yordam beradi." /><div className="mt-8 max-w-2xl"><label className="block"><span className="mb-3 block text-sm font-bold">Imtihon sanasi</span><input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} min={new Date().toISOString().split("T")[0]} className="h-16 w-full rounded-2xl border border-[#211A14]/10 bg-[#FAF7F0] px-5 text-lg font-semibold outline-none transition focus:border-[#C9922C] focus:ring-4 focus:ring-[#C9922C]/10" /></label><InfoBox title="Aniq sana = aniqroq reja" text="AI qolgan kunlarni bosqichlarga bo'lib, oxirgi kunlarda takrorlash va sinovlarni ko'paytiradi." /></div></motion.div>}
                {step === 3 && <motion.div key="three" {...pageMotion}><StepHeader eyebrow="03 · FOCUS" icon={<BookOpen />} title={<>Qaysi fanlarga<br className="hidden sm:block" /> <em>e'tibor beramiz?</em></>} subtitle="Eng muhim 2 ta fanni tanlang. Keyin AI har bir fan bo'yicha alohida kuchsiz mavzularni belgilashingizga yordam beradi." /><div className="mt-7 flex items-center justify-between rounded-2xl border border-[#211A14]/6 bg-[#F7F0E4] px-4 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#211A14] text-[#F5D58A]"><Sparkles className="h-4 w-4" /></div><span className="text-sm font-semibold">Asosiy fanlar</span></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">{selectedSubjects.length} / 2</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{subjects.map((subject, index) => { const Icon = subject.icon; return <ChoiceCard key={subject.id} compact selected={selectedSubjects.includes(subject.id)} onClick={() => toggleSubject(subject.id)} icon={<Icon />} title={subject.title} subtitle={selectedSubjects.includes(subject.id) ? "Asosiy fan" : "Tanlash"} badge={String(index + 1).padStart(2, "0")} />; })}</div></motion.div>}
                {step === 4 && <motion.div key="four" {...pageMotion}><StepHeader eyebrow="04 · DIAGNOSIS" icon={<Pencil />} title={<>Kuchsiz joylarni<br className="hidden sm:block" /> <em>aniqlaymiz.</em></>} subtitle="Tanlagan ikkala faningiz uchun ham alohida mavzular mavjud. Qiynalayotganlaringizni belgilang — AI aynan shu joylarga ko'proq vaqt ajratadi." /><div className="mt-7 space-y-4">{selectedSubjects.map((id, index) => { const subject = subjects.find((item) => item.id === id); if (!subject) return null; return <WeakPointPanel key={id} subject={subject} number={index + 1} selected={weakPoints[id] ?? []} onToggle={(topic) => toggleWeakPoint(id, topic)} />; })}</div></motion.div>}
                {step === 5 && <motion.div key="five" {...pageMotion}><StepHeader eyebrow="05 · RHYTHM" icon={<Timer />} title={<>Sizning <em>ritmingiz</em> qanday?</>} subtitle="Ko'p vaqt emas — sizga mos va davom ettira oladigan ritm muhim." /><div className="mt-8 grid gap-3 sm:grid-cols-2">{timeOptions.map((option) => { const Icon = option.icon; return <ChoiceCard key={option.id} selected={time === option.id} onClick={() => setTime(option.id)} icon={<Icon />} title={option.title} subtitle={option.subtitle} />; })}</div><div className="relative mt-6 overflow-hidden rounded-[26px] bg-[#1D1711] p-6 text-white shadow-[0_20px_50px_rgba(33,26,20,.18)]"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#D6A03D]/18 blur-3xl" /><div className="relative flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D6A03D] text-[#211A14]"><Sparkles className="h-5 w-5" /></div><div><p className="font-bold">AI rejangiz tayyorlanadi</p><p className="mt-1.5 max-w-xl text-sm leading-6 text-white/60">Siz bergan ma'lumotlar asosida kunlik maqsadlar, mavzular va takrorlashlar tartiblanadi.</p></div></div></div></motion.div>}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 border-t border-[#211A14]/7 bg-white/90 px-5 py-4 sm:px-8 lg:px-12 lg:py-5"><div className="hidden min-w-0 items-center gap-2 text-xs text-[#211A14]/38 sm:flex"><ShieldCheck className="h-4 w-4 text-[#C9922C]" /> Ma'lumotlaringiz xavfsiz saqlanadi</div><button onClick={next} disabled={!canContinue} className="group ml-auto inline-flex min-h-12 min-w-[190px] items-center justify-center gap-3 rounded-2xl bg-[#D39A2E] px-6 text-sm font-bold text-[#211A14] shadow-[0_14px_32px_rgba(201,146,44,.25)] transition hover:-translate-y-0.5 hover:bg-[#E0AD4C] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none">{step === 5 ? "Rejani boshlash" : "Davom etish"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button></div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AmbientBackground() { return <><div className="pointer-events-none absolute -left-64 -top-64 h-[720px] w-[720px] rounded-full bg-[#D6A03D]/10 blur-3xl" /><div className="pointer-events-none absolute -bottom-72 -right-64 h-[760px] w-[760px] rounded-full bg-[#8A5D2F]/10 blur-3xl" /></>; }

function VisualPanel({ step, selectedSubjects }: { step: number; selectedSubjects: SubjectId[] }) {
  const copy = [["Maqsadingiz aniq,", "rejangiz shaxsiy."], ["Vaqtingizni", "natijaga aylantiramiz."], ["Fokusni", "eng muhim fanlarga beramiz."], ["Kuchsiz mavzularni", "AI bilan kuchaytiramiz."], ["Reja tayyor.", "Endi natija sari."]][step - 1];
  return <aside className="relative hidden overflow-hidden bg-[#120E0A] text-white lg:block"><div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_32%,rgba(214,160,61,.16),transparent_29%),radial-gradient(circle_at_10%_92%,rgba(214,160,61,.08),transparent_34%)]" /><div className="absolute inset-5 rounded-[28px] border border-[#D6A03D]/10" /><div className="relative flex h-full min-h-[720px] flex-col p-8 xl:p-11"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F3C65B] via-[#C9922C] to-[#80520E] font-serif text-xl font-bold text-[#211A14] shadow-[0_8px_30px_rgba(214,160,61,.28)]">I</div><div><div className="font-serif text-[22px] tracking-[-.04em]">INTIL</div><div className="text-[8px] font-bold tracking-[.28em] text-[#D6A03D]">AI · TA'LIM · NATIJA</div></div></div><div className="relative flex min-h-[390px] flex-1 items-center justify-center [perspective:1200px]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute h-[340px] w-[340px] rounded-full border border-[#D6A03D]/15 [transform:rotateX(64deg)]" /><motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute h-[270px] w-[270px] rounded-full border border-dashed border-[#D6A03D]/18 [transform:rotateX(68deg)_rotateY(10deg)]" /><motion.div animate={{ y: [0, -9, 0], rotateZ: [0, 1.5, 0, -1.5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative h-56 w-56 [transform-style:preserve-3d]"><div className="absolute inset-0 rounded-full border border-[#F8D989]/35 bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,.75),rgba(238,185,71,.55)_22%,rgba(126,74,9,.88)_68%,rgba(25,10,0,.98))] shadow-[inset_18px_18px_35px_rgba(255,255,255,.16),inset_-25px_-30px_45px_rgba(15,5,0,.55),0_35px_80px_rgba(0,0,0,.5)] [transform:translateZ(30px)]" /><div className="absolute inset-10 rounded-full border border-white/15 bg-black/10 backdrop-blur-[2px] [transform:translateZ(48px)]" /><div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[30px] border border-[#F8D989]/40 bg-[#1C140D]/65 text-[#F8D989] shadow-[0_0_50px_rgba(214,160,61,.25)] backdrop-blur-xl [transform:translateZ(75px)_rotate(-6deg)]"><span className="font-serif text-6xl leading-none">I</span></div><div className="absolute left-[18%] top-[10%] h-4 w-4 rounded-full bg-[#F7D37A] shadow-[0_0_25px_#D6A03D]" /></motion.div><OrbitDot className="left-[10%] top-[28%]" delay={0} /><OrbitDot className="right-[12%] top-[20%]" delay={1.1} /><OrbitDot className="right-[18%] bottom-[20%]" delay={2} /><FloatingCard className="left-0 top-[20%]" title="AI TAHLIL" value="Shaxsiy" icon={<Brain />} /><FloatingCard className="right-0 bottom-[20%]" title="FOCUS" value={selectedSubjects.length ? `${selectedSubjects.length} fan` : "SMART"} icon={<Target />} /></div><div className="relative max-w-md"><AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .28 }}><p className="mb-3 text-[10px] font-bold uppercase tracking-[.26em] text-[#D6A03D]">INTIL AI · SHAXSIY REJA</p><h2 className="font-serif text-[2.55rem] leading-[.98] tracking-[-.045em] xl:text-[3.2rem]">{copy[0]}<br /><span className="text-white/42">{copy[1]}</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/45">Har bir javobingiz keyingi bosqichni sizga moslashtiradi.</p></motion.div></AnimatePresence></div><div className="relative mt-7 flex items-center gap-2">{steps.map((label, index) => <div key={label} className="flex items-center gap-2"><div className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 <= step ? "w-9 bg-[#D6A03D]" : "w-2 bg-white/15"}`} /><span className="hidden text-[9px] font-medium text-white/30 xl:block">{index + 1 === step ? label : ""}</span></div>)}</div></div></aside>;
}

function OrbitDot({ className, delay }: { className: string; delay: number }) { return <motion.span animate={{ y: [0, -8, 0], opacity: [.5, 1, .5] }} transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" }} className={`absolute h-2.5 w-2.5 rounded-full bg-[#D6A03D] shadow-[0_0_18px_rgba(214,160,61,.8)] ${className}`} />; }
function FloatingCard({ className, title, value, icon }: { className: string; title: string; value: string; icon: ReactNode }) { return <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute z-30 rounded-2xl border border-white/10 bg-[#21170F]/78 px-3.5 py-3 shadow-2xl backdrop-blur-xl ${className}`}><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D6A03D]/15 text-[#D6A03D]">{icon}</div><div><p className="text-[8px] font-medium uppercase tracking-wider text-white/35">{title}</p><p className="text-sm font-bold text-white/90">{value}</p></div></div></motion.div>; }
function StepHeader({ eyebrow, icon, title, subtitle }: { eyebrow: string; icon: ReactNode; title: ReactNode; subtitle: string }) { return <div className="max-w-3xl"><div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6A03D]/12 text-[#A97419] shadow-sm">{icon}</div><span className="text-[10px] font-black tracking-[.22em] text-[#A97419]">{eyebrow}</span></div><h1 className="font-serif text-[2.35rem] leading-[1.02] tracking-[-.05em] sm:text-5xl lg:text-[3.35rem]">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#211A14]/50 sm:text-base">{subtitle}</p></div>; }
function ExamChoice({ selected, onClick, type }: { selected: boolean; onClick: () => void; type: ExamType }) { const milliy = type === "milliy"; return <motion.button type="button" onClick={onClick} whileHover={{ y: -4 }} whileTap={{ scale: .985 }} className={`group relative min-h-[286px] overflow-hidden rounded-[28px] border text-left transition duration-300 ${selected ? "border-[#C9922C] bg-[#FFF9ED] shadow-[0_22px_60px_rgba(201,146,44,.16)]" : "border-[#211A14]/9 bg-white hover:border-[#C9922C]/40 hover:shadow-[0_18px_45px_rgba(33,26,20,.08)]"}`}><div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border border-[#211A14]/15">{selected && <span className="h-3.5 w-3.5 rounded-full bg-[#C9922C] shadow-[0_0_0_4px_rgba(201,146,44,.12)]" />}</div><div className="relative flex h-[170px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(214,160,61,.15),transparent_62%)]"><ExamVisual type={type} /></div><div className="px-7 pb-7"><div className="text-xl font-bold tracking-[-.02em]">{milliy ? "Milliy Sertifikat" : "DTM"}</div><p className="mt-1 text-sm text-[#211A14]/50">{milliy ? "Fan bo'yicha chuqur tayyorgarlik" : "Kirish imtihoniga tayyorgarlik"}</p><span className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${selected ? "bg-[#D6A03D]/20 text-[#946514]" : "bg-[#F5EEE1] text-[#6D5A3E]"}`}>{milliy ? "Fan bilimini oshirish" : "Imtihonga kirish"}</span></div></motion.button>; }
function ExamVisual({ type }: { type: ExamType }) { if (type === "dtm") return <div className="relative h-32 w-36"><div className="absolute bottom-0 left-1/2 h-5 w-28 -translate-x-1/2 rounded-[50%] bg-[#B97812]/20 blur-xl" /><div className="absolute bottom-2 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-[26px] border border-[#EBC56E] bg-gradient-to-br from-[#F7D477] via-[#C98A22] to-[#71400A] text-[#fff1bd] shadow-[inset_7px_6px_13px_rgba(255,255,255,.28),inset_-9px_-12px_18px_rgba(50,20,0,.28),0_18px_28px_rgba(137,81,11,.2)]"><Trophy className="h-12 w-12" strokeWidth={1.35} /></div><div className="absolute left-1/2 top-3 h-4 w-16 -translate-x-1/2 rounded-[50%] bg-[#F9DA83]/70 blur-[1px]" /></div>; return <div className="relative h-32 w-40"><div className="absolute bottom-0 left-1/2 h-5 w-32 -translate-x-1/2 rounded-[50%] bg-[#B97812]/20 blur-xl" /><div className="absolute bottom-3 left-1/2 h-6 w-32 -translate-x-1/2 rounded-[50%] border border-[#B97812]/40 bg-gradient-to-b from-[#F2CF79] to-[#9A5D0D]" /><div className="absolute bottom-8 left-1/2 h-12 w-24 -translate-x-1/2 rounded-md border border-[#D6B46B] bg-gradient-to-b from-[#FBF8EF] to-[#D9C8A7]" /><div className="absolute bottom-[3.9rem] left-1/2 flex h-14 w-14 -translate-x-1/2 -rotate-45 items-center justify-center rounded-[5px] border border-[#F4D47B] bg-gradient-to-br from-[#F8D77B] via-[#C98A21] to-[#704008] shadow-[0_10px_20px_rgba(137,81,11,.25)]"><GraduationCap className="h-7 w-7 rotate-45 text-[#FFF0B5]" strokeWidth={1.5} /></div><div className="absolute bottom-[4.1rem] left-[calc(50%-28px)] h-7 w-28 rounded-full border-2 border-[#D8A33C]" /></div>; }
function InfoBox({ title, text }: { title: string; text: string }) { return <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#C9922C]/15 bg-[#C9922C]/6 p-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9922C]/12 text-[#A36F18]"><Clock3 className="h-4 w-4" /></div><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-[#211A14]/55">{text}</p></div></div>; }
function ChoiceCard({ selected, onClick, icon, title, subtitle, badge, compact = false }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; subtitle: string; badge?: string; compact?: boolean }) { return <motion.button type="button" onClick={onClick} whileHover={{ y: -3 }} whileTap={{ scale: .985 }} className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border text-left transition duration-300 ${compact ? "min-h-[88px] p-4" : "min-h-[112px] p-5"} ${selected ? "border-[#C9922C] bg-[#FFF9ED] shadow-[0_14px_35px_rgba(201,146,44,.14)]" : "border-[#211A14]/9 bg-white/90 hover:border-[#C9922C]/35 hover:bg-[#FCFAF6]"}`}>{selected && <motion.div layoutId="choice-glow" className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#D6A03D]/15 blur-2xl" />}{badge && <span className={`absolute right-4 top-3 text-[9px] font-black tracking-widest ${selected ? "text-[#A97419]" : "text-[#211A14]/20"}`}>{badge}</span>}<span className={`relative flex shrink-0 items-center justify-center rounded-2xl transition ${compact ? "h-11 w-11" : "h-12 w-12"} ${selected ? "bg-[#D6A03D] text-[#211A14] shadow-lg" : "bg-[#F5EEE1] text-[#211A14]/55 group-hover:bg-[#EEE4D2]"}`}>{icon}</span><span className="relative min-w-0 flex-1"><span className="block font-bold tracking-[-.01em]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#211A14]/45">{subtitle}</span></span><span className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${selected ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#211A14]/12 text-transparent"}`}><Check className="h-3.5 w-3.5" /></span></motion.button>; }
function WeakPointPanel({ subject, selected, onToggle, number }: { subject: Subject; selected: string[]; onToggle: (topic: string) => void; number: number }) { const Icon = subject.icon; return <section className="rounded-[24px] border border-[#211A14]/8 bg-white/85 p-4 shadow-[0_10px_30px_rgba(33,26,20,.05)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE1] text-[#A97419]"><Icon className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><p className="font-bold">{subject.title}</p><span className="rounded-full bg-[#F7F2E8] px-2 py-0.5 text-[9px] font-black text-[#A97419]">FAN {number}</span></div><p className="mt-0.5 text-xs text-[#211A14]/40">Qiynalayotgan barcha mavzularni belgilang</p></div></div><span className="shrink-0 rounded-full bg-[#211A14] px-2.5 py-1 text-[10px] font-bold text-white">{selected.length} ta</span></div><div className="grid gap-2 sm:grid-cols-2">{subject.topics.map((topic) => { const active = selected.includes(topic); return <motion.button key={topic} type="button" whileTap={{ scale: .98 }} onClick={() => onToggle(topic)} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${active ? "border-[#C9922C] bg-[#C9922C]/8 font-semibold shadow-sm" : "border-[#211A14]/8 bg-[#FCFAF6] hover:border-[#C9922C]/35 hover:bg-[#FAF7F0]"}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? "border-[#C9922C] bg-[#C9922C] text-white" : "border-[#211A14]/12"}`}>{active && <Check className="h-3 w-3" />}</span><span className="flex-1">{topic}</span></motion.button>; })}</div></section>; }
