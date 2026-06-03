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
    <div className="relative h-screen w-screen overflow-hidden bg-white text-slate-900">
      <AmbientBackground />
      <Navbar />
      <HeroScene />
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
          <Trophy className="h-3 w-3 text-violet-600" /> DTM maksimal ball
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
