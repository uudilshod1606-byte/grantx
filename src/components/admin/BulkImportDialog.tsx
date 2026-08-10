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

const COLUMNS = [
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

type PreparedRow = {
  rowNumber: number;
  errors: string[];
  kind: ExamKind;
  block: DtmBlock | null;
  subjectId: string;
  subjectName: string;
  points: number;
  text: string;
  questionType: "yopiq" | "ochiq";
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  answerText: string;
};

function norm(v: unknown) {
  return String(v ?? "").trim();
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

function parseAnswer(raw: string): 0 | 1 | 2 | 3 | null {
  const v = raw.toLowerCase().trim();
  const idx = ["a", "b", "c", "d"].indexOf(v);
  if (idx >= 0) return idx as 0 | 1 | 2 | 3;
  const n = Number(v);
  if (n >= 1 && n <= 4) return (n - 1) as 0 | 1 | 2 | 3;
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
      const missing = COLUMNS.filter((c) => !headers.includes(c));
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

        const optionCells = ["variant_a", "variant_b", "variant_c", "variant_d"].map(get);
        const filledCount = optionCells.filter((o) => o).length;
        const isOpenQuestion = filledCount === 0;

        if (!isOpenQuestion && filledCount < 4) errors.push("barcha variantlar to'ldirilmagan");
        if (!get("savol_matni")) errors.push("savol_matni bo'sh");

        const rawAnswer = get("togri_javob");
        if (!rawAnswer) errors.push("togri_javob bo'sh");

        let correctIndex: 0 | 1 | 2 | 3 | null = null;
        if (!isOpenQuestion) {
          correctIndex = parseAnswer(rawAnswer);
          if (correctIndex === null) errors.push("togri_javob noto'g'ri (A/B/C/D)");
        }

        // Formulalar aynan admin paneldagi funksiya orqali HTML'ga aylantiriladi.
        const text = await renderTextWithLatexMarkers(get("savol_matni"));
        const options = (await Promise.all(
          optionCells.map((o) => renderTextWithLatexMarkers(o)),
        )) as [string, string, string, string];
        const answerText = isOpenQuestion && rawAnswer
          ? await renderTextWithLatexMarkers(rawAnswer)
          : "";

        prepared.push({
          rowNumber: i + 2,
          errors,
          kind: kind ?? "dtm",
          block,
          subjectId: match?.subject.id ?? get("fan"),
          subjectName: match?.subject.name ?? get("fan"),
          points,
          text,
          questionType: isOpenQuestion ? "ochiq" : "yopiq",
          options,
          correctIndex: correctIndex ?? 0,
          answerText,
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
          options: r.questionType === "ochiq" ? [] : r.options,
          correctIndex: r.questionType === "ochiq" ? undefined : r.correctIndex,
          answerText: r.questionType === "ochiq" ? r.answerText : undefined,
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
      [...COLUMNS],
      [
        "dtm-majburiy",
        "Ona tili",
        "1.1",
        "Quyidagi ifodani soddalashtiring: [[LATEX: x^2+y^2]]",
        "[[LATEX: x+y]]",
        "2xy",
        "x-y",
        "0",
        "A",
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
              Ustunlar: <span className="text-foreground">{COLUMNS.join(", ")}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Formulalar <code className="text-foreground">[[LATEX: x^2+y^2]]</code> ko'rinishida
              yoziladi — import paytida ular avtomatik formulaga aylantiriladi. Ochiq (yozma
              javob) savollar uchun variant ustunlarini bo'sh qoldiring, javobni to'g'ridan-to'g'ri
              "togri_javob" ustuniga yozing.
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
                      {r.subjectName} · {r.points} ball · {r.questionType === "ochiq" ? "Ochiq" : "Yopiq"}
                    </div>
                    <MathContent latex={r.text} />
                    {r.questionType === "ochiq" ? (
                      <div className="mt-2 rounded-md bg-emerald-500/15 px-2 py-1 text-xs">
                        <span className="mr-1 font-semibold">Javob:</span>
                        <MathContent latex={r.answerText} inline />
                      </div>
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
                            <span className="mr-1 font-semibold">
                              {["A", "B", "C", "D"][i]}.
                            </span>
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
