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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F3EEE3] text-[#241A12]">
      <Hero />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between py-7">
      <div className="flex shrink-0 items-center gap-2 font-serif text-[22px] font-medium tracking-tight text-[#241A12]">
        <span className="h-[26px] w-[26px] rounded-[7px] bg-[linear-gradient(145deg,#FBE2AC,#B87F2C)] shadow-[0_2px_10px_-2px_rgba(223,167,66,0.5)]" />
        int<span className="italic text-[#B87F2C]">i</span>l
      </div>
      <ul className="hidden shrink-0 gap-9 font-mono text-[13px] uppercase tracking-[0.5px] text-[#83705C] md:flex">
        <li><a href="#" className="transition-colors hover:text-[#241A12]">Fanlar</a></li>
        <li><a href="#" className="transition-colors hover:text-[#241A12]">DTM testlari</a></li>
        <li><a href="#" className="transition-colors hover:text-[#241A12]">Reyting</a></li>
        <li><a href="#" className="transition-colors hover:text-[#241A12]">Biz haqimizda</a></li>
      </ul>
      <Link
        to="/login"
        className="shrink-0 rounded-full bg-[#241A12] px-6 py-2.5 text-sm font-medium text-[#F3EEE3] transition-colors hover:bg-[#3A2A1C]"
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
    <div className="relative z-10 mx-auto w-full max-w-6xl overflow-hidden border-y border-[#241A1214] py-3">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex shrink-0 gap-10">
            {strip.map((label, i) => (
              <span key={`${rep}-${i}`} className="flex items-center gap-10 font-mono text-[11px] tracking-[2px] text-[#83705C]">
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

/* ---------------- Realistic DTM answer sheet — the hero's main image ---------------- */
function seedPick(i: number, mod: number, salt = 0) {
  return (i * 31 + salt * 17 + 7) % mod;
}
const LETTERS = ["A", "B", "C", "D", "E"];

function AnswerSheetHero() {
  return (
    <div className="w-[430px] max-w-full select-none rounded-md bg-white font-sans shadow-[0_50px_90px_-30px_rgba(36,26,18,0.35)]">
      <div className="bg-[#BFE9EA] px-5 py-3.5 text-center">
        <div className="text-[12px] font-bold leading-relaxed text-[#1E2A3A]">
          INTIL TA'LIM PLATFORMASI
          <br />
          DTM VA MILLIY SERTIFIKAT TAYYORGARLIK TIZIMI
          <br />
          Onlayn sinov natijasi
        </div>
      </div>

      <div className="px-5 pt-2.5 text-sm font-bold text-[#1E2A3A]">Umumiy bali: 189</div>

      <div className="relative m-5 rounded border-2 border-[#1E2A3A] py-3.5 pl-[34px] pr-3.5">
        <div className="absolute bottom-2 left-1 top-2 flex w-[14px] flex-col justify-between">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="h-[3px] rounded-sm bg-[#1E2A3A]" />
          ))}
        </div>

        <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
          <span className="rounded bg-[#B3242F] px-2.5 py-1 text-[15px] font-extrabold tracking-wide text-white">DTM</span>
          <span
            className="h-[32px] w-[32px] border-2 border-[#1E2A3A]"
            style={{ background: "repeating-conic-gradient(#1E2A3A 0% 25%, transparent 0% 50%) 0 0/8px 8px" }}
          />
          <span className="text-[13px] font-bold tracking-wide text-[#1E2A3A]">JAVOBLAR VARAQASI</span>
          <div className="flex h-[24px] items-end gap-[1.5px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="w-[2px] bg-[#1E2A3A]" style={{ height: `${7 + seedPick(i, 16)}px` }} />
            ))}
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-3 text-[10px] text-[#3A4658]">
          <span>Test kodi: <b className="text-[#1E2A3A]">7777</b></span>
          <span>TIP: <b className="text-[#1E2A3A]">77</b></span>
          <span>Guruh: <b className="text-[#1E2A3A]">777</b></span>
          <span>Bo'lim: <b className="text-[#1E2A3A]">7</b></span>
          <span>O'rindiq: <b className="text-[#1E2A3A]">77</b></span>
        </div>

        <div className="mb-2.5 border-y border-dashed border-[#C9BFA8] py-2 text-center text-[12.5px] font-bold tracking-[2px] text-[#1E2A3A]">
          AAA AAA AAA
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((c) => (
            <div key={c} className="rounded bg-[#F3ECDB] p-1.5">
              <div className="mb-1 text-center text-[7.5px] font-bold text-[#3A4658]">BO'LIM {c + 1}</div>
              {Array.from({ length: 30 }).map((_, r) => {
                const qn = c * 30 + r + 1;
                const filledIdx = seedPick(qn, 5, c);
                return (
                  <div key={r} className="mb-[1.5px] flex items-center gap-[2.5px]">
                    <span className="w-[10px] text-[6px] text-[#3A4658]">{qn}.</span>
                    {LETTERS.map((_, li) => (
                      <span
                        key={li}
                        className={`h-[6px] w-[6px] rounded-full border ${
                          li === filledIdx ? "border-[#1E2A3A] bg-[#1E2A3A]" : "border-[#3A4658] bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-dashed border-[#C9BFA8] pt-2.5">
          <div className="grid grid-cols-3 gap-x-2 gap-y-[3px] text-[9px] text-[#1E2A3A]">
            {Array.from({ length: 90 }).map((_, i) => {
              const n = i + 1;
              const letter = LETTERS[seedPick(n, 5, 3)];
              return (
                <div key={n} className="flex justify-between">
                  <span>{n}. {letter}</span>
                  <span className="font-bold text-[#2E8B57]">✓</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-1 text-[8.5px] text-[#3A4658]">
          <span>Imzo: AAA AAA</span>
          <span>Sana: 07.07.2026</span>
          <span>Natija: 189/200</span>
        </div>
      </div>
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
    setTilt({ x: py * -8, y: px * 10 });
  }
  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden px-6 md:px-[6.5vw]"
      style={{
        background:
          "radial-gradient(900px 560px at 82% 10%, rgba(223,167,66,0.14), transparent 62%), linear-gradient(180deg, #F6F2E9 0%, #F3EEE3 40%, #EFE8D9 100%)",
      }}
    >
      <Navbar />
      <Marquee />

      <div className="relative grid flex-1 grid-cols-1 items-center gap-10 py-10 md:grid-cols-[1.05fr_0.95fr]">
        <span
          className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 select-none font-serif text-[420px] font-medium leading-none text-[#241A12] opacity-[0.03] md:text-[520px]"
          aria-hidden
        >
          189
        </span>

        <div className="relative z-[6]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DFA74266] bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[1px] text-[#B87F2C] shadow-[0_4px_20px_-8px_rgba(223,167,66,0.25)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#DFA742]" />
            Milliy sertifikat &amp; DTM tayyorgarligi
          </div>

          <h1 className="font-serif text-[46px] font-normal leading-[1.03] tracking-[-0.8px] text-[#241A12] md:text-[64px]">
            Bir xabar. Butun{" "}
            <span className="relative inline-block italic text-[#241A12]">
              <span className="absolute inset-x-0 bottom-[6px] -z-10 h-[36%] -skew-x-6 bg-[#F0C670]" />
              kelajagingizni
            </span>
            <br />
            o'zgartirishi mumkin.
          </h1>

          <p className="mt-6 max-w-[460px] text-[17.5px] leading-[1.7] text-[#6B5D4F]">
            INTIL — DTM va Milliy sertifikatga tayyorlanish uchun yaratilgan zamonaviy platforma.
            Eng so'ngi testlar bilan bilim darajangizni oshiring, natijalaringizni kuzating va
            maqsadingiz sari ishonch bilan harakat qiling.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-[11px] bg-[linear-gradient(150deg,#FBE2AC,#DFA742_55%,#B87F2C)] px-8 py-4 text-[15px] font-bold text-[#241A12] shadow-[0_14px_34px_-10px_rgba(223,167,66,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] transition-transform hover:-translate-y-0.5"
            >
              Bepul boshlash <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#"
              className="group flex items-center gap-2 py-4 text-[15px] font-medium text-[#241A12] transition-colors hover:text-[#B87F2C]"
            >
              Testlarni ko'rish
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div
          ref={stageRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="relative z-[6] flex h-full min-h-[460px] items-center justify-center [perspective:1600px]"
        >
          <div
            className="absolute h-[420px] w-[420px] rounded-full opacity-60"
            style={{ background: "radial-gradient(circle, rgba(223,167,66,0.28), transparent 70%)" }}
            aria-hidden
          />
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{ transform: `rotate(-3deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
          >
            <AnswerSheetHero />
          </div>
        </div>
      </div>

      <div className="relative z-[5] flex flex-col items-center gap-2 pb-7 font-mono text-[11px] tracking-[1.5px] text-[#83705C]">
        <span>SCROLL</span>
        <div className="h-[34px] w-px bg-[linear-gradient(#DFA742,transparent)]" />
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
