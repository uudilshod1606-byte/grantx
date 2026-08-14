import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, SectionHeader, Skeleton } from "@/components/intil/ui";
import { questionsRepo, type Question } from "@/lib/domain";
import { MILLIY_SUBJECTS as SUBJECTS } from "@/lib/milliy";

export const Route = createFileRoute("/milliy-sertifikat/$subjectId")({
  component: () => (
    <ProtectedRoute>
      <MilliySubjectPage />
    </ProtectedRoute>
  ),
  head: ({ params }) => {
    const name = SUBJECTS[params.subjectId]?.name ?? "Milliy sertifikat";
    const title = `${name} — Milliy sertifikat · INTIL`;
    const description = `${name} fanidan haqiqiy imtihon savollari va tayyorgarlik mashqlari.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

const LEGACY_LABEL = "Imtihon 1";

type ExamGroup = {
  label: string;
  count: number;
};

function parseDateLabel(value: string) {
  const match = value.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
  if (!match) return null;
  const [, day, month, rawYear] = match;
  const year = rawYear.length === 2 ? Number(rawYear) + 2000 : Number(rawYear);
  const date = new Date(year, Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

/** Dates newest-first; labels without a date stay in stable alphabetical order. */
function compareLabelsDesc(a: string, b: string) {
  const da = parseDateLabel(a);
  const db = parseDateLabel(b);
  if (da != null && db != null) return db - da;
  if (da != null) return -1;
  if (db != null) return 1;
  return a.localeCompare(b, "uz");
}

function groupByExamLabel(rows: Question[], category: "original" | "mashq") {
  const map = new Map<string, number>();
  for (const q of rows) {
    if (q.examCategory !== category) continue;
    const label = q.examLabel?.trim() || (category === "original" ? LEGACY_LABEL : "Mashq");
    map.set(label, (map.get(label) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => compareLabelsDesc(a.label, b.label));
}

function ExamCard({
  subjectId,
  group,
  category,
  index,
}: {
  subjectId: string;
  group: ExamGroup;
  category: "original" | "mashq";
  index: number;
}) {
  const isOriginal = category === "original";
  const examId = isOriginal ? group.label : `mashq-${group.label}`;

  return (
    <Link
      to="/imtihon/$subjectId/$examId"
      params={{ subjectId, examId }}
      className="group relative flex aspect-square min-h-[220px] flex-col overflow-hidden rounded-[24px] border border-hairline bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[var(--shadow-lift)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-ivory tabnum text-sm font-semibold text-ink transition-colors group-hover:border-gold/45 group-hover:text-gold-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-medium text-ink-soft">
          {isOriginal ? "Original" : "Mashq"}
        </span>
      </div>

      <div className="mt-auto">
        <p className="eyebrow">{isOriginal ? "Haqiqiy imtihon" : "Tayyorgarlik"}</p>
        <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[25px]">
          {group.label}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          {isOriginal ? "Milliy sertifikat imtihonida tushgan savollar" : "Mashq varianti"}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
          <span className="text-[13px] text-ink-soft">Boshlash</span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-obsidian">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function MilliySubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECTS[subjectId];
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "mashq">("original");

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        setQuestions(rows.filter((q) => q.kind === "milliy" && q.subjectId === subjectId));
      })
      .catch(() => alive && setQuestions([]));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  const originalGroups = useMemo(
    () => (questions ? groupByExamLabel(questions, "original") : []),
    [questions],
  );
  const mashqGroups = useMemo(
    () => (questions ? groupByExamLabel(questions, "mashq") : []),
    [questions],
  );

  const groups = activeTab === "original" ? originalGroups : mashqGroups;

  if (!subject) {
    return (
      <AppShell
        breadcrumb={[{ label: "Milliy sertifikat", to: "/milliy-sertifikat" }, { label: "Topilmadi" }]}
      >
        <EmptyState
          title="Bunday fan topilmadi."
          description="Manzil noto'g'ri bo'lishi mumkin. Fanlar ro'yxatiga qaytib, kerakli yo'nalishni tanlang."
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumb={[
        { label: "Milliy sertifikat", to: "/milliy-sertifikat" },
        { label: subject.name },
      ]}
    >
      <header className="rise">
        <p className="eyebrow">Milliy sertifikat · {subject.name}</p>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[40px]">
          Imtihonlar
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Haqiqiy imtihon savollarini sana bo'yicha tanlang yoki mashq variantlari bilan tayyorlaning.
        </p>
      </header>

      <section className="mt-10">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-hairline pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("original")}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "original"
                ? "bg-obsidian text-ivory"
                : "text-ink-soft hover:bg-ivory hover:text-ink"
            }`}
          >
            Original savollar
            <span className="ml-2 opacity-60">{originalGroups.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mashq")}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "mashq"
                ? "bg-obsidian text-ivory"
                : "text-ink-soft hover:bg-ivory hover:text-ink"
            }`}
          >
            Mashq savollari
            <span className="ml-2 opacity-60">{mashqGroups.length}</span>
          </button>
        </div>

        <div className="mt-8">
          <SectionHeader
            eyebrow={activeTab === "original" ? "Original savollar" : "Mashq savollari"}
            title={activeTab === "original" ? "Haqiqiy imtihonlar" : "Mashq variantlari"}
            description={
              activeTab === "original"
                ? "Har bir karta — ma'lum sanada o'tkazilgan haqiqiy Milliy sertifikat imtihoni."
                : "Har bir karta — alohida mashq varianti."
            }
          />

          {questions === null ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="aspect-square min-h-[220px] rounded-[24px]" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              className="mt-4"
              title={
                activeTab === "original"
                  ? "Original imtihonlar hali qo'shilmagan."
                  : "Mashq variantlari hali qo'shilmagan."
              }
              description="Savol bazasi to'ldirilgach, kartalar shu yerda avtomatik paydo bo'ladi."
            />
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((group, index) => (
                <ExamCard
                  key={group.label}
                  subjectId={subjectId}
                  group={group}
                  category={activeTab}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
