import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type MathFieldProps = {
  value: string;
  onChange?: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  minHeight?: number;
  ariaLabel?: string;
};

/**
 * Temporary plain-text fallback for MathField while the MathLive integration
 * is disabled. Preserves the same props/API so callers keep working. Content
 * is stored as-is (LaTeX text) so no data is lost when MathLive is re-enabled.
 */
export function MathField({
  value,
  onChange,
  placeholder,
  readOnly,
  className,
  style,
  minHeight = 56,
  ariaLabel,
}: MathFieldProps) {
  if (readOnly) {
    return (
      <div
        aria-label={ariaLabel}
        className={cn("whitespace-pre-wrap break-words text-foreground", className)}
        style={style}
      >
        {value}
      </div>
    );
  }
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={cn(
        "block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
        className,
      )}
      style={{ minHeight, ...style }}
    />
  );
}