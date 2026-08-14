/**
 * Single source of truth for how a formula is turned into stored HTML.
 * Both the admin RichEditor ("Formula" toolbar button) and the bulk
 * Excel/CSV importer call these helpers.
 */

export function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Render one LaTeX string as the `.formula-embed` span stored in the DB. */
export async function renderFormulaEmbed(latex: string): Promise<string> {
  const clean = latex.trim();
  if (!clean) return "";
  let markup = escapeText(clean);
  try {
    const ml: any = await import("mathlive");
    if (typeof ml.convertLatexToMarkup === "function") {
      markup = ml.convertLatexToMarkup(clean);
    }
  } catch (e) {
    console.error("MathLive render failed", e);
  }
  return `<span class="formula-embed" data-latex="${escapeAttr(
    clean,
  )}" contenteditable="false">${markup}</span>`;
}

export const LATEX_MARKER = /\[\[LATEX:([\s\S]*?)\]\]/g;

/**
 * Legacy/AI-friendly math delimiters accepted by the importer:
 *   $x^2+y^2$
 *   \(x^2+y^2\)
 *
 * Dollar delimiters are only promoted when a matching closing `$` exists.
 * This deliberately leaves ordinary currency such as `250$` untouched.
 */
const DOLLAR_MATH = /\$([^$\r\n]+?)\$/g;
const PAREN_MATH = /\\\(([\s\S]*?)\\\)/g;

function tokenizeMathMarkers(src: string) {
  const chunks: Array<{ type: "text" | "math"; value: string }> = [];
  let last = 0;

  const matches = [
    ...src.matchAll(LATEX_MARKER),
    ...src.matchAll(DOLLAR_MATH),
    ...src.matchAll(PAREN_MATH),
  ]
    .map((m) => ({
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
      latex: m[1] ?? "",
      priority: m[0].startsWith("[[LATEX:") ? 0 : 1,
    }))
    .sort((a, b) => a.start - b.start || a.priority - b.priority);

  for (const m of matches) {
    if (m.start < last) continue;
    if (m.start > last) chunks.push({ type: "text", value: src.slice(last, m.start) });
    chunks.push({ type: "math", value: m.latex });
    last = m.end;
  }
  if (last < src.length) chunks.push({ type: "text", value: src.slice(last) });
  return chunks;
}

/**
 * Convert supported math markers inside a plain-text cell into the same
 * formula-embed HTML the editor produces. Plain text around formulas is
 * HTML-escaped and newlines become <br>.
 */
export async function renderTextWithLatexMarkers(input: string): Promise<string> {
  const src = input ?? "";
  const chunks = tokenizeMathMarkers(src);
  const html: string[] = [];

  for (const chunk of chunks) {
    if (chunk.type === "math") {
      html.push(await renderFormulaEmbed(chunk.value));
    } else {
      html.push(escapeText(chunk.value));
    }
  }

  return html.join("").replace(/\r?\n/g, "<br>");
}
