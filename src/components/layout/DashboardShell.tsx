import * as React from "react";
import { Bell } from "lucide-react";
import { Sidebar, MobileNav, StreakCard } from "@/components/layout/Sidebar";

export { StreakCard };

export function DashboardShell({
  children,
  title,
  subtitle,
  streakDays = 0,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  streakDays?: number;
}) {
  return (
    <div className="min-h-screen bg-page">
      <Sidebar streakDays={streakDays} />

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

      <MobileNav />
    </div>
  );
}

export default DashboardShell;
