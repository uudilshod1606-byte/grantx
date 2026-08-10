import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Sparkles,
  Target,
  BookOpen,
  Braces,
  ShieldCheck,
  LifeBuoy,
  Settings,
  Bell,
  Flame,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Brand mark — plain line "book" glyph on a solid dark plate                 */
/* -------------------------------------------------------------------------- */

export function BookMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-deep", className)}
    >
      <BookOpen className="h-[18px] w-[18px] text-brass" strokeWidth={1.6} />
    </span>
  );
}

const NAV = [
  { to: "/dashboard", label: "Bosh sahifa", icon: Home },
  { to: "/dtm", label: "DTM", icon: Sparkles },
  { to: "/milliy-sertifikat", label: "Milliy Sertifikat", icon: Target },
  { to: "/qollanmalar", label: "Qo'llanma", icon: BookOpen },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (to: string) => (to === "/dashboard" ? pathname === to : pathname.startsWith(to));
}

/* -------------------------------------------------------------------------- */
/*  Streak card — derived strictly from real attempt timestamps                */
/* -------------------------------------------------------------------------- */

export function StreakCard({ days }: { days: number }) {
  const goal = 7;
  const pct = Math.min(100, Math.round((days / goal) * 100));
  const active = days > 0;
  return (
    <div className="rounded-2xl border border-edge bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] text-ink-mute">
          <Flame className="h-4 w-4 text-brass" strokeWidth={1.6} />
          Faol seriya
        </span>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
            active ? "bg-[#F1EEE5] text-ink-mute" : "bg-[#F5F2EA] text-ink-mute/70",
          )}
        >
          {active ? "Faol" : "Bo'sh"}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <p className="tabnum text-[26px] font-semibold leading-none text-ink-strong">
          {days} kun
        </p>
        <span className="tabnum text-[12px] text-ink-mute">→ {goal}</span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EDE8DC]">
        <div className="h-full rounded-full bg-deep transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[12px]">
        <span className="font-medium text-ink-strong">
          {active ? "Bugun faol ✓" : "Hali boshlanmagan"}
        </span>
        <span className="text-ink-mute">{Math.max(0, goal - days)} qoldi</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SidebarBody({ streakDays }: { streakDays: number }) {
  const isActive = useActive();
  const { isAdmin, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-5 pb-6 pt-5">
        <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="INTIL bosh sahifa">
          <BookMark />
          <span className="text-[16px] font-bold tracking-[0.02em] text-ink-strong">INTIL</span>
        </Link>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-edge text-ink-mute">
          <PanelLeft className="h-4 w-4" strokeWidth={1.6} />
        </span>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          Menyu
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                    active
                      ? "bg-deep font-medium text-white"
                      : "text-ink-strong/80 hover:bg-[#F3EFE6]",
                  )}
                >
                  <item.icon
                    className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-ink-mute")}
                    strokeWidth={1.6}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Study Plan is not built yet — shown as an inert "soon" entry. */}
          <li>
            <span
              aria-disabled="true"
              className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-mute"
            >
              <Braces className="h-[18px] w-[18px] text-ink-mute" strokeWidth={1.6} />
              Study Plan
              <span className="ml-auto rounded-md bg-[#F1EEE5] px-1.5 py-0.5 text-[10px] font-semibold text-ink-mute">
                Tez orada
              </span>
            </span>
          </li>

          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-strong/80 transition-colors hover:bg-[#F3EFE6]"
              >
                <ShieldCheck className="h-[18px] w-[18px] text-ink-mute" strokeWidth={1.6} />
                Boshqaruv
              </Link>
            </li>
          )}
        </ul>

        <div className="mt-4">
          <StreakCard days={streakDays} />
        </div>
      </nav>

      <div className="space-y-1 px-3 pb-5">
        <Link
          to="/qollanmalar"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-strong/80 transition-colors hover:bg-[#F3EFE6]"
        >
          <LifeBuoy className="h-[18px] w-[18px] text-ink-mute" strokeWidth={1.6} />
          Yordam
        </Link>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink-strong/80 transition-colors hover:bg-[#F3EFE6]"
        >
          <LogOut className="h-[18px] w-[18px] text-ink-mute" strokeWidth={1.6} />
          Chiqish
        </button>
        <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-mute">
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.6} />
          Sozlamalar
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function DashboardShell({
  children,
  title,
  subtitle,
  streakDays,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  streakDays: number;
}) {
  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[288px] border-r border-edge lg:block">
        <SidebarBody streakDays={streakDays} />
      </aside>

      <div className="lg:pl-[288px]">
        <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-9">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] font-bold leading-tight text-ink-strong sm:text-[32px]">
                {title}
              </h1>
              {subtitle && <p className="mt-1.5 text-[15px] text-ink-mute">{subtitle}</p>}
            </div>
            <button
              aria-label="Bildirishnomalar"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-edge bg-white text-ink-mute transition-colors hover:text-ink-strong"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </header>

          <div className="mt-7">{children}</div>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-white lg:hidden">
        <ul className="mx-auto flex max-w-md">
          {NAV.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] text-ink-mute"
              >
                <item.icon className="h-[19px] w-[19px]" strokeWidth={1.6} />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default DashboardShell;
