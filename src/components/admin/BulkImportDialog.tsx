import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MathContent } from "@/components/math/MathContent";
import { renderTextWithLatexMarkers } from "@/components/math/formula";
import {
  ADMIN_SUBJECTS,
  defaultPointsFor,
  questionsRepo,
  type DtmBlock,
  type ExamKind,
} from "@/lib/domain";

const REQUIRED_COLUMNS = [
  "imtihon_turi",
  "fan",
  "ball",
  "savol_matni",
  "variant_a",
  "variant_b",
  "variant_c",
  "variant_d",
  "togri_javob",
] as const;

const OPTION_COLUMNS = [
  "variant_a",
  "variant_b",
  "variant_c",
  "variant_d",
  "variant_e",
  "variant_f",
] as const;

// "savol_turi", "yechim" va "asosiy_matn" ixtiyoriy ustunlar — eski fayllarda
// bo'lmasa ham hech narsa buzilmaydi, faqat qo'shimcha imkoniyat beradi.
const ALL_COLUMNS = [
  ...REQUIRED_COLUMNS,
  "variant_e",
  "variant_f",
  "group_id",
  "group_intro",
  "savol_turi",
  "yechim",
  "asosiy_matn",
  "bolim",
  "imtihon_sanasi",
];

const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

type QuestionType = "yopiq" | "moslashtirish" | "ochiq" | "esse";

// Excel'dagi "savol_turi" ustunidagi qiymatlarni ilova ichidagi turlarga moslashtiradi.
// Bo'sh yoki tanilmagan qiymat bo'lsa — pastdagi eski heuristikaga qaytiladi.
const SAVOL_TURI_MAP: Record<string, QuestionType> = {
  yopiq: "yopiq",
  moslashtirish: "moslashtirish",
  ochiq: "ochiq",
  ochiq_bitta: "ochiq",
  ochiq_qism: "ochiq",
  yozma: "ochiq",
  esse: "esse",
};

type PreparedRow = {
  rowNumber: number;
  errors: string[];
  kind: ExamKind;
  block: DtmBlock | null;
  subjectId: string;
  subjectName: string;
  points: number;
  text: string;
  questionType: QuestionType;
  options: string[];
  correctIndex: number;
  answerText: string;
  solution: string;
  passageText: string;
  examCategory: "original" | "mashq";
  examLabel: string;
  groupId: string | null;
  groupIntro: string | null;
};

function norm(v: unknown) {
  return String(v ?? "").trim();
}

function stripLeadingNumber(v: string) {
  return v.replace(/^\d+(-[a-zA-Zа-яА-Я])?[.)]\s*/, "").trim();
}

function parseKind(raw: string): { kind: ExamKind | null; block: DtmBlock | null } {
  const v = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (v.startsWith("milliy") || v.includes("sertifikat")) return { kind: "milliy", block: null };
  if (v.startsWith("dtm")) {
    if (v.includes("majburiy") || v.includes("mandatory")) return { kind: "dtm", block: "mandatory" };
    if (v.includes("2")) return { kind: "dtm", block: "main2" };
    if (v.includes("1") || v.includes("asosiy") || v.includes("main")) return { kind: "dtm", block: "main1" };
    return { kind: "dtm", block: null };
  }
  return { kind: null, block: null };
}

function findSubject(kind: ExamKind, block: DtmBlock | null, raw: string) {
  const key = raw.toLowerCase().trim();
  const pools =
    kind === "milliy"
      ? [{ block: null as DtmBlock | null, list: ADMIN_SUBJECTS.milliy }]
      : block === "mandatory"
        ? [{ block: "mandatory" as DtmBlock | null, list: ADMIN_SUBJECTS.dtmMandatory }]
        : block
          ? [{ block, list: ADMIN_SUBJECTS.dtmMain }]
          : [
              { block: "mandatory" as DtmBlock | null, list: ADMIN_SUBJECTS.dtmMandatory },
              { block: "main1" as DtmBlock | null, list: ADMIN_SUBJECTS.dtmMain },
            ];
  for (const pool of pools) {
    const hit = pool.list.find(
      (s) => s.id.toLowerCase() === key || s.name.toLowerCase() === key,
    );
    if (hit) return { subject: hit, block: pool.block };
  }
  return null;
}

