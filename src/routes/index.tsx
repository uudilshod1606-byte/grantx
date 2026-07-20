import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  GraduationCap,
  Target,
  Brain,
  BarChart3,
  Timer,
  Trophy as TrophyIcon,
  User,
  Sparkles,
  BookOpen,
  LineChart,
  Smartphone,
  Building2,
  CheckCircle2,
  ArrowRight,
  Rocket,
  ClipboardList,
  Layers,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLoadingScreen, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GrantX — DTM va Milliy Sertifikatga tayyorlov" },
      { name: "description", content: "GrantX — O'zbek talabalari uchun zamonaviy ta'lim platformasi. DTM va Milliy Sertifikat imtihonlariga onlayn tayyorlanish." },
    ],
  }),
});

function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white text-slate-900">
      <Navbar />
      <Hero />
      <WhyGrantX />
      <Features />
      <HowItWorks />
      <Stats />
      <FuturePlans />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <header className="relative z-50 px-4 pt-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-[#E9DFC9] bg-[#FFFDF9] px-5 py-3 shadow-[0_8px_24px_-14px_rgba(46,38,32,0.15)]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E2620]">
            <GraduationCap className="h-[18px] w-[18px] text-[#F3E4C4]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#2E2620]">
            Grant<span className="text-[#C1852F]">X</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-[14.5px] font-semibold text-[#6B6058] md:flex">
          <a href="#natijalar" className="transition hover:text-[#2E2620]">Natijalar</a>
          <a href="#platforma" className="transition hover:text-[#2E2620]">Platforma</a>
          <a href="#yonalish" className="transition hover:text-[#2E2620]">Yo'nalish</a>
          <a href="#reja" className="transition hover:text-[#2E2620]">Reja</a>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-[#2E2620] hover:bg-[#F1EAD9] hover:text-[#2E2620]">
              Kirish
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="gap-1.5 bg-[#2E2620] text-[#FAF7EF] hover:bg-[#241D19]">
              Boshlash <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ---------------- University orbit data ---------------- */
type UniCard = {
  name: string;
  tag: string;
  logo: string;
  pos: string;
  glow: string;
  delay: string;
};

const UNIVERSITIES: UniCard[] = [
  { name: "UWED", tag: "Jahon iqtisodiyoti va diplomatiya universiteti", logo: "/universities/uwed.png", pos: "top-[10px] left-0", glow: "#8B7CF0", delay: "0s" },
  { name: "TDYU", tag: "Toshkent davlat yuridik universiteti", logo: "/universities/tdyu.png", pos: "top-0 right-0", glow: "#F0A24D", delay: "0.7s" },
  { name: "O'zMU", tag: "O'zbekiston Milliy universiteti", logo: "/universities/ozmu.png", pos: "top-[262px] left-[-40px] lg:left-[-72px]", glow: "#5DCAA5", delay: "1.4s" },
  { name: "TATU", tag: "Toshkent axborot texnologiyalari universiteti", logo: "/universities/tatu.png", pos: "top-[250px] right-[-40px] lg:right-[-72px]", glow: "#4D8CF0", delay: "2.1s" },
  { name: "UzDJTU", tag: "O'zbekiston davlat jahon tillari universiteti", logo: "/universities/uzdjtu.png", pos: "top-[512px] left-[14px]", glow: "#B78BF0", delay: "2.8s" },
  { name: "TDIU", tag: "Toshkent davlat iqtisodiyot universiteti", logo: "/universities/tdiu.png", pos: "top-[502px] right-[6px]", glow: "#F0A24D", delay: "3.5s" },
];

function UniversityCard({ uni }: { uni: UniCard }) {
  return (
    <div className={`animate-float absolute w-[230px] ${uni.pos}`} style={{ animationDelay: uni.delay }}>
      <div
        className="absolute -inset-[18px] -z-10 rounded-[30px] opacity-50 blur-2xl"
        style={{ background: `radial-gradient(circle, ${uni.glow}, transparent 70%)` }}
      />
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#E9DFC9] bg-[#FFFDF9] p-4 shadow-[0_16px_36px_-14px_rgba(46,38,32,0.16)]">
        <img src={uni.logo} alt={uni.name} className="h-[46px] w-[46px] flex-shrink-0 rounded-lg object-contain" />
        <div>
          <div className="text-[15px] font-bold text-[#2E2620]">{uni.name}</div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-[#8A7F72]">{uni.tag}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative w-full overflow-x-clip bg-[#FAF7EF] px-5 pb-20 pt-14 md:pt-16">
      {/* Desktop orbit hero */}
      <div className="relative mx-auto hidden min-h-[660px] max-w-[1180px] md:block">
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(193,133,47,0.13), transparent 70%)" }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[660px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#2E2620]/[0.14]" />

        {UNIVERSITIES.map((u) => (
          <UniversityCard key={u.name} uni={u} />
        ))}

        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DFC9] bg-[#FFFDF9] px-[18px] py-2 text-[12.5px] font-bold text-[#C1852F] shadow-sm">
            🏆 DTM maksimal ball
          </div>
          <div className="mt-4 text-[132px] font-extrabold leading-none tracking-[-6px] text-[#2E2620] [text-shadow:0_10px_34px_rgba(46,38,32,0.12)]">
            189
          </div>
          <h1 className="mt-4 text-[21px] font-extrabold text-[#2E2620]">
            Orzudagi universitet bir qadam yaqin
          </h1>
          <p className="mt-1.5 text-[14.5px] font-medium text-[#8A7F72]">
            Bilimingga ishon, kelajagingni yarAT!
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F1EAD9] px-5 py-2.5 text-[13px] font-bold text-[#7A4E19]">
            🎯 Maqsad aniq, yo'l ochiq!
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 flex justify-center gap-3.5 md:mt-16">
        <Link to="/signup">
          <Button className="h-[52px] gap-1.5 rounded-xl bg-[#2E2620] px-8 text-[15.5px] font-bold text-[#FAF7EF] hover:bg-[#241D19]">
            Bepul boshlash <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#platforma">
          <Button
            variant="outline"
            className="h-[52px] rounded-xl border-[1.5px] border-[#E9DFC9] bg-transparent px-8 text-[15.5px] font-semibold text-[#2E2620] hover:bg-[#F1EAD9]"
          >
            Qanday ishlaydi?
          </Button>
        </a>
      </div>

      {/* Mobile fallback: simplified stacked hero (orbit layout doesn't fit small screens) */}
      <div className="mx-auto max-w-md text-center md:hidden">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DFC9] bg-[#FFFDF9] px-4 py-1.5 text-[12px] font-bold text-[#C1852F]">
          🏆 DTM maksimal ball
        </div>
        <div className="mt-4 text-[84px] font-extrabold leading-none tracking-[-3px] text-[#2E2620]">189</div>
        <h1 className="mt-3 text-lg font-extrabold text-[#2E2620]">Orzudagi universitet bir qadam yaqin</h1>
        <p className="mt-1.5 text-sm font-medium text-[#8A7F72]">Bilimingga ishon, kelajagingni yarAT!</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F1EAD9] px-4 py-2 text-[12.5px] font-bold text-[#7A4E19]">
          🎯 Maqsad aniq, yo'l ochiq!
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {UNIVERSITIES.map((u) => (
            <div key={u.name} className="flex items-center gap-2.5 rounded-2xl border border-[#E9DFC9] bg-[#FFFDF9] p-3 text-left">
              <img src={u.logo} alt={u.name} className="h-9 w-9 flex-shrink-0 rounded-md object-contain" />
              <div className="text-[13px] font-bold text-[#2E2620]">{u.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section wrapper ---------------- */
function Section({
  eyebrow,
  title,
  subtitle,
  children,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "light" | "tint";
}) {
  return (
    <section
      className={`relative w-full px-5 py-24 md:py-32 ${
        tone === "tint" ? "bg-[#F8FAFF]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-violet-600">
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-[#6B7280] md:text-lg">{subtitle}</p>
          )}
        </div>
        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  );
}


function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "#7c3aed",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_10px_30px_-12px_rgba(124,58,237,0.15)]">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{description}</p>
    </div>
  );
}

/* ---------------- Why GrantX ---------------- */
function WhyGrantX() {
  const items = [
    { icon: Target,    title: "Real DTM simulyatsiyasi",   description: "Haqiqiy DTM imtihoniga eng yaqin tajriba — vaqt, format va baholash bir xil." },
    { icon: BookOpen,  title: "Milliy Sertifikat tayyorgarligi", description: "Barcha fanlar bo'yicha Milliy Sertifikat darajasiga moslashtirilgan testlar." },
    { icon: CheckCircle2, title: "Avtomatik natijalar",     description: "Testdan so'ng natijangiz darhol chiqadi — to'g'ri, noto'g'ri va izohlar bilan." },
    { icon: BarChart3, title: "Progress tracking",         description: "Har bir mavzu bo'yicha o'sishingizni real vaqtda kuzatib boring." },
    { icon: LineChart, title: "Learning analytics",        description: "Kuchli va zaif tomonlaringizni aniqlaydigan chuqur tahlil." },
    { icon: Brain,     title: "Aqlli tavsiyalar",          description: "Natijalaringizga qarab keyingi qadamlar avtomatik tavsiya etiladi." },
  ];
  return (
    <Section
      eyebrow="Nima uchun GrantX"
      title="Imtihonga tayyorlanishning eng samarali yo'li"
      subtitle="GrantX — O'zbek abituriyentlari uchun maxsus ishlab chiqilgan, zamonaviy va kuchli ta'lim platformasi."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <FeatureCard key={it.title} {...it} />
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  const items = [
    { icon: Layers,    title: "Fanlar bo'yicha testlar", description: "Matematika, fizika, ona tili, tarix va boshqa fanlar bo'yicha minglab savollar.", accent: "#3b82f6" },
    { icon: Timer,     title: "Vaqtli testlar",          description: "Real imtihon sharoitida vaqt nazorati bilan ishlashga o'rganing.", accent: "#ef4444" },
    { icon: TrophyIcon,title: "Reyting tizimi",          description: "Boshqa abituriyentlar orasidagi o'rningizni kuzatib boring.", accent: "#f59e0b" },
    { icon: User,      title: "Shaxsiy kabinet",         description: "Barcha natijalar, sertifikatlar va yutuqlar bitta joyda.", accent: "#10b981" },
    { icon: PieChart,  title: "Statistikalar",           description: "Har bir test bo'yicha batafsil grafik va statistik tahlillar.", accent: "#06b6d4" },
    { icon: Sparkles,  title: "AI analytics (tez orada)", description: "Sun'iy intellekt yordamida shaxsiylashtirilgan tavsiyalar — yo'lda.", accent: "#a855f7" },
  ];
  return (
    <Section
      tone="tint"
      eyebrow="Platforma imkoniyatlari"
      title="Tayyorlanish uchun barcha kerakli vositalar"
      subtitle="GrantX sizga muvaffaqiyat uchun zarur bo'lgan har bir asbobni taqdim etadi."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <FeatureCard key={it.title} {...it} />
        ))}
      </div>
    </Section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Ro'yxatdan o'tish",          description: "Bir necha soniyada bepul akkaunt yarating va platformaga kiring." },
    { n: "02", title: "Fan tanlash",                description: "O'zingizga kerakli fan va imtihon turini tanlang." },
    { n: "03", title: "Test ishlash",               description: "Real DTM formatidagi testlarni vaqt nazorati ostida yeching." },
    { n: "04", title: "Natijalarni tahlil qilish",  description: "Avtomatik natija, to'g'ri javoblar va batafsil izohlarni ko'ring." },
    { n: "05", title: "Bilimni oshirish",           description: "Zaif mavzularingiz ustida ishlang va keyingi testlarda yuqori ball oling." },
  ];
  return (
    <Section
      eyebrow="Qanday ishlaydi"
      title="Faqat 5 ta oddiy qadam"
      subtitle="Ro'yxatdan o'tishdan tortib yuqori ball olishgacha — hammasi bir joyda."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_10px_30px_-12px_rgba(124,58,237,0.15)]"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl font-semibold leading-none text-violet-600">
                {s.n}
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-[#111827]">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{s.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Stats ---------------- */
function Stats() {
  const stats = [
    { value: "10 000+", label: "Faol abituriyentlar" },
    { value: "50 000+", label: "Test savollari" },
    { value: "15+",     label: "Fanlar" },
    { value: "189",     label: "Maksimal DTM ball" },
  ];
  return (
    <section className="relative w-full bg-white px-5 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl">
            Raqamlarda GrantX
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#6B7280] md:text-lg">
            Minglab abituriyentlar bizga ishonib, orzularini ro'yobga chiqarmoqda.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-8 text-center">
              <div className="text-3xl font-semibold tracking-tight text-violet-600 md:text-4xl">{s.value}</div>
              <div className="mt-2 text-sm text-[#6B7280]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Future plans ---------------- */
function FuturePlans() {
  const items = [
    { icon: Brain,      title: "AI Analytics",              description: "Sun'iy intellekt yordamida har bir o'quvchi uchun shaxsiy o'qish yo'li." },
    { icon: ClipboardList, title: "RASH modeli testlari",   description: "Xalqaro standartdagi RASH modeliga asoslangan ilg'or test tizimi." },
    { icon: Smartphone, title: "Mobil ilova",               description: "iOS va Android uchun to'liq funksiyali mobil ilova ishlab chiqilmoqda." },
    { icon: Building2,  title: "Universitet tavsiya tizimi", description: "Ballaringizga qarab eng mos universitet va yo'nalishlarni tavsiya etamiz." },
  ];
  return (
    <Section
      tone="tint"
      eyebrow="Kelajakdagi rejalar"
      title="GrantX o'sishda davom etmoqda"
      subtitle="Yaqin oylar ichida platformamizga qo'shiladigan yangi imkoniyatlar."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((it) => (
          <FeatureCard key={it.title} {...it} />
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTA() {
  const highlights = [
    { icon: CheckCircle2, title: "Bepul boshlash",    description: "Ro'yxatdan o'tish va asosiy testlar to'liq bepul." },
    { icon: Target,       title: "Real DTM formati",   description: "Haqiqiy imtihonga eng yaqin savollar va vaqt nazorati." },
    { icon: BarChart3,    title: "Batafsil tahlil",    description: "Har bir urinishdan keyin natija va tavsiyalar." },
    { icon: TrophyIcon,   title: "Reyting va yutuqlar", description: "Boshqa abituriyentlar orasidagi o'rningizni ko'ring." },
  ];
  return (
    <section className="relative w-full bg-white px-5 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-violet-600">
            <Rocket className="h-3 w-3" /> Bugun boshlang
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-[#111827] md:text-5xl">
            Orzularingiz sari birinchi qadamni qo'ying
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#6B7280] md:text-lg">
            GrantX bilan DTM va Milliy Sertifikat imtihonlariga professional darajada
            tayyorlanishni boshlang. Ro'yxatdan o'tish — bepul.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="h-12 w-full bg-violet-600 px-8 text-base text-white hover:bg-violet-700 sm:w-auto">
                Boshlash <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="h-12 w-full border-slate-200 bg-white px-8 text-base text-slate-800 sm:w-auto">
                Kirish
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-violet-300 hover:shadow-[0_10px_30px_-12px_rgba(124,58,237,0.15)]"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-600">
                <h.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#111827]">{h.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">{h.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-[#111827]">
            Grant<span className="text-violet-600">X</span>
          </span>
        </div>
        <p className="text-xs text-[#6B7280]">
          © {new Date().getFullYear()} GrantX. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
