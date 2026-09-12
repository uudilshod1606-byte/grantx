import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AnswerInput = {
  question_id: string;
  answer_index?: number | null;
  answer_text?: string | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    let body: { attempt_id?: string; answers?: AnswerInput[] };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const attemptId = String(body.attempt_id ?? "");
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (!attemptId || answers.length > 1000) return json({ error: "Invalid submission" }, 400);

    const admin = ctx.supabaseAdmin;

    const { data: attempt, error: attemptError } = await admin
      .from("exam_attempts")
      .select("id,user_id,status,expires_at,submitted_at")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) return json({ error: "Could not load attempt" }, 500);
    if (!attempt || attempt.user_id !== userId) return json({ error: "Attempt not found" }, 404);
    if (attempt.status !== "active") return json({ error: "Attempt already submitted" }, 409);

    const expiresAt = new Date(attempt.expires_at).getTime();
    if (!Number.isFinite(expiresAt)) return json({ error: "Invalid attempt deadline" }, 500);

    const normalized = answers
      .map((a) => ({
        question_id: String(a?.question_id ?? ""),
        answer_index: a?.answer_index == null ? null : Number(a.answer_index),
        answer_text: a?.answer_text == null ? null : String(a.answer_text).slice(0, 2000),
      }))
      .filter((a) => a.question_id.length > 0)
      .slice(0, 1000);

    const uniqueIds = [...new Set(normalized.map((a) => a.question_id))];
    const { data: questions, error: questionError } = await admin
      .from("questions")
      .select("id,correct_index,points")
      .in("id", uniqueIds);

    if (questionError) return json({ error: "Could not score submission" }, 500);

    const questionMap = new Map(
      (questions ?? []).map((q) => [String(q.id), q as { id: string; correct_index: number | null; points: number | null }]),
    );

    const answerRows = normalized.filter((a) => questionMap.has(a.question_id));
    const correct = answerRows.reduce((sum, answer) => {
      const q = questionMap.get(answer.question_id);
      return sum + (q?.correct_index != null && answer.answer_index === Number(q.correct_index) ? 1 : 0);
    }, 0);

    const total = questionMap.size;
    const unanswered = Math.max(0, total - answerRows.length);
    const incorrect = Math.max(0, answerRows.length - correct);
    const percent = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

    const now = new Date().toISOString();

    const { error: answersError } = await admin
      .from("exam_answers")
      .upsert(
        answerRows.map((a) => ({
          attempt_id: attemptId,
          question_id: a.question_id,
          answer_index: a.answer_index,
          answer_text: a.answer_text,
          answered_at: now,
        })),
        { onConflict: "attempt_id,question_id" },
      );

    if (answersError) return json({ error: "Could not save answers" }, 500);

    const { error: updateError } = await admin
      .from("exam_attempts")
      .update({
        status: "submitted",
        submitted_at: now,
        total,
        correct,
        incorrect,
        unanswered,
        percent,
        updated_at: now,
      })
      .eq("id", attemptId)
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) return json({ error: "Could not finalize attempt" }, 500);

    return json({
      attempt_id: attemptId,
      total,
      correct,
      incorrect,
      unanswered,
      percent,
      submitted_at: now,
      expired: Date.now() > expiresAt,
    });
  }),
};
