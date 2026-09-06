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
  /** Tight diagram bounding box in page percentages (0-100). */
  rasm_x: number | null;
  rasm_y: number | null;
  rasm_kengligi: number | null;
  rasm_balandligi: number | null;
};

const PROMPT = `Sen O'zbekiston imtihon savollarini raqamlashtiruvchi juda aniq PDF extraction yordamchisan.

VAZIFA:
Berilgan PDF hujjatdagi BARCHA haqiqiy savollarni to'liq ajratib ol. Matnni mazmunan o'zgartirma, qisqartirma va yangi ma'lumot o'ylab topma. FAQAT JSON massiv qaytar.

HAR BIR ELEMENT:
{
  "savol_turi": "yopiq" | "ochiq" | "moslashtirish" | "yozma",
  "asosiy_matn": "savollar guruhiga umumiy bo'lgan matn/parcha (bo'lmasa bo'sh satr)",
  "savol_matni": "savolning o'z matni",
  "variant_a": "", "variant_b": "", "variant_c": "", "variant_d": "", "variant_e": "", "variant_f": "",
  "togri_javob": "A/B/C/D/E/F yoki ochiq savol javobi",
  "yechim": "yechim yoki izoh (bo'lmasa bo'sh satr)",
  "sahifa": savol joylashgan sahifa raqami (butun son),
  "rasm_bor": true/false,
  "rasm_x": 0-100, "rasm_y": 0-100, "rasm_kengligi": 0-100, "rasm_balandligi": 0-100
}

MATN VA FORMULA QOIDALARI:
- Savol matnidagi oddiy so'zlarni aynan PDFdagidek saqla.
- Savol boshidagi tartib raqamini olib tashla.
- Matematik formulalarni [[LATEX: ...]] ko'rinishida yoz.
- JSON ichidagi backslash'larni to'g'ri escape qil.
- Hech qachon "LaTeX", "LATEX", "LaTeX kodi" kabi so'zlarni foydalanuvchiga ko'rinadigan savol matniga yozma.
- Hech qachon \`[LATEX: ...]\`, "latex:", "LATEX:" yoki code fence ishlatma. Faqat [[LATEX: formula ]] markeridan foydalan.
- Variantlari yo'q savollar uchun variant maydonlarini bo'sh qoldir.
- Javob kaliti bo'lmasa "togri_javob" bo'sh, "yechim" esa "TEKSHIRISH KERAK" bo'lsin.

RASMLAR — JUDA MUHIM:
- [RASM: ...] belgisi faqat savolda HAQIQATAN ko'rinadigan diagramma, grafik, geometrik chizma yoki rasm bo'lsa ishlatiladi.
- Sof matn, formula, oddiy jadval yoki faqat belgilar bo'lsa rasm deb hisoblama.
- Agar HAQIQIY rasm bo'lsa, savol_matni ichida rasm joylashgan joyga aynan [RASM: qisqa tavsif] qo'y va rasm_bor=true qil.
- Agar HAQIQIY rasm bo'lmasa, [RASM: ...] yozma va rasm_bor=false qil.
- Agar rasm bor bo'lsa, koordinatalar FAQAT rasmning o'zini qamrab olsin: x/y chap-yuqori burchak, kenglik/balandlik rasm o'lchami, barchasi 0-100%.
- Bounding box maksimal darajada TIGHT bo'lsin. Rasm ichidagi A, B, C, x, y, pi, o'lchovlar va boshqa muhim label'lar qolsin.
- Oddiy savol jumlasi, variantlar, sarlavha, savol raqami va rasmga tegishli bo'lmagan matn box ichiga kirmasin.
- Rasmning koordinatasini ishonchli topa olmasang, rasm_bor=true bo'lib qoladi, lekin koordinatalarni null qil. Hech qachon butun sahifani rasm deb belgilama.
- Bitta diagramma a) va b) ga umumiy bo'lsa, uni faqat birinchi qismga biriktir. Keyingi qismda rasm_bor=false va koordinatalar null bo'lsin.
- Rasm tavsifi [RASM: ...] — faqat import jarayoni uchun ichki marker. U saqlanadigan savol matnida ko'rinmasligi kerak.

ENG MUHIM TEKSHIRUV:
Har bir savolni PDFning VISUAL ko'rinishi bilan solishtir. Diagramma bor joyda uni o'tkazib yuborma; diagramma yo'q joyda rasm o'ylab topma.`;

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

