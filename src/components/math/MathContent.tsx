import { useEffect } from "react";
import { cn } from "@/lib/utils";
// Ensure MathLive's static stylesheet + web fonts are loaded persistently.
// The markup produced by `convertLatexToMarkup` (stored in the DB and
// rendered below via dangerouslySetInnerHTML) depends on these styles.
// Without them, formulas visually collapse to plain text whenever no
// <math-field> element is mounted in the DOM. Importing the CSS here as
// side-effects makes Vite bundle them into the app stylesheet, so they
// stay loaded for the lifetime of the page regardless of the MathLive
// virtual keyboard / editor state.
import "mathlive/static.css";
import "mathlive/fonts.css";

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
