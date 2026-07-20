import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      <Navbar />
      <Hero />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-6 pt-6 md:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
            <GraduationCap className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Grant<span className="text-[#F0A24D]">X</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/15 hover:text-white">
              Kirish
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="gap-1.5 bg-white text-[#2E2620] hover:bg-white/90">
              Boshlash <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ---------------- Hero (full-bleed video) ---------------- */
function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/50" />
    </section>
  );
}
