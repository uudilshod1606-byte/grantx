import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Microscope,
  Sparkles,
  Target,
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

type Subject = {
  id: string;
  name: string;
  short: string;
  description: string;
  icon: typeof BookOpen;
  topics: string[];
};

const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Matematika",
    short: "MAT",
    description: "Algebra, geometriya va masalalar",
    icon: Brain,
    topics: ["Algebra", "Funksiyalar", "Geometriya", "Ehtimollik", "Tenglamalar"],
  },
  {
    id: "physics",
    name: "Fizika",
    short: "FIZ",
    description: "Mexanika, elektr va formulalar",
    icon: Zap,
    topics: ["Mexanika", "Elektr", "Optika", "Termodinamika", "Formulalar"],
  },
  {
    id: "chemistry",
    name: "Kimyo",
    short: "KIM",
    description: "Reaksiyalar, hisob-kitob va organik kimyo",
    icon: FlaskConical,
    topics: ["Reaksiyalar", "Hisob-kitob", "Organik kimyo", "Anorganik kimyo", "Periodik jadval"],
  },
  {
    id: "biology",
    name: "Biologiya",
    short: "BIO",
    description: "Hujayra, genetika va organizmlar",
    icon: Microscope,
    topics: ["Hujayra", "Genetika", "Anatomiya", "Ekologiya", "Evolyutsiya"],
  },
];

