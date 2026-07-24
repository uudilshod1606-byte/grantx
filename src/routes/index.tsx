import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between py-7">
      <div className="flex items-center gap-2 font-serif text-[22px] font-medium tracking-tight">
        <span className="h-[26px] w-[26px] rounded-[7px] bg-[linear-gradient(145deg,#FBE2AC,#B87F2C)] shadow-[0_2px_10px_-2px_rgba(223,167,66,0.6)]" />
        int<span className="italic text-[#F0C670]">i</span>l
      </div>
      <ul className="hidden gap-9 text-sm text-[#B8A490] md:flex">
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Fanlar</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">DTM testlari</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Reyting</a></li>
        <li><a href="#" className="transition-colors hover:text-[#F7EEE1]">Biz haqimizda</a></li>
      </ul>
      <Link
        to="/login"
        className="rounded-full border border-[#DFA74266] px-6 py-2.5 text-sm font-medium text-[#FBE2AC] backdrop-blur-md transition-colors hover:bg-[#DFA742] hover:text-[#140D08]"
      >
        Kirish
      </Link>
    </nav>
  );
}

/* ---------------- Floating university card ---------------- */
function FloatCard({
  className,
  iconBg,
  iconFg,
  label,
  sub,
  icon,
}: {
  className: string;
  iconBg: string;
  iconFg: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`absolute z-[8] flex w-[146px] items-center gap-2.5 rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] px-4 py-3 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl ${className}`}
    >
      <div
        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: iconBg, color: iconFg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-[#F7EEE1]">{label}</div>
        <div className="text-[11px] text-[#8C7A68]">{sub}</div>
      </div>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden px-6 md:px-[6.5vw]"
      style={{
        background:
          "radial-gradient(1100px 700px at 82% 8%, rgba(223,167,66,0.14), transparent 62%), radial-gradient(700px 500px at 8% 92%, rgba(223,167,66,0.06), transparent 60%), linear-gradient(172deg, #140D08 0%, #1E140D 38%, #2C1D12 70%, #40291A 100%)",
      }}
    >
      {/* grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Navbar />

      <div className="relative grid flex-1 grid-cols-1 items-center gap-5 py-5 md:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="relative z-[6]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DFA7424D] bg-[linear-gradient(180deg,rgba(223,167,66,0.10),rgba(223,167,66,0.03))] py-2 pl-3.5 pr-4.5 text-[13px] text-[#FBE2AC] shadow-[0_4px_20px_-8px_rgba(223,167,66,0.25)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#F0C670] shadow-[0_0_8px_2px_rgba(240,198,112,0.7)]" />
            Milliy sertifikat &amp; DTM tayyorgarligi
          </div>

          <h1 className="font-serif text-[42px] font-normal leading-[1.04] tracking-[-0.8px] text-[#F7EEE1] md:text-[58px]">
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

        {/* Visual stage */}
        <div className="relative h-full min-h-[420px]">
          <FloatCard
            className="left-[2%] top-[6%] animate-[floatY_6s_ease-in-out_infinite]"
            iconBg="linear-gradient(145deg,#C23A4A,#7A1F2B)"
            iconFg="#FDEBEC"
            label="UWED"
            sub="tayyorgarlik mos"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z" />
              </svg>
            }
          />
          <FloatCard
            className="bottom-[10%] left-[-2%] animate-[floatY_7s_ease-in-out_infinite_0.6s]"
            iconBg="linear-gradient(145deg,#3FD98C,#1F8A56)"
            iconFg="#08301C"
            label="TATU"
            sub="tayyorgarlik mos"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5h14M12 5v14M8 19c-1.8 0-3-1.5-3-3.3 0-1.3.8-2.4 2-2.9" />
              </svg>
            }
          />
          <FloatCard
            className="right-[-4%] top-[44%] animate-[floatY_5.5s_ease-in-out_infinite_1.1s]"
            iconBg="linear-gradient(145deg,#3D5A8A,#152540)"
            iconFg="#EAF0FA"
            label="TDYU"
            sub="tayyorgarlik mos"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 4l1.5 1.5H17v11H7v-11h3.5L12 4z" />
                <path d="M7 6.5v11M17 6.5v11" />
              </svg>
            }
          />

          <div className="absolute right-[-6%] top-1/2 w-[120%] max-w-[640px] -translate-y-1/2">
            <svg viewBox="0 0 600 600" width="100%" height="100%">
              <defs>
                <radialGradient id="ambient" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#DFA742" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#DFA742" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="ringA" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#FBE2AC" />
                  <stop offset="45%" stopColor="#DFA742" />
                  <stop offset="100%" stopColor="#7A4E1E" />
                </linearGradient>
                <linearGradient id="ringB" x1="90%" y1="10%" x2="10%" y2="90%">
                  <stop offset="0%" stopColor="#5C3A22" />
                  <stop offset="55%" stopColor="#DFA742" />
                  <stop offset="100%" stopColor="#FBE2AC" />
                </linearGradient>

                <radialGradient id="medalFace" cx="38%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#FCEAC0" />
                  <stop offset="35%" stopColor="#EBBE6E" />
                  <stop offset="70%" stopColor="#B87F2C" />
                  <stop offset="100%" stopColor="#6B4419" />
                </radialGradient>

                <linearGradient id="medalRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBE2AC" />
                  <stop offset="50%" stopColor="#B87F2C" />
                  <stop offset="100%" stopColor="#3A2408" />
                </linearGradient>

                <filter id="blurSm" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.6" />
                </filter>
                <filter id="shadow" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000000" floodOpacity="0.55" />
                </filter>
              </defs>

              <circle cx="300" cy="300" r="280" fill="url(#ambient)" />

              <g style={{ transformOrigin: "300px 300px", animation: "spin 40s linear infinite" }}>
                <path d="M 300 60 A 240 240 0 1 1 84 220" fill="none" stroke="url(#ringA)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
                <circle cx="300" cy="60" r="4.5" fill="#FBE2AC" />
              </g>
              <g style={{ transformOrigin: "300px 300px", animation: "spinRev 55s linear infinite" }}>
                <path d="M 300 96 A 204 204 0 1 0 470 430" fill="none" stroke="url(#ringB)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              </g>

              <g filter="url(#shadow)">
                <g style={{ transformOrigin: "300px 300px", animation: "spin 34s linear infinite" }}>
                  <path d="M 300 120 A 180 180 0 1 1 132 402" fill="none" stroke="url(#ringA)" strokeWidth="26" strokeLinecap="round" filter="url(#blurSm)" />
                </g>
                <g style={{ transformOrigin: "300px 300px", animation: "spinRev 44s linear infinite" }}>
                  <path d="M 300 165 A 135 135 0 1 0 415 385" fill="none" stroke="url(#ringB)" strokeWidth="15" strokeLinecap="round" filter="url(#blurSm)" />
                </g>

                <circle cx="300" cy="300" r="86" fill="url(#medalRim)" />
                <circle cx="300" cy="300" r="76" fill="url(#medalFace)" />
                <circle cx="300" cy="300" r="76" fill="none" stroke="#3A2408" strokeWidth="1" opacity="0.4" />
                <circle cx="278" cy="272" r="34" fill="#FFFFFF" opacity="0.18" />

                <text x="300" y="315" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="52" fill="#2C1D12" fontWeight="600">
                  189
                </text>
              </g>

              <g opacity="0.8" style={{ animation: "pulse 4s ease-in-out infinite" }}>
                <circle cx="470" cy="180" r="3" fill="#FBE2AC" />
                <circle cx="130" cy="440" r="2.5" fill="#F0C670" />
                <circle cx="500" cy="380" r="2" fill="#FBE2AC" />
                <circle cx="110" cy="200" r="2" fill="#F0C670" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-[5] flex flex-col items-center gap-2 pb-7 text-[11px] tracking-[1.5px] text-[#8C7A68]">
        <span>SCROLL</span>
        <div className="h-[34px] w-px bg-[linear-gradient(#DFA742,transparent)]" />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.55; } 50% { opacity: 0.85; } }
        @keyframes floatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
    </section>
  );
}
