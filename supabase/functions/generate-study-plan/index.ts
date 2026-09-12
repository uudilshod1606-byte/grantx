import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
  math: "Matematika", physics: "Fizika", history: "Tarix", uzbek: "Ona tili",
  biology: "Biologiya", chemistry: "Kimyo", english: "Ingliz tili",
};
const MINUTES: Record<Exclude<DailyTime, null>, number> = { "15-30": 22, "30-60": 45, "1-2": 90, "2+": 120 };

function daysUntil(date?: string | null) {
  if (!date) return 7;
  const target = new Date(`${date}T23:59:59`);
  return Math.max(1, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
}

function fallback(payload: Payload) {
  const subjects = payload.subjects?.length ? payload.subjects.slice(0, 7) : ["math"];
  const minutes = payload.dailyTime ? MINUTES[payload.dailyTime] : 45;
  const days = Math.min(14, Math.max(7, daysUntil(payload.examDate)));
  const weak = payload.weakPoints ?? {};
  const planDays = Array.from({ length: days }, (_, i) => {
    const id = subjects[i % subjects.length];
    const subject = SUBJECT_NAMES[id] ?? id;
    const topics = weak[id] ?? [];
    const topic = topics[i % Math.max(1, topics.length)] ?? "Asosiy mavzular";
    const focusMinutes = Math.max(10, Math.round(minutes * 0.65));
    return {
      day: i + 1,
      focus: `${subject} · ${topic}`,
      total_minutes: minutes,
      tasks: [
        { subject, topic, minutes: focusMinutes, task: "Mavzuni o'rganish va maqsadli savollar yechish" },
        { subject, topic: "Xatolar tahlili", minutes: minutes - focusMinutes, task: "Xatolarni qayta ko'rish va mustahkamlash" },
      ],
    };
  });
  return {
    title: "INTIL shaxsiy tayyorgarlik rejasi",
    summary: `${subjects.length} ta fan va siz belgilagan kuchsiz nuqtalar asosida boshlang'ich reja tuzildi. Keyingi natijalarga qarab moslashtiriladi.`,
    days: planDays,
    rules: ["Kuchsiz mavzularga ustuvorlik bering.", "Har mashg'ulotdan keyin xatolarni tahlil qiling.", "Natijalarga qarab yuklamani qayta taqsimlang."],
  };
}

function getGeminiKeys() {
  const values = [Deno.env.get("GEMINI_API_KEY"), ...Array.from({ length: 10 }, (_, i) => Deno.env.get(`GEMINI_API_KEY_${i + 1}`))];
  return [...new Set(values.flatMap((v) => (v ?? "").split(",")).map((v) => v.trim()).filter(Boolean))];
}

async function generateWithGemini(payload: Payload) {
  const keys = getGeminiKeys();
  if (!keys.length) return null;
  const subjects = (payload.subjects ?? []).slice(0, 7).map((s) => SUBJECT_NAMES[s] ?? s).join(", ");
  const weak = JSON.stringify(payload.weakPoints ?? {});
  const prompt = `Sen INTIL uchun O'zbekistondagi o'quvchilar uchun individual tayyorgarlik rejasini tuzadigan AI'san.
Imtihon: ${payload.examType ?? "ko'rsatilmagan"}
Imtihon sanasi: ${payload.examDate ?? "ko'rsatilmagan"}
Maqsad ball: ${payload.targetScore ?? "ko'rsatilmagan"}
Fanlar: ${subjects || "Matematika"}
Kunlik vaqt: ${payload.dailyTime ?? "30-60"}
Kuchsiz mavzular: ${weak}

7-14 kunlik amaliy boshlang'ich reja tuz. Kuchsiz mavzularga ustuvorlik ber, lekin mustahkamlash va xatolar tahlilini ham qo'sh. Har kuni aniq vazifa, mavzu va daqiqalarni ko'rsat. Kunlik jami vaqt foydalanuvchi tanlagan vaqtga mos bo'lsin. O'zbek tilida yoz.
FAQAT JSON qaytar: {"title":string,"summary":string,"days":[{"day":number,"focus":string,"total_minutes":number,"tasks":[{"subject":string,"topic":string,"minutes":number,"task":string}]}],"rules":[string]}`;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  let lastError = "";
  for (const key of keys) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.35 } }),
        });
        const data = await response.json();
        if (response.status === 429 || response.status === 503) { lastError = data?.error?.message ?? `Gemini ${response.status}`; await new Promise((r) => setTimeout(r, 700 * (attempt + 1))); continue; }
        if (!response.ok) { lastError = data?.error?.message ?? `Gemini ${response.status}`; break; }
        const content = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
        if (!content) { lastError = "Gemini bo'sh javob qaytardi"; break; }
        const start = content.indexOf("{"); const end = content.lastIndexOf("}");
        if (start < 0 || end <= start) { lastError = "Gemini JSON qaytarmadi"; break; }
        return { plan: JSON.parse(content.slice(start, end + 1)), model: "gemini-2.5-flash" };
      } catch (error) { lastError = error instanceof Error ? error.message : "Gemini xatosi"; break; }
    }
  }
  console.warn("[INTIL] Gemini study-plan failed; using fallback", lastError);
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Authorization required" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Supabase server configuration missing" }, 500);
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Invalid session" }, 401);
    const payload = (await req.json()) as Payload;
    const subjects = Array.isArray(payload.subjects) ? payload.subjects.slice(0, 7) : [];
    if (!subjects.length) return json({ error: "subjects are required" }, 400);
    const normalized: Payload = { ...payload, subjects };
    const ai = await generateWithGemini(normalized);
    const generated = ai ?? { plan: fallback(normalized), model: "adaptive-fallback" };
    const plan = generated.plan as Record<string, unknown>;
    const title = typeof plan.title === "string" ? plan.title : "INTIL shaxsiy reja";
    const summary = typeof plan.summary === "string" ? plan.summary : null;
    const { data: saved, error: saveError } = await admin.from("study_plans").insert({ user_id: userData.user.id, title, summary, plan, model: generated.model, generated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select("id,title,summary,plan,model,generated_at,updated_at").single();
    if (saveError) return json({ error: "Could not save study plan", details: saveError.message }, 500);
    return json({ ok: true, studyPlan: saved });
  } catch (error) {
    console.error("generate-study-plan error", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
