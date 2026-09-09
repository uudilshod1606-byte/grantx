import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/domain";
import { getGeminiApiKey } from "@/lib/gemini-key.functions";
import { evaluateEssay, evaluateWrittenQuestion } from "@/lib/written-ai";
import { writtenRepo, type CriterionScore, type WrittenSubmission } from "@/lib/written-submissions";
import { ESSAY_CRITERIA } from "@/lib/exam-scoring";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/yozma-ishlar")({
  component: () => (
    <ProtectedRoute adminOnly>
      <WrittenAdminPage />
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Yozma ishlarni baholash — INTIL Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function WrittenAdminPage() {
  const { user } = useAuth();
  const admin = isAdminEmail(user?.email);
  const [rows, setRows] = useState<WrittenSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<CriterionScore[]>([]);
  const [writtenScore, setWrittenScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const next = await writtenRepo.listAll();
      setRows(next);
      if (!selectedId) {
        const first = next.find((r) => r.status === "pending");
        if (first) setSelectedId(first.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yozma ishlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    if (selected.submissionKind === "esse") {
      setCriteria(selected.aiSuggestion?.criteria ?? selected.approvedCriteria ?? ESSAY_CRITERIA.map((c) => ({ id: c.id, name: c.name, score: 0, errors: [] })));
    } else {
      setWrittenScore(selected.aiSuggestion?.score ?? selected.approvedScore ?? 0);
    }
  }, [selectedId, rows]);

  if (!admin) {
    return <div className="min-h-screen p-10 text-center">Ruxsat yo'q</div>;
  }

  const generateAi = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const apiKeys = await getGeminiApiKey();
      const apiKey = apiKeys[0];
      if (selected.submissionKind === "esse") {
        const ai = await evaluateEssay({
          apiKey,
          essay: selected.answerText,
          promptText: selected.questionText,
        });
        await writtenRepo.saveAiSuggestion(selected.id, ai);
        setCriteria(ai.criteria);
      } else {
        const ai = await evaluateWrittenQuestion({
          apiKey,
          questionText: selected.questionText,
          referenceAnswer: selected.aiSuggestion?.comment || undefined,
          studentAnswer: selected.answerText,
          maxPoints: selected.maxPoints || 25,
        });
        await writtenRepo.saveAiSuggestion(selected.id, ai);
        setWrittenScore(ai.score);
      }
      await refresh();
      toast.success("AI taklifi tayyor. Endi admin sifatida tekshirib tasdiqlang.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI baholashda xatolik");
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await writtenRepo.approve(selected, {
        criteria: selected.submissionKind === "esse" ? criteria : undefined,
        score: selected.submissionKind === "yozma" ? Math.max(0, Math.min(selected.maxPoints, writtenScore)) : undefined,
        siblings: rows,
      });
      toast.success("Yozma ish tasdiqlandi va hisoblash jarayoniga qo'shildi.");
      setSelectedId(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tasdiqlashda xatolik");
    } finally {
      setBusy(false);
    }
  };

  const updateCriterion = (index: number, patch: Partial<CriterionScore>) => {
    setCriteria((prev) => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <div className="font-semibold">Yozma ishlarni baholash</div>
              <div className="text-xs text-muted-foreground">AI taklifi → admin tekshiruvi → tasdiq → yakuniy natija</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" /> Yangilash</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Tekshirishni kutmoqda" value={pending.length} icon={Clock3} />
          <Stat label="Jami ishlar" value={rows.length} icon={Sparkles} />
          <Stat label="Tasdiqlangan" value={rows.filter((r) => r.status === "approved").length} icon={CheckCircle2} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-3">
            <h2 className="px-2 pb-3 text-sm font-semibold">Kutilayotgan ishlar ({pending.length})</h2>
            <div className="space-y-2">
              {pending.length === 0 ? (
                <div className="rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">Hozircha tekshiriladigan ish yo'q.</div>
              ) : pending.map((row) => (
                <button key={row.id} onClick={() => setSelectedId(row.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === row.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{row.userName || row.userEmail || "Talaba"}</span>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700">Kutilmoqda</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{row.subjectName} · {row.submissionKind === "esse" ? "45-esse" : `${row.questionNumber}-savol`}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString("uz-UZ")}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-border bg-card p-5">
            {!selected ? (
              <div className="flex min-h-[500px] items-center justify-center text-center text-muted-foreground">Chapdan ish tanlang.</div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{selected.subjectName} · {selected.examLabel || "Mashq"}</div>
                    <h1 className="mt-1 text-xl font-semibold">{selected.submissionKind === "esse" ? "45-savol — Esse" : `${selected.questionNumber}-savol — Yozma ish`}</h1>
                    <div className="mt-1 text-xs text-muted-foreground">{selected.userName || selected.userEmail}</div>
                  </div>
                  <Button onClick={() => void generateAi()} disabled={busy} variant="outline"><Sparkles className="mr-2 h-4 w-4" /> {busy ? "AI ishlayapti..." : "AI taklifini olish"}</Button>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Savol / mavzu</div>
                  <div className="whitespace-pre-wrap text-sm leading-6">{selected.questionText || "—"}</div>
                </div>
                <div className="mt-4 rounded-xl border border-border p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Talabaning to'liq javobi</div>
                  <div className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-7">{selected.answerText || "Javob kiritilmagan."}</div>
                </div>

                {selected.submissionKind === "esse" ? (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between"><h2 className="font-semibold">12 mezon</h2><span className="text-sm text-muted-foreground">Xom ball: {criteria.reduce((s, c) => s + Number(c.score || 0), 0).toFixed(1)} / 24</span></div>
                    {criteria.map((criterion, index) => (
                      <div key={criterion.id} className="rounded-xl border border-border p-4">
                        <div className="grid gap-3 md:grid-cols-[1fr_110px]">
                          <div>
                            <div className="font-medium">{criterion.name}</div>
                            {criterion.errors.length > 0 ? (
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-destructive">{criterion.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                            ) : <div className="mt-2 text-xs text-muted-foreground">AI aniq xato topmadi.</div>}
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Ball</label>
                            <select value={criterion.score} onChange={(e) => updateCriterion(index, { score: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                              {[0, 0.5, 1, 1.5, 2].map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-border p-4">
                    <div className="text-sm font-semibold">AI taklifi / admin balli</div>
                    <div className="mt-2 text-xs text-muted-foreground">Maksimal: {selected.maxPoints} ball</div>
                    <Input className="mt-3 max-w-[180px]" type="number" min={0} max={selected.maxPoints} step="0.5" value={writtenScore} onChange={(e) => setWrittenScore(Number(e.target.value))} />
                    {selected.aiSuggestion?.comment && <p className="mt-3 text-sm text-muted-foreground">{selected.aiSuggestion.comment}</p>}
                    {selected.aiSuggestion?.errors?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-destructive">{selected.aiSuggestion.errors.map((e, i) => <li key={i}>{e}</li>)}</ul> : null}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <div className="text-sm text-muted-foreground">Tasdiqlangandan keyin natija hisoblashga kiradi.</div>
                  <Button onClick={() => void approve()} disabled={busy} className="gradient-bg text-primary-foreground"><CheckCircle2 className="mr-2 h-4 w-4" /> Tasdiqlash</Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Clock3 }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4" /></div><div className="mt-2 text-2xl font-bold">{value}</div></div>;
}
