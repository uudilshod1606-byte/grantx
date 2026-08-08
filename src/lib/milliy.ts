import type { LucideIcon } from "lucide-react";
import {
  Languages,
  Calculator,
  BookText,
  Clock,
  Zap,
  Leaf,
  FlaskConical,
} from "lucide-react";

/** Questions bundled into one Milliy Sertifikat exam variant. */
export const QUESTIONS_PER_EXAM = 30;

export const MILLIY_SUBJECTS: Record<string, { name: string; icon: LucideIcon }> = {
  "cefr-english": { name: "CEFR English", icon: Languages },
  matematika: { name: "Matematika", icon: Calculator },
  "ona-tili": { name: "Ona tili va adabiyot", icon: BookText },
  "ona-tili-adabiyot": { name: "Ona tili va adabiyot", icon: BookText },
  tarix: { name: "Tarix", icon: Clock },
  fizika: { name: "Fizika", icon: Zap },
  biologiya: { name: "Biologiya", icon: Leaf },
  kimyo: { name: "Kimyo", icon: FlaskConical },
};

/** How many exam variants exist for a subject, given its question count. */
export function variantCount(questionCount: number) {
  return Math.max(1, Math.ceil(questionCount / QUESTIONS_PER_EXAM));
}