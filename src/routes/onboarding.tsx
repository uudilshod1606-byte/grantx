import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Lightbulb,
  Pencil,
  Sigma,
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

type Subject = {
  id: SubjectId;
  title: string;
  icon: typeof Sigma;
  topics: string[];
};

const subjects: Subject[] = [
  {
    id: "matematika",
    title: "Matematika",
    icon: Sigma,
    topics: [
      "Algebra",
      "Funksiya",
      "Tenglamalar va tengsizliklar",
      "Trigonometriya",
      "Geometriya",
      "Hosila",
      "Ehtimollik",
      "Logarifm",
    ],
  },
  {
    id: "fizika",
    title: "Fizika",
    icon: Zap,
    topics: [
      "Mexanika",
      "Molekulyar fizika",
      "Termodinamika",
      "Elektr",
      "Magnit maydon",
      "Optika",
      "Formulalarni qo'llash",
      "Masala yechish",
    ],
  },
  {
    id: "kimyo",
    title: "Kimyo",
    icon: FlaskConical,
    topics: [
      "Umumiy kimyo",
      "Anorganik kimyo",
      "Organik kimyo",
      "Reaksiyalar",
      "Hisoblash masalalari",
      "Davriy jadval",
      "Eritmalar",
      "Elektrokimyo",
    ],
  },
  {
    id: "biologiya",
    title: "Biologiya",
    icon: BookOpen,
    topics: [
      "Hujayra",
      "Genetika",
      "Odam anatomiyasi",
      "Botanika",
      "Zoologiya",
      "Ekologiya",
      "Evolyutsiya",
      "Biologik masalalar",
    ],
  },
  {
    id: "ona_tili",
    title: "Ona tili",
    icon: Languages,
    topics: [
      "Grammatika",
      "Imlo",
      "Punktuatsiya",
      "Leksikologiya",
      "Sintaksis",
      "Matn tahlili",
      "Insho / esse",
      "Adabiyot",
    ],
  },
  {
    id: "ingliz_tili",
    title: "Ingliz tili",
    icon: GraduationCap,
    topics: [
      "Grammar",
      "Vocabulary",
      "Reading",
      "Listening",
      "Writing",
      "Speaking",
      "Use of English",
      "Test strategiyasi",
    ],
  },
];

