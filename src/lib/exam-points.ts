/**
 * Per-subject point distribution for imported exam questions.
 *
 * Rules are keyed by `${kind}:${subjectId}` so other subjects can get their
 * own distribution later without touching the import UI.
 */
import type { ExamKind } from "@/lib/domain";

export type PointsRule = {
  /** Points for closed questions 1..35, by 1-based order number. */
  closed: (order: number) => number;
  /** Points for open questions 36..45, per a/b part. */
  openA: number;
  openB: number;
  /** Points when an open question is not split into a/b rows. */
  openWhole: number;
};

/** Milliy Sertifikat Matematika: 1.3 for these order numbers, 2.2 for the rest. */
const MILLIY_MATH_LOW = new Set([1, 2, 5, 6, 7, 9, 10, 15, 17, 19]);

const RULES: Record<string, PointsRule> = {
  "milliy:matematika": {
    closed: (order) => (MILLIY_MATH_LOW.has(order) ? 1.3 : 2.2),
    openA: 1.5,
    openB: 1.7,
    openWhole: 3.2,
  },
};

export function getPointsRule(kind: ExamKind, subjectId: string): PointsRule | null {
  return RULES[`${kind}:${subjectId}`] ?? null;
}

/** Detects an "a)" / "b)" sub-part label at the start of a question text. */
export function detectPart(text: string): "a" | "b" | null {
  const m = text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .match(/^\(?\s*([ab])\s*[).:]/i);
  return m ? (m[1]!.toLowerCase() as "a" | "b") : null;
}

/**
 * Points for a question at 1-based `order` in the original PDF sequence.
 * Returns null when the subject has no configured distribution.
 */
export function pointsForOrder(input: {
  kind: ExamKind;
  subjectId: string;
  order: number;
  questionType: string;
  text: string;
}): number | null {
  const rule = getPointsRule(input.kind, input.subjectId);
  if (!rule) return null;
  const isOpen = input.questionType === "ochiq" || input.questionType === "esse";
  if (input.order <= 35 && !isOpen) return rule.closed(input.order);
  const part = detectPart(input.text);
  if (part === "a") return rule.openA;
  if (part === "b") return rule.openB;
  return isOpen ? rule.openWhole : rule.closed(input.order);
}
