import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { AuthLoadingScreen, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "INTIL — DTM va Milliy Sertifikatga tayyorlov" },
      { name: "description", content: "INTIL — O'zbek talabalari uchun zamonaviy ta'lim platformasi. DTM va Milliy Sertifikat imtihonlariga onlayn tayyorlanish." },
    ],
  }),
});

function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#140D08] text-[#F7EEE1]">
      <Hero />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between py-7">
      <div className="flex shrink-0 items-center gap-2 font-serif text-[22px] font-medium tracking-tight">
        <span className="h-[26px] w-[26px] rounded-[7px] bg-[linear-gradient(145deg,#FBE2AC,#B87F2C)] shadow-[0_2px_10px_-2px_rgba(223,167,66,0.6)]" />
        int<span className="italic text-[#F0C670]">i</span>l
      </div>
      <ul className="hidden shrink-0 gap-9 text-sm text-[#B8A490] md:flex">
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Fanlar</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">DTM testlari</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Reyting</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Biz haqimizda</a></li>
      </ul>
      <Link
        to="/login"
        className="shrink-0 rounded-full border border-[#DFA74266] px-6 py-2.5 text-sm font-medium text-[#FBE2AC] backdrop-blur-md transition-colors hover:bg-[#DFA742] hover:text-[#140D08]"
      >
        Kirish
      </Link>
    </nav>
  );
}

