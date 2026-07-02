import { useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  latex: string;
  className?: string;
  inline?: boolean;
};

/**
 * Renders admin-authored rich text (HTML with optional embedded MathLive
 * formulas). Prop is still named `latex` for backwards compatibility with
 * existing call sites — the value is treated as an HTML string.
 */
export function MathContent({ latex, className, inline = false }: Props) {
  // Ensure MathLive stylesheet is present so any embedded formula markup
  // renders correctly for students.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!latex || !latex.includes("formula-embed")) return;
    import("mathlive").catch(() => {
      /* non-fatal — text still renders */
    });
  }, [latex]);

  if (!latex) return null;
  if (inline) {
    return (
      <span
        className={cn("rich-content inline align-middle", className)}
        dangerouslySetInnerHTML={{ __html: latex }}
      />
    );
  }
  return (
    <div
      className={cn("rich-content block whitespace-pre-wrap break-words", className)}
      dangerouslySetInnerHTML={{ __html: latex }}
    />
  );
}
