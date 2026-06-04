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
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
      {/* Desktop hero (immersive) */}
      <div className="relative hidden h-screen w-full overflow-hidden md:block">
        <AmbientBackground />
        <HeroScene />
      </div>
      {/* Mobile hero (clean & simple) */}
      <MobileHero />

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

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent_70%)] blur-2xl" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(closest-side at 50% 50%, black, transparent 78%)",
        }}
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg glow">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Grant<span className="gradient-text">X</span>
      </span>
    </div>
  );
}

function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="text-slate-700 hover:bg-slate-100">
              Kirish
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="gradient-bg text-primary-foreground hover:opacity-90 glow">
              Boshlash
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

function HeroScene() {
  const universities = [
    { name: "UWED",  subtitle: "Jahon iqtisodiyoti va diplomatiya universiteti", accent: "#3b82f6", glow: "rgba(59,130,246,0.45)", pos: { top: "16%", left: "16%" },   rotate: "-8deg", delay: "0s",   duration: "7s" },
    { name: "TDYU",  subtitle: "Toshkent davlat yuridik universiteti",           accent: "#ef4444", glow: "rgba(239,68,68,0.40)",  pos: { top: "16%", right: "16%" },  rotate: "8deg",  delay: "0.6s", duration: "8s" },
    { name: "O‘zMU", subtitle: "O‘zbekiston Milliy universiteti",                accent: "#10b981", glow: "rgba(16,185,129,0.40)", pos: { top: "46%", left: "8%" },    rotate: "-10deg",delay: "1.2s", duration: "9s" },
    { name: "TATU",  subtitle: "Toshkent axborot texnologiyalari universiteti",  accent: "#06b6d4", glow: "rgba(6,182,212,0.45)",  pos: { top: "46%", right: "8%" },   rotate: "10deg", delay: "1.8s", duration: "7.5s" },
    { name: "UzDJTU",subtitle: "O‘zbekiston davlat jahon tillari universiteti",  accent: "#a855f7", glow: "rgba(168,85,247,0.45)", pos: { bottom: "14%", left: "16%" },rotate: "9deg",  delay: "2.4s", duration: "8.5s" },
    { name: "TDIU",  subtitle: "Toshkent davlat iqtisodiyot universiteti",       accent: "#f97316", glow: "rgba(249,115,22,0.40)", pos: { bottom: "14%", right: "16%" },rotate: "-9deg",delay: "3s",   duration: "9.5s" },
  ];

  const orbitDots = Array.from({ length: 16 });

  return (
    <section className="relative h-full w-full">
      {/* Orbit rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[58vmin] w-[58vmin]">
          <div className="absolute inset-0 rounded-full border border-dashed border-violet-300/60" />
          <div className="absolute -inset-[6vmin] rounded-full border border-violet-200/50" />
          <div className="absolute -inset-[12vmin] rounded-full border border-violet-100/60" />
          {orbitDots.map((_, i) => {
            const angle = (i / orbitDots.length) * Math.PI * 2;
            const r = 29; // vmin (half of 58)
            const x = 50 + Math.cos(angle) * r;
            const y = 50 + Math.sin(angle) * r;
            return (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  boxShadow: "0 0 10px rgba(139,92,246,0.9), 0 0 20px rgba(139,92,246,0.5)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Ambient radial glow behind 189 */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.45), rgba(168,85,247,0.18) 50%, transparent 75%)",
        }}
      />

      {/* Center stage */}
      <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center">
        <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-sm backdrop-blur">
          <TrophyIcon className="h-3 w-3 text-violet-600" /> DTM maksimal ball
        </div>
        <div
          className="animate-fade-up relative mt-4 select-none leading-[0.85] tracking-tighter"
          style={{
            fontSize: "clamp(10rem, 38vmin, 26rem)",
            fontWeight: 900,
            background:
              "linear-gradient(180deg, #a78bfa 0%, #7c3aed 45%, #6d28d9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter:
              "drop-shadow(0 6px 0 rgba(109,40,217,0.25)) drop-shadow(0 18px 30px rgba(124,58,237,0.45)) drop-shadow(0 40px 80px rgba(124,58,237,0.35))",
            animationDelay: "0.1s",
          }}
        >
          189
        </div>
        <div className="animate-fade-up mt-5 space-y-1" style={{ animationDelay: "0.25s" }}>
          <p className="text-base font-semibold text-slate-800 md:text-lg">
            Orzular sari bir qadam yaqinroq!
          </p>
          <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent md:text-base">
            Bilimingga ishon, kelajagingni yarAT!
          </p>
        </div>
        <div
          className="animate-fade-up mt-4 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-sm backdrop-blur"
          style={{ animationDelay: "0.35s" }}
        >
          <Target className="h-3 w-3 text-violet-600" /> Maqsad aniq, yo‘l ochiq
        </div>
      </div>

      {/* Floating university cards */}
      {universities.map((u) => (
        <UniversityCard key={u.name} {...u} />
      ))}
    </section>
  );
}

