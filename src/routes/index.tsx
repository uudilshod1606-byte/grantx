import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GraduationCap, Trophy, Target } from "lucide-react";
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
    <div className="relative h-screen w-screen overflow-hidden text-foreground">
      <AmbientBackground />
      <Navbar />
      <HeroScene />
    </div>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-20 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-3xl animate-blob" />
      <div
        className="absolute top-1/3 -right-24 h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-3xl animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-3xl animate-blob"
        style={{ animationDelay: "6s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(closest-side at 50% 50%, black, transparent 75%)",
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
      <span className="text-xl font-bold tracking-tight">
        Grant<span className="gradient-text">X</span>
      </span>
    </div>
  );
}

function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:bg-white/10">
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
    { name: "UWED", subtitle: "Jahon iqtisodiyoti va diplomatiya universiteti", accent: "#3b82f6", glow: "rgba(59,130,246,0.55)", pos: { top: "8%", left: "4%" },    delay: "0s",   duration: "7s" },
    { name: "TDYU",  subtitle: "Toshkent davlat yuridik universiteti",          accent: "#ef4444", glow: "rgba(239,68,68,0.50)",  pos: { top: "8%", right: "4%" },   delay: "0.6s", duration: "8s" },
    { name: "O‘zMU", subtitle: "O‘zbekiston Milliy universiteti",               accent: "#10b981", glow: "rgba(16,185,129,0.50)", pos: { top: "44%", left: "1%" },   delay: "1.2s", duration: "9s" },
    { name: "TATU",  subtitle: "Toshkent axborot texnologiyalari universiteti", accent: "#06b6d4", glow: "rgba(6,182,212,0.55)",  pos: { top: "44%", right: "1%" },  delay: "1.8s", duration: "7.5s" },
    { name: "UzDJTU",subtitle: "O‘zbekiston davlat jahon tillari universiteti", accent: "#a855f7", glow: "rgba(168,85,247,0.55)", pos: { bottom: "8%", left: "4%" }, delay: "2.4s", duration: "8.5s" },
    { name: "TDIU",  subtitle: "Toshkent davlat iqtisodiyot universiteti",       accent: "#f97316", glow: "rgba(249,115,22,0.50)", pos: { bottom: "8%", right: "4%" },delay: "3s",   duration: "9.5s" },
  ];

  return (
    <section className="relative h-full w-full">
      {/* Soft orbit ring (connection line) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-[78vmin] w-[78vmin] rounded-full border border-dashed"
          style={{
            borderColor: "color-mix(in oklab, var(--foreground) 14%, transparent)",
          }}
        />
      </div>

      {/* Ambient radial glow behind 189 */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
        }}
      />

      {/* Center stage */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px] text-muted-foreground">
          <Trophy className="h-3 w-3 text-accent" /> DTM maksimal ball
        </div>
        <div
          className="animate-fade-up mt-3 leading-none tracking-tighter gradient-text"
          style={{
            fontSize: "clamp(7rem, 22vmin, 16rem)",
            fontWeight: 900,
            filter: "drop-shadow(0 18px 60px rgba(120,80,255,0.45))",
            animationDelay: "0.1s",
          }}
        >
          189
        </div>
        <div
          className="animate-fade-up mt-4 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px] text-muted-foreground"
          style={{ animationDelay: "0.2s" }}
        >
          <Target className="h-3 w-3 text-accent" /> Maqsad aniq, yo‘l ochiq
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
  delay,
  duration,
}: {
  name: string;
  subtitle: string;
  accent: string;
  glow: string;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  delay: string;
  duration: string;
}) {
  return (
    <div
      className="absolute animate-float"
      style={{ ...pos, animationDelay: delay, animationDuration: duration }}
    >
      <div
        className="group relative w-[150px] cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.04] hover:border-white/25 md:w-[210px] md:p-5"
        style={{ boxShadow: `0 18px 60px -20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.08)` }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(120% 80% at 0% 0%, ${glow}, transparent 60%)` }}
        />
        <div className="relative flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            University
          </span>
        </div>
        <div
          className="relative mt-2 text-2xl font-extrabold tracking-tight md:text-3xl"
          style={{ color: accent }}
        >
          {name}
        </div>
        <div className="relative mt-1 text-[11px] leading-snug text-muted-foreground md:text-xs">
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
