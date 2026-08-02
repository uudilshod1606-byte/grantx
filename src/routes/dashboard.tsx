import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Menu,
  LogOut,
  BookOpen,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
  Clock,
  Play,
  Award,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight,
  Inbox,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute, useAuth, type AuthUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — INTIL" },
      { name: "description", content: "INTIL shaxsiy kabinet: statistikalar, faollik va imtihon natijalari." },
    ],
  }),
});

// New users start with zero data. Real data will be wired up later.
const fallbackUser = {
  name: "Yangi foydalanuvchi",
  username: "@student",
  joined: "Bugun qo'shildi",
  avatarInitials: "YF",
};

const stats = {
  totalTests: 0,
  averageScore: 0,
  bestScore: 0,
  weeklyActivity: 0,
  streak: 0,
};

function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isAdmin, signOut } = useAuth();
  const displayUser = getDisplayUser(user);

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <Navbar user={displayUser} isAdmin={isAdmin} onSignOut={signOut} />

      <main className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <ProfileCard user={displayUser} />

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Ishlangan testlar" value={stats.totalTests} />
          <StatCard icon={<Target className="h-5 w-5" />} label="O'rtacha ball" value={`${stats.averageScore}%`} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Eng yuqori ball" value={`${stats.bestScore}%`} />
          <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Haftalik faollik" value={stats.weeklyActivity} />
          <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${stats.streak} kun`} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <QuickActions />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <SubjectPerformance />
          <WeakStrongSubjects />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentActivity />
          <LeaderboardPreview />
        </section>
      </main>
    </div>
  );
}

function getDisplayUser(authUser: AuthUser | null) {
  const name = authUser?.fullName || "INTIL foydalanuvchi";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GX";

  return {
    name,
    username: authUser?.email ? `@${authUser.email.split("@")[0]}` : "@student",
    joined: authUser?.createdAt
      ? `${new Date(authUser.createdAt).toLocaleDateString("uz-UZ")} qo'shildi`
      : "Bugun qo'shildi",
    avatarInitials: initials,
  };
}

import { Logo } from "@/components/brand/Logo";

type DashboardUser = ReturnType<typeof getDisplayUser>;

function Navbar({ user, isAdmin, onSignOut }: { user: DashboardUser; isAdmin: boolean; onSignOut: () => Promise<void> }) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3">
        <Link to="/dashboard"><Logo /></Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/dashboard" className="text-sm text-foreground transition">Dashboard</Link>
          <Link to="/dtm" className="text-sm text-muted-foreground transition hover:text-foreground">DTM</Link>
          <Link to="/milliy-sertifikat" className="text-sm text-muted-foreground transition hover:text-foreground">Milliy Sertifikat</Link>
          <Link to="/leaderboard" className="text-sm text-muted-foreground transition hover:text-foreground">Reyting</Link>
          <Link to="/achievements" className="text-sm text-muted-foreground transition hover:text-foreground">Yutuqlar</Link>
          <Link to="/history" className="text-sm text-muted-foreground transition hover:text-foreground">Tarix</Link>
          {isAdmin && <Link to="/admin" className="text-sm text-primary transition hover:text-foreground">Admin Panel</Link>}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-bg text-sm font-semibold text-primary-foreground">
            {user.avatarInitials}
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground hover:bg-white/10 hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {isAdmin && (
            <Link to="/admin" aria-label="Admin Panel" className="rounded-lg p-2 text-primary hover:bg-white/10">
              <ShieldCheck className="h-5 w-5" />
            </Link>
          )}
          <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}