const timeOptions: { id: TimeOption; title: string; subtitle: string; icon: typeof Timer }[] = [
  { id: "15-30", title: "15–30 daqiqa", subtitle: "Qisqa, lekin muntazam mashg'ulotlar", icon: Timer },
  { id: "30-60", title: "30–60 daqiqa", subtitle: "Kuniga bir to'liq mashg'ulot", icon: Clock3 },
  { id: "1-2", title: "1–2 soat", subtitle: "Jiddiy va muvozanatli tayyorgarlik", icon: Brain },
  { id: "2+", title: "2+ soat", subtitle: "Intensiv tayyorgarlik", icon: Trophy },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [weakPoints, setWeakPoints] = useState<Record<SubjectId, string[]>>({} as Record<SubjectId, string[]>);
  const [time, setTime] = useState<TimeOption | null>(null);

  const activeSubject = selectedSubjects.find((id) => (weakPoints[id] ?? []).length === 0) ?? selectedSubjects[0];

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(examType);
    if (step === 2) return Boolean(examDate);
    if (step === 3) return selectedSubjects.length === 2;
    if (step === 4) return selectedSubjects.every((id) => (weakPoints[id] ?? []).length > 0);
    return Boolean(time);
  }, [step, examType, examDate, selectedSubjects, weakPoints, time]);

  const toggleSubject = (id: SubjectId) => {
    setSelectedSubjects((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return current;
      return [...current, id];
    });
  };

  const toggleWeakPoint = (subjectId: SubjectId, topic: string) => {
    setWeakPoints((current) => {
      const existing = current[subjectId] ?? [];
      return {
        ...current,
        [subjectId]: existing.includes(topic)
          ? existing.filter((item) => item !== topic)
          : [...existing, topic],
      };
    });
  };

  const next = () => {
    if (!canContinue) return;
    if (step < 5) {
      setStep((value) => value + 1);
      return;
    }

    const payload = {
      examType,
      examDate,
      subjects: selectedSubjects,
      weakPoints,
      dailyTime: time,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("intil_onboarding", JSON.stringify(payload));
    navigate({ to: "/signup" });
  };

  const back = () => {
    if (step > 1) setStep((value) => value - 1);
    else navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#F3EEE3] px-4 py-5 text-[#241A12] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#241A12]/10 bg-white shadow-[0_25px_80px_rgba(36,26,18,0.10)] lg:min-h-[calc(100vh-64px)] lg:flex-row">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#241A12] p-7 text-[#F3EEE3] lg:flex">
          <div className="mb-auto">
            <div className="mb-12 flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3EEE3] text-sm text-[#241A12]">I</span>
              <span>INT<i>i</i>L</span>
            </div>
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.18em] text-[#F3EEE3]/50">Shaxsiy reja</p>
            <div className="space-y-5">
              {[
                [1, "Imtihon"],
                [2, "Sana"],
                [3, "Fanlar"],
                [4, "Kuchsiz joylar"],
                [5, "Vaqt"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= Number(number) ? "bg-[#E85D3F] text-white" : "border border-white/20 text-white/50"}`}>
                    {step > Number(number) ? <Check className="h-3.5 w-3.5" /> : number}
                  </div>
                  <span className={`text-sm ${step === Number(number) ? "font-semibold text-white" : "text-white/45"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Lightbulb className="mb-2 h-5 w-5 text-[#E85D3F]" />
            <p className="text-xs leading-5 text-white/60">Javoblaringiz asosida AI sizga mos tayyorgarlik yo'nalishini shakllantiradi.</p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#241A12]/8 px-5 py-4 sm:px-8">
            <button onClick={back} className="inline-flex items-center gap-2 text-sm font-medium text-[#241A12]/60 transition hover:text-[#241A12]">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <div className="text-xs font-medium text-[#241A12]/45">{step} / 5</div>
          </header>

          <div className="flex-1 px-5 py-8 sm:px-10 sm:py-10 lg:px-14">
            <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[#241A12]/8">
              <div className="h-full rounded-full bg-[#E85D3F] transition-all duration-300" style={{ width: `${step * 20}%` }} />
            </div>

            {step === 1 && (
              <StepShell icon={<Target />} title="Qaysi imtihonga tayyorlanyapsiz?" subtitle="Siz uchun mos reja tuzishimizga yordam beradi.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard selected={examType === "milliy"} onClick={() => setExamType("milliy")} icon={<GraduationCap />} title="Milliy Sertifikat" subtitle="Fan bo'yicha chuqur tayyorgarlik" />
                  <ChoiceCard selected={examType === "dtm"} onClick={() => setExamType("dtm")} icon={<Trophy />} title="DTM" subtitle="Kirish imtihoniga tayyorgarlik" />
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell icon={<Target />} title="Imtihoningiz qachon?" subtitle="AI mashg'ulotlarni qolgan kunlar soniga qarab taqsimlaydi.">
                <label className="block max-w-xl">
                  <span className="mb-2 block text-sm font-semibold">Imtihon sanasi</span>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(event) => setExamDate(event.target.value)}
                    className="w-full rounded-2xl border border-[#241A12]/12 bg-[#F9F7F2] px-4 py-4 text-base outline-none transition focus:border-[#E85D3F]"
                  />
                </label>
                <div className="mt-5 rounded-2xl bg-[#F9F7F2] p-4 text-sm text-[#241A12]/60">
                  <Clock3 className="mr-2 inline h-4 w-4" /> Aniq sana bo'lsa, reja ancha aniqroq bo'ladi.
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell icon={<BookOpen />} title="Qaysi fanlardan tayyorlanmoqchisiz?" subtitle="Eng ko'p 2 ta fan tanlang. Keyingi bosqichda har biri bo'yicha kuchsiz joylaringizni belgilaysiz.">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-[#241A12]/55">Tanlangan fanlar</span>
                  <span className="font-semibold">{selectedSubjects.length} / 2</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {subjects.map((subject) => {
                    const Icon = subject.icon;
                    return (
                      <ChoiceCard
                        key={subject.id}
                        selected={selectedSubjects.includes(subject.id)}
                        onClick={() => toggleSubject(subject.id)}
                        icon={<Icon />}
                        title={subject.title}
                        subtitle={selectedSubjects.includes(subject.id) ? "Tanlandi" : "Tanlash uchun bosing"}
                      />
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell icon={<Pencil />} title="Qaysi mavzularda qiynalasiz?" subtitle="Har bir fan uchun kamida bitta kuchsiz nuqtani tanlang. AI aynan shu joylarga ko'proq vaqt ajratadi.">
                {selectedSubjects.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {selectedSubjects.map((id) => {
                      const subject = subjects.find((item) => item.id === id)!;
                      return (
                        <div key={id} className="rounded-full bg-[#241A12] px-3 py-1.5 text-xs font-semibold text-white">
                          {subject.title}: {(weakPoints[id] ?? []).length} ta tanlandi
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeSubject && (
                  <WeakPointPicker
                    subject={subjects.find((item) => item.id === activeSubject)!}
                    selected={weakPoints[activeSubject] ?? []}
                    onToggle={(topic) => toggleWeakPoint(activeSubject, topic)}
                  />
                )}
                {selectedSubjects.length === 2 && (weakPoints[selectedSubjects[0]]?.length ?? 0) > 0 && (weakPoints[selectedSubjects[1]]?.length ?? 0) > 0 && (
                  <div className="mt-5 rounded-2xl border border-[#E85D3F]/20 bg-[#E85D3F]/5 p-4 text-sm text-[#241A12]/70">
                    <Check className="mr-2 inline h-4 w-4 text-[#E85D3F]" /> Ikkala fan uchun ham kuchsiz nuqtalar belgilandi.
                  </div>
                )}
              </StepShell>
            )}

            {step === 5 && (
              <StepShell icon={<Timer />} title="Kuniga qancha vaqt ajrata olasiz?" subtitle="AI rejangizni real hayotingizga moslaydi — ko'p vaqt emas, to'g'ri vaqt muhim.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {timeOptions.map((option) => {
                    const Icon = option.icon;
                    return <ChoiceCard key={option.id} selected={time === option.id} onClick={() => setTime(option.id)} icon={<Icon />} title={option.title} subtitle={option.subtitle} />;
                  })}
                </div>
                <div className="mt-6 rounded-2xl bg-[#241A12] p-5 text-white">
                  <div className="flex items-start gap-3">
                    <Brain className="mt-0.5 h-5 w-5 shrink-0 text-[#E85D3F]" />
                    <div>
                      <p className="font-semibold">Keyingi qadam</p>
                      <p className="mt-1 text-sm leading-5 text-white/60">Javoblaringiz saqlanadi. Hisob yaratganingizdan so'ng AI shu ma'lumotlardan individual tayyorgarlik rejasini tuzish uchun foydalanadi.</p>
                    </div>
                  </div>
                </div>
              </StepShell>
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-[#241A12]/8 px-5 py-4 sm:px-10 lg:px-14">
            <span className="hidden text-xs text-[#241A12]/40 sm:block">Istalgan payt orqaga qaytishingiz mumkin</span>
            <button
              onClick={next}
              disabled={!canContinue}
              className="ml-auto inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#E85D3F] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {step === 5 ? "Rejani boshlash" : "Davom etish"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

function StepShell({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-7 max-w-2xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E85D3F]/10 text-[#E85D3F]">{icon}</div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#241A12]/55 sm:text-base">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ChoiceCard({ selected, onClick, icon, title, subtitle }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? "border-[#E85D3F] bg-[#E85D3F]/6 shadow-[0_8px_25px_rgba(232,93,63,0.10)]" : "border-[#241A12]/10 bg-white hover:border-[#241A12]/25 hover:bg-[#F9F7F2]"}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#E85D3F] text-white" : "bg-[#F3EEE3] text-[#241A12]/60"}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#241A12]/50">{subtitle}</span>
      </span>
      <span className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#E85D3F] bg-[#E85D3F] text-white" : "border-[#241A12]/15"}`}>
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}

function WeakPointPicker({ subject, selected, onToggle }: { subject: Subject; selected: string[]; onToggle: (topic: string) => void }) {
  const Icon = subject.icon;
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EEE3]"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="font-semibold">{subject.title}</p>
          <p className="text-xs text-[#241A12]/45">Bir nechta variant tanlash mumkin</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {subject.topics.map((topic) => {
          const isSelected = selected.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onToggle(topic)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${isSelected ? "border-[#E85D3F] bg-[#E85D3F]/6 font-medium" : "border-[#241A12]/10 hover:border-[#241A12]/25"}`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${isSelected ? "border-[#E85D3F] bg-[#E85D3F] text-white" : "border-[#241A12]/15"}`}>
                {isSelected && <Check className="h-3 w-3" />}
              </span>
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}
