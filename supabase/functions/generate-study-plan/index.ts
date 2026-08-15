import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DailyTime = "15-30" | "30-60" | "1-2" | "2+" | null;
type Payload = {
  examType?: string | null;
  examDate?: string | null;
  targetScore?: number | null;
  subjects?: string[];
  weakPoints?: Record<string, string[]>;
  dailyTime?: DailyTime;
};

const SUBJECT_NAMES: Record<string, string> = {
  math: "Matematika",
  physics: "Fizika",
  history: "Tarix",
  uzbek: "Ona tili",
  biology: "Biologiya",
  chemistry: "Kimyo",
  english: "Ingliz tili",
};

const MINUTES: Record<Exclude<DailyTime, null>, number> = {
  "15-30": 22,
  "30-60": 45,
  "1-2": 90,
  "2+": 120,
};

function daysUntil(date?: string | null) {
  if (!date) return 30;
  const target = new Date(`${date}T23:59:59`);
  const now = new Date();
  return Math.max(1, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

function buildFallback(payload: Payload) {
  const subjects = payload.subjects?.length ? payload.subjects : ["math"];
  const weak = payload.weakPoints ?? {};
  const minutes = payload.dailyTime ? MINUTES[payload.dailyTime] : 45;
  const days = Math.min(14, Math.max(7, daysUntil(payload.examDate)));

  const planDays = Array.from({ length: days }, (_, index) => {
    const primary = subjects[index % subjects.length];
    const name = SUBJECT_NAMES[primary] ?? primary;
    const topics = weak[primary] ?? [];
    const topic = topics[index % Math.max(1, topics.length)] ?? "Asosiy mavzular";
    const split = Math.max(10, Math.round(minutes * 0.65));
    const review = Math.max(8, minutes - split);

    return {
      day: index + 1,
      focus: `${name} · ${topic}`,
      total_minutes: minutes,
      tasks: [
        { subject: name, topic, minutes: split, task: "Mavzuni o'rganish va maqsadli savollar yechish" },
        { subject: name, topic: "Xatolar tahlili", minutes: review, task: "Xatolarni qayta ko'rish va qisqa mustahkamlash" },
      ],
    };
  });

  return {
    title: "INTIL shaxsiy tayyorgarlik rejasi",
    summary: `${subjects.length} ta fan va siz belgilagan kuchsiz nuqtalar asosida ${days} kunlik boshlang'ich reja tuzildi. Reja natijalaringizga qarab keyin moslashtiriladi.`,
    days: planDays,
    rules: [
      "Avval kuchsiz nuqtalarni ishlang, keyin kuchli mavzularni mustahkamlang.",
      "Har bir mashg'ulotdan keyin xatolarni qayd eting.",
      "Har 3-4 kunda natijaga qarab yuklamani qayta taqsimlang.",
    ],
  };
}

async function buildWithOpenAI(payload: Payload, fallback: ReturnType<typeof buildFallback>) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return { plan: fallback, model: "adaptive-fallback" };

  const prompt = `You are INTIL, an adaptive exam-preparation planner for Uzbek students.\nCreate a practical ${Math.min(14, Math.max(7, daysUntil(payload.examDate)))}-day starter plan.\nExam: ${payload.examType ?? "unspecified"}\nExam date: ${payload.examDate ?? "unspecified"}\nTarget score: ${payload.targetScore ?? "unspecified"}\nDaily study time: ${payload.dailyTime ?? "30-60"}\nSubjects: ${(payload.subjects ?? []).map((s) => SUBJECT_NAMES[s] ?? s).join(", ")}\nWeak points: ${JSON.stringify(payload.weakPoints ?? {})}\n\nReturn ONLY valid JSON with this shape:\n{"title":string,"summary":string,"days":[{"day":number,"focus":string,"total_minutes":number,"tasks":[{"subject":string,"topic":string,"minutes":number,"task":string}]}],"rules":[string]}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You create concise, realistic study plans. Never invent exam rules. Return JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) return { plan: fallback, model: "adaptive-fallback" };
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return { plan: fallback, model: "adaptive-fallback" };

  try {
    return { plan: JSON.parse(content), model: data?.model ?? "openai" };
  } catch {
    return { plan: fallback, model: "adaptive-fallback" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const payload = (await req.json()) as Payload;
    const fallback = buildFallback(payload);
    const generated = await buildWithOpenAI(payload, fallback);

    const { data: saved, error: saveError } = await supabase
      .from("study_plans")
      .insert({ user_id: user.id, title: generated.plan.title ?? "INTIL shaxsiy reja", summary: generated.plan.summary ?? null, plan: generated.plan, model: generated.model })
      .select("id, title, summary, plan, model, generated_at, updated_at")
      .single();

    if (saveError) throw new Error(`Study plan save failed: ${saveError.message}`);

    return new Response(JSON.stringify(saved), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
