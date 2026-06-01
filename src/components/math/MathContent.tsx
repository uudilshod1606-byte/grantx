import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  latex: string;
  className?: string;
  inline?: boolean;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Beautifully renders LaTeX (stored from the MathField) into typeset math.
 * Falls back to plain text while mathlive is loading.
 */
export function MathContent({ latex, className, inline = false }: Props) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    if (!latex) {
      setHtml("");
      return;
    }
    void import("mathlive").then(({ convertLatexToMarkup }) => {
      if (!mounted) return;
      try {
        // Render in text mode so natural-language content (with spaces,
        // punctuation, Uzbek characters like o', g', etc.) is preserved.
        // Math segments still render when wrapped in $...$ inside the LaTeX.
        setHtml(convertLatexToMarkup(latex, { defaultMode: "text" }));
      } catch {
        setHtml(escapeHtml(latex));
      }
    });
    return () => {
      mounted = false;
    };
  }, [latex]);

  if (!latex) return null;

  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={cn("grantx-math", inline ? "inline" : "block", className)}
      // mathlive output is trusted (we generated it). LaTeX itself can't inject script.
      dangerouslySetInnerHTML={{ __html: html || escapeHtml(latex) }}
    />
  );
}