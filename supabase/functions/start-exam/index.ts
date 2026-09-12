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

const DTM_MANDATORY = ["ona-tili", "matematika-m", "tarix-m"] as const;
const DTM_MAIN_SUBJECTS = [
  "matematika",
  "fizika",
  "kimyo",
  "biologiya",
  "geografiya",
  "ingliz",
  "adabiyot",
  "tarix",
  "huquq",
  "informatika",
] as const;

function isExactDtmConfig(subjects: SubjectInput[], duration: number) {
  if (duration !== 180 || subjects.length !== 5) return false;
  const mandatory = subjects.filter((s) => s.block === "mandatory");
  const main1 = subjects.filter((s) => s.block === "main1");
  const main2 = subjects.filter((s) => s.block === "main2");
  if (mandatory.length !== 3 || main1.length !== 1 || main2.length !== 1) return false;

  const mandatoryIds = mandatory.map((s) => String(s.id)).sort();
  if (mandatoryIds.join("|") !== [...DTM_MANDATORY].sort().join("|")) return false;
  if (mandatory.some((s) => Number(s.questionCount) !== 10)) return false;
  if (Number(main1[0].questionCount) !== 30 || Number(main2[0].questionCount) !== 30) return false;

  const main1Id = String(main1[0].id);
  const main2Id = String(main2[0].id);
  if (main1Id === main2Id) return false;
  if (!(DTM_MAIN_SUBJECTS as readonly string[]).includes(main1Id)) return false;
  if (!(DTM_MAIN_SUBJECTS as readonly string[]).includes(main2Id)) return false;
  return true;
}

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

    // DTM structure is authoritative on the server. Never trust the browser to
    // choose blocks, counts, duration, or arbitrary subject IDs.
    if (kind === "dtm" && !isExactDtmConfig(subjects, duration)) {
      return json({ error: "Invalid DTM exam configuration" }, 400);
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

      if (kind === "dtm") query = query.eq("block", subject.block);

      const { data, error } = await query;
      if (error) return json({ error: "Could not load exam questions" }, 500);

      if (kind === "dtm" && (data?.length ?? 0) !== count) {
        return json({ error: `Not enough questions for ${subjectId}` }, 409);
      }

      for (const q of data ?? []) {
        questionIds.push(String(q.id));
        publicQuestions.push(q);
      }
    }

    if (questionIds.length === 0) return json({ error: "No questions available" }, 404);
    if (kind === "dtm" && questionIds.length !== 90) return json({ error: "DTM question set is incomplete" }, 409);
    if (new Set(questionIds).size !== questionIds.length) return json({ error: "Duplicate questions detected" }, 409);

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
