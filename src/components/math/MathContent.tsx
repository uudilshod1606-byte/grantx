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

type Convert = (latex: string, opts?: Record<string, unknown>) => string;

/**
 * Render plain text exactly as authored (spaces, line breaks, blank lines)
 * with inline math segments wrapped in $...$ rendered via MathLive.
 */
function buildHtml(source: string, convert: Convert | null): string {
  if (!source) return "";
  // Split text from inline math: $...$ (single-dollar) — non-greedy, no
  // newlines inside math. Escaped \$ stays literal.
  const parts: Array<{ type: "text" | "math"; value: string }> = [];
  const regex = /(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(source)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: source.slice(last, m.index) });
    parts.push({ type: "math", value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < source.length) parts.push({ type: "text", value: source.slice(last) });

  return parts
    .map((p) => {
      if (p.type === "text") {
        // Escape, unescape literal \$ back to $, preserve newlines as <br/>.
        return escapeHtml(p.value).replace(/\\\$/g, "$").replace(/\n/g, "<br/>");
      }
      if (!convert) return escapeHtml(`$${p.value}$`);
      try {
        return convert(p.value, { defaultMode: "math" });
      } catch {
        return escapeHtml(`$${p.value}$`);
      }
    })
    .join("");
}

/**
 * Beautifully renders text + inline LaTeX into typeset math while preserving
 * the author's spacing, line breaks and paragraphs.
 */
export function MathContent({ latex, className, inline = false }: Props) {
  const [html, setHtml] = useState<string>(() => buildHtml(latex, null));

  useEffect(() => {
    let mounted = true;
    if (!latex) {
      setHtml("");
      return;
    }
    // Initial paint with plain text, then upgrade once mathlive is loaded.
    setHtml(buildHtml(latex, null));
    void import("mathlive").then(({ convertLatexToMarkup }) => {
      if (!mounted) return;
      setHtml(buildHtml(latex, convertLatexToMarkup));
    });
    return () => {
      mounted = false;
    };
  }, [latex]);

  if (!latex) return null;

  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={cn(
        "grantx-math whitespace-pre-wrap break-words",
        inline ? "inline" : "block",
        className,
      )}
      // mathlive output is trusted (we generated it). LaTeX itself can't inject script.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}