const TOTAL_STEPS = 5;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState<ExamType | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [weakPoints, setWeakPoints] = useState<Record<string, string[]>>({});
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [dailyTime, setDailyTime] = useState<TimeOption | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedSubjects = useMemo(
    () => SUBJECTS.filter((subject) => subjects.includes(subject.id)),
    [subjects],
  );

  const canContinue =
    (step === 1 && !!exam) ||
    (step === 2 && subjects.length > 0) ||
    (step === 3 && subjects.every((id) => (weakPoints[id] ?? []).length > 0)) ||
    (step === 4 && !!examDate && !!targetScore) ||
    (step === 5 && !!dailyTime);

  const toggleSubject = (id: string) => {
    setSubjects((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        setWeakPoints((points) => {
          const copy = { ...points };
          delete copy[id];
          return copy;
        });
        return next;
      }
      return [...current, id];
    });
  };

  const toggleWeakPoint = (subjectId: string, topic: string) => {
    setWeakPoints((current) => {
      const selected = current[subjectId] ?? [];
      const next = selected.includes(topic)
        ? selected.filter((item) => item !== topic)
        : [...selected, topic];
      return { ...current, [subjectId]: next };
    });
  };

  const next = () => {
    if (!canContinue) return;
    if (step < TOTAL_STEPS) setStep((value) => value + 1);
  };

  const back = () => setStep((value) => Math.max(1, value - 1));

  const finish = async () => {
    if (!canContinue || saving) return;
    setSaving(true);
    const payload = {
      examType: exam,
      examDate,
      targetScore: Number(targetScore) || null,
      subjects,
      weakPoints,
      dailyTime,
    };
    window.localStorage.setItem("intil_onboarding", JSON.stringify(payload));
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#0c0a08] text-[#211b15] selection:bg-[#d99a2b]/20">
      <div className="relative mx-auto flex min-h-screen max-w-[1800px] overflow-hidden bg-[#0c0a08] lg:p-4">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_72%_30%,rgba(214,158,48,.12),transparent_25%),radial-gradient(circle_at_20%_80%,rgba(214,158,48,.08),transparent_24%)]" />

        <aside className="relative hidden w-[39%] min-w-[420px] overflow-hidden rounded-[30px] border border-[#b8822b]/20 bg-[radial-gradient(circle_at_50%_38%,#3a2814_0%,#17110b_33%,#0b0907_72%)] lg:flex">
          <GoldOrbitArt />
          <div className="relative z-10 flex w-full flex-col p-10 xl:p-12">
            <Brand />
            <div className="mt-auto max-w-[520px] pb-3">
              <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#dca13b]">
                <span className="h-px w-8 bg-[#dca13b]" /> INTIL AI · SHAXSIY REJA
              </div>
              <h1 className="font-serif text-[clamp(42px,4.2vw,70px)] leading-[.98] tracking-[-.045em] text-white">
                Maqsadingiz aniq,
                <br />
                rejangiz <span className="text-[#e0a33a]">shaxsiy.</span>
              </h1>
              <p className="mt-6 max-w-[440px] text-[16px] leading-7 text-white/58">
                Sun’iy intellekt yordamida eng samarali tayyorgarlik yo‘lini birga yaratamiz.
              </p>
              <div className="mt-9 grid max-w-[460px] grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] backdrop-blur-xl">
                {[
                  ["10 000+", "o‘quvchi"],
                  ["95%", "muvaffaqiyat"],
                  ["24/7", "AI mentor"],
                ].map(([value, label]) => (
                  <div key={value} className="border-r border-white/10 px-4 py-4 last:border-r-0">
                    <p className="text-[18px] font-semibold text-[#e7ad48]">{value}</p>
                    <p className="mt-0.5 text-[11px] text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center bg-[#fbf9f5] lg:m-0 lg:min-h-[calc(100vh-32px)] lg:rounded-[30px]">
          <div className="flex min-h-screen w-full max-w-[980px] flex-col px-6 py-7 sm:px-10 lg:min-h-0 lg:px-14 lg:py-10 xl:px-20">
            <header className="flex items-center justify-between border-b border-[#e9e2d6] pb-6">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="group inline-flex items-center gap-2 text-[14px] font-medium text-[#625a51] transition hover:text-[#1f1913] disabled:invisible"
              >
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                Orqaga
              </button>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-[#e9e1d4] bg-white px-4 py-2 text-[13px] font-semibold tabular-nums text-[#514a42] shadow-[0_5px_20px_rgba(80,55,25,.04)]">
                  0{step} / 0{TOTAL_STEPS}
                </span>
                <div className="hidden items-center gap-2 sm:flex">
                  {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                    <span key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index + 1 === step ? "w-8 bg-[#c98a1c]" : index + 1 < step ? "w-5 bg-[#e1b35f]" : "w-3 bg-[#e9e2d8]"}`} />
                  ))}
                </div>
              </div>
            </header>

            <div className="h-1 overflow-hidden rounded-full bg-[#eee8df]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#c17d0e] to-[#e2ad4d] transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>

            <div className="flex flex-1 flex-col pt-9 sm:pt-12">
              {step === 1 && <StepExam value={exam} onChange={setExam} />}
              {step === 2 && <StepSubjects selected={subjects} onToggle={toggleSubject} />}
              {step === 3 && <StepWeakPoints subjects={selectedSubjects} weakPoints={weakPoints} onToggle={toggleWeakPoint} />}
              {step === 4 && <StepGoal examDate={examDate} targetScore={targetScore} onDateChange={setExamDate} onScoreChange={setTargetScore} />}
              {step === 5 && <StepTime value={dailyTime} onChange={setDailyTime} />}

              <div className="mt-auto pt-9 sm:pt-12">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-[#948b80]">
                    <LockKeyhole className="h-3.5 w-3.5 text-[#c88a20]" />
                    Ma’lumotlaringiz xavfsiz saqlanadi
                  </div>
                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canContinue}
                      className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#b9770c] px-7 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(185,119,12,.2)] transition hover:-translate-y-0.5 hover:bg-[#a96c09] disabled:cursor-not-allowed disabled:bg-[#d7cbb9] disabled:shadow-none"
                    >
                      Davom etish
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finish}
                      disabled={!canContinue || saving}
                      className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#b9770c] px-7 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(185,119,12,.2)] transition hover:-translate-y-0.5 hover:bg-[#a96c09] disabled:cursor-not-allowed disabled:bg-[#d7cbb9] disabled:shadow-none"
                    >
                      {saving ? "Rejangiz tayyorlanmoqda…" : "Rejamni yaratish"}
                      {saving ? <Sparkles className="h-4 w-4 animate-pulse" /> : <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-[#f0b441] to-[#a96d10] text-[#21150a] shadow-[0_0_35px_rgba(220,157,48,.25)]">
        <span className="font-serif text-[31px] leading-none">I</span>
      </div>
      <div>
        <p className="font-serif text-[28px] tracking-[.06em] text-white">INTIL</p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.34em] text-[#d99a2b]">AI · TA’LIM · NATIJA</p>
      </div>
    </div>
  );
}

function GoldOrbitArt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[48%] top-[38%] h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c68a29]/20 [box-shadow:0_0_80px_rgba(210,150,42,.08)]" />
      <div className="absolute left-[48%] top-[38%] h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d79b31]/25 rotate-[-22deg]" />
      <div className="absolute left-[48%] top-[38%] h-[200px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#e1ac49]/35 rotate-[27deg]" />
      <div className="absolute left-[48%] top-[38%] h-[200px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#a96d16]/30 rotate-[-30deg]" />
      <div className="absolute left-[48%] top-[38%] grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[34px] border border-[#e2ae4f]/40 bg-gradient-to-br from-[#dca445]/50 via-[#9a6416]/35 to-[#2a1a0c]/60 shadow-[0_0_80px_rgba(214,155,44,.22),inset_0_0_35px_rgba(255,220,135,.1)] backdrop-blur-xl">
        <div className="grid h-20 w-20 place-items-center rounded-[24px] border border-white/15 bg-white/[.05]">
          <span className="font-serif text-[54px] text-[#f5d58e] drop-shadow-[0_0_18px_rgba(240,185,75,.4)]">I</span>
        </div>
      </div>
      {[[22, 30], [76, 25], [15, 55], [82, 52], [56, 18], [67, 62]].map(([left, top], index) => (
        <span key={index} className="absolute h-2.5 w-2.5 rounded-full bg-[#e6ad42] shadow-[0_0_18px_6px_rgba(230,173,66,.16)]" style={{ left: `${left}%`, top: `${top}%` }} />
      ))}
      <div className="absolute bottom-[25%] left-[42%] h-40 w-40 -translate-x-1/2 rounded-full bg-[#d99b31]/10 blur-3xl" />
    </div>
  );
}

function SectionIntro({ eyebrow, title, accent, description, icon: Icon }: { eyebrow: string; title: string; accent?: string; description: string; icon: typeof Target }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-[#eadbc1] bg-[#fffdf8] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[.13em] text-[#ad7110] shadow-[0_4px_18px_rgba(80,55,25,.035)]">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        {eyebrow}
      </div>
      <h2 className="mt-6 max-w-[720px] font-serif text-[clamp(38px,4.4vw,58px)] leading-[1.02] tracking-[-.045em] text-[#201913]">
        {title} {accent ? <span className="text-[#c98416]">{accent}</span> : null}
      </h2>
      <p className="mt-4 max-w-[650px] text-[15px] leading-7 text-[#746b61]">{description}</p>
    </div>
  );
}

function ChoiceCard({ selected, onClick, number, icon: Icon, title, description, tag }: { selected: boolean; onClick: () => void; number: string; icon: typeof GraduationCap; title: string; description: string; tag: string }) {
  return (
    <button type="button" onClick={onClick} className={`group relative flex min-h-[235px] flex-col overflow-hidden rounded-[24px] border p-6 text-left transition duration-300 ${selected ? "border-[#d99728] bg-[#fffaf0] shadow-[0_18px_45px_rgba(188,125,20,.12)]" : "border-[#e8e0d5] bg-white hover:-translate-y-1 hover:border-[#d8c5a7] hover:shadow-[0_16px_40px_rgba(64,45,24,.07)]"}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold ${selected ? "bg-[#f4dfb7] text-[#a86c0b]" : "bg-[#f7f3ec] text-[#968b7c]"}`}>{number}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-full border ${selected ? "border-[#c98316] bg-[#c98316]" : "border-[#d8d1c6] bg-white"}`}>
          {selected ? <Check className="h-4 w-4 text-white" /> : null}
        </span>
      </div>
      <div className={`mt-5 grid h-16 w-16 place-items-center rounded-2xl transition ${selected ? "bg-[#f2d79f] text-[#9e6208]" : "bg-[#f8f4ed] text-[#9b8c78] group-hover:bg-[#f4eee2]"}`}>
        <Icon className="h-8 w-8" strokeWidth={1.35} />
      </div>
      <div className="mt-auto pt-5">
        <h3 className="text-[18px] font-bold tracking-[-.015em] text-[#201a14]">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-5 text-[#7f766d]">{description}</p>
        <span className="mt-3 inline-flex rounded-full bg-[#f6eddd] px-3 py-1 text-[11px] font-medium text-[#9a6b25]">{tag}</span>
      </div>
    </button>
  );
}

function StepExam({ value, onChange }: { value: ExamType | null; onChange: (value: ExamType) => void }) {
  return (
    <div>
      <SectionIntro eyebrow="01 · Boshlaymiz" title="Qaysi imtihonga" accent="tayyorlanyapsiz?" description="Siz haqingizdagi bir nechta ma’lumotni bilsak, AI rejangizni ancha aniq va samarali tuzadi." icon={Target} />
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        <ChoiceCard selected={value === "milliy"} onClick={() => onChange("milliy")} number="01" icon={GraduationCap} title="Milliy Sertifikat" description="Fan bo‘yicha chuqur tayyorgarlik" tag="Fan bilimini oshirish" />
        <ChoiceCard selected={value === "dtm"} onClick={() => onChange("dtm")} number="02" icon={Trophy} title="DTM" description="Kirish imtihoniga tayyorgarlik" tag="Imtihonga kirish" />
      </div>
    </div>
  );
}

function StepSubjects({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <SectionIntro eyebrow="02 · Yo‘nalish" title="Qaysi fanlar" accent="siz uchun muhim?" description="Bir nechta fanni tanlashingiz mumkin. Keyingi bosqichda har bir tanlangan fan uchun alohida kuchsiz nuqtalarni belgilaymiz." icon={BookOpen} />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SUBJECTS.map((subject) => {
          const selectedNow = selected.includes(subject.id);
          const Icon = subject.icon;
          return (
            <button key={subject.id} type="button" onClick={() => onToggle(subject.id)} className={`group flex items-center gap-4 rounded-[20px] border p-4 text-left transition ${selectedNow ? "border-[#d99628] bg-[#fffaf0] shadow-[0_12px_30px_rgba(188,125,20,.08)]" : "border-[#e8e0d5] bg-white hover:border-[#d9c8ad] hover:shadow-[0_10px_26px_rgba(64,45,24,.05)]"}`}>
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${selectedNow ? "bg-[#f1d59c] text-[#9f640a]" : "bg-[#f7f3ec] text-[#958a7a]"}`}><Icon className="h-6 w-6" strokeWidth={1.45} /></div>
              <div className="min-w-0 flex-1"><p className="text-[16px] font-bold text-[#211b15]">{subject.name}</p><p className="mt-0.5 text-[12px] text-[#81786e]">{subject.description}</p></div>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selectedNow ? "border-[#c98417] bg-[#c98417]" : "border-[#d9d1c5]"}`}>{selectedNow ? <Check className="h-3.5 w-3.5 text-white" /> : null}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[12px] text-[#a0988e]">{selected.length ? `${selected.length} ta fan tanlandi` : "Kamida bitta fan tanlang"}</p>
    </div>
  );
}

function StepWeakPoints({ subjects, weakPoints, onToggle }: { subjects: Subject[]; weakPoints: Record<string, string[]>; onToggle: (subjectId: string, topic: string) => void }) {
  return (
    <div>
      <SectionIntro eyebrow="03 · AI tahlil" title="Kuchsiz nuqtalaringizni" accent="belgilaymiz." description="Har bir fan uchun sizga qiyin bo‘ladigan mavzularni tanlang. AI aynan shu joylarga ko‘proq vaqt ajratadi." icon={Sparkles} />
      <div className="mt-8 space-y-4">
        {subjects.map((subject, index) => {
          const Icon = subject.icon;
          const chosen = weakPoints[subject.id] ?? [];
          return (
            <div key={subject.id} className="rounded-[20px] border border-[#e8e0d5] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7f2e9] text-[#ad7318]"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
                <div className="flex-1"><p className="text-[15px] font-bold text-[#211b15]">{subject.name}</p><p className="text-[11px] text-[#9a9187]">{index + 1} · {chosen.length} ta tanlangan</p></div>
                {chosen.length > 0 ? <span className="text-[11px] font-semibold text-[#ad7318]">AI moslashtiradi</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {subject.topics.map((topic) => {
                  const active = chosen.includes(topic);
                  return <button key={topic} type="button" onClick={() => onToggle(subject.id, topic)} className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${active ? "border-[#d99a2b] bg-[#fff3d8] text-[#9e630a]" : "border-[#e6dfd5] bg-[#fcfbf8] text-[#72695f] hover:border-[#d4c2a5]"}`}>{active ? "✓ " : ""}{topic}</button>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepGoal({ examDate, targetScore, onDateChange, onScoreChange }: { examDate: string; targetScore: string; onDateChange: (value: string) => void; onScoreChange: (value: string) => void }) {
  return (
    <div>
      <SectionIntro eyebrow="04 · Maqsad" title="Qayerga yetib" accent="bormoqchisiz?" description="Maqsadingiz va muddatingizni bilsak, AI rejangizdagi yuklamani real vaqtga moslab beradi." icon={CalendarDays} />
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        <label className="rounded-[22px] border border-[#e8e0d5] bg-white p-5 transition focus-within:border-[#d69a2e] focus-within:shadow-[0_12px_30px_rgba(188,125,20,.07)]">
          <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.12em] text-[#9b9082]"><CalendarDays className="h-4 w-4 text-[#b97916]" /> Imtihon sanasi</span>
          <input type="date" value={examDate} onChange={(event) => onDateChange(event.target.value)} min={new Date().toISOString().slice(0, 10)} className="mt-5 w-full bg-transparent text-[20px] font-semibold text-[#211b15] outline-none" />
        </label>
        <label className="rounded-[22px] border border-[#e8e0d5] bg-white p-5 transition focus-within:border-[#d69a2e] focus-within:shadow-[0_12px_30px_rgba(188,125,20,.07)]">
          <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.12em] text-[#9b9082]"><Target className="h-4 w-4 text-[#b97916]" /> Maqsad ball</span>
          <input inputMode="numeric" value={targetScore} onChange={(event) => onScoreChange(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Masalan, 180" className="mt-5 w-full bg-transparent text-[24px] font-semibold text-[#211b15] outline-none placeholder:text-[#d2cbc1]" />
        </label>
      </div>
    </div>
  );
}

function StepTime({ value, onChange }: { value: TimeOption | null; onChange: (value: TimeOption) => void }) {
  const options: { id: TimeOption; title: string; sub: string }[] = [
    { id: "15-30", title: "15–30 daqiqa", sub: "Band kunlar uchun" },
    { id: "30-60", title: "30–60 daqiqa", sub: "Muvozanatli temp" },
    { id: "1-2", title: "1–2 soat", sub: "Jiddiy tayyorgarlik" },
    { id: "2+", title: "2+ soat", sub: "Maksimal fokus" },
  ];
  return (
    <div>
      <SectionIntro eyebrow="05 · Ritm" title="Har kuni qancha" accent="vaqt ajratasiz?" description="AI sizni ortiqcha yuklamaydi. Reja sizning real hayotingizga mos bo‘lishi kerak." icon={Clock3} />
      <div className="mt-9 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.id;
          return <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`group flex items-center gap-4 rounded-[20px] border p-5 text-left transition ${active ? "border-[#d99628] bg-[#fffaf0] shadow-[0_14px_34px_rgba(188,125,20,.1)]" : "border-[#e8e0d5] bg-white hover:border-[#d9c8ad]"}`}><div className={`grid h-12 w-12 place-items-center rounded-2xl ${active ? "bg-[#f1d59c] text-[#9f640a]" : "bg-[#f7f3ec] text-[#958a7a]"}`}><Clock3 className="h-5 w-5" strokeWidth={1.5} /></div><div className="flex-1"><p className="text-[15px] font-bold text-[#211b15]">{option.title}</p><p className="mt-0.5 text-[12px] text-[#81786e]">{option.sub}</p></div><ChevronRight className={`h-4 w-4 transition ${active ? "translate-x-0 text-[#b97813]" : "-translate-x-1 text-[#c4bbb0] group-hover:translate-x-0"}`} /></button>;
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-[#eee4d4] bg-[#fffaf0] p-4 text-[12px] leading-5 text-[#857763]"><Sparkles className="mr-2 inline h-4 w-4 text-[#c98a1b]" /> AI tanlovlaringiz asosida mashg‘ulotlarni fanlar va kuchsiz mavzular bo‘yicha taqsimlaydi.</div>
    </div>
  );
}
