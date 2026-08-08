import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, Clock, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { questionsRepo } from "@/lib/domain";
import { MILLIY_SUBJECTS as SUBJECTS, QUESTIONS_PER_EXAM, variantCount } from "@/lib/milliy";

export const Route = createFileRoute("/milliy-sertifikat/$subjectId")({
  component: MilliyExamPage,
  head: ({ params }) => {
    const s = SUBJECTS[params.subjectId];
    const name = s?.name ?? "Milliy Sertifikat";
    return {
      meta: [
        { title: `${name} — Milliy Sertifikat imtihoni · INTIL` },
        {
          name: "description",
          content: `${name} fanidan milliy sertifikat imtihonini real formatda topshiring.`,
        },
      ],
    };
  },
});

function MilliyExamPage() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECTS[subjectId];
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        setCount(rows.filter((q) => q.kind === "milliy" && q.subjectId === subjectId).length);
      })
      .catch(() => alive && setCount(0));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Fan topilmadi</h1>
        <p className="mt-2 text-muted-foreground">
          Tanlangan fan mavjud emas.
        </p>
        <Link to="/milliy-sertifikat">
          <Button className="mt-6 gradient-bg text-primary-foreground hover:opacity-90">
            Fanlar ro'yxatiga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/milliy-sertifikat">
            <Button variant="ghost" className="text-foreground hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Fanlar
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            {subject.name} — <span className="gradient-text">imtihonlar</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Variantlardan birini tanlang va real imtihon formatida topshiring.
          </p>
        </div>

        {count === null ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">Yuklanmoqda...</p>
        ) : count === 0 ? (
          <div className="glass mx-auto mt-12 max-w-md rounded-3xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Bu fan bo'yicha savollar hali qo'shilmagan.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: variantCount(count) }, (_, i) => i + 1).map((n) => {
              const qCount = Math.min(QUESTIONS_PER_EXAM, count - (n - 1) * QUESTIONS_PER_EXAM);
              return (
                <div
                  key={n}
                  className="group flex flex-col rounded-3xl glass p-6 transition hover:-translate-y-1 md:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold">Imtihon {n}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-white/5 px-3 py-1">{qCount} ta savol</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                      <Clock className="h-3.5 w-3.5" /> 90 daqiqa
                    </span>
                  </div>
                  <Link
                    to="/imtihon/$subjectId/$examId"
                    params={{ subjectId, examId: String(n) }}
                    className="mt-6 block"
                  >
                    <Button
                      size="lg"
                      className="w-full gap-2 gradient-bg text-primary-foreground hover:opacity-90"
                    >
                      Testni boshlash
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
