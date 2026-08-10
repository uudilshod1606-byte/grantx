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
  Flame,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { IntilLogo } from "@/components/brand/IntilLogo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const SIDEBAR_WIDTH = 288;

export const NAV = [
  { to: "/dashboard", label: "Bosh sahifa", icon: Home },
  { to: "/dtm", label: "DTM", icon: Sparkles },
  { to: "/milliy-sertifikat", label: "Milliy Sertifikat", icon: Target },
  { to: "/qollanmalar", label: "Qo'llanma", icon: BookOpen },
] as const;

export function useActiveNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (to: string) => (to === "/dashboard" ? pathname === to : pathname.startsWith(to));
}

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
        <p className="tabnum text-[26px] font-semibold leading-none text-ink-strong">{days} kun</p>
        <span className="tabnum text-[12px] text-ink-mute">→ {goal}</span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EDE8DC]">
        <div
          className="h-full rounded-full bg-deep transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
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

/** Shared sidebar body — identical on every internal page. */
export function SidebarBody({ streakDays }: { streakDays?: number }) {
  const isActive = useActiveNav();
  const { isAdmin, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-5 pb-6 pt-5">
        <Link to="/dashboard" aria-label="INTIL bosh sahifa">
          <IntilLogo />
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

          {/* Study Plan is not built yet — inert "soon" entry. */}
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

        {typeof streakDays === "number" && (
          <div className="mt-4">
            <StreakCard days={streakDays} />
          </div>
        )}
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

/** Fixed desktop sidebar. */
export function Sidebar({ streakDays }: { streakDays?: number }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[288px] border-r border-edge lg:block">
      <SidebarBody streakDays={streakDays} />
    </aside>
  );
}

/** Mobile bottom navigation, mirrors the sidebar menu. */
export function MobileNav() {
  const isActive = useActiveNav();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-white lg:hidden">
      <ul className="mx-auto flex max-w-md">
        {NAV.map((item) => {
          const active = isActive(item.to);
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-2.5 text-[10.5px]"
              >
                <item.icon
                  className={cn("h-[19px] w-[19px]", active ? "text-brass" : "text-ink-mute")}
                  strokeWidth={1.6}
                />
                <span className={active ? "font-medium text-ink-strong" : "text-ink-mute"}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Sidebar;