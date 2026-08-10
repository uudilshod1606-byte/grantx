import { createFileRoute, Link } from "@tanstack/react-router";
import { BookMarked, Clock } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { guides } from "@/data/qollanmalar";

export const Route = createFileRoute("/qollanmalar/")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 flex items-center gap-3">
            <BookMarked className="h-7 w-7 text-accent" />
            <div>
              <h1 className="text-2xl font-bold">Qo'llanmalar</h1>
              <p className="text-sm text-muted-foreground">
                Imtihonlarga tayyorgarlik bo'yicha amaliy qo'llanmalar
              </p>
            </div>
          </div>

          {guides.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              <BookMarked className="mx-auto h-8 w-8 text-accent" />
              <h2 className="mt-4 text-2xl font-bold">Qo'llanmalar</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Imtihonlarga tayyorgarlik bo'yicha qo'llanmalar tez orada shu yerda paydo bo'ladi.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  to="/qollanmalar/$slug"
                  params={{ slug: guide.slug }}
                  className="glass group overflow-hidden rounded-3xl transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={guide.coverImage}
                      alt={guide.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {guide.tag}
                    </span>
                    <h2 className="mt-2 text-lg font-bold leading-snug">{guide.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {guide.readTime}
                      </span>
                      <span className="text-sm font-semibold text-accent">O'qish →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
