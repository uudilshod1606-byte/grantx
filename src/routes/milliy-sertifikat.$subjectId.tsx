import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import {
  EmptyState,
  ExamModule,
  InfoTip,
  SectionHeader,
  Skeleton,
} from "@/components/intil/ui";
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
    const description = `${name} fanidan imtihon formatidagi variantlar va tayyorgarlik mashqlari.`;
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
const MASHQ_EXAM_ID = "mashq";

type OriginalGroup = {
  label: string;
  count: number;
};

/** "01.04.2024" kabi sanalarni haqiqiy sana sifatida solishtirib saralash;
 *  sana formatiga mos kelmasa oddiy matn sifatida saralanadi. */
function compareLabels(a: string, b: string): number {
  const parseDate = (s: string) => {
    const m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
    if (!m) return null;
    const [, d, mo, y] = m;
    const year = y.length === 2 ? Number(y) + 2000 : Number(y);
    return new Date(year, Number(mo) - 1, Number(d)).getTime();
  };
  const da = parseDate(a);
  const db = parseDate(b);
  if (da != null && db != null) return da - db;
  return a.localeCompare(b);
}

function MilliySubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECTS[subjectId];
  const [questions, setQuestions] = useState<Question[] | null>(null);

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

  const { originalGroups, mashqCount } = useMemo(() => {
    if (!questions) return { originalGroups: [] as OriginalGroup[], mashqCount: 0 };
    const originalMap = new Map<string, number>();
    let mashq = 0;
    for (const q of questions) {
      if (q.examCategory === "mashq") {
        mashq++;
        continue;
      }
      const label = q.examLabel?.trim() || LEGACY_LABEL;
      originalMap.set(label, (originalMap.get(label) ?? 0) + 1);
    }
    const groups = Array.from(originalMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => compareLabels(a.label, b.label));
    return { originalGroups: groups, mashqCount: mashq };
  }, [questions]);

  if (!subject) {
    return (
      <AppShell breadcrumb={[{ label: "Milliy sertifikat", to: "/milliy-sertifikat" }, { label: "Topilmadi" }]}>
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
        <p className="eyebrow">Milliy sertifikat</p>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight text-ink sm:text-[40px]">
          {subject.name}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Haqiqiy o'tgan imtihonlar va tayyorgarlik mashqlari.
        </p>
        <div className="gold-rule mt-8 w-40" />
      </header>

      {/* ---------------- Original savollar ---------------- */}
      <section className="mt-10">
        <SectionHeader
          eyebrow="Haqiqiy imtihonlar"
          title="Original savollar"
          description="Har biri haqiqiy imtihonda tushgan savollardan iborat."
          action={
            <InfoTip label="Baholash haqida">
              Platforma test natijasini (to'g'ri javoblar ulushini) ko'rsatadi. Rasmiy sertifikat
              balli Rash modeli asosida alohida hisoblanadi.
            </InfoTip>
          }
        />

        {questions === null ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[86px] rounded-2xl" />
            ))}
          </div>
        ) : originalGroups.length === 0 ? (
          <EmptyState
            title="Bu fan bo'yicha original savollar hali qo'shilmagan."
            description="Savol bazasi to'ldirilgach, imtihonlar avtomatik tarzda shu yerda ochiladi."
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-hairline elev">
            {originalGroups.map((g, i) => (
              <ExamModule
                key={g.label}
                index={String(i + 1).padStart(2, "0")}
                title={g.label}
                meta={[`${g.count} ta savol`, "90 daqiqa", "To'liq ekran rejimi"]}
                ctaLabel="Boshlash"
                to="/imtihon/$subjectId/$examId"
                params={{ subjectId, examId: g.label }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Mashq qilish ---------------- */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Tayyorgarlik"
          title="Mashq qilish"
          description="Umumiy savollar banki bilan erkin mashq qiling."
        />

        {questions === null ? (
          <div className="mt-6"><Skeleton className="h-[86px] rounded-2xl" /></div>
        ) : mashqCount === 0 ? (
          <EmptyState
            title="Mashq savollari hali qo'shilmagan."
            description="Mashq banki to'ldirilgach, shu yerda ochiladi."
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-hairline elev">
            <ExamModule
              index="01"
              title="Mashq qilish"
              meta={[`${mashqCount} ta savol`, "Vaqt cheklanmagan"]}
              ctaLabel="Boshlash"
              to="/imtihon/$subjectId/$examId"
              params={{ subjectId, examId: MASHQ_EXAM_ID }}
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
