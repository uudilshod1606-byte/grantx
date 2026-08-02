import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Trophy, Award, ArrowRight } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/testlar")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">Testlar</h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/dtm" className="glass group rounded-3xl p-6 transition hover:bg-white/[0.07]">
              <Trophy className="h-6 w-6 text-primary" />
              <p className="mt-3 font-semibold">DTM imtihoni</p>
              <p className="mt-1 text-xs text-muted-foreground">5 ta fan, 189 ball</p>
              <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
            <Link to="/milliy-sertifikat" className="glass group rounded-3xl p-6 transition hover:bg-white/[0.07]">
              <Award className="h-6 w-6 text-primary" />
              <p className="mt-3 font-semibold">Milliy Sertifikat</p>
              <p className="mt-1 text-xs text-muted-foreground">Fan tanlab boshlash</p>
              <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
          </div>
        </main>
      </AppShell>
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Testlar — INTIL" },
      { name: "description", content: "DTM va Milliy Sertifikat testlarini tanlang va boshlang." },
      { property: "og:title", content: "Testlar — INTIL" },
      { property: "og:description", content: "DTM va Milliy Sertifikat testlarini tanlang va boshlang." },
    ],
  }),
});