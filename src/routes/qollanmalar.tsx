import { createFileRoute } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/qollanmalar")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="glass rounded-3xl p-8 text-center">
            <BookMarked className="mx-auto h-8 w-8 text-accent" />
            <h1 className="mt-4 text-2xl font-bold">Qo'llanmalar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Imtihonlarga tayyorgarlik bo'yicha qo'llanmalar tez orada shu yerda paydo bo'ladi.
            </p>
          </div>
        </main>
      </AppShell>
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [
      { title: "Qo'llanmalar — INTIL" },
      { name: "description", content: "DTM va Milliy Sertifikatga tayyorgarlik bo'yicha qo'llanmalar." },
      { property: "og:title", content: "Qo'llanmalar — INTIL" },
      { property: "og:description", content: "DTM va Milliy Sertifikatga tayyorgarlik bo'yicha qo'llanmalar." },
    ],
  }),
});