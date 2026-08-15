import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CalendarDays, Check, Clock3,
  FlaskConical, GraduationCap, Languages, Landmark, LockKeyhole, Microscope,
  Sparkles, Target, Trophy, Zap,
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
type Subject = { id: string; name: string; description: string; icon: typeof BookOpen; topics: string[] };

const SUBJECTS: Subject[] = [
  { id: "math", name: "Matematika", description: "Algebra, geometriya va masalalar", icon: Brain, topics: ["Algebra", "Funksiyalar", "Geometriya", "Ehtimollik", "Tenglamalar"] },
  { id: "physics", name: "Fizika", description: "Mexanika, elektr va formulalar", icon: Zap, topics: ["Mexanika", "Elektr", "Optika", "Termodinamika", "Formulalar"] },
  { id: "history", name: "Tarix", description: "Davrlar, voqealar va sanalar", icon: Landmark, topics: ["O‘zbekiston tarixi", "Jahon tarixi", "Davlatlar", "Sanalar", "Tarixiy shaxslar"] },
  { id: "uzbek", name: "Ona tili", description: "Grammatika, imlo va matn", icon: BookOpen, topics: ["Grammatika", "Imlo", "Sintaksis", "Leksika", "Matn tahlili"] },
  { id: "biology", name: "Biologiya", description: "Hujayra, genetika va organizmlar", icon: Microscope, topics: ["Hujayra", "Genetika", "Anatomiya", "Ekologiya", "Evolyutsiya"] },
  { id: "chemistry", name: "Kimyo", description: "Reaksiyalar, hisob-kitob va organik kimyo", icon: FlaskConical, topics: ["Reaksiyalar", "Hisob-kitob", "Organik kimyo", "Anorganik kimyo", "Periodik jadval"] },
  { id: "english", name: "Ingliz tili", description: "Grammar, vocabulary va reading", icon: Languages, topics: ["Grammar", "Vocabulary", "Reading", "Listening", "Writing"] },
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

  const selectedSubjects = useMemo(() => SUBJECTS.filter(s => subjects.includes(s.id)), [subjects]);
  const canContinue =
    (step === 1 && !!exam) ||
    (step === 2 && subjects.length > 0) ||
    (step === 3 && subjects.every(id => (weakPoints[id] ?? []).length > 0)) ||
    (step === 4 && !!examDate && !!targetScore) ||
    (step === 5 && !!dailyTime);

  const toggleSubject = (id: string) => setSubjects(current => {
    if (current.includes(id)) {
      setWeakPoints(points => { const copy = { ...points }; delete copy[id]; return copy; });
      return current.filter(x => x !== id);
    }
    return [...current, id];
  });

  const toggleWeakPoint = (subjectId: string, topic: string) => setWeakPoints(current => {
    const selected = current[subjectId] ?? [];
    return { ...current, [subjectId]: selected.includes(topic) ? selected.filter(x => x !== topic) : [...selected, topic] };
  });

  const next = () => { if (canContinue && step < TOTAL_STEPS) setStep(x => x + 1); };
  const back = () => setStep(x => Math.max(1, x - 1));
  const finish = async () => {
    if (!canContinue || saving) return;
    setSaving(true);
    localStorage.setItem("intil_onboarding", JSON.stringify({ examType: exam, examDate, targetScore: Number(targetScore) || null, subjects, weakPoints, dailyTime }));
    await new Promise(r => setTimeout(r, 550));
    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="intil-onboarding min-h-screen bg-[#080706] text-[#211b15] selection:bg-[#d69a2c]/25">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');
        .intil-onboarding{font-family:'DM Sans',system-ui,sans-serif}.intil-serif{font-family:'Playfair Display',Georgia,serif}
        .intil-noise:before{content:'';position:absolute;inset:0;opacity:.035;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}
        @keyframes intil-float{0%,100%{transform:translate3d(0,0,0) rotateX(4deg) rotateY(-8deg)}50%{transform:translate3d(0,-12px,0) rotateX(-2deg) rotateY(8deg)}}
        @keyframes intil-spin{to{transform:rotate(360deg)}} @keyframes intil-spin2{to{transform:rotate(-360deg)}}
        @keyframes intil-pulse{0%,100%{opacity:.35;transform:scale(.96)}50%{opacity:.85;transform:scale(1.04)}}
        .intil-float{animation:intil-float 7s ease-in-out infinite}.intil-spin{animation:intil-spin 24s linear infinite}.intil-spin2{animation:intil-spin2 31s linear infinite}.intil-pulse{animation:intil-pulse 4s ease-in-out infinite}
        .intil-card{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,border-color .35s,background .35s}.intil-card:hover{transform:translateY(-3px);box-shadow:0 20px 50px rgba(72,48,16,.08)}
        .intil-card.selected{border-color:#d39a35;box-shadow:0 18px 45px rgba(174,112,13,.12),inset 0 0 0 1px rgba(211,154,53,.16);background:linear-gradient(135deg,#fffdf9,#fbf4e7)}
        .intil-topic{transition:all .22s}.intil-topic:hover{border-color:#d6a24c;transform:translateY(-1px)}.intil-topic.selected{background:#b97813;color:white;border-color:#b97813;box-shadow:0 8px 18px rgba(185,119,12,.2)}
        .intil-input{transition:border-color .2s,box-shadow .2s}.intil-input:focus{outline:none;border-color:#c78a22;box-shadow:0 0 0 4px rgba(199,138,34,.09)}
        @media(max-width:1023px){.intil-desktop-art{display:none!important}.intil-main{border-radius:0!important}.intil-content{max-width:900px!important}}
      `}</style>

      <div className="intil-noise relative mx-auto flex min-h-screen max-w-[1900px] overflow-hidden bg-[#080706] lg:p-4">
        <aside className="intil-desktop-art relative hidden w-[40%] min-w-[470px] overflow-hidden rounded-[32px] border border-[#d39a35]/20 bg-[radial-gradient(circle_at_52%_34%,#3b2915_0%,#17100a_35%,#090806_74%)] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(236,177,72,.13),transparent_20%),radial-gradient(circle_at_20%_85%,rgba(209,142,29,.10),transparent_28%)]" />
          <Premium3DArt />
          <div className="relative z-10 flex w-full flex-col p-10 xl:p-12">
            <Brand />
            <div className="mt-auto pb-3">
              <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.32em] text-[#dca13b]"><span className="h-px w-9 bg-[#dca13b]"/> INTIL AI · SHAXSIY REJA</div>
              <h1 className="intil-serif max-w-[560px] text-[clamp(44px,4.25vw,74px)] leading-[.94] tracking-[-.055em] text-white">Maqsadingiz aniq,<br/>rejangiz <span className="text-[#dfa23a]">shaxsiy.</span></h1>
              <p className="mt-6 max-w-[455px] text-[15px] leading-7 text-white/52">Sun’iy intellekt yordamida eng samarali tayyorgarlik yo‘lini birga yaratamiz.</p>
              <div className="mt-9 grid max-w-[490px] grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] backdrop-blur-xl">
                {[["10 000+","o‘quvchi"],["95%","muvaffaqiyat"],["24/7","AI mentor"]].map(([v,l],i)=><div key={v} className={`px-5 py-4 ${i<2?'border-r border-white/10':''}`}><div className="text-[18px] font-semibold text-[#e7ad48]">{v}</div><div className="mt-1 text-[10px] uppercase tracking-[.13em] text-white/38">{l}</div></div>)}
              </div>
            </div>
          </div>
        </aside>

        <main className="intil-main relative z-10 flex min-h-screen flex-1 items-center justify-center bg-[#fcfaf6] lg:min-h-[calc(100vh-32px)] lg:rounded-[32px]">
          <div className="intil-content flex min-h-screen w-full max-w-[1120px] flex-col px-5 py-6 sm:px-9 lg:min-h-0 lg:px-12 lg:py-9 xl:px-16">
            <header className="flex items-center justify-between pb-5">
              <button type="button" onClick={back} disabled={step===1} className="group inline-flex items-center gap-2 text-[13px] font-medium text-[#6f665d] transition hover:text-[#211b15] disabled:invisible"><ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1"/>Orqaga</button>
              <div className="flex items-center gap-4"><span className="rounded-full border border-[#e9e1d4] bg-white px-4 py-2 text-[12px] font-semibold tracking-[.08em] text-[#574f46] shadow-[0_8px_25px_rgba(77,52,19,.05)]">0{step} / 0{TOTAL_STEPS}</span><div className="hidden items-center gap-1.5 sm:flex">{Array.from({length:TOTAL_STEPS}).map((_,i)=><span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i+1===step?'w-9 bg-[#c78920]':i+1<step?'w-5 bg-[#d9a44d]':'w-2.5 bg-[#e8e1d7]'}`}/>)}</div></div>
            </header>
            <div className="h-[2px] overflow-hidden bg-[#eee8df]"><div className="h-full bg-gradient-to-r from-[#bd770d] via-[#d99a32] to-[#efc06c] transition-all duration-700" style={{width:`${step/TOTAL_STEPS*100}%`}}/></div>

            <div className="flex flex-1 flex-col pt-8 sm:pt-10">
              {step===1&&<StepExam value={exam} onChange={setExam}/>} {step===2&&<StepSubjects selected={subjects} onToggle={toggleSubject}/>} {step===3&&<StepWeakPoints subjects={selectedSubjects} weakPoints={weakPoints} onToggle={toggleWeakPoint}/>} {step===4&&<StepGoal examDate={examDate} targetScore={targetScore} onDateChange={setExamDate} onScoreChange={setTargetScore}/>} {step===5&&<StepTime value={dailyTime} onChange={setDailyTime}/>} 
              <div className="mt-auto pt-8 sm:pt-10"><div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-[11px] text-[#968d82]"><LockKeyhole className="h-3.5 w-3.5 text-[#c88a20]"/>Ma’lumotlaringiz xavfsiz saqlanadi</div>{step<TOTAL_STEPS?<button type="button" onClick={next} disabled={!canContinue} className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#b8750c] px-7 text-[13px] font-semibold text-white shadow-[0_13px_30px_rgba(185,119,12,.19)] transition hover:-translate-y-0.5 hover:bg-[#a86a08] disabled:cursor-not-allowed disabled:bg-[#d7cdbf] disabled:shadow-none">Davom etish<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></button>:<button type="button" onClick={finish} disabled={!canContinue||saving} className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#b8750c] px-7 text-[13px] font-semibold text-white shadow-[0_13px_30px_rgba(185,119,12,.19)] transition hover:-translate-y-0.5 hover:bg-[#a86a08] disabled:cursor-not-allowed disabled:bg-[#d7cdbf] disabled:shadow-none">{saving?'Rejangiz tayyorlanmoqda…':'Rejamni yaratish'}{saving?<Sparkles className="h-4 w-4 animate-pulse"/>:<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/>}</button>}</div></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand(){return <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#f0c36d]/30 bg-gradient-to-br from-[#f0b441] via-[#d39125] to-[#8f590c] text-[#241707] shadow-[0_0_50px_rgba(220,157,48,.25)]"><span className="intil-serif text-[31px] leading-none">I</span></div><div><div className="intil-serif text-[27px] tracking-[.05em] text-white">INTIL</div><div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[.38em] text-[#d99a2b]">AI · TA’LIM · NATIJA</div></div></div>}

function Premium3DArt(){return <div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="absolute left-1/2 top-[35%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d89b2e]/[.035] blur-3xl intil-pulse"/>
  <div className="absolute left-1/2 top-[35%] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d99d38]/15 intil-spin"/>
  <div className="absolute left-1/2 top-[35%] h-[390px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#e2ad50]/25 intil-spin2"/>
  <div className="absolute left-1/2 top-[35%] h-[210px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#bd7d1e]/25 intil-spin"/>
  <div className="absolute left-[26%] top-[24%] h-2 w-2 rounded-full bg-[#e9b14b] shadow-[0_0_18px_5px_rgba(233,177,75,.45)]"/>
  <div className="absolute right-[22%] top-[35%] h-1.5 w-1.5 rounded-full bg-[#f0c36b] shadow-[0_0_15px_4px_rgba(240,195,107,.4)]"/>
  <div className="intil-float absolute left-1/2 top-[35%] h-[225px] w-[225px] -translate-x-1/2 -translate-y-1/2 [perspective:900px]">
    <div className="relative h-full w-full [transform-style:preserve-3d] [transform:rotateX(7deg)_rotateY(-12deg)_rotateZ(3deg)]">
      <div className="absolute inset-[10%] rounded-[42px] border border-[#f5d07e]/40 bg-[linear-gradient(145deg,rgba(255,216,122,.88),rgba(180,111,12,.78)_42%,rgba(66,36,8,.82))] shadow-[inset_18px_18px_45px_rgba(255,230,165,.32),inset_-25px_-25px_45px_rgba(28,13,2,.55),0_35px_90px_rgba(0,0,0,.5),0_0_70px_rgba(219,157,49,.2)] [transform:translateZ(25px)_rotate(45deg)]"/>
      <div className="absolute inset-[24%] rounded-[24px] border border-[#f5d58c]/35 bg-[linear-gradient(145deg,rgba(255,235,173,.38),rgba(110,65,10,.22))] shadow-[inset_5px_5px_20px_rgba(255,242,198,.2)] [transform:translateZ(52px)_rotate(45deg)]"/>
      <div className="absolute left-1/2 top-1/2 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] border border-[#f5d995]/40 bg-[#6e420d]/55 shadow-[0_0_45px_rgba(237,183,76,.2)] [transform:translateZ(78px)]"><span className="intil-serif text-[42px] text-[#f8d88f]">I</span></div>
      <div className="absolute -inset-4 rounded-[55px] border border-[#e2ac4b]/10 [transform:translateZ(-5px)_rotate(45deg)]"/>
    </div>
  </div>
  <div className="absolute bottom-[23%] left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-[#d89a32]/35 to-transparent"/>
</div>}

function StepHeader({eyebrow,title,accent,description,icon:Icon}:{eyebrow:string;title:string;accent:string;description:string;icon:typeof BookOpen}){return <div className="mb-7 sm:mb-8"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead9bb] bg-[#fffdf9] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#b8760d] shadow-[0_5px_18px_rgba(85,54,13,.04)]"><Icon className="h-3.5 w-3.5"/>{eyebrow}</div><h2 className="intil-serif max-w-[980px] text-[clamp(38px,4.2vw,62px)] leading-[.98] tracking-[-.045em] text-[#221c16]">{title} <span className="text-[#c78618]">{accent}</span></h2><p className="mt-4 max-w-[760px] text-[14px] leading-6 text-[#7c746a]">{description}</p></div>}

function StepExam({value,onChange}:{value:ExamType|null;onChange:(v:ExamType)=>void}){return <><StepHeader eyebrow="01 · Boshlaymiz" title="Qaysi imtihonga" accent="tayyorlanyapsiz?" description="Siz haqingizdagi bir nechta ma’lumotni bilsak, AI rejangizni ancha aniq va samarali tuzadi." icon={Target}/><div className="grid gap-4 sm:grid-cols-2">{([['milliy','Milliy Sertifikat','Fan bo‘yicha chuqur tayyorgarlik',GraduationCap,'Fan bilimini oshirish'],['dtm','DTM','Kirish imtihoniga tayyorgarlik',Trophy,'Imtihonga kirish']] as const).map(([id,name,desc,Icon,tag])=><button type="button" key={id} onClick={()=>onChange(id)} className={`intil-card relative min-h-[205px] rounded-[22px] border p-6 text-left ${value===id?'selected':'border-[#e8e0d5] bg-white'}`}><div className="flex items-start justify-between"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${value===id?'bg-[#b97813] text-white':'bg-[#f7f2e9] text-[#9a8b76]'}`}><Icon className="h-5 w-5"/></div><div className={`grid h-6 w-6 place-items-center rounded-full border ${value===id?'border-[#c78920] bg-[#c78920] text-white':'border-[#ded6ca] bg-white text-transparent'}`}><Check className="h-3.5 w-3.5"/></div></div><div className="mt-8 text-[20px] font-semibold tracking-[-.025em] text-[#211b15]">{name}</div><div className="mt-1.5 text-[13px] text-[#81786e]">{desc}</div><div className="mt-5 inline-flex rounded-full bg-[#f7f1e6] px-3 py-1.5 text-[10px] font-semibold text-[#a26c18]">{tag}</div></button>)}</div></>}

function StepSubjects({selected,onToggle}:{selected:string[];onToggle:(id:string)=>void}){return <><StepHeader eyebrow="02 · Yo‘nalish" title="Qaysi fanlar" accent="siz uchun muhim?" description="Bir nechta fanni tanlashingiz mumkin. Keyingi bosqichda har bir tanlangan fan uchun alohida kuchsiz nuqtalarni belgilaymiz." icon={BookOpen}/><div className="grid gap-3 sm:grid-cols-2">{SUBJECTS.map(({id,name,description,icon:Icon})=>{const active=selected.includes(id);return <button type="button" key={id} onClick={()=>onToggle(id)} className={`intil-card flex min-h-[118px] items-center gap-4 rounded-[19px] border p-4 text-left ${active?'selected':'border-[#e8e0d5] bg-white'}`}><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${active?'bg-[#b97813] text-white':'bg-[#f7f2e9] text-[#9b8d79]'}`}><Icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="text-[16px] font-semibold text-[#29221b]">{name}</div><div className="mt-1 text-[11px] leading-5 text-[#8a8177]">{description}</div></div><div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active?'border-[#c78920] bg-[#c78920] text-white':'border-[#ded6ca] text-transparent'}`}><Check className="h-3.5 w-3.5"/></div></button>})}</div><div className="mt-4 text-[11px] text-[#a0978d]">Kamida bitta fan tanlang · {selected.length} ta tanlandi</div></>}

function StepWeakPoints({subjects,weakPoints,onToggle}:{subjects:Subject[];weakPoints:Record<string,string[]>;onToggle:(id:string,t:string)=>void}){return <><StepHeader eyebrow="03 · AI tahlil" title="Kuchsiz nuqtalaringizni" accent="belgilaymiz." description="Har bir fan uchun sizga qiyin bo‘ladigan mavzularni tanlang. AI aynan shu joylarga ko‘proq vaqt ajratadi." icon={Sparkles}/><div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">{subjects.map(({id,name,topics,icon:Icon})=><div key={id} className="rounded-[20px] border border-[#e8e0d5] bg-white p-4 sm:p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf4e8] text-[#b47a1c]"><Icon className="h-4 w-4"/></div><div><div className="text-[15px] font-semibold text-[#29221b]">{name}</div><div className="text-[10px] text-[#9b9187]">{(weakPoints[id]??[]).length} ta tanlangan</div></div></div><div className="mt-4 flex flex-wrap gap-2">{topics.map(topic=>{const active=(weakPoints[id]??[]).includes(topic);return <button type="button" key={topic} onClick={()=>onToggle(id,topic)} className={`intil-topic rounded-full border px-3.5 py-2 text-[11px] font-medium ${active?'selected':'border-[#e5ddd1] bg-[#fffdfa] text-[#776e63]'}`}>{active&&<Check className="mr-1 inline h-3 w-3"/>}{topic}</button>})}</div></div>)}</div></>}

function StepGoal({examDate,targetScore,onDateChange,onScoreChange}:{examDate:string;targetScore:string;onDateChange:(v:string)=>void;onScoreChange:(v:string)=>void}){return <><StepHeader eyebrow="04 · Maqsad" title="Qayerga yetib" accent="bormoqchisiz?" description="Maqsadingiz va muddatingizni bilsak, AI rejangizdagi yuklamani real vaqtga moslab beradi." icon={CalendarDays}/><div className="grid gap-4 sm:grid-cols-2"><label className="rounded-[22px] border border-[#e7dfd4] bg-white p-5 shadow-[0_10px_30px_rgba(76,52,20,.035)]"><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#b17a22]"><CalendarDays className="h-3.5 w-3.5"/>Imtihon sanasi</span><input type="date" value={examDate} onChange={e=>onDateChange(e.target.value)} className="intil-input mt-5 w-full border-0 border-b border-[#e8e0d5] bg-transparent pb-3 text-[19px] font-semibold text-[#29221b]"/></label><label className="rounded-[22px] border border-[#e7dfd4] bg-white p-5 shadow-[0_10px_30px_rgba(76,52,20,.035)]"><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#b17a22]"><Target className="h-3.5 w-3.5"/>Maqsad ball</span><input type="number" min="0" value={targetScore} onChange={e=>onScoreChange(e.target.value)} placeholder="Masalan, 180" className="intil-input mt-5 w-full border-0 border-b border-[#e8e0d5] bg-transparent pb-3 text-[19px] font-semibold text-[#29221b] placeholder:text-[#c8c0b6]"/></label></div><div className="mt-5 rounded-2xl border border-[#efe6d8] bg-[#fffaf1] px-5 py-4 text-[11px] leading-5 text-[#8d7b63]"><Sparkles className="mr-2 inline h-3.5 w-3.5 text-[#c78920]"/>AI muddat va maqsad orasidagi masofani hisoblab, kundalik yuklamani balanslaydi.</div></>}

function StepTime({value,onChange}:{value:TimeOption|null;onChange:(v:TimeOption)=>void}){const options:[TimeOption,string,string,typeof Clock3][]=[['15-30','15–30 daqiqa','Juda band kunlar',Clock3],['30-60','30–60 daqiqa','Barqaror ritm',Clock3],['1-2','1–2 soat','Jiddiy tayyorgarlik',Zap],['2+','2+ soat','Maksimal intensivlik',Sparkles]];return <><StepHeader eyebrow="05 · Ritm" title="Kuniga qancha vaqt" accent="ajrata olasiz?" description="Real reja ideal rejadan kuchliroq. O‘zingizga qulay ritmni tanlang — qolganini AI moslaydi." icon={Clock3}/><div className="grid gap-3 sm:grid-cols-2">{options.map(([id,time,desc,Icon])=>{const active=value===id;return <button type="button" key={id} onClick={()=>onChange(id)} className={`intil-card relative rounded-[20px] border p-5 text-left ${active?'selected':'border-[#e8e0d5] bg-white'}`}><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${active?'bg-[#b97813] text-white':'bg-[#f7f2e9] text-[#9b8d79]'}`}><Icon className="h-5 w-5"/></div><div className={`grid h-6 w-6 place-items-center rounded-full border ${active?'border-[#c78920] bg-[#c78920] text-white':'border-[#ded6ca] text-transparent'}`}><Check className="h-3.5 w-3.5"/></div></div><div className="mt-6 text-[22px] font-semibold tracking-[-.03em] text-[#29221b]">{time}</div><div className="mt-1 text-[11px] text-[#8c8379]">{desc}</div></button>})}</div><div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#eadfcf] bg-white px-5 py-4"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf3e3] text-[#c2851d]"><Brain className="h-4 w-4"/></div><div><div className="text-[12px] font-semibold text-[#51483f]">AI rejangiz tayyor</div><div className="mt-0.5 text-[10px] text-[#948a7f]">Tanlovlaringiz asosida siz uchun individual yo‘l xaritasi yaratiladi.</div></div></div></>}
