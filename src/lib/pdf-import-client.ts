/**
 * Browser-side Gemini PDF extraction.
 *
 * The request is sent DIRECTLY from the admin's browser to
 * generativelanguage.googleapis.com, because Google blocks the server
 * data-centre IPs with "User location is not supported".
 * Key: GEMINI_API_KEY, handed to the admin browser by the admin-only
 * server function getGeminiApiKey (never bundled publicly).
 */

const MODEL = "gemini-3.6-flash";

export type ExtractedQuestion = {
  savol_turi: string;
  asosiy_matn: string;
  savol_matni: string;
  variant_a: string;
  variant_b: string;
  variant_c: string;
  variant_d: string;
  variant_e: string;
  variant_f: string;
  togri_javob: string;
  yechim: string;
  sahifa: number | null;
  /** true only when the question genuinely has a diagram/graph/drawing */
  rasm_bor: boolean;
  /** Diagram bounding box in page percentages (0-100), null when unknown */
  rasm_x: number | null;
  rasm_y: number | null;
  rasm_kengligi: number | null;
  rasm_balandligi: number | null;
};

const PROMPT = `Sen O'zbekiston imtihon savollarini raqamlashtiruvchi yordamchisan.
Berilgan PDF hujjatdagi BARCHA savollarni to'liq ajratib ol va FAQAT JSON massiv qaytar (hech qanday izoh, markdown yoki \`\`\` belgilarisiz).

Har bir element quyidagi maydonlarga ega bo'lsin:
{
  "savol_turi": "yopiq" | "ochiq" | "moslashtirish" | "yozma",
  "asosiy_matn": "savollar guruhiga umumiy bo'lgan matn/parcha (bo'lmasa bo'sh satr)",
  "savol_matni": "savol matni",
  "variant_a": "", "variant_b": "", "variant_c": "", "variant_d": "", "variant_e": "", "variant_f": "",
  "togri_javob": "A/B/C/D/E/F yoki ochiq savol javobi",
  "yechim": "yechim yoki izoh (bo'lmasa bo'sh satr)",
  "sahifa": savol joylashgan sahifa raqami (butun son),
  "rasm_bor": true/false,
  "rasm_x": 0-100, "rasm_y": 0-100, "rasm_kengligi": 0-100, "rasm_balandligi": 0-100
}

QOIDALAR:
- Matematik formulalarni [[LATEX: ...]] ko'rinishida yoz. JSON ichida backslash'larni IKKI marta escape qil (masalan "[[LATEX: \\\\frac{1}{2}]]").
- Variantlari yo'q savollar uchun variant maydonlarini bo'sh satr qoldir va savol_turi'ni "ochiq" yoki "yozma" qil.
- Agar hujjatda javob kaliti bo'lmasa: "togri_javob" ni bo'sh satr qoldir va "yechim" ga "TEKSHIRISH KERAK" deb yoz.
- Savol matni boshidagi tartib raqamini olib tashla.
- Hech qanday savolni o'ylab topma — faqat hujjatdagi haqiqiy savollarni chiqar.

RASMLAR (juda muhim):
- Faqat savolda HAQIQATAN diagramma, grafik, chizma, jadval-rasm yoki geometrik shakl bo'lsa, savol_matni ichida o'sha joyga [RASM: qisqacha tavsif] belgisini qo'y va "rasm_bor": true qil.
- Sof matn yoki faqat formuladan iborat savollarda [RASM: ...] belgisi BO'LMASIN va "rasm_bor": false bo'lsin, koordinatalar null bo'lsin.
- "rasm_bor": true bo'lganda o'sha diagrammaning sahifadagi TAXMINIY joylashuvini foizda ber: rasm_x va rasm_y — sahifaning CHAP-YUQORI burchagidan boshlab diagrammaning chap-yuqori nuqtasi (sahifa kengligi/balandligiga nisbatan %), rasm_kengligi va rasm_balandligi — diagrammaning o'lchami (% da). Butun sahifani (0,0,100,100) berma.
- Agar joylashuvni aniq ayta olmasang, koordinatalarni null qoldir.`;


function stripFences(s: string) {
  return s
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function extractJsonArray(raw: string): string {
  const s = stripFences(raw);
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s;
}

/** Tolerant parse: retries after escaping stray backslashes the model emitted. */
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

export async function extractQuestionsFromPdf(input: {
  fileBase64: string;
  mimeType?: string;
  apiKey: string;
}): Promise<ExtractedQuestion[]> {
  if (!input.fileBase64) throw new Error("Fayl bo'sh");
  if (input.fileBase64.length > 25_000_000) {
    throw new Error("PDF hajmi juda katta. Faylni bo'lib yuboring.");
  }

  const apiKey = input.apiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY sozlanmagan — administratorga murojaat qiling");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
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
    if (res.status === 429) throw new Error("So'rovlar chegarasi (429). Biroz kutib qayta urining.");
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Gemini kaliti rad etildi (${res.status}): ${message}`);
    }
    throw new Error(`AI xatosi (${res.status}): ${message}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!content) throw new Error("AI bo'sh javob qaytardi");

  const parsed = parseLoose(content);
  if (!Array.isArray(parsed)) throw new Error("AI javobi JSON massiv emas");

  return parsed
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => {
      const pageRaw = Number(r["sahifa"]);
      return {
        savol_turi: str(r["savol_turi"]).toLowerCase(),
        asosiy_matn: str(r["asosiy_matn"]),
        savol_matni: str(r["savol_matni"]),
        variant_a: str(r["variant_a"]),
        variant_b: str(r["variant_b"]),
        variant_c: str(r["variant_c"]),
        variant_d: str(r["variant_d"]),
        variant_e: str(r["variant_e"]),
        variant_f: str(r["variant_f"]),
        togri_javob: str(r["togri_javob"]),
        yechim: str(r["yechim"]),
        sahifa: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : null,
      };
    })
    .filter((q) => q.savol_matni.length > 0);
}
