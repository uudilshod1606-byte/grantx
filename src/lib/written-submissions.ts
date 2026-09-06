/**
 * Yozma ishlar (esse va kengaytirilgan yozma savollar) — saqlash va baholash.
 *
 * Talaba imtihonni yakunlaganda javob "kutilmoqda" holatida yoziladi.
 * Admin "Yozma ishlarni baholash" bo'limida ko'rib, tasdiqlaydi — faqat
 * shundan keyin yakuniy ball hisoblanadi.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  ESSAY_CRITERIA,
  essayRawTo75,
  finalScoreMethodB,
  gradeFor,
  round2,
  testSection75,
} from "@/lib/exam-scoring";

export type CriterionScore = { id: string; name: string; score: number; errors: string[] };

export type AiSuggestion = {
  criteria?: CriterionScore[];
  /** Kimyo/Biologiya yozma savollari uchun (0-25). */
  score?: number;
  comment?: string;
  errors?: string[];
};

export type WrittenSubmission = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  attemptId: string;
  subjectId: string;
  subjectName: string;
  examLabel: string | null;
  submissionKind: "esse" | "yozma";
  questionNumber: number;
  questionText: string;
  answerText: string;
  maxPoints: number;
  aiSuggestion: AiSuggestion | null;
  approvedCriteria: CriterionScore[] | null;
  approvedScore: number | null;
  status: "pending" | "approved";
  testRaw: number;
  testMax: number;
  scoringMethod: "A" | "B";
  finalScore: number | null;
  finalGrade: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type Row = Record<string, unknown>;

function toSubmission(r: Row): WrittenSubmission {
  return {
    id: String(r["id"]),
    userId: String(r["user_id"]),
    userEmail: String(r["user_email"] ?? ""),
    userName: String(r["user_name"] ?? ""),
    attemptId: String(r["attempt_id"]),
    subjectId: String(r["subject_id"]),
    subjectName: String(r["subject_name"]),
    examLabel: (r["exam_label"] as string | null) ?? null,
    submissionKind: (r["submission_kind"] as "esse" | "yozma") ?? "esse",
    questionNumber: Number(r["question_number"] ?? 0),
    questionText: String(r["question_text"] ?? ""),
    answerText: String(r["answer_text"] ?? ""),
    maxPoints: Number(r["max_points"] ?? 0),
    aiSuggestion: (r["ai_suggestion"] as AiSuggestion | null) ?? null,
    approvedCriteria: (r["approved_criteria"] as CriterionScore[] | null) ?? null,
    approvedScore: r["approved_score"] == null ? null : Number(r["approved_score"]),
    status: (r["status"] as "pending" | "approved") ?? "pending",
    testRaw: Number(r["test_raw"] ?? 0),
    testMax: Number(r["test_max"] ?? 0),
    scoringMethod: (r["scoring_method"] as "A" | "B") ?? "B",
    finalScore: r["final_score"] == null ? null : Number(r["final_score"]),
    finalGrade: (r["final_grade"] as string | null) ?? null,
    reviewedAt: (r["reviewed_at"] as string | null) ?? null,
    createdAt: String(r["created_at"]),
  };
}

export type NewSubmission = {
  userId: string;
  userEmail: string;
  userName: string;
  attemptId: string;
  subjectId: string;
  subjectName: string;
  examLabel: string | null;
  submissionKind: "esse" | "yozma";
  questionNumber: number;
  questionText: string;
  answerText: string;
  maxPoints: number;
  testRaw: number;
  testMax: number;
};

export const writtenRepo = {
  async submit(rows: NewSubmission[]): Promise<void> {
    if (!rows.length) return;
    const { error } = await supabase.from("written_submissions").insert(
      rows.map((r) => ({
        user_id: r.userId,
        user_email: r.userEmail,
        user_name: r.userName,
        attempt_id: r.attemptId,
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        exam_label: r.examLabel,
        submission_kind: r.submissionKind,
        question_number: r.questionNumber,
        question_text: r.questionText,
        answer_text: r.answerText,
        max_points: r.maxPoints,
        test_raw: r.testRaw,
        test_max: r.testMax,
        scoring_method: "B",
        status: "pending",
      })) as never,
    );
    if (error) throw new Error(error.message);
  },

  async listAll(): Promise<WrittenSubmission[]> {
    const { data, error } = await supabase
      .from("written_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Row[]).map(toSubmission);
  },

  async listForUser(userId: string): Promise<WrittenSubmission[]> {
    const { data, error } = await supabase
      .from("written_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Row[]).map(toSubmission);
  },

  async saveAiSuggestion(id: string, suggestion: AiSuggestion): Promise<void> {
    const { error } = await supabase
      .from("written_submissions")
      .update({ ai_suggestion: suggestion } as never)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  /** Admin tasdig'i: ball, yakuniy natija va daraja yoziladi. */
  async approve(
    submission: WrittenSubmission,
    input: { criteria?: CriterionScore[]; score?: number; siblings: WrittenSubmission[] },
  ): Promise<void> {
    const writtenResult =
      submission.submissionKind === "esse"
        ? essayRawTo75(round2((input.criteria ?? []).reduce((s, c) => s + c.score, 0)))
        : null;

    // Kimyo/Biologiya: 41-43 savollarning tasdiqlangan ballari yig'indisi (max 75).
    const ownScore =
      submission.submissionKind === "esse" ? (writtenResult ?? 0) : (input.score ?? 0);

    const group = input.siblings.filter((s) => s.attemptId === submission.attemptId);
    const others = group.filter((s) => s.id !== submission.id);
    const allApproved = others.every((s) => s.status === "approved");

    const writtenTotal =
      submission.submissionKind === "esse"
        ? ownScore
        : round2(ownScore + others.reduce((s, o) => s + (o.approvedScore ?? 0), 0));

    const test75 = testSection75(submission.subjectId, submission.testRaw);
    const final = allApproved ? finalScoreMethodB(test75, Math.min(75, writtenTotal)) : null;

    const patch: Record<string, unknown> = {
      approved_criteria: input.criteria ?? null,
      approved_score: ownScore,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      final_score: final,
      final_grade: final == null ? null : gradeFor(final),
    };
    const { error } = await supabase
      .from("written_submissions")
      .update(patch as never)
      .eq("id", submission.id);
    if (error) throw new Error(error.message);

    // Guruhdagi barcha ishlar tasdiqlangan bo'lsa, yakuniy ballni hammasiga yozamiz.
    if (final != null && others.length) {
      await supabase
        .from("written_submissions")
        .update({ final_score: final, final_grade: gradeFor(final) } as never)
        .eq("attempt_id", submission.attemptId);
    }
  },
};

/** Bo'sh (AI taklifisiz) mezonlar ro'yxati. */
export function emptyCriteria(): CriterionScore[] {
  return ESSAY_CRITERIA.map((c) => ({ id: c.id, name: c.name, score: 0, errors: [] }));
}
