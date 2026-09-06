/**
 * Browser-side Gemini extraction for official answer-key PDFs.
 * The answer key is intentionally parsed separately from question extraction.
 */

const MODEL = "gemini-3.6-flash";

export type AnswerKeyItem = {
  questionNumber: number;
  part: "a" | "b" | null;
  answer: string;
};

const PROMPT = `Sen O'zbekiston imtihonlarining JAVOBLAR KALITI PDFini raqamlashtiruvchi yordamchisan.
Berilgan PDFdagi javoblar jadvalini o'qi va FAQAT JSON massiv qaytar.

Har bir element:
{
  "questionNumber": 1,
  "part": null | "a" | "b",
  "answer": "A"
}

QOIDALAR:
- 1-35 kabi oddiy yopiq savollarda part=null va answer faqat javob harfi bo'lsin: A, B, C, D, E yoki F.
- 36-45 kabi a/b savollarda har bir qismni alohida chiqaring: masalan {"questionNumber":36,"part":"a","answer":"21"} va {"questionNumber":36,"part":"b","answer":"-37"}.
- Ochiq javoblarni PDFda qanday berilgan bo'lsa, mazmunini o'zgartirmasdan matn sifatida saqlang. Kasr, ildiz, daraja, minus va o'lchov birliklarini yo'qotmang.
- Jadval sarlavhalari, telefon raqamlari, Telegram username, reklama va boshqa matnlarni javob deb olmang.
- Savol raqamlarini aynan PDFdagi raqam bilan chiqaring.
- Agar javobni ishonchli o'qiy olmasang, o'sha elementni chiqarmaslik o'rniga answer maydonini bo'sh qoldir.
- FAQAT JSON massiv qaytar, markdown yoki izoh yozma.`;

function stripFences(s: string) {
  return s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
}

function extractJsonArray(raw: string) {
  const s = stripFences(raw);
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  return start >= 0 && end > start ? s.slice(start, end + 1) : s;
}

function parseLoose(raw: string): unknown {
  const body = extractJsonArray(raw);
  try {
    return JSON.parse(body);
  } catch {
    const fixed = body.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  }
}

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
}

export async function extractAnswerKeyFromPdf(input: {
  fileBase64: string;
  mimeType?: string;
  apiKey: string;
}): Promise<AnswerKeyItem[]> {
  if (!input.fileBase64) throw new Error("Javoblar PDFi bo'sh");
  if (input.fileBase64.length > 25_000_000) {
    throw new Error("Javoblar PDFi juda katta. Faylni bo'lib yuboring.");
  }
  if (!input.apiKey) throw new Error("GEMINI_API_KEY sozlanmagan");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": input.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: PROMPT },
              {
                inline_data: {
                  mime_type: input.mimeType || "application/pdf",
                  data: input.fileBase64,
                },
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    let message = body.slice(0, 400);
    try {
      const j = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = j.error?.message ?? j.message ?? message;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429) throw new Error("Javoblar PDFi uchun AI so'rovlari chegarasiga yetildi (429).");
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Gemini kaliti rad etildi (${res.status}): ${message}`);
    }
    throw new Error(`Javoblar AI xatosi (${res.status}): ${message}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!content) throw new Error("AI javoblar PDFidan bo'sh javob qaytardi");

  const parsed = parseLoose(content);
  if (!Array.isArray(parsed)) throw new Error("AI javoblar kalitini JSON massiv sifatida qaytarmadi");

  const normalized = parsed
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => {
      const questionNumber = Number(r.questionNumber ?? r.savol ?? r.number);
      const rawPart = str(r.part ?? r.qism).toLowerCase();
      const part: "a" | "b" | null = rawPart === "a" || rawPart === "b" ? rawPart : null;
      return {
        questionNumber,
        part,
        answer: str(r.answer ?? r.javob),
      } satisfies AnswerKeyItem;
    })
    .filter(
      (r) =>
        Number.isInteger(r.questionNumber) &&
        r.questionNumber > 0 &&
        r.questionNumber <= 100 &&
        (r.part === null || r.part === "a" || r.part === "b"),
    );

  const map = new Map<string, AnswerKeyItem>();
  for (const item of normalized) {
    const key = `${item.questionNumber}:${item.part ?? ""}`;
    if (!map.has(key) || !map.get(key)?.answer) map.set(key, item);
  }
  return [...map.values()].sort(
    (a, b) => a.questionNumber - b.questionNumber || String(a.part).localeCompare(String(b.part)),
  );
}
