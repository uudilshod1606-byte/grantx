import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import {
  Menu,
  Trophy,
  ArrowRight,
  Languages,
  Calculator,
  BookText,
  Clock,
  Zap,
  Leaf,
  FlaskConical,
  BarChart3,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/milliy-sertifikat")({
  component: MilliySertifikat,
  head: () => ({
    meta: [
      { title: "Milliy Sertifikat — INTIL" },
      { name: "description", content: "Milliy Sertifikat imtihonlariga tayyorlanish — CEFR English, Matematika, Ona tili va adabiyot, Tarix, Fizika, Biologiya, Kimyo. INTIL bilan imtihonga tayyorlaning." },
    ],
  }),
});

function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/">
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Bosh sahifa
          </Link>
          <span className="text-sm text-foreground">Milliy Sertifikat</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" className="text-foreground hover:bg-white/10">
            Kirish
          </Button>
          <Button className="gradient-bg text-primary-foreground hover:opacity-90">
            Boshlash
          </Button>
        </div>
        <button
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>
    </header>
  );
}

const subjects = [
  {
    id: "cefr-english",
    name: "CEFR English",
    description: "Milliy sertifikat ingliz tili imtihoni — B2 va C1 darajalari.",
    icon: Languages,
    color: "oklch(0.7 0.2 250)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "matematika",
    name: "Matematika",
    description: "Milliy sertifikat matematika imtihoni — algebra, geometriya va analiz.",
    icon: Calculator,
    color: "oklch(0.65 0.22 270)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "ona-tili",
    name: "Ona tili va adabiyot",
    description: "O'zbek tili va adabiyotidan milliy sertifikat imtihoni.",
    icon: BookText,
    color: "oklch(0.6 0.18 150)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "tarix",
    name: "Tarix",
    description: "O'zbekiston va jahon tarixi bo'yicha milliy sertifikat.",
    icon: Clock,
    color: "oklch(0.7 0.15 50)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "fizika",
    name: "Fizika",
    description: "Milliy sertifikat fizika imtihoni — mexanika, elektrodinamika, optika.",
    icon: Zap,
    color: "oklch(0.7 0.2 220)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "biologiya",
    name: "Biologiya",
    description: "Milliy sertifikat biologiya imtihoni — zoologiya, botanika, anatomiya.",
    icon: Leaf,
    color: "oklch(0.65 0.18 140)",
    questions: 0,
    duration: "90 daqiqa",
  },
  {
    id: "kimyo",
    name: "Kimyo",
    description: "Milliy sertifikat kimyo imtihoni — organik va noorganik kimyo.",
    icon: FlaskConical,
    color: "oklch(0.7 0.2 300)",
    questions: 0,
    duration: "90 daqiqa",
  },
];

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 text-center md:pt-24">
      <div className="animate-fade-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-accent" />
        O'zbekistonning eng zamonaviy sertifikat platformasi
      </div>
      <h1 className="animate-fade-up mt-6 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
        Milliy <span className="gradient-text">Sertifikat</span>
      </h1>
      <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg" style={{ animationDelay: "0.2s" }}>
        Fanlarni tanlang va imtihonga real formatda tayyorlaning. Har bir fan bo'yicha maxsus testlar va qulay interfeys.
      </p>

      <div className="animate-fade-up mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "0.3s" }}>
        {[
          { v: "7", l: "Fanlar" },
          { v: "0", l: "Test savollari" },
          { v: "90 min", l: "Har bir fan" },
          { v: "Real format", l: "Imtihon naqshida" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-4 md:p-5">
            <div className="text-xl font-bold gradient-text md:text-2xl">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubjectCard({ subject, index }: { subject: typeof subjects[0]; index: number }) {
  const Icon = subject.icon;
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-3xl glass p-6 transition duration-500 hover:-translate-y-1 hover:glow md:p-8"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Decorative gradient orb */}
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
        style={{ background: subject.color }}
      />

      <div className="relative flex flex-1 flex-col">
        {/* Icon */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
          style={{ background: `color-mix(in oklab, ${subject.color} 25%, transparent)`, boxShadow: `0 8px 32px -8px ${subject.color}` }}
        >
          <Icon className="h-7 w-7" style={{ color: subject.color }} />
        </div>

        {/* Title */}
        <h3 className="mt-5 text-xl font-bold md:text-2xl">{subject.name}</h3>

        {/* Description */}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {subject.description}
        </p>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {subject.questions} ta savol
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {subject.duration}
          </span>
        </div>

        {/* Action */}
        <Link
          to="/milliy-sertifikat/$subjectId"
          params={{ subjectId: subject.id }}
          className="mt-6 block"
        >
          <Button
            className="w-full gap-2 gradient-bg text-primary-foreground hover:opacity-90"
            size="lg"
          >
            Imtihonni boshlash
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SubjectsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold md:text-4xl">
          Imtihon <span className="gradient-text">fanlari</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          O'zingizga kerakli fanni tanlang va real imtihon formatida mashq qiling.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, i) => (
          <SubjectCard key={subject.id} subject={subject} index={i} />
        ))}
      </div>
    </section>
  );
}

function InfoSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-3xl glass p-8 md:p-12">
        <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-primary)" }} />
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-4xl">
              Haqiqiy imtihon <span className="text-primary-foreground/90">tajribasi</span>
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80 md:text-base">
              Milliy sertifikat imtihonlarida kutiladigan barcha fanlarni bir joyda mashq qiling. Vaqt chegarasi, savol turlari va baholash mezoni — hammasi real imtihonga mos.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Bepul sinab ko'rish <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, label: "Rasmiy sertifikatga mos" },
              { icon: BarChart3, label: "Batafsil tahlil" },
              { icon: BookOpen, label: "Keng qamrovli savollar" },
              { icon: Zap, label: "Tez natijalar" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4 text-center">
                <item.icon className="mx-auto h-6 w-6 text-primary-foreground" />
                <p className="mt-2 text-xs text-primary-foreground/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row">
        <Link to="/">
          <Logo />
        </Link>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} INTIL. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Telegram</a>
          <a href="#" className="hover:text-foreground">Instagram</a>
          <a href="#" className="hover:text-foreground">YouTube</a>
        </div>
      </div>
    </footer>
  );
}

function MilliySertifikat() {
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
      <SubjectsGrid />
      <InfoSection />
      <Footer />
    </div>
  );
}
