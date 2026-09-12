import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

type AnswerInput = { question_id: string; answer_index?: number | null; answer_text?: string | null };

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);
    let body: { attempt_id?: string; answers?: AnswerInput[] };
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const attemptId = String(body.attempt_id ?? "");
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (!attemptId || answers.length > 1000) return json({ error: "Invalid submission" }, 400);
    const admin = ctx.supabaseAdmin;
    const { data: attempt, error: attemptError } = await admin.from("exam_attempts").select("id,user_id,status,expires_at,question_ids").eq("id", attemptId).maybeSingle();
    if (attemptError) return json({ error: "Could not load attempt" }, 500);
    if (!attempt || attempt.user_id !== userId) return json({ error: "Attempt not found" }, 404);
    if (attempt.status !== "active") return json({ error: "Attempt already submitted" }, 409);
    const expiresAt = new Date(attempt.expires_at).getTime();
    if (!Number.isFinite(expiresAt)) return json({ error: "Invalid attempt deadline" }, 500);
    if (Date.now() > expiresAt) {
      await admin.from("exam_attempts").update({ status: "expired", updated_at: new Date().toISOString() }).eq("id", attemptId).eq("status", "active");
      return json({ error: "Exam time has expired" }, 409);
    }
    const lockedIds = Array.isArray(attempt.question_ids) ? [...new Set(attempt.question_ids.map((id: unknown) => String(id)).filter(Boolean))] : [];
    if (lockedIds.length === 0) return json({ error: "Attempt has no locked questions" }, 500);

    const normalized = answers.map((a) => {
      const rawIndex = a?.answer_index;
      const answerIndex = rawIndex == null ? null : Number(rawIndex);
      return {
        question_id: String(a?.question_id ?? ""),
        answer_index: answerIndex,
        answer_text: a?.answer_text == null ? null : String(a.answer_text).slice(0, 2000),
      };
    }).filter((a) => {
      if (!lockedIds.includes(a.question_id) || !a.question_id) return false;
      if (a.answer_index !== null && (!Number.isInteger(a.answer_index) || a.answer_index < 0 || a.answer_index > 3)) return false;
      return true;
    });

    const answerMap = new Map<string, (typeof normalized)[number]>();
    for (const answer of normalized) answerMap.set(answer.question_id, answer);
    const cleanAnswers = [...answerMap.values()];

    const { data: questions, error: questionError } = await admin.from("questions").select("id,correct_index,points").in("id", lockedIds);
    if (questionError) return json({ error: "Could not score submission" }, 500);
    const questionMap = new Map((questions ?? []).map((q) => [String(q.id), q as { id: string; correct_index: number | null; points: number | null }]));
    let correct = 0;
    let score = 0;
    let maxScore = 0;
    for (const id of lockedIds) {
      const q = questionMap.get(id);
      const pts = Number(q?.points ?? 0);
      maxScore += Number.isFinite(pts) ? pts : 0;
      const answer = answerMap.get(id);
      if (q?.correct_index != null && answer?.answer_index === Number(q.correct_index)) { correct += 1; score += pts; }
    }
    const total = lockedIds.length;
    const unanswered = lockedIds.filter((id) => !answerMap.has(id)).length;
    const incorrect = Math.max(0, total - correct - unanswered);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : Math.round((correct / total) * 10000) / 100;
    const now = new Date().toISOString();
    const { error: answersError } = await admin.from("exam_answers").upsert(cleanAnswers.map((a) => ({ attempt_id: attemptId, question_id: a.question_id, answer_index: a.answer_index, answer_text: a.answer_text, answered_at: now })), { onConflict: "attempt_id,question_id" });
    if (answersError) return json({ error: "Could not save answers" }, 500);
    const { data: finalized, error: updateError } = await admin.from("exam_attempts").update({ status: "submitted", submitted_at: now, total, correct, incorrect, unanswered, percent, updated_at: now }).eq("id", attemptId).eq("user_id", userId).eq("status", "active").select("id").maybeSingle();
    if (updateError) return json({ error: "Could not finalize attempt" }, 500);
    if (!finalized) return json({ error: "Attempt was finalized by another request" }, 409);
    return json({ attempt_id: attemptId, total, correct, incorrect, unanswered, percent, score, max_score: maxScore, submitted_at: now });
  }),
};