function ProfileCard({ user }: { user: DashboardUser }) {
  return (
    <div className="glass animate-fade-up mt-6 rounded-3xl p-6 md:p-8">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-bg text-2xl font-bold text-primary-foreground glow">
              {user.avatarInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-accent p-1">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.username}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> {user.joined}
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Umumiy progress</span>
            <span className="font-semibold gradient-text">0%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full gradient-bg transition-all" style={{ width: "0%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Birinchi testingizni ishlab, progressni boshlang
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass animate-fade-up group rounded-2xl p-4 transition hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="glass animate-fade-up rounded-3xl p-6 lg:col-span-3">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tezkor amallar</h2>
        <Sparkles className="h-4 w-4 text-accent" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <ActionCard
          to="/dtm"
          icon={<Trophy className="h-5 w-5" />}
          title="DTM imtihoni"
          desc="5 ta fan, 180 daqiqa"
          primary
        />
        <ActionCard
          to="/milliy-sertifikat"
          icon={<Award className="h-5 w-5" />}
          title="Milliy Sertifikat"
          desc="Fan tanlab boshlash"
        />
        <ActionCard
          to="/dashboard"
          icon={<Play className="h-5 w-5" />}
          title="Oxirgi imtihon"
          desc="Hozircha imtihon yo'q"
          disabled
        />
      </div>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  desc,
  primary,
  disabled,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`group relative flex items-center justify-between rounded-2xl border border-white/5 p-4 transition ${
        disabled ? "opacity-50" : "hover:border-primary/40 hover:bg-white/[0.04]"
      } ${primary ? "gradient-bg !border-transparent" : "bg-white/[0.02]"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${primary ? "bg-white/20 text-primary-foreground" : "bg-primary/15 text-primary"}`}>
          {icon}
        </div>
        <div>
          <p className={`font-semibold ${primary ? "text-primary-foreground" : ""}`}>{title}</p>
          <p className={`text-xs ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{desc}</p>
        </div>
      </div>
      {!disabled && (
        <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-1 ${primary ? "text-primary-foreground" : "text-muted-foreground"}`} />
      )}
    </div>
  );
  if (disabled) return inner;
  return <Link to={to}>{inner}</Link>;
}

function SubjectPerformance() {
  return (
    <div className="glass animate-fade-up rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Fanlar bo'yicha natijalar</h2>
        <BarChart3 className="h-4 w-4 text-accent" />
      </div>
      <EmptyState
        icon={<BarChart3 className="h-6 w-6" />}
        title="Siz hali test ishlamagansiz"
        desc="Birinchi testingizni boshlang va natijalaringizni shu yerda kuzating."
        ctaTo="/dtm"
        ctaLabel="Testni boshlash"
      />
    </div>
  );
}

function WeakStrongSubjects() {
  return (
    <div className="glass animate-fade-up rounded-3xl p-6">
      <h2 className="mb-5 text-lg font-semibold">Kuchli va zaif fanlar</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-400">
            <TrendingUp className="h-4 w-4" /> Kuchli fanlar
          </div>
          <p className="text-xs text-muted-foreground">Yetarli ma'lumot yo'q</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-400">
            <TrendingDown className="h-4 w-4" /> Zaif fanlar
          </div>
          <p className="text-xs text-muted-foreground">Yetarli ma'lumot yo'q</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Bir nechta testlardan keyin tahlil avtomatik tarzda paydo bo'ladi.
      </p>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="glass animate-fade-up rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">So'nggi faollik</h2>
        <Clock className="h-4 w-4 text-accent" />
      </div>
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="Faollik tarixi bo'sh"
        desc="Imtihonlar ishlangach, ular shu yerda ko'rinadi."
      />
    </div>
  );
}

function LeaderboardPreview() {
  return (
    <div className="glass animate-fade-up rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Haftalik reyting</h2>
        <Crown className="h-4 w-4 text-accent" />
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sizning o'rningiz</span>
          <span className="font-semibold">—</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Eng yuqori ball</span>
          <span className="font-semibold">—</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Reyting birinchi imtihondan so'ng faollashadi. Hozircha hech kim natija topshirmagan.
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  ctaTo,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  ctaTo?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{desc}</p>
      {ctaTo && ctaLabel && (
        <Link to={ctaTo} className="mt-4">
          <Button className="gradient-bg text-primary-foreground hover:opacity-90">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
