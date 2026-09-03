import { Fragment, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  extractQuestionsFromPdf,
  type ExtractedQuestion,
} from "@/lib/pdf-import-client";
import { useServerFn } from "@tanstack/react-start";
import { getGeminiApiKey } from "@/lib/gemini-key.functions";

import { renderTextWithLatexMarkers } from "@/components/math/formula";
import {
  ADMIN_SUBJECTS,
  defaultPointsFor,
  questionsRepo,
  type DtmBlock,
  type ExamKind,
} from "@/lib/domain";

const MAX_FILES = 10;
const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;
const NEEDS_REVIEW = "TEKSHIRISH KERAK";

type QuestionType = "yopiq" | "moslashtirish" | "ochiq" | "esse";

type Row = {
  id: string;
  fileName: string;
  selected: boolean;
  questionType: QuestionType;
  passageText: string;
  text: string;
  options: string[];
  answerLetter: string;
  answerText: string;
  solution: string;
  page: number | null;
  imageUrl: string;
  groupId: string | null;
  needsReview: boolean;
};

type FileState = {
  name: string;
  status: "kutmoqda" | "ishlanmoqda" | "tayyor" | "xato";
  message?: string;
  count?: number;
};

function mapType(raw: string, optionCount: number): QuestionType {
  const v = raw.replace(/[\s-]+/g, "_");
  if (v.startsWith("esse")) return "esse";
  if (v.startsWith("moslash")) return "moslashtirish";
  if (v.startsWith("ochiq") || v.startsWith("yozma")) return "ochiq";
  if (v.startsWith("yopiq")) return optionCount > 4 ? "moslashtirish" : "yopiq";
  if (optionCount === 0) return "ochiq";
  return optionCount > 4 ? "moslashtirish" : "yopiq";
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result ?? "");
      resolve(res.slice(res.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function PdfImportDialog({ onImported }: { onImported: () => void }) {
  const fetchGeminiKey = useServerFn(getGeminiApiKey);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<ExamKind>("milliy");
  const [block, setBlock] = useState<DtmBlock>("mandatory");
  const [subjectId, setSubjectId] = useState("matematika");
  const [examLabel, setExamLabel] = useState("");
  const [examCategory, setExamCategory] = useState<"original" | "mashq">("original");
  const [withImages, setWithImages] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [onlyReview, setOnlyReview] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const subjectPool =
    kind === "milliy"
      ? ADMIN_SUBJECTS.milliy
      : block === "mandatory"
        ? ADMIN_SUBJECTS.dtmMandatory
        : ADMIN_SUBJECTS.dtmMain;

  const subject = subjectPool.find((s) => s.id === subjectId) ?? subjectPool[0]!;

  const visible = useMemo(
    () => (onlyReview ? rows.filter((r) => r.needsReview) : rows),
    [rows, onlyReview],
  );
  const selectedCount = rows.filter((r) => r.selected).length;
  const reviewCount = rows.filter((r) => r.needsReview).length;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
    if (picked.length === 0) return toast.error("Faqat PDF fayllar");
    setFiles((prev) => {
      const merged = [...prev, ...picked].slice(0, MAX_FILES);
      if (prev.length + picked.length > MAX_FILES) {
        toast.warning(`Ko'pi bilan ${MAX_FILES} ta fayl`);
      }
      return merged;
    });
  };

  const reset = () => {
    setFiles([]);
    setRows([]);
    setFileStates([]);
    setOnlyReview(false);
    setExpanded(null);
  };

  const patch = (id: string, p: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const buildRows = (
    fileName: string,
    items: ExtractedQuestion[],
    pageImages: Record<number, string>,
  ): Row[] => {
    let groupSeq = 0;
    let lastPassage = "";
    let currentGroup: string | null = null;

    return items.map((q, i) => {
      const options = [
        q.variant_a,
        q.variant_b,
        q.variant_c,
        q.variant_d,
        q.variant_e,
        q.variant_f,
      ].filter((o) => o.trim().length > 0);
      const questionType = mapType(q.savol_turi, options.length);

      const passage = q.asosiy_matn.trim();
      if (passage) {
        if (passage !== lastPassage) {
          groupSeq++;
          currentGroup = `${fileName}-g${groupSeq}`;
          lastPassage = passage;
        }
      } else {
        lastPassage = "";
        currentGroup = null;
      }

      const needsReview =
        q.yechim.toUpperCase().includes(NEEDS_REVIEW) ||
        (!q.togri_javob && questionType !== "esse");

      return {
        id: `${fileName}-${i}`,
        fileName,
        selected: true,
        questionType,
        passageText: passage,
        text: q.savol_matni,
        options,
        answerLetter: q.togri_javob.trim().toUpperCase().slice(0, 1),
        answerText: q.togri_javob,
        solution: q.yechim,
        page: q.sahifa,
        imageUrl: (q.sahifa && pageImages[q.sahifa]) || "",
        groupId: currentGroup,
        needsReview,
      };
    });
  };

  const start = async () => {
    if (files.length === 0) return toast.error("Avval PDF fayl tanlang");
    if (kind === "milliy" && examCategory === "original" && !examLabel.trim()) {
      return toast.error("Imtihon sanasi/nomini kiriting");
    }
    setRunning(true);
    setRows([]);
    let apiKey: string;
    try {
      apiKey = await fetchGeminiKey({ data: undefined });
    } catch (e) {
      setRunning(false);
      toast.error(e instanceof Error ? e.message : "Gemini kaliti olinmadi");
      return;
    }
    setFileStates(files.map((f) => ({ name: f.name, status: "ishlanmoqda" })));

    const setState = (name: string, s: Partial<FileState>) =>
      setFileStates((prev) => prev.map((f) => (f.name === name ? { ...f, ...s } : f)));

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const [base64, images] = await Promise.all([
            toBase64(file),
            withImages
              ? import("@/lib/pdf-pages")
                  .then((m) => m.renderAndUploadPdfPages(file))
                  .catch((e) => {
                    console.error("Rasm chiqarish xatosi", e);
                    return [];
                  })
              : Promise.resolve([]),
          ]);
          const items = await extractQuestionsFromPdf({
            fileBase64: base64,
            mimeType: "application/pdf",
            apiKey,
          });
          const pageMap: Record<number, string> = {};
          for (const img of images) pageMap[img.page] = img.url;
          const built = buildRows(file.name, items, pageMap);
          setState(file.name, { status: "tayyor", count: built.length });
          return built;
        } catch (e) {
          setState(file.name, {
            status: "xato",
            message: e instanceof Error ? e.message : String(e),
          });
          return [] as Row[];
        }
      }),
    );

    setRows(results.flat());
    setRunning(false);
    const total = results.flat().length;
    if (total > 0) toast.success(`${total} ta savol ajratib olindi`);
    else toast.error("Hech qanday savol ajratilmadi");
  };

  const approve = async (targets: Row[]) => {
    if (targets.length === 0) return;
    setSaving(true);
    let ok = 0;
    const failed: string[] = [];
    for (const r of targets) {
      try {
        const isChoice = r.questionType === "yopiq" || r.questionType === "moslashtirish";
        const letterIndex = LETTERS.indexOf(r.answerLetter as (typeof LETTERS)[number]);
        const text = await renderTextWithLatexMarkers(r.text);
        const options = isChoice
          ? await Promise.all(r.options.map((o) => renderTextWithLatexMarkers(o)))
          : [];
        const answerText = !isChoice ? await renderTextWithLatexMarkers(r.answerText) : "";
        const solution = r.solution ? await renderTextWithLatexMarkers(r.solution) : "";
        const passageText = r.passageText
          ? await renderTextWithLatexMarkers(r.passageText)
          : "";

        await questionsRepo.add({
          text,
          subjectId: subject.id,
          kind,
          block: kind === "dtm" ? block : null,
          points: defaultPointsFor(kind, kind === "dtm" ? block : null),
          questionType: r.questionType,
          options,
          correctIndex: isChoice ? (letterIndex >= 0 ? letterIndex : 0) : undefined,
          answerText: !isChoice ? answerText : undefined,
          solution: solution || undefined,
          passageText: passageText || undefined,
          imageUrl: r.imageUrl || undefined,
          examCategory: kind === "milliy" ? examCategory : undefined,
          examLabel:
            kind === "milliy" && examCategory === "original" ? examLabel.trim() : null,
          groupId: r.groupId,
          groupIntro: r.groupId && passageText ? passageText : null,
        });
        ok++;
      } catch {
        failed.push(r.id);
      }
    }
    setSaving(false);
    if (ok > 0) toast.success(`${ok} ta savol bazaga qo'shildi`);
    if (failed.length) toast.error(`${failed.length} ta savol saqlanmadi`);
    setRows((prev) => prev.filter((r) => !targets.some((t) => t.id === r.id)));
    onImported();
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
          <FileText className="mr-2 h-4 w-4" /> PDF import
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-h-[92vh] overflow-y-auto border-border sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>PDF orqali ommaviy savol import qilish</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Sozlamalar */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Imtihon turi</label>
              <Select
                value={kind}
                onValueChange={(v) => {
                  const next = v as ExamKind;
                  setKind(next);
                  const pool =
                    next === "milliy"
                      ? ADMIN_SUBJECTS.milliy
                      : block === "mandatory"
                        ? ADMIN_SUBJECTS.dtmMandatory
                        : ADMIN_SUBJECTS.dtmMain;
                  setSubjectId(pool[0]!.id);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="milliy">Milliy Sertifikat</SelectItem>
                  <SelectItem value="dtm">DTM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {kind === "dtm" && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Blok</label>
                <Select
                  value={block}
                  onValueChange={(v) => {
                    const next = v as DtmBlock;
                    setBlock(next);
                    const pool =
                      next === "mandatory" ? ADMIN_SUBJECTS.dtmMandatory : ADMIN_SUBJECTS.dtmMain;
                    setSubjectId(pool[0]!.id);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandatory">Majburiy blok</SelectItem>
                    <SelectItem value="main1">1-asosiy blok</SelectItem>
                    <SelectItem value="main2">2-asosiy blok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Fan</label>
              <Select value={subject.id} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjectPool.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "milliy" && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Bo'lim</label>
                <Select
                  value={examCategory}
                  onValueChange={(v) => setExamCategory(v as "original" | "mashq")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original imtihon</SelectItem>
                    <SelectItem value="mashq">Mashq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {kind === "milliy" && examCategory === "original" && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Imtihon sanasi / nomi
                </label>
                <Input
                  value={examLabel}
                  onChange={(e) => setExamLabel(e.target.value)}
                  placeholder="01.04.2024"
                />
              </div>
            )}
          </div>

          {/* Fayl tanlash */}
          <div
            ref={dropRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="rounded-xl border border-dashed border-border p-4 text-sm"
          >
            <p className="text-muted-foreground">
              PDF fayllarni bu yerga tashlang yoki tanlang (ko'pi bilan {MAX_FILES} ta). Barcha
              fayllar bir vaqtda qayta ishlanadi.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
                <Upload className="mr-2 h-3.5 w-3.5" /> PDF tanlash
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={withImages}
                  onChange={(e) => setWithImages(e.target.checked)}
                />
                Sahifa rasmlarini ham chiqarish (kontrast oshirilgan)
              </label>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {files.map((f, i) => {
                  const st = fileStates.find((s) => s.name === f.name);
                  return (
                    <li key={f.name + i} className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                      {st?.status === "ishlanmoqda" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                      {st?.status === "tayyor" && (
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {st.count} ta savol
                        </span>
                      )}
                      {st?.status === "xato" && (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <XCircle className="h-3.5 w-3.5" /> {st.message}
                        </span>
                      )}
                      {!running && (
                        <button
                          type="button"
                          className="ml-auto text-muted-foreground hover:text-rose-400"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-3">
              <Button
                className="gradient-bg text-primary-foreground"
                onClick={start}
                disabled={running || files.length === 0}
              >
                {running ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Qayta ishlanmoqda...
                  </>
                ) : (
                  "Import boshlash"
                )}
              </Button>
            </div>
          </div>

          {/* Natijalar */}
          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">Jami: {rows.length}</span>
                {reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <AlertTriangle className="h-4 w-4" /> Tekshirish kerak: {reviewCount}
                  </span>
                )}
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={onlyReview}
                    onChange={(e) => setOnlyReview(e.target.checked)}
                  />
                  Faqat "TEKSHIRISH KERAK"
                </label>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() =>
                    setRows((prev) => prev.map((r) => ({ ...r, selected: true })))
                  }
                >
                  Hammasini belgilash
                </button>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() =>
                    setRows((prev) => prev.map((r) => ({ ...r, selected: false })))
                  }
                >
                  Belgilashni bekor qilish
                </button>
              </div>

              <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 w-8"></th>
                      <th className="px-3 py-2">Savol</th>
                      <th className="px-3 py-2">Fan</th>
                      <th className="px-3 py-2">Tur</th>
                      <th className="px-3 py-2">Javob</th>
                      <th className="px-3 py-2">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <Fragment key={r.id}>
                        <tr className="border-t border-border align-top">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={r.selected}
                              onChange={(e) => patch(r.id, { selected: e.target.checked })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="text-left hover:underline"
                              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                            >
                              {plain(r.text) ? (
                                <MarkerContent text={plain(r.text).slice(0, 220)} />
                              ) : (
                                "(bo'sh)"
                              )}
                            </button>

                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {r.fileName}
                              {r.page ? ` · ${r.page}-sahifa` : ""}
                              {r.groupId ? " · guruh" : ""}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs">{subject.name}</td>
                          <td className="px-3 py-2 text-xs">{r.questionType}</td>
                          <td className="px-3 py-2">
                            {r.questionType === "yopiq" || r.questionType === "moslashtirish" ? (
                              <Input
                                className="h-8 w-16"
                                value={r.answerLetter}
                                onChange={(e) =>
                                  patch(r.id, {
                                    answerLetter: e.target.value.toUpperCase().slice(0, 1),
                                    needsReview: !e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <div className="space-y-1">
                                <Input
                                  className="h-8"
                                  value={r.answerText}
                                  onChange={(e) =>
                                    patch(r.id, {
                                      answerText: e.target.value,
                                      needsReview: !e.target.value,
                                    })
                                  }
                                />
                                {r.answerText && (
                                  <div className="text-xs">
                                    <MarkerContent text={r.answerText} />
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-xs">
                            {r.needsReview ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-600">
                                <AlertTriangle className="h-3 w-3" /> Tekshirish
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Tayyor
                              </span>
                            )}
                          </td>
                        </tr>
                        {expanded === r.id && (
                          <tr className="border-t border-border bg-muted/30">
                            <td></td>
                            <td colSpan={5} className="space-y-2 px-3 py-3">
                              <div>
                                <label className="text-xs text-muted-foreground">Savol matni</label>
                                <Textarea
                                  rows={3}
                                  value={r.text}
                                  onChange={(e) => patch(r.id, { text: e.target.value })}
                                />
                              </div>
                              {r.passageText && (
                                <div>
                                  <label className="text-xs text-muted-foreground">
                                    Asosiy matn
                                  </label>
                                  <Textarea
                                    rows={2}
                                    value={r.passageText}
                                    onChange={(e) => patch(r.id, { passageText: e.target.value })}
                                  />
                                </div>
                              )}
                              {r.options.length > 0 && (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {r.options.map((o, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="w-4 text-xs font-semibold">{LETTERS[i]}</span>
                                      <Input
                                        value={o}
                                        onChange={(e) =>
                                          patch(r.id, {
                                            options: r.options.map((x, xi) =>
                                              xi === i ? e.target.value : x,
                                            ),
                                          })
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div>
                                <label className="text-xs text-muted-foreground">Yechim</label>
                                <Textarea
                                  rows={2}
                                  value={r.solution}
                                  onChange={(e) => patch(r.id, { solution: e.target.value })}
                                />
                              </div>
                              {r.imageUrl && (
                                <img
                                  src={r.imageUrl}
                                  alt={`${r.page}-sahifa rasmi`}
                                  className="max-h-64 rounded-lg border border-border"
                                  loading="lazy"
                                />
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={() => setRows([])} disabled={saving}>
                  Tozalash
                </Button>
                <Button
                  variant="outline"
                  onClick={() => approve(rows.filter((r) => r.selected))}
                  disabled={saving || selectedCount === 0}
                >
                  Tanlanganlarni tasdiqlash ({selectedCount})
                </Button>
                <Button
                  className="gradient-bg text-primary-foreground"
                  onClick={() => approve(rows)}
                  disabled={saving}
                >
                  {saving ? "Saqlanmoqda..." : `Hammasini tasdiqlash (${rows.length})`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
