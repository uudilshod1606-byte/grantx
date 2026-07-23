import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#EDEEF3] text-black">
      <Hero />
    </div>
  );
}

/* ---------------- Navbar (centered pill) ---------------- */
function Navbar() {
  return (
    <nav className="mx-auto mb-6 flex max-w-md items-center justify-center gap-8 rounded-full bg-white px-6 py-3 shadow-[0_10px_24px_-12px_rgba(20,22,42,0.15)]">
      <span className="mr-1 text-lg font-extrabold tracking-tight">INTIL</span>
      <a href="#" className="text-sm font-medium text-black/70 hover:text-black">Tizim</a>
      <a href="#" className="text-sm font-medium text-black/70 hover:text-black">Natija</a>
      <Link to="/login" className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
        Kirish
      </Link>
    </nav>
  );
}

/* ---------------- Hero (card layout) ---------------- */
function Hero() {
  return (
    <section className="px-6 pt-6 pb-0">
      <Navbar />

      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden md:grid-cols-[0.92fr_1.08fr]">
        {/* Left panel */}
        <div className="flex flex-col justify-center rounded-3xl bg-white p-10 md:p-11">
          <div className="mb-4 h-16 w-16">
            <img src="/intil-icon.png" alt="INTIL" className="h-full w-full object-contain" />
          </div>

          <div className="relative inline-block">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Bir xabar. Butun{" "}
              <span className="bg-[linear-gradient(transparent_60%,#FFE24D_60%)]">
                kelajagingizni
              </span>{" "}
              o'zgartirishi mumkin.
            </h1>
            <svg className="absolute -right-10 -top-2 h-9 w-9" viewBox="0 0 40 40" fill="none">
              <g stroke="#2FBFA8" strokeWidth="2" strokeLinecap="round">
                <line x1="20" y1="0" x2="20" y2="10" />
                <line x1="6" y1="4" x2="12" y2="12" />
                <line x1="34" y1="4" x2="28" y2="12" />
                <line x1="0" y1="16" x2="10" y2="18" />
                <line x1="40" y1="16" x2="30" y2="18" />
              </g>
            </svg>
          </div>

          <p className="mt-5 max-w-md text-base leading-relaxed text-black/60">
            INTIL — DTM va Milliy sertifikatga tayyorlanish uchun yaratilgan zamonaviy platforma.
            Eng so'ngi testlar bilan bilim darajangizni oshiring, natijalaringizni kuzating va
            maqsadingiz sari ishonch bilan harakat qiling.
          </p>

          <div className="mt-7 flex gap-3">
            <Link to="/signup">
              <Button className="gap-1.5 rounded-full bg-[#3E7BFA] px-6 py-6 text-sm font-bold text-white hover:bg-[#3E7BFA]/90">
                Boshlash <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full border-black/10 px-6 py-6 text-sm font-bold">
              Bepul sinov
            </Button>
          </div>
        </div>

        {/* Right panel — video */}
        <div className="relative ml-0 mt-4 overflow-hidden rounded-3xl md:ml-5 md:mt-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.jpg"
            className="h-full min-h-[420px] w-full object-cover"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>

          <div className="absolute bottom-6 left-0 right-0 flex gap-2.5 overflow-hidden px-6">
            {["AI Tutor", "Rasch model", "So'ngi testlar", "Qo'llanmalar"].map((label) => (
              <span
                key={label}
                className="flex-shrink-0 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Subject tab bar */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2.5 rounded-t-3xl bg-white px-8 py-5">
        {["Ona tili", "Tarix", "Matematika", "Fizika", "Kimyo", "Biologiya", "Geografiya", "Ingliz tili"].map(
          (subj) => (
            <span
              key={subj}
              className={
                subj === "Matematika"
                  ? "rounded-full bg-[#3E7BFA] px-4.5 py-2.5 text-sm font-semibold text-white"
                  : "rounded-full px-4.5 py-2.5 text-sm font-semibold text-black/55"
              }
            >
              {subj}
            </span>
          )
        )}
      </div>
    </section>
  );
}
