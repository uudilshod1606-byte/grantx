import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./mathlive-setup";
import { cn } from "@/lib/utils";

// Minimal JSX typing for the <math-field> web component.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<HTMLElement>;
          "default-mode"?: "text" | "math" | "inline-math";
          "virtual-keyboard-mode"?: "manual" | "onfocus" | "off";
          "math-virtual-keyboard-policy"?: "auto" | "manual" | "sandboxed";
          "smart-mode"?: boolean | string;
          "smart-fence"?: boolean | string;
          readonly?: boolean;
          placeholder?: string;
        },
        HTMLElement
      >;
    }
  }
}

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
 * MathLive editor wrapped for React. Uses text mode by default so admins can
 * type ordinary Uzbek text naturally; math is entered via the virtual keyboard
 * (small keyboard icon) or common shortcuts like `\frac`, `\sqrt`, `^`, `_`.
 *
 * Stores clean LaTeX in `value` — reopening restores exact formatting.
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
  const ref = useRef<HTMLElement | null>(null);
  const lastEmitted = useRef<string>(value);

  useEffect(() => {
    const el = ref.current as any;
    if (!el) return;
    // Configure once mounted.
    try {
      el.mathVirtualKeyboardPolicy = "manual";
      el.smartMode = true;
      el.smartFence = true;
      el.defaultMode = "text";
      el.readOnly = !!readOnly;
    } catch {
      /* MathLive may not be fully hydrated yet — attributes handle it. */
    }
    if (el.value !== value) {
      el.value = value ?? "";
      lastEmitted.current = value ?? "";
    }
    if (readOnly || !onChange) return;
    const handler = () => {
      const v: string = el.value ?? "";
      if (v === lastEmitted.current) return;
      lastEmitted.current = v;
      onChange(v);
    };
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [onChange, readOnly, value]);

  return (
    <math-field
      ref={ref as any}
      default-mode="text"
      virtual-keyboard-mode="manual"
      math-virtual-keyboard-policy="manual"
      readonly={readOnly || undefined}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={cn(
        "mathfield block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
        readOnly && "border-transparent bg-transparent shadow-none px-0 py-0",
        className,
      )}
      style={{ minHeight, ...style }}
    />
  );
}
