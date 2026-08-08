import { useEffect, useState } from "react";
import { renderFormulaEmbed } from "@/components/math/formula";
import { MathContent } from "@/components/math/MathContent";

/** Renders a single LaTeX string using the same markup the admin editor stores. */
export function Formula({ latex, className }: { latex: string; className?: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let alive = true;
    renderFormulaEmbed(latex)
      .then((h) => {
        if (alive) setHtml(h);
      })
      .catch(() => {
        if (alive) setHtml("");
      });
    return () => {
      alive = false;
    };
  }, [latex]);

  if (!html) return <code className={className}>{latex}</code>;
  return <MathContent latex={html} inline className={className} />;
}