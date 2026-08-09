import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { BrandVisual } from "@/components/intil/BrandVisual";
import {
  EmptyState,
  ExamModule,
  SectionHeader,
  Skeleton,
} from "@/components/intil/ui";
import { questionsRepo } from "@/lib/domain";
import { MILLIY_SUBJECTS, variantCount } from "@/lib/milliy";

export const Route = createFileRoute("/milliy-sertifikat/")({
  component: () => (
    <ProtectedRoute>
      <MilliyIndex />
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Milliy sertifikat — INTIL" },
      {
        name: "description",
        content:
          "Milliy sertifikat fanlarini tanlang: matematika, ona tili va adabiyot, tarix, fizika, kimyo, biologiya, CEFR English.",
      },
      { property: "og:title", content: "Milliy sertifikat — INTIL" },
      {
        property: "og:description",
        content: "Imtihon formatidagi testlar bilan milliy sertifikatga tayyorlaning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const ORDER = [
  "matematika",
  "ona-tili-adabiyot",
  "cefr-english",
  "tarix",
  "fizika",
  "kimyo",
  "biologiya",
];

function MilliyIndex() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        const map: Record<string, number> = {};
        for (const q of rows) {
          if (q.kind !== "milliy") continue;
          map[q.subjectId] = (map[q.subjectId] ?? 0) + 1;
        }
        setCounts(map);
      })
      .catch(() => alive && setCounts({}));
    return () => {
      alive = false;
    };
  }, []);

  const available = ORDER.filter((id) => (counts?.[id] ?? 0) > 0);
  const upcoming = ORDER.filter((id) => !(counts?.[id] ?? 0));

  return (
    <AppShell
      breadcrumb={[{ label: "INTIL", to: "/dashboard" }, { label: "Milliy sertifikat" }]}
    >
      <section className="rise relative overflow-hidden rounded-[28px] border border-hairline bg-card">
        <div className="pointer-events-none absolute -right-16 -top-24 hidden h-[380px] w-[380px] opacity-45 md:block">
          <BrandVisual className="h-full w-full" />
        </div>
        <div className="relative px-6 py-10 sm:px-10 sm:py-12 md:max-w-[62%]">
          <p className="eyebrow">Asosiy yo'nalish</p>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.14] text-ink sm:text-[38px]">
            Milliy sertifikat
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Fanni tanlang va imtihon formatidagi variantlar bilan ishlang. Har bir variant
            haqiqiy imtihon tuzilishiga mos.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Fanlar"
          title="Tayyorgarlik yo'nalishi"
          description="Savol bazasi mavjud bo'lgan fanlar ochiq."
        />

        {counts === null ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[86px] rounded-2xl" />
            ))}
          </div>
        ) : available.length === 0 ? (
          <EmptyState
            title="Fanlar hali ochilmagan."
            description="Savol bazasi to'ldirilgach, mavjud fanlar shu yerda paydo bo'ladi."
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-hairline elev">
            {available.map((id, i) => {
              const count = counts[id] ?? 0;
              return (
                <ExamModule
                  key={id}
                  index={String(i + 1).padStart(2, "0")}
                  title={MILLIY_SUBJECTS[id]?.name ?? id}
                  meta={[
                    `${variantCount(count)} ta variant`,
                    `${count} ta savol`,
                    "90 daqiqa",
                  ]}
                  ctaLabel="Ochish"
                  to="/milliy-sertifikat/$subjectId"
                  params={{ subjectId: id }}
                />
              );
            })}
          </div>
        )}

        {counts && upcoming.length > 0 && (
          <div className="mt-8 border-t border-hairline pt-6">
            <p className="eyebrow">Tayyorlanmoqda</p>
            <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {upcoming.map((id) => (
                <span key={id}>{MILLIY_SUBJECTS[id]?.name ?? id}</span>
              ))}
            </p>
            <p className="mt-3 text-xs text-ink-soft/80">
              Bu fanlar bo'yicha savol bazasi hali to'ldirilmoqda.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
