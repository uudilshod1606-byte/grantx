import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "dilshoduktamov34@gmail.com";
const MODEL = "google/gemini-3.6-flash";

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
  "sahifa": savol joylashgan sahifa raqami (butun son)
}

QOIDALAR:
- Matematik formulalarni [[LATEX: ...]] ko'rinishida yoz. JSON ichida backslash'larni IKKI marta escape qil (masalan "[[LATEX: \\\\frac{1}{2}]]").
- Variantlari yo'q savollar uchun variant maydonlarini bo'sh satr qoldir va savol_turi'ni "ochiq" yoki "yozma" qil.
- Agar hujjatda javob kaliti bo'lmasa: "togri_javob" ni bo'sh satr qoldir va "yechim" ga "TEKSHIRISH KERAK" deb yoz.
- Savol matni boshidagi tartib raqamini olib tashla.
- Hech qanday savolni o'ylab topma — faqat hujjatdagi haqiqiy savollarni chiqar.`;

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

export const extractQuestionsFromPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fileName: string; fileBase64: string; mimeType?: string }) => {
    if (!input?.fileBase64) throw new Error("Fayl bo'sh");
    return input;
  })
  .handler(async ({ data, context }): Promise<ExtractedQuestion[]> => {
    const email = String(
      (context.claims as { email?: string } | null)?.email ?? "",
    ).toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI kaliti sozlanmagan");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              {
                type: "file",
                file: {
                  filename: data.fileName || "savollar.pdf",
                  file_data: `data:${data.mimeType || "application/pdf"};base64,${data.fileBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

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
      if (res.status === 402) throw new Error(`AI krediti yetarli emas: ${message}`);
      if (res.status === 403) throw new Error(`AI bloklangan: ${message}`);
      throw new Error(`AI xatosi (${res.status}): ${message}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
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
  });
