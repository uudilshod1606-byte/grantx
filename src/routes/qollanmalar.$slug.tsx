import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Lightbulb } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { getGuideBySlug, type Guide } from "@/data/qollanmalar";

export const Route = createFileRoute("/qollanmalar/$slug")({
  loader: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  component: () => {
    const guide = Route.useLoaderData() as Guide;

    return (
      <ProtectedRoute>
        <AppShell>
          <main className="mx-auto max-w-4xl px-4 py-10">
            <Link
              to="/qollanmalar"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Qo'llanmalarga qaytish
            </Link>

            <span
              className="text-xs font-semibold uppercase tracking-[0.15em] text-accent"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {guide.tag}
            </span>

            <h1
              className="mt-3 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {guide.title}
            </h1>

            <p
              className="mt-4 text-lg italic text-muted-foreground"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {guide.description}
            </p>

            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {guide.readTime}
            </div>

            <figure className="mt-8">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl">
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {guide.coverCaption && (
                <figcaption
                  className="mt-2 text-sm italic text-muted-foreground"
                  style={{ fontFamily: "'Lora', Georgia, serif" }}
                >
                  {guide.coverCaption}
                </figcaption>
              )}
            </figure>

            <article
              className="mt-10 max-w-none text-[1.075rem] leading-[1.85] text-foreground/90"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {guide.sections.map((section, i) => (
                <section key={i} className="mb-9">
                  {section.heading && (
                    <h2
                      className="mb-3 text-[1.4rem] font-semibold tracking-tight text-foreground"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {section.heading}
                    </h2>
                  )}
                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className="mt-3 first:mt-0">
                      {p}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="mt-3 space-y-2 pl-0">
                      {section.list.map((item, k) => (
                        <li key={k} className="flex gap-3">
                          <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>

            {guide.nextGuideNote && (
              <div className="mt-4 flex gap-3 rounded-2xl bg-accent/10 p-5">
                <Lightbulb className="h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Keyingi qo'llanma
                  </p>
                  <p
                    className="mt-1 text-sm italic text-muted-foreground"
                    style={{ fontFamily: "'Lora', Georgia, serif" }}
                  >
                    {guide.nextGuideNote}
                  </p>
                </div>
              </div>
            )}
          </main>
        </AppShell>
      </ProtectedRoute>
    );
  },
  head: ({ loaderData }) => ({
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap",
      },
    ],
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
