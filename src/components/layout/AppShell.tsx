import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { IntilLogo } from "@/components/brand/IntilLogo";

export function Topbar({
  breadcrumb,
  right,
}: {
  breadcrumb?: { label: string; to?: string; params?: Record<string, string> }[];
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-page/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-9">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link to="/dashboard" className="lg:hidden" aria-label="INTIL">
            <IntilLogo showWordmark={false} />
          </Link>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-[13px]">
              {(breadcrumb ?? []).map((c, i, arr) => (
                <li key={c.label} className="flex min-w-0 items-center gap-2">
                  {c.to && i < arr.length - 1 ? (
                    <Link
                      to={c.to as any}
                      params={c.params as any}
                      className="truncate text-ink-mute transition-colors hover:text-ink-strong"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="truncate font-medium text-ink-strong">{c.label}</span>
                  )}
                  {i < arr.length - 1 && <span className="text-ink-mute/45">/</span>}
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
    <div className="min-h-screen bg-page">
      <Sidebar />
      <div className="lg:pl-[288px]">
        <Topbar breadcrumb={breadcrumb} right={topRight} />
        <main className="mx-auto max-w-[1240px] px-5 pb-28 pt-8 sm:px-9 lg:pb-20">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

export default AppShell;
