import { createFileRoute } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/materiallar")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="glass rounded-3xl p-8 text-center">
            <Library className="mx-auto h-8 w-8 text-accent" />
            <h1 className="mt-4 text-2xl font-bold">Materiallar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Darslik va o'quv materiallari tez orada shu yerda joylashtiriladi.
            </p>
          </div>
        </main>
      </AppShell>
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Materiallar — INTIL" },
      { name: "description", content: "INTIL o'quv materiallari va darsliklar to'plami." },
      { property: "og:title", content: "Materiallar — INTIL" },
      { property: "og:description", content: "INTIL o'quv materiallari va darsliklar to'plami." },
    ],
  }),
});