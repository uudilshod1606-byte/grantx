import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CalendarDays, Check, Clock3,
  FlaskConical, GraduationCap, Languages, Landmark, LockKeyhole, Microscope,
  Sparkles, Target, Trophy, Zap, Orbit, Waves,
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
    await new Promise(r => setTimeout(r, 650));
    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="intil-premium min-h-screen text-[#27221d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');
        .intil-premium{font-family:'Manrope',system-ui,sans-serif;background:#f6f1e9;overflow:hidden}
        .intil-serif{font-family:'Playfair Display',Georgia,serif}
        .intil-shell{background:linear-gradient(115deg,#f0e8da 0%,#fbf8f2 38%,#fffdfa 100%)}
        .intil-left{background:radial-gradient(circle at 50% 44%,rgba(228,169,63,.18),transparent 30%),radial-gradient(circle at 16% 88%,rgba(206,140,35,.10),transparent 25%),linear-gradient(145deg,#f7f0e4,#eee5d8)}
        .intil-glass{background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,250,240,.56));border:1px solid rgba(193,153,88,.22);box-shadow:0 24px 70px rgba(88,63,29,.08),inset 0 1px 0 rgba(255,255,255,.8);backdrop-filter:blur(18px)}
        .intil-card{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,border-color .35s,background .35s}.intil-card:hover{transform:translateY(-3px);box-shadow:0 22px 55px rgba(84,57,23,.10)}
        .intil-card.selected{border-color:#c58b32;box-shadow:0 22px 55px rgba(188,125,20,.13),inset 0 0 0 1px rgba(197,139,50,.16);background:linear-gradient(145deg,#fffdf8,#fbf0dc)}
        .intil-topic{transition:all .2s}.intil-topic:hover{transform:translateY(-1px);border-color:#d2a35d}.intil-topic.selected{background:linear-gradient(135deg,#d19a3b,#ae6d13);border-color:#b8791b;color:#fff;box-shadow:0 8px 22px rgba(180,116,18,.22)}
        .intil-input:focus{outline:none;border-color:#c58b32;box-shadow:0 0 0 4px rgba(197,139,50,.10)}
        .intil-scroll::-webkit-scrollbar{width:5px}.intil-scroll::-webkit-scrollbar-thumb{background:#ddc9aa;border-radius:20px}
        @keyframes goldFloat{0%,100%{transform:translateY(0) rotateX(3deg) rotateY(-4deg)}50%{transform:translateY(-13px) rotateX(-4deg) rotateY(5deg)}}
        @keyframes orbitA{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes orbitB{to{transform:translate(-50%,-50%) rotate(-360deg)}}
        @keyframes breathe{0%,100%{transform:scale(.9);opacity:.35}50%{transform:scale(1.1);opacity:.7}}
        @keyframes particle{0%,100%{transform:translate3d(0,0,0);opacity:.35}50%{transform:translate3d(12px,-17px,0);opacity:1}}
        .gold-float{animation:goldFloat 7s ease-in-out infinite}.orbit-a{animation:orbitA 18s linear infinite}.orbit-b{animation:orbitB 25s linear infinite}.breathe{animation:breathe 5s ease-in-out infinite}.particle{animation:particle 5s ease-in-out infinite}
        @media(max-width:1023px){.intil-art{display:none!important}.intil-main{min-height:100vh!important}.intil-content{max-width:900px!important}}
      `}</style>
      <div className="intil-shell mx-auto flex min-h-screen max-w-[1920px] gap-0 p-0 lg:min-h-screen lg:p-4">
        <aside className="intil-art intil-left relative hidden w-[42%] min-w-[480px] overflow-hidden rounded-[34px] border border-[#c79a52]/20 lg:flex">
          <div className="absolute inset-0 opacity-35" style={{backgroundImage:"radial-gradient(rgba(123,91,45,.22) .65px,transparent .65px)",backgroundSize:"22px 22px"}} />
          <Brand /><Luxury3D />
          <div className="relative z-10 mt-auto p-11 xl:p-14">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.34em] text-[#b87818]"><span className="h-px w-10 bg-[#c18a2e]"/> INTIL AI · SHAXSIY REJA</div>
            <h1 className="intil-serif max-w-[600px] text-[clamp(48px,4.7vw,78px)] leading-[.91] tracking-[-.055em] text-[#29231d]">Maqsadingiz aniq,<br/>rejangiz <em className="text-[#c38219]">shaxsiy.</em></h1>
            <p className="mt-6 max-w-[500px] text-[14px] leading-7 text-[#786e61]">Sun’iy intellekt yordamida sizga mos tayyorgarlik yo‘lini yaratamiz — ortiqcha yuklamasdan, aynan kerakli nuqtalarga e’tibor bilan.</p>
          </div>
        </aside>
        <main className="intil-main relative z-10 flex min-h-[calc(100vh-32px)] flex-1 items-center justify-center overflow-hidden bg-[#fffdfa] lg:rounded-[34px]">
          <div className="intil-content flex min-h-[calc(100vh-32px)] w-full max-w-[1120px] flex-col px-5 py-6 sm:px-9 lg:px-12 lg:py-8 xl:px-16">
            <header className="flex items-center justify-between pb-5">
              <button type="button" onClick={back} disabled={step === 1} className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-[12px] font-semibold text-[#766d63] transition hover:bg-[#f8f2e8] hover:text-[#29231d] disabled:invisible"><ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1"/>Orqaga</button>
              <div className="flex items-center gap-4"><span className="rounded-full border border-[#e8dfd2] bg-white/80 px-4 py-2 text-[11px] font-bold tracking-[.1em] text-[#665c51] shadow-[0_8px_25px_rgba(76,53,20,.05)]">0{step} / 0{TOTAL_STEPS}</span><div className="hidden items-center gap-1.5 sm:flex">{Array.from({length:TOTAL_STEPS}).map((_,i)=><span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i+1===step?'w-10 bg-[#c78920]':i+1<step?'w-5 bg-[#ddb56e]':'w-2.5 bg-[#e9e2d8]'}`}/>)}</div></div>
            </header>
            <div className="h-[2px] overflow-hidden rounded-full bg-[#eee7dc]"><div className="h-full rounded-full bg-gradient-to-r from-[#b97612] via-[#d39b3e] to-[#edc276] transition-all duration-700" style={{width:`${step/TOTAL_STEPS*100}%`}}/></div>
            <div className="flex flex-1 flex-col pt-7 sm:pt-9">
              {step===1&&<StepExam value={exam} onChange={setExam}/>} {step===2&&<StepSubjects selected={subjects} onToggle={toggleSubject}/>} {step===3&&<StepWeakPoints subjects={selectedSubjects} weakPoints={weakPoints} onToggle={toggleWeakPoint}/>} {step===4&&<StepGoal examDate={examDate} targetScore={targetScore} onDateChange={setExamDate} onScoreChange={setTargetScore}/>} {step===5&&<StepTime value={dailyTime} onChange={setDailyTime}/>} 
              <div className="mt-auto pt-7 sm:pt-9"><div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-[10px] font-medium text-[#999085]"><LockKeyhole className="h-3.5 w-3.5 text-[#c58a28]"/>Ma’lumotlaringiz xavfsiz saqlanadi</div><button type="button" onClick={step===TOTAL_STEPS?finish:next} disabled={!canContinue||saving} className="group inline-flex h-12 items-center justify-center gap-3 rounded-[14px] bg-gradient-to-r from-[#c98c2e] to-[#ad6d12] px-7 text-[12px] font-bold text-white shadow-[0_15px_35px_rgba(177,111,15,.20)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(177,111,15,.26)] disabled:cursor-not-allowed disabled:bg-[#d8d0c5] disabled:bg-none disabled:text-white disabled:shadow-none">{saving?'Rejangiz tayyorlanmoqda…':step===TOTAL_STEPS?'Rejamni yaratish':'Davom etish'}{saving?<Sparkles className="h-4 w-4 animate-pulse"/>:<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/>}</button></div></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand(){return <div className="absolute left-10 top-9 z-20 flex items-center gap-3 xl:left-12"><div className="relative h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_25%,#fff0c6,#e1a844_48%,#a96c12)] shadow-[inset_0_2px_8px_rgba(255,255,255,.7),0_12px_30px_rgba(174,113,20,.18)]"><span className="absolute inset-[8px] rounded-full border border-white/70"/></div><div><div className="intil-serif text-[25px] font-semibold tracking-[.03em] text-[#30291f]">INTIL</div><div className="text-[7px] font-bold uppercase tracking-[.34em] text-[#b47618]">AI · TA’LIM · NATIJA</div></div></div>}

function Luxury3D(){return <div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="breathe absolute left-1/2 top-[39%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d49b3a]/[.09] blur-3xl"/>
  <div className="orbit-a absolute left-1/2 top-[39%] h-[440px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#bd7e22]/30"/>
  <div className="orbit-b absolute left-1/2 top-[39%] h-[250px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#d7a44f]/28 rotate-[18deg]"/>
  <div className="orbit-a absolute left-1/2 top-[39%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#d8a04a]/22 rotate-[66deg]" style={{animationDuration:'31s'}}/>
  <div className="orbit-b absolute left-1/2 top-[39%] h-[170px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#b97818]/18 rotate-[-31deg]" style={{animationDuration:'22s'}}/>
  <div className="gold-float absolute left-1/2 top-[39%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 [perspective:1000px]">
    <div className="relative h-full w-full [transform-style:preserve-3d]">
      <div className="absolute inset-[12%] rounded-[48%] bg-[radial-gradient(circle_at_28%_22%,#fff4cf_0%,#f4cb79_12%,#d99b36_34%,#a86612_63%,#71440d_100%)] shadow-[inset_20px_18px_35px_rgba(255,243,204,.5),inset_-28px_-32px_48px_rgba(71,39,5,.42),0_38px_80px_rgba(166,103,12,.18)] [transform:translateZ(20px)_rotateX(8deg)_rotateY(-12deg)]"/>
      <div className="absolute left-[16%] right-[16%] top-[30%] h-[38%] rounded-[50%] border border-[#ffe9af]/55 shadow-[0_0_28px_rgba(235,177,70,.2)] [transform:translateZ(46px)_rotateX(62deg)_rotateZ(-9deg)]"/>
      <div className="absolute left-[25%] right-[25%] top-[35%] h-[28%] rounded-[50%] border border-[#ffe8aa]/40 [transform:translateZ(60px)_rotateX(65deg)_rotateY(12deg)_rotateZ(28deg)]"/>
      <div className="absolute left-[30%] top-[24%] h-5 w-5 rounded-full bg-[#fff0bc] shadow-[0_0_24px_8px_rgba(255,214,119,.45)] [transform:translateZ(82px)]"/>
      <div className="absolute right-[24%] bottom-[27%] h-3 w-3 rounded-full bg-[#f4c76d] shadow-[0_0_18px_6px_rgba(230,168,60,.35)] [transform:translateZ(72px)]"/>
    </div>
  </div>
  <span className="particle absolute left-[20%] top-[32%] h-1.5 w-1.5 rounded-full bg-[#d99e3e] shadow-[0_0_14px_4px_rgba(217,158,62,.28)]" style={{animationDelay:'-2.5s'}}/>
  <span className="particle absolute right-[18%] top-[45%] h-1.5 w-1.5 rounded-full bg-[#d99e3e] shadow-[0_0_14px_4px_rgba(217,158,62,.28)]" style={{animationDelay:'-1.5s'}}/>
  <span className="particle absolute left-[31%] bottom-[29%] h-1.5 w-1.5 rounded-full bg-[#d99e3e] shadow-[0_0_14px_4px_rgba(217,158,62,.28)]" style={{animationDelay:'-3s'}}/>
  <span className="particle absolute right-[28%] bottom-[36%] h-1.5 w-1.5 rounded-full bg-[#d99e3e] shadow-[0_0_14px_4px_rgba(217,158,62,.28)]" style={{animationDelay:'-4s'}}/>
</div>}

function StepHeader({eyebrow,title,accent,description,icon:Icon}:{eyebrow:string;title:string;accent:string;description:string;icon:typeof BookOpen}){return <div className="mb-7 sm:mb-8"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadcc7] bg-[#fffdf9] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[.24em] text-[#b57617] shadow-[0_6px_18px_rgba(81,56,21,.04)]"><Icon className="h-3.5 w-3.5"/>{eyebrow}</div><h2 className="intil-serif max-w-[980px] text-[clamp(40px,4.2vw,65px)] leading-[.94] tracking-[-.05em] text-[#29231d]">{title} <span className="text-[#c17e18]">{accent}</span></h2><p className="mt-4 max-w-[750px] text-[13px] leading-6 text-[#81786d]">{description}</p></div>}

function SelectMark({active}:{active:boolean}){return <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all ${active?'border-[#c48727] bg-gradient-to-br from-[#dca84d] to-[#b77314] text-white shadow-[0_5px_15px_rgba(181,116,19,.2)]':'border-[#ddd4c7] bg-white text-transparent'}`}><Check className="h-3.5 w-3.5"/></div>}

function StepExam({value,onChange}:{value:ExamType|null;onChange:(v:ExamType)=>void}){const cards:[ExamType,string,string,typeof GraduationCap,string][]=[['milliy','Milliy Sertifikat','Fan bo‘yicha chuqur va tizimli tayyorgarlik',GraduationCap,'FAN BILIMINI OSHIRISH'],['dtm','DTM','Kirish imtihoniga yo‘naltirilgan tayyorgarlik',Trophy,'IMTIHONDA NATIJA']];return <><StepHeader eyebrow="01 · Boshlaymiz" title="Qaysi imtihonga" accent="tayyorlanyapsiz?" description="Siz haqingizdagi bir nechta ma’lumotni bilsak, AI rejangizni ancha aniq va samarali tuzadi." icon={Target}/><div className="grid gap-4 sm:grid-cols-2">{cards.map(([id,name,desc,Icon,tag])=>{const active=value===id;return <button type="button" key={id} onClick={()=>onChange(id)} className={`intil-card intil-glass relative min-h-[190px] rounded-[23px] p-5 text-left ${active?'selected':''}`}><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${active?'bg-gradient-to-br from-[#dba74e] to-[#ad6d13] text-white':'bg-[#f5efe5] text-[#9a8d7c]'}`}><Icon className="h-5 w-5"/></div><SelectMark active={active}/></div><div className="mt-7 text-[18px] font-semibold tracking-[-.02em] text-[#29231d]">{name}</div><div className="mt-1.5 max-w-[300px] text-[11px] leading-5 text-[#857c71]">{desc}</div><span className="mt-4 inline-flex rounded-full bg-[#f6ecdc] px-3 py-1.5 text-[8px] font-bold tracking-[.1em] text-[#a56e17]">{tag}</span></button>})}</div></>}

function StepSubjects({selected,onToggle}:{selected:string[];onToggle:(id:string)=>void}){return <><StepHeader eyebrow="02 · Yo‘nalish" title="Qaysi fanlar" accent="siz uchun muhim?" description="Bir nechta fanni tanlang. Keyingi bosqichda har bir tanlangan fan uchun alohida kuchsiz nuqtalarni belgilaymiz." icon={BookOpen}/><div className="grid gap-3 sm:grid-cols-2">{SUBJECTS.map(({id,name,description,icon:Icon})=>{const active=selected.includes(id);return <button type="button" key={id} onClick={()=>onToggle(id)} className={`intil-card intil-glass flex min-h-[94px] items-center gap-3.5 rounded-[19px] p-4 text-left ${active?'selected':''}`}><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${active?'bg-gradient-to-br from-[#dba74e] to-[#ae7018] text-white':'bg-[#f6f0e6] text-[#9b8d7b]'}`}><Icon className="h-[18px] w-[18px]"/></div><div className="min-w-0 flex-1"><div className="text-[14px] font-semibold text-[#2b251f]">{name}</div><div className="mt-1 text-[10px] leading-4 text-[#8b8277]">{description}</div></div><SelectMark active={active}/></button>})}</div><div className="mt-4 text-[10px] font-medium text-[#9a9187]">Kamida bitta fan tanlang · <span className="text-[#b8791b]">{selected.length} ta tanlandi</span></div></>}

function StepWeakPoints({subjects,weakPoints,onToggle}:{subjects:Subject[];weakPoints:Record<string,string[]>;onToggle:(id:string,t:string)=>void}){return <><StepHeader eyebrow="03 · AI tahlil" title="Kuchsiz nuqtalaringizni" accent="belgilaymiz." description="Sizga qiyin bo‘ladigan mavzularni belgilang. AI aynan shu joylarga ko‘proq vaqt ajratadi." icon={Sparkles}/><div className="intil-scroll max-h-[390px] space-y-3 overflow-y-auto pr-1">{subjects.map(({id,name,topics,icon:Icon})=><div key={id} className="intil-glass rounded-[20px] p-4 sm:p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf2e3] text-[#b57718]"><Icon className="h-4 w-4"/></div><div><div className="text-[14px] font-semibold text-[#2c261f]">{name}</div><div className="mt-0.5 text-[9px] text-[#9c9286]">{(weakPoints[id]??[]).length} ta tanlangan</div></div><div className="ml-auto text-[9px] font-bold uppercase tracking-[.12em] text-[#bd8123]">AI focus</div></div><div className="mt-4 flex flex-wrap gap-2">{topics.map(topic=>{const active=(weakPoints[id]??[]).includes(topic);return <button type="button" key={topic} onClick={()=>onToggle(id,topic)} className={`intil-topic rounded-full border px-3 py-2 text-[10px] font-semibold ${active?'selected':'border-[#e4dbce] bg-white/70 text-[#786f64]'}`}>{active&&<Check className="mr-1 inline h-3 w-3"/>}{topic}</button>})}</div></div>)}</div></>}

function StepGoal({examDate,targetScore,onDateChange,onScoreChange}:{examDate:string;targetScore:string;onDateChange:(v:string)=>void;onScoreChange:(v:string)=>void}){return <><StepHeader eyebrow="04 · Maqsad" title="Qayerga yetib" accent="bormoqchisiz?" description="Imtihon sanasi va maqsad balingizni kiriting. AI rejangizdagi yuklamani real vaqtga moslaydi." icon={CalendarDays}/><div className="grid gap-4 sm:grid-cols-2"><label className="intil-glass rounded-[22px] p-5"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#af7620]"><CalendarDays className="h-3.5 w-3.5"/>Imtihon sanasi</span><input type="date" value={examDate} onChange={e=>onDateChange(e.target.value)} className="intil-input mt-5 w-full border-0 border-b border-[#e5dccc] bg-transparent pb-3 text-[18px] font-semibold text-[#2b251f]"/></label><label className="intil-glass rounded-[22px] p-5"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#af7620]"><Target className="h-3.5 w-3.5"/>Maqsad ball</span><input type="number" min="0" value={targetScore} onChange={e=>onScoreChange(e.target.value)} placeholder="Masalan, 180" className="intil-input mt-5 w-full border-0 border-b border-[#e5dccc] bg-transparent pb-3 text-[18px] font-semibold text-[#2b251f] placeholder:text-[#c8c0b7]"/></label></div><div className="mt-5 flex items-center gap-3 rounded-[19px] border border-[#eadfcf] bg-[#fffaf1] px-5 py-4 text-[10px] leading-5 text-[#887a68]"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f9ecd8] text-[#bd8123]"><Orbit className="h-4 w-4"/></div><span>AI muddat va maqsad orasidagi masofani hisoblab, kundalik yuklamani balanslaydi.</span></div></>}

function StepTime({value,onChange}:{value:TimeOption|null;onChange:(v:TimeOption)=>void}){const options:[TimeOption,string,string,typeof Clock3][]=[['15-30','15–30 daqiqa','Juda band kunlar',Clock3],['30-60','30–60 daqiqa','Barqaror ritm',Clock3],['1-2','1–2 soat','Jiddiy tayyorgarlik',Zap],['2+','2+ soat','Maksimal intensivlik',Sparkles]];return <><StepHeader eyebrow="05 · Ritm" title="Kuniga qancha vaqt" accent="ajrata olasiz?" description="Real reja ideal rejadan kuchliroq. O‘zingizga qulay ritmni tanlang — qolganini AI moslaydi." icon={Clock3}/><div className="grid gap-3 sm:grid-cols-2">{options.map(([id,time,desc,Icon])=>{const active=value===id;return <button type="button" key={id} onClick={()=>onChange(id)} className={`intil-card intil-glass relative rounded-[20px] p-5 text-left ${active?'selected':''}`}><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${active?'bg-gradient-to-br from-[#dba74e] to-[#ae7018] text-white':'bg-[#f6f0e6] text-[#9b8d7b]'}`}><Icon className="h-5 w-5"/></div><SelectMark active={active}/></div><div className="mt-6 text-[20px] font-semibold tracking-[-.03em] text-[#2b251f]">{time}</div><div className="mt-1 text-[10px] text-[#8c8379]">{desc}</div></button>})}</div><div className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#eadfcf] bg-white/80 px-5 py-4"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf1df] text-[#bd8123]"><Waves className="h-4 w-4"/></div><div><div className="text-[11px] font-bold text-[#514940]">AI rejangiz tayyor</div><div className="mt-0.5 text-[9px] text-[#958b80]">Tanlovlaringiz asosida individual yo‘l xaritasi yaratiladi.</div></div></div></>}
