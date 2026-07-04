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

/* ---------------- Hero (mobile-first, responsive) ---------------- */
function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-5 pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />
      </div>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3 w-3" /> GrantX — zamonaviy ta'lim platformasi
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
          DTM va Milliy Sertifikatga{" "}
          <span className="gradient-text">tayyorgarlik platformasi</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
          Real testlar, natijalar tahlili va bilim darajangizni baholash.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button className="h-12 w-full gradient-bg px-8 text-base text-primary-foreground glow sm:w-auto">
              Test ishlash <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-12 w-full border-slate-200 bg-white px-8 text-base text-slate-800 sm:w-auto"
            >
              Kirish
            </Button>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-violet-600" /> Bepul ro'yxatdan o'tish</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-violet-600" /> Real DTM formati</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-violet-600" /> Avtomatik natijalar</span>
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
