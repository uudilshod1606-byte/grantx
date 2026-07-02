import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * MathLive-backed editor for the admin Question field only.
 * - Client-only dynamic import (safe for SSR).
 * - Falls back to a plain <textarea> if MathLive fails to load, so the
 *   Question editor is never unusable.
 * - Virtual keyboard is manual (only opens when the user clicks the
 *   keyboard icon).
 * - Default mode is "text" so Uzbek prose types naturally.
 */
export function MathQuestionField({
  value,
  onChange,
  placeholder,
  minHeight = 140,
  ariaLabel,
  className,
  style,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mfRef = useRef<any>(null);
  const valueRef = useRef(value);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Load MathLive once on the client.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await import("mathlive");
        if (!cancelled) setReady(true);
      } catch (e) {
        console.error("MathLive failed to load", e);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Create the <math-field> element imperatively after MathLive is loaded.
  useEffect(() => {
    if (!ready || !hostRef.current) return;
    const host = hostRef.current;
    let mf: any;
    try {
      mf = document.createElement("math-field");
      mf.setAttribute("default-mode", "text");
      mf.setAttribute("math-virtual-keyboard-policy", "manual");
      mf.setAttribute("smart-mode", "false");
      if (ariaLabel) mf.setAttribute("aria-label", ariaLabel);
      if (placeholder) mf.setAttribute("placeholder", placeholder);
      mf.style.width = "100%";
      mf.style.minHeight = `${minHeight}px`;
      mf.style.padding = "8px 12px";
      mf.style.border = "1px solid hsl(var(--input))";
      mf.style.borderRadius = "6px";
      mf.style.background = "transparent";
      mf.style.font = "inherit";
      mf.style.color = "inherit";
      mf.value = valueRef.current ?? "";
      const handleInput = () => {
        const v = mf.value ?? "";
        valueRef.current = v;
        onChange(v);
      };
      mf.addEventListener("input", handleInput);
      host.appendChild(mf);
      mfRef.current = mf;
      return () => {
        mf.removeEventListener("input", handleInput);
        if (mf.parentNode === host) host.removeChild(mf);
        mfRef.current = null;
      };
    } catch (e) {
      console.error("MathLive init failed", e);
      setFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Keep external value in sync when it changes from outside typing.
  useEffect(() => {
    valueRef.current = value;
    const mf = mfRef.current;
    if (mf && mf.value !== value) {
      mf.value = value ?? "";
    }
  }, [value]);

  if (failed) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

  return (
    <div
      ref={hostRef}
      className={cn("w-full", className)}
      style={{ minHeight, ...style }}
      onClick={() => mfRef.current?.focus?.()}
    >
      {!ready && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}