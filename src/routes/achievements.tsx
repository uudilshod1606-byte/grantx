import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { ACHIEVEMENTS, RANKS, attemptsRepo, computeStats, nextRank, rankForXp } from "@/lib/domain";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({
    meta: [
      { title: "Yutuqlar — INTIL" },
      { name: "description", content: "INTIL yutuqlari va daraja tizimi." },
    ],
  }),
});

function AchievementsPage() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}

function AchievementsContent() {
  const { user } = useAuth();
  const attempts = user ? attemptsRepo.list(user.id) : [];
  const stats = computeStats(attempts);
  const rank = rankForXp(stats.xp);
  const next = nextRank(stats.xp);
  const progress = next ? Math.min(100, Math.round(((stats.xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)) : 100;

  return (
    <div className="relative min-h-screen text-foreground">
      <Backdrop />
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Award className="h-5 w-5 text-accent" />
          <span className="font-semibold">Yutuqlar</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-20 pt-6">
        {/* Rank card */}
        <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-8">
          <div className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${rank.ring} blur-3xl`} />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 ${rank.tone}`}>
              <rank.icon className="h-10 w-10" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs uppercase text-muted-foreground">Sizning darajangiz</div>
              <h2 className="mt-1 text-3xl font-bold gradient-text">{rank.name}</h2>
              <div className="mt-1 text-sm text-muted-foreground">{stats.xp} XP</div>
              {next && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Keyingisi: {next.name}</span>
                    <span>{next.minXp - stats.xp} XP qoldi</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full gradient-bg transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-5 gap-2 text-center">
            {RANKS.map((r) => {
              const reached = stats.xp >= r.minXp;
              return (
                <div key={r.id} className={`rounded-xl p-3 text-xs ${reached ? "bg-white/5" : "opacity-40"}`}>
                  <r.icon className={`mx-auto h-5 w-5 ${r.tone}`} />
                  <div className="mt-1 font-semibold">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.minXp} XP</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Yutuqlar</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.check(stats);
              return (
                <div key={a.id} className={`glass rounded-2xl p-5 transition ${unlocked ? "" : "opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${unlocked ? "gradient-bg glow" : "bg-white/5"}`}>
                      {unlocked ? <a.icon className="h-6 w-6 text-primary-foreground" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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
