/**
 * Single source of truth for how a formula is turned into stored HTML.
 * Both the admin RichEditor ("Formula" toolbar button) and the bulk
 * Excel/CSV importer call these helpers, so imported questions are
 * byte-for-byte identical to hand-authored ones.
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
 * Convert `[[LATEX: ...]]` markers inside a plain-text cell into the same
 * formula-embed HTML the editor produces. Plain text around the markers is
 * HTML-escaped, newlines become <br>.
 */
export async function renderTextWithLatexMarkers(input: string): Promise<string> {
  const src = input ?? "";
  const parts: string[] = [];
  let last = 0;
  const matches = [...src.matchAll(LATEX_MARKER)];
  for (const m of matches) {
    parts.push(escapeText(src.slice(last, m.index ?? 0)));
    parts.push(await renderFormulaEmbed(m[1] ?? ""));
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(escapeText(src.slice(last)));
  return parts.join("").replace(/\r?\n/g, "<br>");
}