import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Trophy, Target } from "lucide-react";
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
    <div className="relative h-screen w-screen overflow-hidden bg-white text-[#17254a]">
      <AmbientBackground />
      <HeroScene />
    </div>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute left-[-8%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(93,151,255,0.16),transparent_68%)] blur-3xl" />
      <div className="absolute right-[-8%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,93,177,0.12),transparent_68%)] blur-3xl" />
      <div className="absolute left-1/2 top-[50%] h-[34rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(121,92,255,0.105),transparent_70%)] blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_bottom,rgba(239,246,255,0.9),transparent_65%)]" />
    </div>
  );
}

function HeroScene() {
  const universities = [
    { name: "UWED", subtitle: "Jahon iqtisodiyoti va\ndiplomatiya universiteti", accent: "#1554b7", soft: "#dbeafe", glow: "rgba(37,99,235,0.34)", pos: { left: "14.6%", top: "8.8%" }, rotate: "-8deg", seal: "✦", delay: "0s" },
    { name: "TDYU", subtitle: "Toshkent davlat\nyuridik universiteti", accent: "#d51b36", soft: "#ffe4e8", glow: "rgba(220,38,38,0.28)", pos: { left: "65.9%", top: "9.8%" }, rotate: "5deg", seal: "♜", delay: "0.4s" },
    { name: "O‘ZMU", subtitle: "O‘zbekiston\nMilliy universiteti", accent: "#10a04f", soft: "#dcfce7", glow: "rgba(34,197,94,0.35)", pos: { left: "4.2%", top: "37.6%" }, rotate: "-5deg", seal: "◉", delay: "0.8s" },
    { name: "TATU", subtitle: "Toshkent axborot\ntexnologiyalari universiteti", accent: "#18b7c8", soft: "#cffafe", glow: "rgba(6,182,212,0.32)", pos: { left: "76%", top: "38.3%" }, rotate: "3deg", seal: "T", delay: "1.2s" },
    { name: "UzDJTU", subtitle: "O‘zbekiston davlat\njahon tillari universiteti", accent: "#8b5cf6", soft: "#ede9fe", glow: "rgba(139,92,246,0.34)", pos: { left: "15.2%", top: "70.3%" }, rotate: "-4deg", seal: "◎", delay: "1.6s" },
    { name: "TDIU", subtitle: "Toshkent davlat\niqtisodiyot universiteti", accent: "#ff8a12", soft: "#ffedd5", glow: "rgba(249,115,22,0.34)", pos: { left: "65.2%", top: "70.6%" }, rotate: "4deg", seal: "▥", delay: "2s" },
  ];
  const dots = [
    { left: "39.1%", top: "17.2%", color: "#4d73ff" },
    { left: "61.6%", top: "18.5%", color: "#ff4bb1" },
    { left: "10.5%", top: "50.2%", color: "#c084fc" },
    { left: "27.9%", top: "47.2%", color: "#22e58a" },
    { left: "72.4%", top: "47.3%", color: "#26d9ee" },
    { left: "90.6%", top: "49.3%", color: "#c084fc" },
    { left: "13%", top: "78.3%", color: "#70c2ff" },
    { left: "39.1%", top: "83.8%", color: "#8b5cf6" },
    { left: "61.4%", top: "83.8%", color: "#ff7a1a" },
    { left: "88%", top: "78.6%", color: "#38bdf8" },
  ];

  return (
    <section className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
      <div className="relative aspect-[1240/626] w-[min(1240px,100vw)] min-w-[760px] max-w-[1240px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,243,255,0.85),rgba(255,255,255,0)_58%)]" />

        <div className="pointer-events-none absolute left-[5.7%] top-[11.8%] h-[75%] w-[88.6%] rounded-[50%] border border-dashed border-[#8b5cf6]/14" />
        <div className="pointer-events-none absolute left-[28.8%] top-[12.2%] h-[72%] w-[42.4%] rounded-[50%] border border-dashed border-[#8b5cf6]/10" />
        <div className="pointer-events-none absolute left-[50%] top-[17.3%] h-[67%] border-l border-dashed border-[#8b5cf6]/8" />
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[47.9%] border-t border-dashed border-[#8b5cf6]/10" />

        {dots.map((dot, index) => (
          <span
            key={index}
            className="absolute z-[3] h-[5px] w-[5px] rounded-full"
            style={{
              left: dot.left,
              top: dot.top,
              background: dot.color,
              boxShadow: `0 0 9px ${dot.color}, 0 0 22px ${dot.color}`,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-[48.8%] z-[2] h-[43%] w-[43%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(125,102,255,0.18),rgba(255,255,255,0)_68%)] blur-2xl" />

        <div className="absolute left-1/2 top-[26.2%] z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ddd8ff] bg-white/78 px-5 py-2 text-[13px] font-bold text-[#5d55d9] shadow-[0_8px_24px_rgba(92,86,216,0.10)] backdrop-blur-xl">
          <Trophy className="h-4 w-4 fill-[#6860ee]/15 text-[#635cf0]" /> DTM maksimal ball
        </div>

        <div className="absolute left-1/2 top-[48.5%] z-10 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(10rem,18.8vw,14.7rem)] font-black leading-none tracking-[-0.065em] text-[#151d3a]">
          <span
            className="block"
            style={{
              textShadow:
                "0 5px 0 rgba(44,61,130,0.10), 0 18px 28px rgba(18,31,72,0.30), 0 38px 64px rgba(59,88,183,0.22), -12px 0 26px rgba(72,105,255,0.18), 14px 7px 22px rgba(255,138,43,0.15)",
            }}
          >
            189
          </span>
        </div>

        <div className="absolute left-1/2 top-[68.8%] z-10 w-full -translate-x-1/2 text-center">
          <p className="text-[18px] font-extrabold tracking-[-0.01em] text-[#2a3d72]">
            Orzular sari bir qadam yaqinroq!
          </p>
          <p className="mt-2 text-[14px] font-semibold text-[#607095]">
            Bilimingga ishon, kelajagingni <span className="text-[#5f5af4]">yarAT!</span>
          </p>
        </div>

        <div className="absolute left-1/2 top-[83.8%] z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ddd8ff] bg-white/78 px-5 py-2 text-[13px] font-bold text-[#5d55d9] shadow-[0_8px_24px_rgba(92,86,216,0.10)] backdrop-blur-xl">
          <Target className="h-4 w-4 text-[#635cf0]" /> Maqsad aniq, yo‘l ochiq!
        </div>

        {universities.map((u) => (
          <UniversityCard key={u.name} {...u} />
        ))}
      </div>
    </section>
  );
}

function UniversityCard({
  name,
  subtitle,
  accent,
  soft,
  glow,
  pos,
  rotate,
  seal,
  delay,
}: {
  name: string;
  subtitle: string;
  accent: string;
  soft: string;
  glow: string;
  pos: { top: string; left: string };
  rotate: string;
  seal: string;
  delay: string;
}) {
  return (
    <div
      className="absolute z-20 h-[112px] w-[246px] animate-float"
      style={{ ...pos, animationDelay: delay, animationDuration: "7.5s", transform: `rotate(${rotate})` }}
    >
      <div
        className="relative flex h-full w-full cursor-default items-center gap-4 overflow-hidden rounded-[18px] border border-white/80 bg-white/82 px-6 py-5 backdrop-blur-2xl"
        style={{
          boxShadow: `0 19px 34px -18px ${glow}, 0 12px 28px -20px rgba(27,38,75,0.42), 0 2px 0 ${soft}, inset 0 1px 0 rgba(255,255,255,0.96)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-75"
          style={{ background: `radial-gradient(90% 120% at 0% 100%, ${soft}, transparent 58%)` }}
        />
        <div
          className="relative flex h-[61px] w-[61px] shrink-0 items-center justify-center rounded-full border-[3px] text-[22px] font-black"
          style={{ color: accent, borderColor: accent, background: `radial-gradient(circle, white 42%, ${soft})` }}
        >
          <span className="absolute inset-[6px] rounded-full border border-current opacity-45" />
          {seal}
        </div>
        <div className="relative min-w-0">
          <div className="text-[25px] font-black leading-none tracking-[-0.035em]" style={{ color: accent }}>
            {name}
          </div>
          <div className="mt-3 whitespace-pre-line text-[12px] font-semibold leading-[1.45] text-[#43516e]">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
