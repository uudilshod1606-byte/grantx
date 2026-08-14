import { supabase } from "@/integrations/supabase/client";

export type StudentProfileInput = {
  targetExam?: string | null;
  targetScore?: number | null;
  examDate?: string | null;
  dailyStudyMinutes?: number | null;
  studyDays?: number[];
  currentLevel?: string | null;
  selfReportedWeakTopics?: string[];
  onboardingCompleted?: boolean;
};

export type QuestionAttemptInput = {
  attemptId?: string | null;
  questionId: string;
  subjectId: string;
  examKind?: string | null;
  examId?: string | null;
  category?: string | null;
  difficulty?: string | null;
  questionType?: string | null;
  selectedAnswer?: unknown;
  correctAnswer?: unknown;
  isCorrect: boolean;
  timeSpentSeconds?: number | null;
  createdAt?: string;
};

// The generated Database type is refreshed by Supabase separately, so this
// repository deliberately keeps the new AI tables behind a tiny typed facade.
const db = supabase as any;

export async function saveStudentProfile(userId: string, input: StudentProfileInput) {
  const { error } = await db.from("student_profiles").upsert(
    {
      user_id: userId,
      target_exam: input.targetExam ?? null,
      target_score: input.targetScore ?? null,
      exam_date: input.examDate ?? null,
      daily_study_minutes: input.dailyStudyMinutes ?? null,
      study_days: input.studyDays ?? [],
      current_level: input.currentLevel ?? null,
      self_reported_weak_topics: input.selfReportedWeakTopics ?? [],
      onboarding_completed: input.onboardingCompleted ?? false,
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(`Student profile: ${error.message}`);
}

export async function syncPendingOnboarding(userId: string) {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem("intil_onboarding");
  if (!raw) return false;

  try {
    const payload = JSON.parse(raw) as {
      examType?: string | null;
      examDate?: string | null;
      subjects?: string[];
      weakPoints?: Record<string, string[]>;
      dailyTime?: "15-30" | "30-60" | "1-2" | "2+" | null;
    };

    const minutesByOption = {
      "15-30": 22,
      "30-60": 45,
      "1-2": 90,
      "2+": 120,
    } as const;

    const subjects = payload.subjects ?? [];
    const weakTopics = subjects.flatMap((subjectId) =>
      (payload.weakPoints?.[subjectId] ?? []).map((topic) => `${subjectId}:${topic}`),
    );

    await saveStudentProfile(userId, {
      targetExam: payload.examType ?? null,
      examDate: payload.examDate ?? null,
      dailyStudyMinutes: payload.dailyTime ? minutesByOption[payload.dailyTime] : null,
      studyDays: [],
      currentLevel: null,
      selfReportedWeakTopics: weakTopics,
      onboardingCompleted: true,
    });

    window.localStorage.removeItem("intil_onboarding");
    return true;
  } catch (error) {
    console.error("[INTIL] onboarding sync failed", error);
    return false;
  }
}

export async function getStudentProfile(userId: string) {
  const { data, error } = await db
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Student profile: ${error.message}`);
  return data;
}

export async function recordQuestionAttempts(userId: string, attempts: QuestionAttemptInput[]) {
  if (!attempts.length) return;

  const rows = attempts.map((a) => ({
    user_id: userId,
    attempt_id: a.attemptId ?? null,
    question_id: a.questionId,
    subject_id: a.subjectId,
    exam_kind: a.examKind ?? null,
    exam_id: a.examId ?? null,
    category: a.category ?? null,
    difficulty: a.difficulty ?? null,
    question_type: a.questionType ?? null,
    selected_answer: a.selectedAnswer ?? null,
    correct_answer: a.correctAnswer ?? null,
    is_correct: a.isCorrect,
    time_spent_seconds: a.timeSpentSeconds ?? null,
    created_at: a.createdAt ?? new Date().toISOString(),
  }));

  const { error } = await db.from("question_attempts").insert(rows);
  if (error) throw new Error(`Question attempts: ${error.message}`);
}

export async function getWeakTopics(userId: string, subjectId?: string) {
  let query = db
    .from("topic_mastery")
    .select("*")
    .eq("user_id", userId)
    .order("mastery_score", { ascending: true });

  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query;
  if (error) throw new Error(`Topic mastery: ${error.message}`);
  return data ?? [];
}
