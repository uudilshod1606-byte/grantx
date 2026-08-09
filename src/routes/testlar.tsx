import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import {
  ActivityItem,
  ButtonLink,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from "@/components/intil/ui";
import { attemptsRepo, type ExamAttempt } from "@/lib/domain";

export const Route = createFileRoute("/testlar")({
  component: () => (
    <ProtectedRoute>
      <MyExams />
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Imtihonlarim — INTIL" },
      { name: "description", content: "Yakunlangan imtihonlaringiz va natijalaringiz tarixi." },
      { property: "og:title", content: "Imtihonlarim — INTIL" },
      { property: "og:description", content: "Yakunlangan imtihonlaringiz va natijalaringiz tarixi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function MyExams() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[] | null>(null);

  useEffect(() => {
    setAttempts(attemptsRepo.list(user?.id));
  }, [user?.id]);

  return (
    <AppShell breadcrumb={[{ label: "INTIL", to: "/dashboard" }, { label: "Imtihonlarim" }]}>
      <header className="rise">
        <p className="eyebrow">Tarix</p>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight text-ink sm:text-[38px]">
          Imtihonlarim
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Yakunlangan imtihonlaringiz va ular bo'yicha haqiqiy natijalar.
        </p>
        <div className="gold-rule mt-8 w-40" />
      </header>

      <section className="mt-10">
        <SectionHeader eyebrow="Natijalar" title="Yakunlangan imtihonlar" />
        {attempts === null ? null : attempts.length === 0 ? (
          <EmptyState
            title="Hali imtihon topshirmagansiz."
            description="Birinchi imtihoningizni yakunlaganingizdan so'ng natijalar shu yerda saqlanadi."
            cta={
              <ButtonLink to="/milliy-sertifikat" size="md">
                Testni boshlash
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
        ) : (
          <ul className="mt-4">
            {attempts.map((a) => (
              <ActivityItem
                key={a.id}
                title={a.examTitle}
                timestamp={new Date(a.finishedAt).toLocaleDateString("uz-UZ", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                right={
                  <StatusBadge tone="done">
                    <span className="tabnum">{a.percent}%</span>
                  </StatusBadge>
                }
              />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
