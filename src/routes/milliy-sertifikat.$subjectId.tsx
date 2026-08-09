import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import {
  EmptyState,
  ExamModule,
  InfoTip,
  SectionHeader,
  Skeleton,
} from "@/components/intil/ui";
import { questionsRepo } from "@/lib/domain";
import { MILLIY_SUBJECTS as SUBJECTS, QUESTIONS_PER_EXAM, variantCount } from "@/lib/milliy";

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

function MilliySubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECTS[subjectId];
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        setCount(rows.filter((q) => q.kind === "milliy" && q.subjectId === subjectId).length);
      })
      .catch(() => alive && setCount(0));
    return () => {
      alive = false;
    };
  }, [subjectId]);

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
          Imtihon formatidagi testlar va tayyorgarlik mashqlari.
        </p>
        <div className="gold-rule mt-8 w-40" />
      </header>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Variantlar"
          title="Imtihonlar"
          description={`Har bir variant ${QUESTIONS_PER_EXAM} tagacha savoldan iborat.`}
          action={
            <InfoTip label="Baholash haqida">
              Platforma test natijasini (to'g'ri javoblar ulushini) ko'rsatadi. Rasmiy sertifikat
              balli Rash modeli asosida alohida hisoblanadi.
            </InfoTip>
          }
        />

        {count === null ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[86px] rounded-2xl" />
            ))}
          </div>
        ) : count === 0 ? (
          <EmptyState
            title="Bu fan bo'yicha savollar hali qo'shilmagan."
            description="Savol bazasi to'ldirilgach, variantlar avtomatik tarzda shu yerda ochiladi."
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-hairline elev">
            {Array.from({ length: variantCount(count) }, (_, i) => i + 1).map((n) => {
              const qCount = Math.min(QUESTIONS_PER_EXAM, count - (n - 1) * QUESTIONS_PER_EXAM);
              return (
                <ExamModule
                  key={n}
                  index={String(n).padStart(2, "0")}
                  title={`Imtihon ${n}`}
                  meta={[`${qCount} ta savol`, "90 daqiqa", "To'liq ekran rejimi"]}
                  ctaLabel="Boshlash"
                  to="/imtihon/$subjectId/$examId"
                  params={{ subjectId, examId: String(n) }}
                />
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
