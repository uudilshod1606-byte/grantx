import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Lightbulb } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { getGuideBySlug } from "@/data/qollanmalar";

export const Route = createFileRoute("/qollanmalar/$slug")({
  loader: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  component: () => {
    const guide = Route.useLoaderData();

    return (
      <ProtectedRoute>
        <AppShell>
          <main className="mx-auto max-w-3xl px-4 py-10">
            <Link
              to="/qollanmalar"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Qo'llanmalarga qaytish
            </Link>

            <div className="glass overflow-hidden rounded-3xl">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {guide.tag}
                </span>
                <h1 className="mt-2 text-3xl font-bold leading-tight">{guide.title}</h1>
                <p className="mt-3 text-muted-foreground">{guide.description}</p>

                <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {guide.readTime}
                </div>

                <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
                  {guide.sections.map((section, i) => (
                    <section key={i} className="mb-8">
                      {section.heading && (
                        <h2 className="text-xl font-bold">{section.heading}</h2>
                      )}
                      {section.paragraphs?.map((p, j) => (
                        <p key={j} className="mt-3 leading-relaxed text-foreground/90">
                          {p}
                        </p>
                      ))}
                      {section.list && (
                        <ul className="mt-3 list-disc space-y-1.5 pl-5">
                          {section.list.map((item, k) => (
                            <li key={k} className="leading-relaxed text-foreground/90">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>

                {guide.nextGuideNote && (
                  <div className="mt-4 flex gap-3 rounded-2xl bg-accent/10 p-4">
                    <Lightbulb className="h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Keyingi qo'llanma</p>
                      <p className="mt-1 text-sm text-muted-foreground">{guide.nextGuideNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </AppShell>
      </ProtectedRoute>
    );
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — INTIL` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} — INTIL` },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.coverImage },
        ]
      : [],
  }),
});
