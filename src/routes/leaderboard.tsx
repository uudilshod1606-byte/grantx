import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Crown, Inbox, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/lib/auth";
import { SUBJECTS, attemptsRepo, computeStats, rankForXp } from "@/lib/domain";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => ({
    meta: [
      { title: "Reyting — INTIL" },
      { name: "description", content: "INTIL global va fan bo'yicha reyting." },
    ],
  }),
});

function readUsersStorage() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("intil.auth.users") ?? "[]") as Array<{ id: string; fullName: string; email: string }>;
  } catch {
    return [];
  }
}

function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}

function LeaderboardContent() {
  const users = readUsersStorage();
  const attempts = attemptsRepo.list();

  const rows = users
    .map((u) => {
      const userAttempts = attempts.filter((a) => a.userId === u.id);
      const stats = computeStats(userAttempts);
      return { user: u, stats, rank: rankForXp(stats.xp) };
    })
    .sort((a, b) => b.stats.xp - a.stats.xp);

  return (
    <div className="relative min-h-screen text-foreground">
      <Backdrop />
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Trophy className="h-5 w-5 text-accent" />
          <span className="font-semibold">Reyting</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-6">
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="glass h-auto flex-wrap gap-1 bg-transparent p-1">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">Haftalik</TabsTrigger>
            <TabsTrigger value="subjects">Fanlar</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <BoardList rows={rows.map((r, i) => ({ rank: i + 1, name: r.user.fullName, score: r.stats.xp, sub: `${r.stats.totalTests} imtihon · ${r.rank.name}` }))} />
          </TabsContent>
          <TabsContent value="weekly">
            <BoardList rows={rows.map((r, i) => ({ rank: i + 1, name: r.user.fullName, score: r.stats.weeklyActivity, sub: "imtihonlar (7 kun)" }))} />
          </TabsContent>
          <TabsContent value="subjects">
            <div className="grid gap-3 md:grid-cols-2">
              {SUBJECTS.map((s) => {
                const ranked = users
                  .map((u) => {
                    const userAttempts = attempts.filter((a) => a.userId === u.id);
                    const stats = computeStats(userAttempts);
                    const sub = stats.perSubject[s.id];
                    return { user: u, correct: sub?.correct ?? 0 };
                  })
                  .filter((r) => r.correct > 0)
                  .sort((a, b) => b.correct - a.correct)
                  .slice(0, 5);
                return (
                  <div key={s.id} className="glass rounded-2xl p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-accent" />
                      <h3 className="font-semibold">{s.name}</h3>
                    </div>
                    {ranked.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Hozircha ma'lumot yo'q</p>
                    ) : (
                      <ol className="space-y-1 text-sm">
                        {ranked.map((r, i) => (
                          <li key={r.user.id} className="flex justify-between">
                            <span>{i + 1}. {r.user.fullName}</span>
                            <span className="text-muted-foreground">{Math.round(r.correct)} ball</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BoardList({ rows }: { rows: Array<{ rank: number; name: string; score: number; sub: string }> }) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <Crown className="mx-auto h-8 w-8 text-accent" />
        <h3 className="mt-3 font-semibold">Reyting hali bo'sh</h3>
        <p className="mt-1 text-sm text-muted-foreground">Birinchi imtihonni ishlab reytingni boshlang.</p>
      </div>
    );
  }
  const active = rows.filter((r) => r.score > 0);
  if (active.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Hech kim hali imtihon ishlamagan.</p>
      </div>
    );
  }
  return (
    <div className="glass overflow-hidden rounded-2xl">
      {active.map((r) => (
        <div key={r.rank} className="flex items-center gap-4 border-b border-white/5 px-5 py-3 last:border-0">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${r.rank <= 3 ? "gradient-bg text-primary-foreground glow" : "bg-white/5"}`}>{r.rank}</div>
          <div className="flex-1">
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.sub}</div>
          </div>
          <div className="font-bold gradient-text">{r.score}</div>
        </div>
      ))}
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
