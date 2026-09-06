import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Timer } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, SectionHeader, Skeleton } from "@/components/intil/ui";
import { cn } from "@/lib/utils";
import {
  BANK_CATEGORIES,
  BANK_SUBJECTS,
  questionsRepo,
  type Question,
} from "@/lib/domain";

export const Route = createFileRoute("/savollar-banki/")({
  component: () => (
    <ProtectedRoute>
      <SavollarBankiPage />
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Savollar banki — INTIL" },
      {
        name: "description",
        content: "Mavzu bo'yicha savollarni tanlang va o'zingizga mos mashq sessiyasini boshlang.",
      },
    ],
  }),
});

const VOLUMES = [10, 20, 30, 40, 50] as const;
type Volume = (typeof VOLUMES)[number] | "all";

function SavollarBankiPage() {
  const navigate = useNavigate();
  const [subjectId, setSubjectId] = useState<string>(
    () => BANK_SUBJECTS.find((s) => s.live)?.id ?? BANK_SUBJECTS[0].id,
  );
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState<Volume>("all");
  const [mode, setMode] = useState<"timed" | "untimed">("timed");

  const subject = BANK_SUBJECTS.find((s) => s.id === subjectId) ?? BANK_SUBJECTS[0];
  const categories = BANK_CATEGORIES[subjectId] ?? [];

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        setQuestions(rows);
      })
      .catch(() => alive && setQuestions([]));
    return () => {
      alive = false;
    };
  }, []);

  // Fan almashganda mavzu tanlovini shu fanning barcha mavzulariga qaytaramiz.
  useEffect(() => {
    setSelected(new Set(categories.map((c) => c.id)));
  }, [subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const subjectPool = useMemo(
    () => (questions ?? []).filter((q) => q.kind === "bank" && q.subjectId === subjectId),
    [questions, subjectId],
  );

  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of subjectPool) {
      const key = q.category ?? "boshqa";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [subjectPool]);

  const totalAvailable = subjectPool.length;
  const selectedCount = subjectPool.filter((q) => selected.has(q.category ?? "boshqa")).length;

  const toggleCategory = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startSession = () => {
    if (selectedCount === 0) return;
    const cats = categories.filter((c) => selected.has(c.id)).map((c) => c.id);
    navigate({
      to: "/savollar-banki/mashq",
      search: {
        subject: subjectId,
        categories: cats.join(","),
        mode,
        volume: volume === "all" ? "all" : String(volume),
      },
    });
  };

  return (
    <AppShell breadcrumb={[{ label: "INTIL", to: "/dashboard" }, { label: "Savollar banki" }]}>
      <header className="rise">
        <p className="eyebrow">Mashq bazasi</p>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[40px]">
          Savollar banki
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Fanni va mavzularni tanlang, sessiya hajmini belgilang va mashq qilishni boshlang.
        </p>
      </header>

      <section className="mt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {BANK_SUBJECTS.map((s) => {
            const active = s.id === subjectId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-obsidian bg-obsidian text-ivory"
                    : "border-hairline bg-card text-ink-soft hover:border-gold/40 hover:text-ink",
                )}
              >
                <s.icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                {s.name}
                {!s.live && (
                  <span className="rounded-full bg-obsidian/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">
                    Tez orada
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {!subject.live ? (
        <section className="mt-10">
          <EmptyState
            title={`${subject.name} bo'yicha savollar banki tayyorlanmoqda.`}
            description="Hozircha faqat Fizika fani bo'yicha savollar banki ochiq. Boshqa fanlar tez orada qo'shiladi."
          />
        </section>
      ) : (
        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionHeader
              eyebrow="Mavzularni tanlang"
              title={subject.name}
              description={
                questions === null
                  ? "Savollar yuklanmoqda..."
                  : `${totalAvailable} ta savol mavjud`
              }
            />

            {questions === null ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[64px] rounded-2xl" />
                ))}
              </div>
            ) : totalAvailable === 0 ? (
              <EmptyState
                className="mt-4"
                title="Bu fan uchun savollar hali qo'shilmagan."
                description="Savol bazasi to'ldirilgach, mavzular shu yerda paydo bo'ladi."
              />
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-hairline">
                {categories.map((cat) => {
                  const count = countsByCategory[cat.id] ?? 0;
                  const checked = selected.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      disabled={count === 0}
                      className="flex w-full items-center justify-between gap-4 border-b border-hairline bg-card px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                            checked
                              ? "border-obsidian bg-obsidian text-ivory"
                              : "border-hairline bg-card",
                          )}
                        >
                          {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        </span>
                        <span className="text-[15px] font-medium text-ink">{cat.name}</span>
                      </span>
                      <span className="tabnum text-sm text-ink-soft">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:pt-[52px]">
            <div className="rounded-2xl border border-hairline bg-card p-5">
              <p className="eyebrow">Rejim</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("timed")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    mode === "timed"
                      ? "border-obsidian bg-obsidian text-ivory"
                      : "border-hairline text-ink-soft hover:border-gold/40 hover:text-ink",
                  )}
                >
                  <Timer className="h-4 w-4" strokeWidth={1.8} /> Vaqtli
                </button>
                <button
                  type="button"
                  onClick={() => setMode("untimed")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    mode === "untimed"
                      ? "border-obsidian bg-obsidian text-ivory"
                      : "border-hairline text-ink-soft hover:border-gold/40 hover:text-ink",
                  )}
                >
                  <Clock3 className="h-4 w-4" strokeWidth={1.8} /> Vaqtsiz
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {mode === "timed"
                  ? "Har bir savolga taxminan 1,5 daqiqa vaqt beriladi."
                  : "Vaqt chegarasi yo'q — o'z tezligingizda ishlang."}
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-5">
              <p className="eyebrow">Savollar soni</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {VOLUMES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVolume(v)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      volume === v
                        ? "border-obsidian bg-obsidian text-ivory"
                        : "border-hairline text-ink-soft hover:border-gold/40 hover:text-ink",
                    )}
                  >
                    {v}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setVolume("all")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    volume === "all"
                      ? "border-obsidian bg-obsidian text-ivory"
                      : "border-hairline text-ink-soft hover:border-gold/40 hover:text-ink",
                  )}
                >
                  Hammasi
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={startSession}
              disabled={selectedCount === 0}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-obsidian text-[15px] font-medium text-ivory transition-colors hover:bg-obsidian-soft disabled:cursor-not-allowed disabled:opacity-45"
            >
              Mashqni boshlash{selectedCount > 0 ? ` (${selectedCount} savol)` : ""}
            </button>
          </aside>
        </section>
      )}
    </AppShell>
  );
}
