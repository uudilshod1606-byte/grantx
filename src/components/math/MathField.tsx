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
  // Track the latest value we emitted, so external resets sync without
  // clobbering the caret on every keystroke.
  const lastEmitted = useRef<string>(value);

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
      // Initialize the field value once mathlive is registered.
      const el = ref.current as (HTMLElement & { value?: string }) | null;
      if (el && el.value !== value) {
        el.value = value;
        lastEmitted.current = value;
      }
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current as (HTMLElement & { value?: string }) | null;
    if (!el) return;
    // Only sync when the change came from outside (e.g. form reset).
    // Skip when this is the value we just emitted, so caret/selection stay put.
    if (value !== lastEmitted.current && el.value !== value) {
      el.value = value;
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    // @ts-expect-error mathlive web component
    <math-field
      ref={ref}
      placeholder={placeholder}
      math-virtual-keyboard-policy="auto"
      default-mode="text"
      aria-label={ariaLabel}
      class={cn("grantx-mathfield", className)}
      style={{ minHeight }}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        const t = e.target as HTMLElement & { value?: string };
        const next = t.value ?? "";
        lastEmitted.current = next;
        onChange(next);
      }}
    />
  );
}