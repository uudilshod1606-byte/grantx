import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Inbox, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { SUBJECTS, attemptsRepo, computeStats } from "@/lib/domain";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Tarix — INTIL" },
      { name: "description", content: "Yechgan imtihonlaringiz tarixi va analitika." },
    ],
  }),
});

function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const attempts = user ? attemptsRepo.list(user.id) : [];
  const stats = computeStats(attempts);

  return (
    <div className="relative min-h-screen text-foreground">
      <Backdrop />
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <HistoryIcon className="h-5 w-5 text-accent" />
          <span className="font-semibold">Tarix va analitika</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Jami imtihon", value: stats.totalTests },
            { label: "O'rtacha foiz", value: `${stats.averagePercent}%` },
            { label: "Eng yaxshi", value: `${stats.bestPercent}%` },
            { label: "To'g'ri javoblar", value: stats.totalCorrect },
          ].map((c) => (
            <div key={c.label} className="glass rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-bold gradient-text">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Fan bo'yicha samaradorlik</h2>
          {Object.keys(stats.perSubject).length === 0 ? (
            <p className="text-sm text-muted-foreground">Yetarli ma'lumot yo'q. Imtihonlarni boshlang.</p>
          ) : (
            <div className="space-y-3">
              {SUBJECTS.map((s) => {
                const p = stats.perSubject[s.id];
                if (!p) return null;
                const pct = p.total ? Math.round((p.correct / p.total) * 100) : 0;
                return (
                  <div key={s.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="flex items-center gap-2"><s.icon className="h-3 w-3 text-accent" />{s.name}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full gradient-bg" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Imtihon tarixi</h2>
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Siz hali test ishlamagansiz.</p>
              <Button asChild className="gradient-bg mt-4 text-primary-foreground">
                <Link to="/dashboard">Birinchi imtihonni boshlang</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {attempts.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{a.examTitle}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(a.finishedAt).toLocaleString("uz-UZ")} · {Math.round(a.durationSeconds / 60)} daq
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold gradient-text">{a.percent}%</div>
                    <div className="text-xs text-muted-foreground">{a.correct}/{a.total}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}