/* ---------------- Marquee ticker ---------------- */
function Marquee() {
  const items = ["DTM TIZIMI", "MILLIY SERTIFIKAT", "189 BALL", "UWED", "TATU", "TDYU", "ONLAYN TEST"];
  const strip = [...items, ...items];
  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl overflow-hidden border-y border-[#F7EEE114] py-3">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex shrink-0 gap-10">
            {strip.map((label, i) => (
              <span key={`${rep}-${i}`} className="flex items-center gap-10 text-xs font-semibold tracking-[2px] text-[#8C7A68]">
                {label}
                <span className="h-1 w-1 rounded-full bg-[#DFA742]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Ticket card (small, peeking behind the main card) ---------------- */
function PeekCard({
  className,
  stripe,
  iconFg,
  label,
  icon,
}: {
  className: string;
  stripe: string;
  iconFg: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`absolute flex h-[150px] w-[110px] flex-col items-center justify-between rounded-2xl border border-white/10 bg-[#241609] p-3 shadow-[0_20px_36px_-16px_rgba(0,0,0,0.65)] ${className}`}
    >
      <span className="h-1 w-9 rounded-full" style={{ background: stripe }} />
      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: stripe, color: iconFg }}>
        {icon}
      </div>
      <span className="text-[11px] font-bold tracking-[1px] text-[#F7EEE1]">{label}</span>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 16 });
  }
  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden px-6 md:px-[6.5vw]"
      style={{
        background:
          "radial-gradient(1000px 640px at 84% 6%, rgba(223,167,66,0.10), transparent 62%), linear-gradient(172deg, #140D08 0%, #1E140D 42%, #2C1D12 78%, #3A2408 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Navbar />
      <Marquee />

      <div className="relative grid flex-1 grid-cols-1 items-center gap-5 py-10 md:grid-cols-[1.05fr_0.95fr]">
        {/* ghost watermark numeral */}
        <span
          className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 select-none font-serif text-[420px] font-medium leading-none text-[#F7EEE1] opacity-[0.035] md:text-[520px]"
          aria-hidden
        >
          189
        </span>

        {/* Copy */}
        <div className="relative z-[6]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DFA7424D] bg-[linear-gradient(180deg,rgba(223,167,66,0.10),rgba(223,167,66,0.03))] py-2 pl-3.5 pr-4.5 text-[13px] text-[#FBE2AC] shadow-[0_4px_20px_-8px_rgba(223,167,66,0.25)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#F0C670] shadow-[0_0_8px_2px_rgba(240,198,112,0.7)]" />
            Milliy sertifikat &amp; DTM tayyorgarligi
          </div>

          <h1 className="font-serif text-[44px] font-normal leading-[1.03] tracking-[-0.8px] text-[#F7EEE1] md:text-[62px]">
            Bir xabar. Butun{" "}
            <span className="bg-[linear-gradient(100deg,#FBE2AC,#DFA742_60%,#B87F2C)] bg-clip-text italic text-transparent">
              kelajagingizni
            </span>
            <br />
            o'zgartirishi mumkin.
          </h1>

          <p className="mt-6 max-w-[460px] text-[17.5px] leading-[1.7] text-[#B8A490]">
            INTIL — DTM va Milliy sertifikatga tayyorlanish uchun yaratilgan zamonaviy platforma.
            Eng so'ngi testlar bilan bilim darajangizni oshiring, natijalaringizni kuzating va
            maqsadingiz sari ishonch bilan harakat qiling.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-[11px] bg-[linear-gradient(150deg,#FBE2AC,#DFA742_55%,#B87F2C)] px-8 py-4 text-[15px] font-bold text-[#140D08] shadow-[0_14px_34px_-10px_rgba(223,167,66,0.55),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-transform hover:-translate-y-0.5"
            >
              Bepul boshlash <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#"
              className="group flex items-center gap-2 py-4 text-[15px] font-medium text-[#F7EEE1] transition-colors hover:text-[#FBE2AC]"
            >
              Testlarni ko'rish
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Visual stage — fanned certificate/ticket stack, mouse-reactive tilt */}
        <div
          ref={stageRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="relative z-[6] flex h-full min-h-[460px] items-center justify-center [perspective:1400px]"
        >
          <div
            className="relative h-[380px] w-[300px] transition-transform duration-300 ease-out"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
          >
            <PeekCard
              className="-top-10 left-2 rotate-[-16deg]"
              stripe="linear-gradient(145deg,#C23A4A,#7A1F2B)"
              iconFg="#FDEBEC"
              label="UWED"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z" />
                </svg>
              }
            />
            <PeekCard
              className="-top-14 left-1/2 -translate-x-1/2 rotate-[-2deg]"
              stripe="linear-gradient(145deg,#3FD98C,#1F8A56)"
              iconFg="#08301C"
              label="TATU"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5h14M12 5v14M8 19c-1.8 0-3-1.5-3-3.3 0-1.3.8-2.4 2-2.9" />
                </svg>
              }
            />
            <PeekCard
              className="-top-10 right-2 rotate-[14deg]"
              stripe="linear-gradient(145deg,#3D5A8A,#152540)"
              iconFg="#EAF0FA"
              label="TDYU"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 4l1.5 1.5H17v11H7v-11h3.5L12 4z" />
                  <path d="M7 6.5v11M17 6.5v11" />
                </svg>
              }
            />

            {/* main certificate ticket */}
            <div
              className="absolute bottom-0 left-1/2 h-[330px] w-[280px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-[#FBE2AC33] shadow-[0_40px_70px_-24px_rgba(0,0,0,0.7)]"
              style={{
                background: "linear-gradient(155deg,#FCEAC0 0%,#EBBE6E 42%,#C6903E 78%,#6B4419 100%)",
                transform: "translateZ(40px) translateX(-50%)",
              }}
            >
              <div className="flex h-full flex-col justify-between p-6 text-[#2C1D12]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[2px]">INTIL</span>
                  <span className="text-[11px] font-semibold tracking-[1px] opacity-70">SERTIFIKAT</span>
                </div>

                <div className="text-center">
                  <div className="font-serif text-[104px] font-semibold leading-none">189</div>
                  <div className="mt-2 text-[11px] font-semibold tracking-[3px] opacity-70">DTM NATIJA BALI</div>
                </div>

                <div>
                  <div className="mb-3 h-px w-full bg-[repeating-linear-gradient(90deg,#2C1D1266_0_6px,transparent_6px_12px)]" />
                  <div className="flex items-end justify-between">
                    <div className="flex gap-[3px]">
                      {[3, 5, 2, 6, 4, 2, 5, 3, 6, 2, 4, 5].map((h, i) => (
                        <span key={i} className="w-[2px] bg-[#2C1D12]" style={{ height: `${h * 3}px`, opacity: 0.6 }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold tracking-[1px] opacity-60">№ 2026-UZ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[5] flex flex-col items-center gap-2 pb-7 text-[11px] tracking-[1.5px] text-[#8C7A68]">
        <span>SCROLL</span>
        <div className="h-[34px] w-px bg-[linear-gradient(#DFA742,transparent)]" />
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
