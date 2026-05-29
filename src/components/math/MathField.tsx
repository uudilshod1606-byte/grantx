import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  minHeight?: string;
};

/**
 * Premium MathLive editor wrapper. Stores LaTeX, supports the full math
 * virtual keyboard (fractions, roots, powers, π, integrals, summation, ...).
 * Keyboard auto-opens on focus on touch devices.
 */
export function MathField({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
  minHeight = "3rem",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;
    void import("mathlive").then(() => {
      if (!mounted) return;
      const vk = window.mathVirtualKeyboard;
      if (vk) {
        try {
          vk.layouts = ["numeric", "symbols", "alphabetic", "greek"];
        } catch {
          /* ignore */
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current as (HTMLElement & { value?: string }) | null;
    if (!el) return;
    if (el.value !== value) el.value = value;
  }, [value]);

  return (
    // @ts-expect-error mathlive web component
    <math-field
      ref={ref}
      placeholder={placeholder}
      math-virtual-keyboard-policy="auto"
      default-mode="math"
      aria-label={ariaLabel}
      class={cn("grantx-mathfield", className)}
      style={{ minHeight }}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        const t = e.target as HTMLElement & { value?: string };
        onChange(t.value ?? "");
      }}
    />
  );
}