import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookMarked, Library, ClipboardList } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Bosh sahifa", icon: Home },
  { to: "/qollanmalar", label: "Qo'llanmalar", icon: BookMarked },
  { to: "/materiallar", label: "Materiallar", icon: Library },
  { to: "/testlar", label: "Testlar", icon: ClipboardList },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="glass fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-white/10 px-4 py-6 md:flex">
      <Link to="/dashboard" className="mb-8 px-2">
        <Logo />
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "gradient-bg font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="px-4 pt-4 md:hidden">
      <div className="glass flex gap-1 overflow-x-auto rounded-2xl p-1.5">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs transition",
                active
                  ? "gradient-bg font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Shared layout for logged-in pages: vertical sidebar + content. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-60">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}

export default AppShell;