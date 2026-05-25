import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles, BookOpen, Trophy, Target, Menu, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          <a href="#dasturlar" className="text-sm text-muted-foreground transition hover:text-foreground">Dasturlar</a>
          <a href="#imkoniyatlar" className="text-sm text-muted-foreground transition hover:text-foreground">Imkoniyatlar</a>
          <a href="#narxlar" className="text-sm text-muted-foreground transition hover:text-foreground">Narxlar</a>
          <a href="#aloqa" className="text-sm text-muted-foreground transition hover:text-foreground">Aloqa</a>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:bg-white/10">Kirish</Button>
          </Link>
          <Link to="/signup">
            <Button className="gradient-bg text-primary-foreground hover:opacity-90">Boshlash</Button>
          </Link>
        </div>
        <button className="md:hidden rounded-lg p-2 hover:bg-white/10" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 text-center md:pt-28">
      <div className="animate-fade-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        O'zbekistonning №1 ta'lim platformasi
      </div>
      <h1 className="animate-fade-up mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl" style={{ animationDelay: "0.1s" }}>
        Orzudagi grantga{" "}
        <span className="gradient-text">bir qadam</span>{" "}
        yaqin
      </h1>
      <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
        GrantX — DTM va Milliy Sertifikat imtihonlariga zamonaviy va samarali tayyorlanish uchun barcha kerakli vositalar bir joyda.
      </p>
      <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.3s" }}>
        <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 glow">
          Bepul boshlash <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" className="glass border-white/15 hover:bg-white/10">
          Demoni ko'rish
        </Button>
      </div>

      <div className="animate-fade-up mt-16 grid grid-cols-3 gap-4 sm:gap-8" style={{ animationDelay: "0.4s" }}>
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
        <Button size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90">
          Hozir ro'yxatdan o'tish <ArrowRight className="ml-2 h-4 w-4" />
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
