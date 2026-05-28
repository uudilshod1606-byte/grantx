import { Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function AuthShell({
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const logoTarget: "/" | "/dashboard" = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <div className="w-full max-w-md">
        <Link to={logoTarget} className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Grant<span className="gradient-text">X</span>
          </span>
        </Link>

        <div className="glass animate-fade-up rounded-3xl p-6 md:p-8">
          {badge && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" /> {badge}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}