/** Remove internal image annotations from student-visible question text. */
function stripImageMarkers(value: string) {
  return value
    .replace(/\s*\[RASM:\s*[^\]]*\]\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Normalize common AI LaTeX wrappers into the single marker understood by INTIL. */
function normalizeLatex(value: string) {
  return value
    .replace(/\[\[\s*LATEX\s*:\s*([\s\S]*?)\]\]/gi, "[[LATEX: $1]]")
    .replace(/\\\[([\s\S]*?)\\\]/g, "[[LATEX: $1]]")
    .replace(/\\\(([\s\S]*?)\\\)/g, "[[LATEX: $1]]")
    .replace(/\$\$([\s\S]*?)\$\$/g, "[[LATEX: $1]]");
}

function cleanQuestionText(value: unknown) {
  return normalizeLatex(stripImageMarkers(str(value)));
}

/**
 * Gemini sometimes returns a two-part national-certificate open question as
 * one record, e.g. "... a) ... b) ...". The exam UI needs each part to have
 * its own answer field. Normalize that shape here while preserving the
 * shared intro and attaching a shared diagram only to the first part.
 */
function splitCompoundOpenQuestion(question: ExtractedQuestion): ExtractedQuestion[] {
  const type = question.savol_turi.toLowerCase();
  if (type !== "ochiq" && type !== "yozma") return [question];
  if (question.variant_a || question.variant_b || question.variant_c || question.variant_d || question.variant_e || question.variant_f) {
    return [question];
  }

  const text = question.savol_matni.trim();
  const aMatch = /(?:^|\s)a\)\s+/i.exec(text);
  if (!aMatch) return [question];
  const aStart = aMatch.index + aMatch[0].length;
  const bMatch = /(?:^|\s)b\)\s+/i.exec(text.slice(aStart));
  if (!bMatch) return [question];

  const prefix = text.slice(0, aMatch.index).trim();
  const aText = text.slice(aStart, aStart + bMatch.index).trim();
  const bText = text.slice(aStart + bMatch.index + bMatch[0].length).trim();
  if (!aText || !bText) return [question];

  const sharedIntro = question.asosiy_matn.trim() || prefix;
  const first: ExtractedQuestion = {
    ...question,
    asosiy_matn: sharedIntro,
    savol_matni: aText,
  };
  const second: ExtractedQuestion = {
    ...question,
    asosiy_matn: sharedIntro,
    savol_matni: bText,
    togri_javob: "",
    rasm_bor: false,
    rasm_x: null,
    rasm_y: null,
    rasm_kengligi: null,
    rasm_balandligi: null,
  };

  return [first, second];
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
        generationConfig: {
          responseMimeType: "application/json",
          media_resolution: "MEDIA_RESOLUTION_MEDIUM",
        },
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

  const pct = (v: unknown): number | null => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    return n;
  };

  const normalized = parsed
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => {
      const pageRaw = Number(r["sahifa"]);
      const text = cleanQuestionText(r["savol_matni"]);
      const passage = cleanQuestionText(r["asosiy_matn"]);
      const hasMarker = /\[RASM:/i.test(str(r["savol_matni"])) || /\[RASM:/i.test(str(r["asosiy_matn"]));
      const flag = r["rasm_bor"] === true || String(r["rasm_bor"]).toLowerCase() === "true";
      const hasValidBox = [r["rasm_x"], r["rasm_y"], r["rasm_kengligi"], r["rasm_balandligi"]].every((v) => pct(v) != null);
      return {
        savol_turi: str(r["savol_turi"]).toLowerCase(),
        asosiy_matn: passage,
        savol_matni: text,
        variant_a: cleanQuestionText(r["variant_a"]),
        variant_b: cleanQuestionText(r["variant_b"]),
        variant_c: cleanQuestionText(r["variant_c"]),
        variant_d: cleanQuestionText(r["variant_d"]),
        variant_e: cleanQuestionText(r["variant_e"]),
        variant_f: cleanQuestionText(r["variant_f"]),
        togri_javob: str(r["togri_javob"]),
        yechim: cleanQuestionText(r["yechim"]),
        sahifa: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : null,
        rasm_bor: hasMarker || flag,
        rasm_x: hasValidBox ? pct(r["rasm_x"]) : null,
        rasm_y: hasValidBox ? pct(r["rasm_y"]) : null,
        rasm_kengligi: hasValidBox ? pct(r["rasm_kengligi"]) : null,
        rasm_balandligi: hasValidBox ? pct(r["rasm_balandligi"]) : null,
      };
    })
    .filter((q) => q.savol_matni.length > 0);

  return normalized.flatMap(splitCompoundOpenQuestion);
}