function UniversityCard({
  name,
  subtitle,
  accent,
  glow,
  pos,
  rotate,
  delay,
  duration,
}: {
  name: string;
  subtitle: string;
  accent: string;
  glow: string;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  rotate: string;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className="absolute z-20 animate-float"
      style={{ ...pos, animationDelay: delay, animationDuration: duration, transform: `rotate(${rotate})` }}
    >
      <div
        className="group relative w-[140px] cursor-default overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.04] md:w-[190px] md:p-5"
        style={{
          boxShadow: `0 24px 60px -20px ${glow}, 0 10px 30px -15px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.9)`,
        }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(120% 80% at 0% 0%, ${glow}, transparent 65%)` }}
        />
        <div className="relative flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            University
          </span>
        </div>
        <div
          className="relative mt-2 text-2xl font-extrabold tracking-tight md:text-3xl"
          style={{ color: accent }}
        >
          {name}
        </div>
        <div className="relative mt-1 text-[11px] leading-snug text-slate-600 md:text-xs">
          {subtitle}
        </div>
        <div
          className="relative mt-3 h-[2px] w-10 rounded-full transition-all duration-500 group-hover:w-20"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      </div>
    </div>
  );
}

/* ---------------- Mobile Hero ---------------- */
function MobileHero() {
  return (
    <section className="relative block w-full overflow-hidden px-5 pb-12 pt-28 md:hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl" />
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3 w-3" /> GrantX — zamonaviy ta'lim platformasi
        </div>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg glow">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Grant<span className="gradient-text">X</span>
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-800">
          Orzular sari bir qadam yaqinroq!
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          DTM va Milliy Sertifikat imtihonlariga onlayn tayyorlaning.
          Real testlar, avtomatik natijalar va shaxsiy progress kuzatuvi.
        </p>
        <div className="mt-7 flex w-full flex-col gap-3">
          <Link to="/signup" className="w-full">
            <Button className="h-12 w-full gradient-bg text-base text-primary-foreground glow">
              Boshlash
            </Button>
          </Link>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="h-12 w-full border-slate-200 bg-white text-base text-slate-800">
              Kirish
            </Button>
          </Link>
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
      className={`relative w-full px-5 py-16 md:py-24 ${
        tone === "tint" ? "bg-violet-50/60" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base text-slate-600 md:text-lg">{subtitle}</p>
          )}
        </div>
        <div className="mt-10 md:mt-14">{children}</div>
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
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(124,58,237,0.25)]">
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: accent }}
      />
      <div
        className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white"
        style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="relative text-lg font-bold text-slate-900">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
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
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl font-black leading-none text-transparent" style={{ WebkitTextStroke: "1.5px #7c3aed" }}>
                {s.n}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.description}</p>
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
    <section className="relative w-full overflow-hidden px-5 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent_70%)]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white shadow-[0_30px_60px_-20px_rgba(124,58,237,0.45)] md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Raqamlarda GrantX
            </h2>
            <p className="mt-2 text-violet-100 md:text-lg">
              Minglab abituriyentlar bizga ishonib, orzularini ro'yobga chiqarmoqda.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black tracking-tight md:text-5xl">{s.value}</div>
                <div className="mt-1 text-sm text-violet-100 md:text-base">{s.label}</div>
              </div>
            ))}
          </div>
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
  return (
    <section className="relative w-full overflow-hidden px-5 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.25),transparent_70%)] blur-2xl" />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
          <Rocket className="h-3 w-3" /> Bugun boshlang
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          Orzularingiz sari birinchi qadamni qo'ying
        </h2>
        <p className="mt-4 text-base text-slate-600 md:text-lg">
          GrantX bilan DTM va Milliy Sertifikat imtihonlariga professional darajada
          tayyorlanishni boshlang. Ro'yxatdan o'tish — bepul.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button className="h-14 w-full gradient-bg px-8 text-base text-primary-foreground glow sm:w-auto">
              Boshlash <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="h-14 w-full border-slate-200 bg-white px-8 text-base text-slate-800 sm:w-auto">
              Kirish
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-slate-900">
            Grant<span className="gradient-text">X</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} GrantX. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
