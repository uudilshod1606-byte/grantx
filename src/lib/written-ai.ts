/** Gemini evaluator for essay and extended written answers.
 *
 * The API key is supplied only to the admin browser by the existing
 * admin-only getGeminiApiKey server function. The returned JSON is a draft:
 * every score must be reviewed by an admin before it affects a student's
 * official INTIL result.
 */
import { ESSAY_CRITERIA, type EssayCriterion } from "@/lib/exam-scoring";

const MODEL = "gemini-3.6-flash";

export type EssayAiResult = {
  criteria: Array<{ id: string; name: string; score: number; errors: string[] }>;
};

export type WrittenAiResult = {
  score: number;
  comment: string;
  errors: string[];
};

function stripFences(raw: string) {
  return raw.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
}

function parseJson(raw: string): unknown {
  const cleaned = stripFences(raw);
  const positions = [cleaned.indexOf("{"), cleaned.indexOf("[")].filter((n) => n >= 0);
  const first = positions.length ? Math.min(...positions) : -1;
  const last = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const body = first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned;
  try {
    return JSON.parse(body);
  } catch {
    return JSON.parse(body.replace(/\\(?!["\\/bfnrtu])/g, "\\\\"));
  }
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function numberOf(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function generate(apiKey: string, prompt: string): Promise<unknown> {
  if (!apiKey) throw new Error("GEMINI_API_KEY sozlanmagan");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
    },
  );
  if (!response.ok) {
    const raw = await response.text();
    let message = raw.slice(0, 500);
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string } };
      message = parsed.error?.message ?? message;
    } catch {
      /* keep raw message */
    }
    throw new Error(`Gemini yozma ish baholash xatosi (${response.status}): ${message}`);
  }
  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!content) throw new Error("Gemini bo'sh javob qaytardi");
  return parseJson(content);
}

const CRITERIA_PROMPT = ESSAY_CRITERIA.map(
  (c: EssayCriterion) => `- ${c.id} — ${c.name}: ${c.guide}`,
).join("\n");

export async function evaluateEssay(input: {
  apiKey: string;
  essay: string;
  promptText?: string;
  passageText?: string;
}): Promise<EssayAiResult> {
  const prompt = `Sen O'zbekiston Milliy Sertifikati Ona tili va adabiyot 45-savol esse ishini dastlabki baholovchi AI yordamchisan.

VAZIFA: Quyidagi esse uchun 12 mezonning har biriga FAQAT 0, 0.5, 1, 1.5 yoki 2 ball taklif qil. Har bir mezon uchun topilgan ANIQ xatolarni misol bilan yoz. Masalan: "5-qatorda imlo xatosi: 'kelajagi' o'rniga 'kelajaqi' yozilgan". Xato topilmasa errors=[] bo'lsin. Hech qanday xatoni o'ylab topma.

MUHIM:
- Bu faqat DASTLABKI AI taklifi. Yakuniy ballni admin tasdiqlaydi.
- Esse mazmunini qayta yozma.
- Har bir mezon uchun aynan bitta score va errors massivini qaytar.
- FAQAT JSON qaytar.

12 MEZON:
${CRITERIA_PROMPT}

SAVOL/MAVZU:
${input.promptText || "Berilmagan"}

ASOSIY MATN/PARCHA:
${input.passageText || "Berilmagan"}

TALABA ESSESI:
${input.essay}

JSON shakli:
{"criteria":[{"id":"uslub","name":"Publitsistik uslub","score":2,"errors":[]}, ... ]}`;

  const parsed = (await generate(input.apiKey, prompt)) as Record<string, unknown>;
  const raw = Array.isArray(parsed.criteria) ? parsed.criteria : [];
  const byId = new Map(raw.map((item) => [textOf((item as Record<string, unknown>).id), item]));

  const criteria = ESSAY_CRITERIA.map((criterion) => {
    const item = (byId.get(criterion.id) ?? {}) as Record<string, unknown>;
    const rawScore = numberOf(item.score, 0);
    const score = [0, 0.5, 1, 1.5, 2].reduce(
      (best, allowed) => Math.abs(allowed - rawScore) < Math.abs(best - rawScore) ? allowed : best,
      0,
    );
    const errors = Array.isArray(item.errors)
      ? item.errors.map(textOf).filter(Boolean)
      : textOf(item.errors) ? [textOf(item.errors)] : [];
    return { id: criterion.id, name: criterion.name, score, errors };
  });

  return { criteria };
}

export async function evaluateWrittenQuestion(input: {
  apiKey: string;
  questionText: string;
  referenceAnswer?: string;
  studentAnswer: string;
  maxPoints: number;
}): Promise<WrittenAiResult> {
  const prompt = `Sen O'zbekiston Milliy Sertifikati Kimyo/Biologiya kengaytirilgan yozma savolini dastlabki tekshiruvchi AI yordamchisan.

Talabaning javobini savol va berilgan etalon/tayanch javob bilan solishtir. 0 dan ${input.maxPoints} gacha TAXMINIY ball taklif qil. Qisqa, aniq izoh va topilgan xatolar ro'yxatini qaytar.

MUHIM:
- Bu faqat DASTLABKI AI taklifi. Yakuniy ballni admin tasdiqlaydi.
- Javobda yo'q ma'lumotni o'ylab topma.
- FAQAT JSON qaytar.

SAVOL:
${input.questionText}

ETALON/TAYANCH JAVOB:
${input.referenceAnswer || "Berilmagan — faqat savol va talaba javobining ilmiy/mantiqiy to'g'riligini bahola."}

TALABA JAVOBI:
${input.studentAnswer}

JSON:
{"score":0,"comment":"qisqa izoh","errors":["aniq xato yoki kamchilik"]}`;

  const parsed = (await generate(input.apiKey, prompt)) as Record<string, unknown>;
  const score = Math.max(0, Math.min(input.maxPoints, numberOf(parsed.score, 0)));
  const errors = Array.isArray(parsed.errors)
    ? parsed.errors.map(textOf).filter(Boolean)
    : textOf(parsed.errors) ? [textOf(parsed.errors)] : [];
  return { score, comment: textOf(parsed.comment), errors };
}
