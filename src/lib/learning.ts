import { supabase } from "@/integrations/supabase/client";

export type StudentProfileInput = {
  targetExam?: string | null;
  targetScore?: number | null;
  examDate?: string | null;
  dailyStudyMinutes?: number | null;
  studyDays?: number[];
  currentLevel?: string | null;
  selectedSubjects?: string[];
  weakPoints?: Record<string, string[]>;
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
      selected_subjects: input.selectedSubjects ?? [],
      weak_points: input.weakPoints ?? {},
      self_reported_weak_topics: input.selfReportedWeakTopics ?? [],
      onboarding_completed: input.onboardingCompleted ?? false,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Student profile: ${error.message}`);
}

export async function generateStudyPlan(payload: {
  examType?: string | null;
  examDate?: string | null;
  targetScore?: number | null;
  subjects?: string[];
  weakPoints?: Record<string, string[]>;
  dailyTime?: "15-30" | "30-60" | "1-2" | "2+" | null;
}) {
  const { data, error } = await supabase.functions.invoke("generate-study-plan", { body: payload });
  if (error) throw new Error(`AI study plan: ${error.message}`);
  if (data?.error) throw new Error(`AI study plan: ${data.error}`);
  return data;
}

export async function syncPendingOnboarding(userId: string) {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem("intil_onboarding");
  if (!raw) return false;

  try {
    const payload = JSON.parse(raw) as {
      examType?: string | null;
      examDate?: string | null;
      targetScore?: number | null;
      subjects?: string[];
      weakPoints?: Record<string, string[]>;
      dailyTime?: "15-30" | "30-60" | "1-2" | "2+" | null;
    };
    const minutesByOption = { "15-30": 22, "30-60": 45, "1-2": 90, "2+": 120 } as const;
    const subjects = payload.subjects ?? [];
    const weakPoints = payload.weakPoints ?? {};
    const weakTopics = subjects.flatMap((subjectId) =>
      (weakPoints[subjectId] ?? []).map((topic) => `${subjectId}:${topic}`),
    );

    await saveStudentProfile(userId, {
      targetExam: payload.examType ?? null,
      targetScore: payload.targetScore ?? null,
      examDate: payload.examDate ?? null,
      dailyStudyMinutes: payload.dailyTime ? minutesByOption[payload.dailyTime] : null,
      studyDays: [],
      currentLevel: null,
      selectedSubjects: subjects,
      weakPoints,
      selfReportedWeakTopics: weakTopics,
      onboardingCompleted: true,
    });

    await generateStudyPlan({
      examType: payload.examType ?? null,
      examDate: payload.examDate ?? null,
      targetScore: payload.targetScore ?? null,
      subjects,
      weakPoints,
      dailyTime: payload.dailyTime ?? null,
    });

    window.localStorage.removeItem("intil_onboarding");
    return true;
  } catch (error) {
    console.error("[INTIL] onboarding sync failed", error);
    return false;
  }
}

export async function getLatestStudyPlan(userId: string) {
  const { data, error } = await db
    .from("study_plans")
    .select("id, title, summary, plan, model, generated_at, updated_at")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Study plan: ${error.message}`);
  return data;
}

export async function getStudentProfile(userId: string) {
  const { data, error } = await db.from("student_profiles").select("*").eq("user_id", userId).maybeSingle();
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
  let query = db.from("topic_mastery").select("*").eq("user_id", userId).order("mastery_score", { ascending: true });
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data, error } = await query;
  if (error) throw new Error(`Topic mastery: ${error.message}`);
  return data ?? [];
}
