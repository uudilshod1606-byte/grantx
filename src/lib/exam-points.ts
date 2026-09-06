/**
 * PDF import uchun ball hisoblash yordamchilari.
 *
 * Ballar "src/config/ball-tizimi.json" faylidan olinadi (src/lib/exam-scoring.ts
 * orqali) — bu yerda hech qanday raqam qo'lda yozilmagan.
 */
import { pointsForQuestionNumber, round2 } from "@/lib/exam-scoring";

/** Detects an "a)" / "b)" sub-part label at the start of a question text. */
export function detectPart(text: string): "a" | "b" | null {
  const m = text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .match(/^\(?\s*([ab])\s*[).:]/i);
  return m ? (m[1]!.toLowerCase() as "a" | "b") : null;
}

/**
 * Savolning PDF'dagi asl tartib raqamiga mos ball.
 * a/b qismli savollarda savol balli ikkiga bo'linadi (admin tuzatishi mumkin).
 */
export function pointsForOrder(input: {
  subjectId: string;
  questionNumber: number;
  part?: "a" | "b" | null;
}): number | null {
  const base = pointsForQuestionNumber(input.subjectId, input.questionNumber);
  if (base == null) return null;
  return input.part ? round2(base / 2) : base;
}
