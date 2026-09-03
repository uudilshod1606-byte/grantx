import { useEffect, useState } from "react";
import { renderTextWithLatexMarkers } from "./formula";
import { MathContent } from "./MathContent";

/**
 * Renders plain text that may contain [[LATEX: ...]] / $...$ / \( ... \)
 * markers, using the exact same pipeline the question/exam pages use:
 * renderTextWithLatexMarkers -> MathContent.
 */
export function MarkerContent({
  text,
  className,
  inline = true,
}: {
  text: string;
  className?: string;
  inline?: boolean;
}) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let alive = true;
    renderTextWithLatexMarkers(text ?? "")
      .then((h) => {
        if (alive) setHtml(h);
      })
      .catch(() => {
        if (alive) setHtml("");
      });
    return () => {
      alive = false;
    };
  }, [text]);

  if (!text) return null;
  if (!html) return <span className={className}>{text}</span>;
  return <MathContent latex={html} inline={inline} className={className} />;
}
