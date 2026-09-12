import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type SubjectInput = {
  id: string;
  block?: "mandatory" | "main1" | "main2" | null;
  questionCount: number;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    let body: {
      exam_key?: string;
      exam_title?: string;
      kind?: "dtm" | "milliy" | "bank";
      duration_minutes?: number;
      subjects?: SubjectInput[];
    };

    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const examKey = String(body.exam_key ?? "").slice(0, 100);
    const examTitle = String(body.exam_title ?? "Imtihon").slice(0, 200);
    const kind = body.kind;
    const duration = Number(body.duration_minutes);
    const subjects = Array.isArray(body.subjects) ? body.subjects : [];

    if (!examKey || !kind || !Number.isFinite(duration) || duration < 1 || duration > 600 || subjects.length < 1 || subjects.length > 20) {
      return json({ error: "Invalid exam configuration" }, 400);
    }

    const admin = ctx.supabaseAdmin;
    const questionIds: string[] = [];
    const publicQuestions: unknown[] = [];

    for (const subject of subjects) {
      const subjectId = String(subject.id ?? "");
      const count = Math.max(0, Math.min(200, Math.floor(Number(subject.questionCount) || 0)));
      if (!subjectId || count === 0) continue;

      let query = admin
        .from("questions")
        .select("id,subject_id,kind,block,category,difficulty,points,image_url,text,question_type,options,passage_text,exam_category,exam_label,group_id,group_intro,created_at,updated_at")
        .eq("subject_id", subjectId)
        .eq("kind", kind)
        .order("created_at", { ascending: true })
        .limit(count);

      if (kind === "dtm" && subject.block) query = query.eq("block", subject.block);

      const { data, error } = await query;
      if (error) return json({ error: "Could not load exam questions" }, 500);

      for (const q of data ?? []) {
        questionIds.push(String(q.id));
        publicQuestions.push(q);
      }
    }

    if (questionIds.length === 0) return json({ error: "No questions available" }, 404);

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + duration * 60_000);

    const { data: attempt, error: attemptError } = await admin
      .from("exam_attempts")
      .insert({
        user_id: userId,
        exam_key: examKey,
        exam_title: examTitle,
        kind,
        subject_ids: subjects.map((s) => ({ id: String(s.id), block: s.block ?? null, questionCount: Number(s.questionCount) })),
        question_ids: questionIds,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .select("id,started_at,expires_at,status")
      .single();

    if (attemptError || !attempt) return json({ error: "Could not start exam" }, 500);

    return json({
      attempt_id: attempt.id,
      started_at: attempt.started_at,
      expires_at: attempt.expires_at,
      questions: publicQuestions,
    });
  }),
};
