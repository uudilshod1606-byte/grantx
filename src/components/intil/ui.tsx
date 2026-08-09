import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                    */
/* -------------------------------------------------------------------------- */

const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45";

const sizes = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-[15px]",
} as const;

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: keyof typeof sizes;
};

export function PremiumButton({ className, size = "md", ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        baseBtn,
        sizes[size],
        "bg-obsidian text-ivory hover:bg-obsidian-soft active:translate-y-px",
        "shadow-[0_1px_0_0_color-mix(in_oklab,var(--champagne)_45%,transparent)_inset]",
        className,
      )}
    />
  );
}

export function GoldButton({ className, size = "md", ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        baseBtn,
        sizes[size],
        "bg-gold text-obsidian hover:bg-champagne active:translate-y-px",
        className,
      )}
    />
  );
}

export function SecondaryButton({ className, size = "md", ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        baseBtn,
        sizes[size],
        "border border-hairline bg-card text-ink hover:border-gold/40 hover:bg-ivory",
        className,
      )}
    />
  );
}

/** Link that renders exactly like PremiumButton. */
export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  ...rest
}: React.ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "gold";
  size?: keyof typeof sizes;
}) {
  const tone =
    variant === "gold"
      ? "bg-gold text-obsidian hover:bg-champagne"
      : variant === "secondary"
        ? "border border-hairline bg-card text-ink hover:border-gold/40 hover:bg-ivory"
        : "bg-obsidian text-ivory hover:bg-obsidian-soft";
  return (
    <Link {...(rest as any)} className={cn(baseBtn, sizes[size], tone, className)}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Structure                                                                  */
/* -------------------------------------------------------------------------- */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-hairline pb-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
  quiet,
}: {
  children: React.ReactNode;
  className?: string;
  quiet?: boolean;
}) {
  return (
    <div className={cn(quiet ? "surface-quiet" : "surface elev", className)}>{children}</div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status + metrics                                                           */
/* -------------------------------------------------------------------------- */

export type StatusTone = "neutral" | "active" | "done";

export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: React.ReactNode }) {
  const map: Record<StatusTone, string> = {
    neutral: "border-hairline text-ink-soft",
    active: "border-gold/45 bg-gold/10 text-gold-muted",
    done: "border-obsidian/15 bg-obsidian/[0.04] text-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        map[tone],
      )}
    >
      {tone === "active" && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
      {children}
    </span>
  );
}

/** Number display. `value` must always come from real data — never invented. */
export function MetricDisplay({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
  hint?: string;
}) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="min-w-0 py-1">
      <p className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p
        className={cn(
          "mt-2 tabnum text-[30px] font-semibold leading-none text-ink",
          empty && "text-ink-soft/60",
        )}
      >
        {empty ? "—" : value}
        {!empty && suffix && (
          <span className="ml-1 text-base font-medium text-ink-soft">{suffix}</span>
        )}
      </p>
      {hint && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function ProgressIndicator({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
          <span>{label}</span>
          <span className="tabnum text-ink">{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-obsidian/8"
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  description,
  cta,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  cta?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3 py-10", className)}>
      {Icon && (
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-ivory text-gold-muted">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exam module (large horizontal row)                                         */
/* -------------------------------------------------------------------------- */

export function ExamModule({
  index,
  title,
  meta,
  status,
  ctaLabel,
  to,
  params,
}: {
  index: React.ReactNode;
  title: string;
  meta: string[];
  status?: { tone: StatusTone; label: string };
  ctaLabel: string;
  to: string;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to as any}
      params={params as any}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline bg-card px-4 py-5 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-ivory sm:gap-6 sm:px-6 sm:py-6"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hairline bg-ivory tabnum text-[15px] font-semibold text-ink transition-colors group-hover:border-gold/45 group-hover:text-gold-muted sm:h-14 sm:w-14">
        {index}
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="truncate text-[16px] font-semibold text-ink sm:text-[17px]">{title}</span>
          {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </span>
      </span>

      <span className="flex items-center gap-3">
        <span className="hidden text-[13px] font-medium text-ink-soft transition-colors group-hover:text-ink sm:inline">
          {ctaLabel}
        </span>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink transition-all duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-obsidian">
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Activity item                                                              */
/* -------------------------------------------------------------------------- */

export function ActivityItem({
  title,
  timestamp,
  right,
}: {
  title: string;
  timestamp: string;
  right?: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline py-3.5 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{timestamp}</p>
      </div>
      {right}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tooltip (CSS-only, keyboard accessible)                                    */
/* -------------------------------------------------------------------------- */

export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-md px-1 text-[12px] text-ink-soft transition-colors hover:text-gold-muted"
      >
        <Info className="h-3.5 w-3.5" />
        {label}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-40 mb-2 w-64 translate-y-1 rounded-xl border border-hairline bg-card p-3 text-[12px] leading-relaxed text-ink-soft opacity-0 shadow-[var(--shadow-lift)] transition-all duration-200 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}
