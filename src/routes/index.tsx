import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GraduationCap, Sparkles, BookOpen, Trophy, Target, Menu, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <Navbar />
      <Hero />
      <Programs />
      <Features />
      <CTA />
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
      <span className="text-xl font-bold tracking-tight">
        Grant<span className="gradient-text">X</span>
      </span>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/"><Logo /></Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#dasturlar" className="text-sm text-muted-foreground transition hover:text-foreground">Dasturlar</a>
          <a href="#imkoniyatlar" className="text-sm text-muted-foreground transition hover:text-foreground">Imkoniyatlar</a>
          <a href="#narxlar" className="text-sm text-muted-foreground transition hover:text-foreground">Narxlar</a>
          <a href="#aloqa" className="text-sm text-muted-foreground transition hover:text-foreground">Aloqa</a>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:bg-white/10">Kirish</Button>
          </Link>
          <Link to="/signup">
            <Button className="gradient-bg text-primary-foreground hover:opacity-90">Boshlash</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  const universities = [
    { name: "UWED", subtitle: "Jahon iqtisodiyoti", accent: "#3b82f6", glow: "rgba(59,130,246,0.55)", pos: "top-0 left-0", delay: "0s" },
    { name: "TDYU", subtitle: "Yuridik universitet", accent: "#ef4444", glow: "rgba(239,68,68,0.5)", pos: "top-0 right-0", delay: "0.6s" },
    { name: "O‘zMU", subtitle: "Milliy universitet", accent: "#10b981", glow: "rgba(16,185,129,0.5)", pos: "top-1/2 -translate-y-1/2 left-0", delay: "1.2s" },
    { name: "UzDJTU", subtitle: "Jahon tillari", accent: "#a855f7", glow: "rgba(168,85,247,0.55)", pos: "top-1/2 -translate-y-1/2 right-0", delay: "1.8s" },
    { name: "TDIU", subtitle: "Iqtisodiyot universiteti", accent: "#f97316", glow: "rgba(249,115,22,0.5)", pos: "bottom-0 left-0", delay: "2.4s" },
    { name: "TATU", subtitle: "Axborot texnologiyalari", accent: "#06b6d4", glow: "rgba(6,182,212,0.55)", pos: "bottom-0 right-0", delay: "3s" },
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 text-center md:pt-24">
      <div className="animate-fade-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        O'zbekistonning №1 ta'lim platformasi
      </div>
      <h1 className="animate-fade-up mt-6 text-4xl font-bold tracking-tight md:text-6xl" style={{ animationDelay: "0.1s" }}>
        Orzudagi grantga{" "}
        <span className="gradient-text">bir qadam</span>{" "}
        yaqin
      </h1>
      <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg" style={{ animationDelay: "0.2s" }}>
        GrantX — DTM va Milliy Sertifikat imtihonlariga zamonaviy va samarali tayyorlanish uchun barcha kerakli vositalar bir joyda.
      </p>

      {/* Premium 189 stage with floating university cards */}
      <div className="relative mx-auto mt-14 h-[640px] w-full max-w-5xl md:h-[560px]">
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 35%, transparent), transparent 70%)" }} />
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(closest-side, black, transparent 70%)" }} />
        </div>

        {/* Central 189 */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-float">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 60%, transparent), transparent 70%)" }} />
            <div className="text-[7rem] font-black leading-none tracking-tighter gradient-text drop-shadow-[0_10px_40px_rgba(120,80,255,0.45)] md:text-[12rem]">
              189
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.4em] text-muted-foreground md:text-sm">
              Maksimal DTM ball
            </div>
          </div>
        </div>

        {/* Floating university cards arranged around center */}
        {universities.map((u, i) => (
          <UniversityCard key={u.name} {...u} index={i} />
        ))}
      </div>

      <div className="animate-fade-up mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.3s" }}>
        <Button asChild size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 glow">
          <Link to="/signup">Bepul boshlash <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button size="lg" variant="outline" className="glass border-white/15 hover:bg-white/10">
          Demoni ko'rish
        </Button>
      </div>

      <div className="animate-fade-up mt-12 grid grid-cols-3 gap-4 sm:gap-8" style={{ animationDelay: "0.4s" }}>
        {[
          { v: "50K+", l: "O'quvchilar" },
          { v: "10K+", l: "Testlar" },
          { v: "98%", l: "Mamnunlik" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-4 md:p-6">
            <div className="text-2xl font-bold gradient-text md:text-4xl">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UniversityCard({
  name,
  subtitle,
  accent,
  glow,
  pos,
  delay,
  index,
}: {
  name: string;
  subtitle: string;
  accent: string;
  glow: string;
  pos: string;
  delay: string;
  index: number;
}) {
  return (
    <div
      className={`absolute ${pos} animate-float`}
      style={{ animationDelay: delay, animationDuration: `${6 + (index % 3)}s` }}
    >
      <div
        className="group relative w-[155px] cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.04] hover:border-white/25 md:w-[185px] md:p-5"
        style={{ boxShadow: `0 18px 60px -20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.08)` }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(120% 80% at 0% 0%, ${glow}, transparent 60%)` }}
        />
        <div className="relative flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">University</span>
        </div>
        <div className="relative mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {name}
        </div>
        <div className="relative mt-1 text-xs text-muted-foreground">{subtitle}</div>
        <div
          className="relative mt-3 h-[2px] w-10 rounded-full transition-all duration-500 group-hover:w-20"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      </div>
    </div>
  );
}

function Programs() {
  const items = [
    {
      icon: BookOpen,
      tag: "Oliy ta'lim",
      title: "DTM",
      href: "/dtm",
      desc: "Davlat test markazi imtihonlariga to'liq tayyorlov. Barcha blok fanlar bo'yicha video darslar, mock testlar va shaxsiy reyting.",
      points: ["Barcha bloklar", "10 000+ test", "Jonli darslar"],
    },
    {
      icon: Trophy,
      tag: "O'qituvchilar uchun",
      title: "Milliy Sertifikat",
      href: "/milliy-sertifikat",
      desc: "CEFR English, Matematika, Ona tili va adabiyot, Tarix, Fizika, Biologiya, Kimyo fanlaridan milliy sertifikatga tayyorlov.",
      points: ["7 ta asosiy fan", "Real format testlar", "Mentor qo'llab-quvvatlash"],
    },
  ];
  return (
    <section id="dasturlar" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-5xl">Asosiy <span className="gradient-text">dasturlar</span></h2>
        <p className="mt-4 text-muted-foreground">Maqsadingizga mos yo'nalishni tanlang va bugundan boshlang.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((it, i) => {
          const Card = (
            <div
              key={it.title}
              className="group relative overflow-hidden rounded-3xl glass p-8 transition duration-500 hover:-translate-y-1 hover:glow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-2xl transition group-hover:bg-primary/40" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg glow">
                  <it.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="mt-6 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  {it.tag}
                </div>
                <h3 className="mt-3 text-3xl font-bold">{it.title}</h3>
                <p className="mt-3 text-muted-foreground">{it.desc}</p>
                <ul className="mt-6 space-y-2">
                  {it.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 gradient-bg text-primary-foreground hover:opacity-90">
                  Batafsil <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          );
          return it.href && it.href !== "#" ? (
            <Link to={it.href} className="block">
              {Card}
            </Link>
          ) : (
            Card
          );
        })}
      </div>
    </section>
  );
}

function Features() {
  const fs = [
    { icon: Target, title: "Shaxsiy reja", desc: "Sun'iy intellekt har bir o'quvchi uchun individual o'qish rejasi tuzadi." },
    { icon: Trophy, title: "Reyting tizimi", desc: "Boshqa o'quvchilar bilan raqobatlashing va motivatsiyangizni oshiring." },
    { icon: Sparkles, title: "Jonli mentorlar", desc: "Tajribali repetitorlardan to'g'ridan-to'g'ri yordam oling." },
  ];
  return (
    <section id="imkoniyatlar" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-5xl">Nima uchun <span className="gradient-text">GrantX?</span></h2>
        <p className="mt-4 text-muted-foreground">Ta'limni qiziqarli, samarali va sodda qildik.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {fs.map((f) => (
          <div key={f.title} className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:bg-white/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <f.icon className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="narxlar" className="mx-auto max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl glass p-10 text-center md:p-16">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-primary)" }} />
        <h2 className="text-3xl font-bold md:text-5xl">Bugun grantga yo'lni boshlang</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Birinchi 7 kun mutlaqo bepul. Karta ma'lumotlari talab qilinmaydi.
        </p>
        <Button asChild size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90">
          <Link to="/signup">Hozir ro'yxatdan o'tish <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="aloqa" className="mx-auto max-w-6xl px-4 pb-10 pt-6">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} GrantX. Barcha huquqlar himoyalangan.</p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Telegram</a>
          <a href="#" className="hover:text-foreground">Instagram</a>
          <a href="#" className="hover:text-foreground">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
