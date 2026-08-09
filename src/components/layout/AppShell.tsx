import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  GraduationCap,
  Layers,
  ClipboardList,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Bosh sahifa", icon: Home },
  { to: "/milliy-sertifikat", label: "Milliy sertifikat", icon: GraduationCap },
  { to: "/dtm", label: "DTM", icon: Layers },
  { to: "/testlar", label: "Imtihonlarim", icon: ClipboardList },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (to: string) => (to === "/dashboard" ? pathname === to : pathname.startsWith(to));
}

/* -------------------------------------------------------------------------- */
/*  Desktop navigation rail                                                    */
/* -------------------------------------------------------------------------- */

function Rail() {
  const isActive = useActive();
  const { user, isAdmin, signOut } = useAuth();
  const initials =
    (user?.fullName ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "IN";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-obsidian text-ivory lg:flex">
      <div className="px-6 pb-7 pt-7">
        <Link to="/dashboard" aria-label="INTIL bosh sahifa">
          <Logo tone="light" textClassName="text-ivory" />
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/35">
          Ish maydoni
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors duration-200",
                    active
                      ? "bg-white/[0.06] text-ivory"
                      : "text-ivory/55 hover:bg-white/[0.035] hover:text-ivory/90",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-gold" />
                  )}
                  <item.icon
                    className={cn(
                      "h-[17px] w-[17px] transition-colors",
                      active ? "text-champagne" : "text-ivory/45 group-hover:text-ivory/70",
                    )}
                    strokeWidth={1.6}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="my-4 h-px bg-white/[0.07]" />
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-ivory/55 transition-colors hover:bg-white/[0.035] hover:text-ivory/90"
            >
              <ShieldCheck className="h-[17px] w-[17px] text-ivory/45" strokeWidth={1.6} />
              Boshqaruv
            </Link>
          </>
        )}
      </nav>

      <div className="m-3 rounded-2xl bg-white/[0.04] p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-champagne/15 text-[12px] font-semibold text-champagne">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ivory">
              {user?.fullName ?? "Foydalanuvchi"}
            </span>
            <span className="block truncate text-[11px] text-ivory/40">{user?.email}</span>
          </span>
          <button
            onClick={() => void signOut()}
            aria-label="Chiqish"
            className="shrink-0 rounded-lg p-1.5 text-ivory/40 transition-colors hover:bg-white/[0.06] hover:text-ivory"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile: compact top bar + bottom navigation                                */
/* -------------------------------------------------------------------------- */

function MobileBar() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-card/95 backdrop-blur lg:hidden">
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
                  className={cn("h-[19px] w-[19px]", active ? "text-gold-muted" : "text-ink-soft")}
                  strokeWidth={1.6}
                />
                <span className={active ? "font-medium text-ink" : "text-ink-soft"}>
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

/* -------------------------------------------------------------------------- */
/*  Contextual topbar                                                          */
/* -------------------------------------------------------------------------- */

export function Topbar({
  breadcrumb,
  right,
}: {
  breadcrumb?: { label: string; to?: string; params?: Record<string, string> }[];
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link to="/dashboard" className="lg:hidden" aria-label="INTIL">
            <LogoMark />
          </Link>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-[13px]">
              {(breadcrumb ?? []).map((c, i, arr) => (
                <li key={c.label} className="flex min-w-0 items-center gap-2">
                  {c.to && i < arr.length - 1 ? (
                    <Link
                      to={c.to as any}
                      params={c.params as any}
                      className="truncate text-ink-soft transition-colors hover:text-ink"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="truncate font-medium text-ink">{c.label}</span>
                  )}
                  {i < arr.length - 1 && <span className="text-ink-soft/45">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */

export function AppShell({
  children,
  breadcrumb,
  topRight,
}: {
  children: React.ReactNode;
  breadcrumb?: { label: string; to?: string; params?: Record<string, string> }[];
  topRight?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Rail />
      <div className="lg:pl-[248px]">
        <Topbar breadcrumb={breadcrumb} right={topRight} />
        <main className="mx-auto max-w-[1180px] px-5 pb-28 pt-8 sm:px-8 lg:pb-20">{children}</main>
      </div>
      <MobileBar />
    </div>
  );
}

export default AppShell;
