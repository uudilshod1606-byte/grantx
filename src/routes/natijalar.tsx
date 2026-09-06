import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { ButtonLink, EmptyState, SectionHeader, StatusBadge } from "@/components/intil/ui";
import { writtenRepo, type WrittenSubmission } from "@/lib/written-submissions";
import { SCORE_DISCLAIMER } from "@/lib/exam-scoring";

export const Route = createFileRoute("/natijalar")({
  component: () => (
    <ProtectedRoute>
      <ResultsPage />
    </ProtectedRoute>
  ),
  head: () => ({ meta: [{ title: "Natijalar — INTIL" }] }),
});

function ResultsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WrittenSubmission[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    writtenRepo.listForUser(user.id).then(setRows).catch(() => setRows([]));
  }, [user?.id]);

  const attempts = useMemo(() => {
    const map = new Map<string, WrittenSubmission>();
    for (const row of rows) {
      if (row.finalScore != null) map.set(row.attemptId, row);
    }
    return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rows]);

  const pending = rows.filter((r) => r.status === "pending");

  return (
    <AppShell breadcrumb={[{ label: "INTIL", to: "/dashboard" }, { label: "Natijalar" }]}>
      <header className="rise">
        <ButtonLink to="/testlar" variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Imtihonlarim</ButtonLink>
        <p className="eyebrow mt-6">Milliy Sertifikat</p>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight text-ink sm:text-[38px]">Natijalar</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">Tasdiqlangan yozma ishlar yakuniy 75 ballik natijaga qo'shilgach shu yerda ko'rinadi.</p>
      </header>

      {pending.length > 0 && (
        <section className="mt-8 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4" /> {pending.length} ta yozma ish tekshirilmoqda</div>
          <p className="mt-1 text-sm">Admin tasdiqlamaguncha yakuniy ball natija sifatida ko'rsatilmaydi.</p>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader eyebrow="Yakuniy natija" title="Tasdiqlangan imtihonlar" />
        {attempts.length === 0 ? (
          <EmptyState title="Hali tasdiqlangan yozma natija yo'q." description="Yozma ishlaringiz admin tomonidan tekshirilgach, natija shu yerda paydo bo'ladi." cta={<ButtonLink to="/milliy-sertifikat" size="md">Testni boshlash</ButtonLink>} />
        ) : (
          <div className="mt-4 space-y-3">
            {attempts.map((row) => (
              <div key={row.attemptId} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-ink-soft">{row.subjectName} · {row.examLabel || "Mashq"}</div>
                    <div className="mt-1 text-lg font-semibold text-ink">{row.finalScore?.toFixed(2)} — {row.finalGrade ?? "Daraja yo'q"}</div>
                  </div>
                  <StatusBadge tone="done">Tasdiqlangan</StatusBadge>
                </div>
                <p className="mt-3 text-xs text-ink-soft">{SCORE_DISCLAIMER}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