function parseAnswerLetter(raw: string, optionCount: number): number | null {
  const v = raw.toLowerCase().trim();
  const letters = LETTERS.slice(0, optionCount).map((l) => l.toLowerCase());
  const idx = letters.indexOf(v);
  if (idx >= 0) return idx;
  const n = Number(v);
  if (n >= 1 && n <= optionCount) return n - 1;
  return null;
}

export function BulkImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<PreparedRow[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setRows(null);
    setFileName("");
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setParsing(true);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]!];
      if (!sheet) throw new Error("Faylda varaq topilmadi");
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (raw.length === 0) throw new Error("Fayl bo'sh");

      const headers = Object.keys(raw[0]!).map((h) => h.trim().toLowerCase());
      const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
      if (missing.length) {
        toast.error("Ustunlar yetishmayapti: " + missing.join(", "));
        setRows([]);
        return;
      }

      const prepared: PreparedRow[] = [];
      for (let i = 0; i < raw.length; i++) {
        const src = raw[i]!;
        const get = (col: string) => {
          const key = Object.keys(src).find((k) => k.trim().toLowerCase() === col);
          return norm(key ? src[key] : "");
        };
        const errors: string[] = [];

        const { kind, block: kindBlock } = parseKind(get("imtihon_turi"));
        if (!kind) errors.push("imtihon_turi noto'g'ri (dtm yoki milliy)");

        const match = kind ? findSubject(kind, kindBlock, get("fan")) : null;
        if (kind && !match) errors.push(`fan topilmadi: "${get("fan")}"`);
        const block = kind === "dtm" ? (kindBlock ?? match?.block ?? "main1") : null;

        const ballRaw = get("ball");
        const points = ballRaw
          ? Number(ballRaw.replace(",", "."))
          : defaultPointsFor(kind ?? "dtm", block);
        if (!(points > 0)) errors.push("ball noto'g'ri");

        const optionCells = OPTION_COLUMNS.map(get);
        const filledOptions = optionCells.filter((o) => o);
        const groupId = get("group_id") || null;
        const groupIntroRaw = get("group_intro");

        // Avval Exceldagi aniq "savol_turi" ustuniga qaraymiz. Bo'sh/tanilmagan
        // bo'lsa — eski avtomatik aniqlash mantig'iga qaytamiz.
        const savolTuriRaw = get("savol_turi").toLowerCase().replace(/\s+/g, "_");
        const explicitType = SAVOL_TURI_MAP[savolTuriRaw];

        let questionType: QuestionType;
        if (explicitType) {
          questionType = explicitType;
        } else if (filledOptions.length === 0) {
          questionType = "ochiq";
        } else if (optionCells[4] || optionCells[5]) {
          questionType = "moslashtirish";
        } else if (filledOptions.length === 4) {
          questionType = "yopiq";
        } else {
          errors.push("variantlar soni noto'g'ri (4 ta yoki 5-6 ta bo'lishi kerak)");
          questionType = "yopiq";
        }

        if (!get("savol_matni")) errors.push("savol_matni bo'sh");

        const rawAnswer = get("togri_javob");
        // Esse turida to'g'ri javob shart emas (baholash qo'lda bo'ladi).
        if (!rawAnswer && questionType !== "esse") errors.push("togri_javob bo'sh");

        let correctIndex: number | null = null;
        if (questionType === "yopiq") {
          correctIndex = parseAnswerLetter(rawAnswer, 4);
          if (correctIndex === null) errors.push("togri_javob noto'g'ri (A/B/C/D)");
        } else if (questionType === "moslashtirish") {
          correctIndex = parseAnswerLetter(rawAnswer, filledOptions.length);
          if (correctIndex === null) {
            errors.push(`togri_javob noto'g'ri (A-${LETTERS[filledOptions.length - 1] ?? "F"})`);
          }
        }

        const text = await renderTextWithLatexMarkers(stripLeadingNumber(get("savol_matni")));
        const options = await Promise.all(filledOptions.map((o) => renderTextWithLatexMarkers(o)));
        const answerText =
          (questionType === "ochiq" || questionType === "esse") && rawAnswer
            ? await renderTextWithLatexMarkers(rawAnswer)
            : "";
        const groupIntro = groupId
          ? await renderTextWithLatexMarkers(
              groupIntroRaw ? stripLeadingNumber(groupIntroRaw) : get("savol_matni")
            )
          : null;
        const solutionRaw = get("yechim");
        const solution = solutionRaw ? await renderTextWithLatexMarkers(solutionRaw) : "";
        const passageRaw = get("asosiy_matn");
        const passageText = passageRaw ? await renderTextWithLatexMarkers(passageRaw) : "";
        const bolimRaw = get("bolim").toLowerCase().trim();
        const examCategory: "original" | "mashq" = bolimRaw === "mashq" ? "mashq" : "original";
        const examLabel = get("imtihon_sanasi");
        if (kind === "milliy" && examCategory === "original" && !examLabel) {
          errors.push("imtihon_sanasi bo'sh (original savol uchun majburiy, masalan 01.04.2024)");
        }

        prepared.push({
          rowNumber: i + 2,
          errors,
          kind: kind ?? "dtm",
          block,
          subjectId: match?.subject.id ?? get("fan"),
          subjectName: match?.subject.name ?? get("fan"),
          points,
          text,
          questionType,
          options,
          correctIndex: correctIndex ?? 0,
          answerText,
          solution,
          passageText,
          examCategory,
          examLabel,
          groupId,
          groupIntro,
        });
      }
      setRows(prepared);
    } catch (e) {
      toast.error("Faylni o'qishda xatolik: " + (e instanceof Error ? e.message : String(e)));
      reset();
    } finally {
      setParsing(false);
    }
  };

  const valid = (rows ?? []).filter((r) => r.errors.length === 0);
  const invalid = (rows ?? []).filter((r) => r.errors.length > 0);

  const doImport = async () => {
    if (valid.length === 0) return;
    setImporting(true);
    let ok = 0;
    const failed: number[] = [];
    for (const r of valid) {
      try {
        await questionsRepo.add({
          text: r.text,
          subjectId: r.subjectId,
          kind: r.kind,
          block: r.block,
          points: r.points,
          questionType: r.questionType,
          options: r.questionType === "yopiq" || r.questionType === "moslashtirish" ? r.options : [],
          correctIndex:
            r.questionType === "yopiq" || r.questionType === "moslashtirish" ? r.correctIndex : undefined,
          answerText:
            r.questionType === "ochiq" || r.questionType === "esse" ? r.answerText : undefined,
          solution: r.solution || undefined,
          passageText: r.passageText || undefined,
          examCategory: r.kind === "milliy" ? r.examCategory : undefined,
          examLabel: r.kind === "milliy" && r.examCategory === "original" ? r.examLabel : null,
          groupId: r.groupId,
          groupIntro: r.groupIntro,
        });
        ok++;
      } catch {
        failed.push(r.rowNumber);
      }
    }
    setImporting(false);
    if (ok > 0) toast.success(`${ok} ta savol qo'shildi`);
    if (failed.length) toast.error(`${failed.length} ta qator saqlanmadi (${failed.join(", ")})`);
    reset();
    setOpen(false);
    onImported();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ALL_COLUMNS,
      [
        "dtm-majburiy",
        "Ona tili",
        "1.1",
        "Quyidagi ifodani soddalashtiring: [[LATEX: x^2+y^2]]",
        "[[LATEX: x+y]]",
        "2xy",
        "x-y",
        "0",
        "",
        "",
        "A",
        "",
        "",
        "yopiq",
        "",
        "",
        "",
        "",
      ],
      [
        "milliy",
        "Matematika",
        "2.7",
        "33. Ikkala konuslar hajmlari yig'indisi shar hajmidan necha marta kichik?",
        "2",
        "1,5",
        "4,(6)",
        "7",
        "3",
        "6,(6)",
        "B",
        "33-35",
        "Rasmda asos radiusi 3 sm va balandligi 14 sm bo'lgan silindr ichiga...",
        "moslashtirish",
        "",
        "",
        "original",
        "01.04.2024",
      ],
      [
        "milliy",
        "Kimyo",
        "1.5",
        "36. 5,6 l (n.sh.) metan to'liq yonganda hosil bo'lgan CO2 massasini (g) toping.",
        "",
        "",
        "",
        "",
        "11",
        "",
        "",
        "36",
        "",
        "ochiq_bitta",
        "",
        "",
        "original",
        "01.04.2024",
      ],
      [
        "milliy",
        "Kimyo",
        "2.5",
        "41. 200 g 20% li tuz eritmasiga 50 g suv qo'shildi. Yangi konsentratsiyani toping.",
        "",
        "",
        "",
        "",
        "16%",
        "",
        "",
        "41",
        "",
        "yozma",
        "Tuz massasi: 200*0,2=40 g. Yangi eritma massasi 250 g. 40/250*100%=16%",
        "",
        "original",
        "01.04.2024",
      ],
      [
        "milliy",
        "Ona tili va adabiyot",
        "5",
        "45. \"Vatanni sevmoq — iymondandir\" mavzusida esse yozing (kamida 150 so'z).",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "45",
        "",
        "esse",
        "Baholash mezoni: mavzuga mosligi, mantiqiylik, savodxonlik, hajm.",
        "",
        "original",
        "01.04.2024",
      ],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "savollar");
    XLSX.writeFile(wb, "intil-savollar-shablon.xlsx");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Excel/CSV import
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto border-border sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ko'plab savol qo'shish (Excel / CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-border p-4 text-sm">
            <p className="text-muted-foreground">
              Ustunlar: <span className="text-foreground">{ALL_COLUMNS.join(", ")}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Formulalar <code className="text-foreground">[[LATEX: x^2+y^2]]</code> ko'rinishida
              yoziladi. Ochiq savollar uchun variant ustunlarini bo'sh qoldiring. Moslashtirish
              turidagi savollar (masalan 33-35) uchun <code className="text-foreground">variant_e</code>,{" "}
              <code className="text-foreground">variant_f</code> ustunlarini ham to'ldiring va bir xil{" "}
              <code className="text-foreground">group_id</code> bering (masalan "33-35"). Bir savolning
              ikki qismini (36-a, 36-b) bitta ekranda ko'rsatish uchun ham bir xil{" "}
              <code className="text-foreground">group_id</code> bering (masalan "36"). Savol matni
              boshidagi raqam avtomatik olib tashlanadi.
            </p>
            <p className="mt-2 text-muted-foreground">
              <span className="text-foreground">savol_turi</span> ustuni ixtiyoriy — aniq belgilash
              uchun: <code className="text-foreground">yopiq</code>,{" "}
              <code className="text-foreground">moslashtirish</code>,{" "}
              <code className="text-foreground">ochiq_bitta</code>,{" "}
              <code className="text-foreground">yozma</code>,{" "}
              <code className="text-foreground">esse</code>. Bo'sh qoldirilsa, tur variant/javob
              ustunlariga qarab avtomatik aniqlanadi. <span className="text-foreground">yechim</span>{" "}
              — to'liq yozma yechim (Fizika/Kimyo/Biologiya "yozma" savollar uchun).{" "}
              <span className="text-foreground">asosiy_matn</span> — Ona tilida tahlil/esse uchun
              o'qish parchasi. <span className="text-foreground">bolim</span> — Milliy Sertifikat
              savollari uchun <code className="text-foreground">original</code> (haqiqiy imtihondan)
              yoki <code className="text-foreground">mashq</code> (umumiy mashq banki). Bo'sh
              qoldirilsa <code className="text-foreground">original</code> deb olinadi.{" "}
              <span className="text-foreground">imtihon_sanasi</span> — original savollar uchun
              majburiy, imtihon sanasi/nomi (masalan <code className="text-foreground">01.04.2024</code>
              ). Bir xil faylda bitta sanaga oid barcha savollarga aynan bir xil matn yozing.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
                <FileSpreadsheet className="mr-2 h-3.5 w-3.5" /> Fayl tanlash
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
              <Button size="sm" variant="ghost" onClick={downloadTemplate}>
                Shablonni yuklab olish
              </Button>
              {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
            </div>
          </div>

          {parsing && (
            <div className="text-sm text-muted-foreground">Fayl o'qilmoqda...</div>
          )}

          {rows && rows.length > 0 && (
            <>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" /> Tayyor: {valid.length}
                </span>
                {invalid.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <AlertTriangle className="h-4 w-4" /> Xatolik: {invalid.length}
                  </span>
                )}
              </div>

              {invalid.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300">
                  {invalid.map((r) => (
                    <li key={r.rowNumber}>
                      {r.rowNumber}-qator: {r.errors.join("; ")}
                    </li>
                  ))}
                </ul>
              )}

              <div className="max-h-72 space-y-3 overflow-y-auto">
                {rows.slice(0, 30).map((r) => (
                  <div
                    key={r.rowNumber}
                    className={
                      "rounded-xl border p-3 text-sm " +
                      (r.errors.length ? "border-rose-500/40" : "border-border")
                    }
                  >
                    <div className="mb-1 text-xs text-muted-foreground">
                      {r.rowNumber}-qator · {r.kind === "dtm" ? "DTM" : "Milliy"} ·{" "}
                      {r.subjectName} · {r.points} ball ·{" "}
                      {r.questionType === "esse"
                        ? "Esse"
                        : r.questionType === "ochiq"
                          ? "Ochiq"
                          : r.questionType === "moslashtirish"
                            ? "Moslashtirish"
                            : "Yopiq"}
                      {r.kind === "milliy"
                        ? ` · ${r.examCategory === "mashq" ? "Mashq" : `Original: ${r.examLabel}`}`
                        : ""}
                      {r.groupId ? ` · Guruh: ${r.groupId}` : ""}
                    </div>
                    <MathContent latex={r.text} />
                    {r.questionType === "ochiq" || r.questionType === "esse" ? (
                      <>
                        {r.answerText && (
                          <div className="mt-2 rounded-md bg-emerald-500/15 px-2 py-1 text-xs">
                            <span className="mr-1 font-semibold">Javob:</span>
                            <MathContent latex={r.answerText} inline />
                          </div>
                        )}
                        {r.solution && (
                          <div className="mt-2 rounded-md bg-muted/50 px-2 py-1 text-xs">
                            <span className="mr-1 font-semibold">Yechim:</span>
                            <MathContent latex={r.solution} inline />
                          </div>
                        )}
                      </>
                    ) : (
                      <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                        {r.options.map((o, i) => (
                          <li
                            key={i}
                            className={
                              "rounded-md px-2 py-1 text-xs " +
                              (i === r.correctIndex ? "bg-emerald-500/15" : "bg-muted/50")
                            }
                          >
                            <span className="mr-1 font-semibold">{LETTERS[i]}.</span>
                            <MathContent latex={o} inline />
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
                {rows.length > 30 && (
                  <div className="text-xs text-muted-foreground">
                    ...va yana {rows.length - 30} ta qator
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={reset} disabled={importing}>
                  Tozalash
                </Button>
                <Button
                  className="gradient-bg text-primary-foreground"
                  onClick={doImport}
                  disabled={importing || valid.length === 0}
                >
                  {importing ? "Yuklanmoqda..." : `${valid.length} ta savolni qo'shish`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
