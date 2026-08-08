import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { questionsRepo, type Question } from "@/lib/domain";
import { useAuth } from "@/lib/auth";
import { BluebookExam } from "@/components/bluebook/BluebookExam";
import { FullscreenGate } from "@/components/bluebook/FullscreenGate";
import { MILLIY_SUBJECTS, QUESTIONS_PER_EXAM } from "@/lib/milliy";

export const Route = createFileRoute("/imtihon/$subjectId/$examId")({
  component: BluebookExamPage,
  head: ({ params }) => {
    const name = MILLIY_SUBJECTS[params.subjectId]?.name ?? "Milliy Sertifikat";
    const title = `${name} — Imtihon ${params.examId} · INTIL`;
    const description = `${name} fanidan Milliy Sertifikat imtihonini to'liq ekran rejimida topshiring.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
});

function BluebookExamPage() {
  const { subjectId, examId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [all, setAll] = useState<Question[] | null>(null);

  const subject = MILLIY_SUBJECTS[subjectId];
  const variant = Math.max(1, Number(examId) || 1);

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (alive) setAll(rows);
      })
      .catch(() => {
        if (alive) setAll([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const questions = useMemo(() => {
    if (!all) return [];
    const pool = all
      .filter((q) => q.kind === "milliy" && q.subjectId === subjectId)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return pool.slice((variant - 1) * QUESTIONS_PER_EXAM, variant * QUESTIONS_PER_EXAM);
  }, [all, subjectId, variant]);

  const exit = () => navigate({ to: "/milliy-sertifikat/$subjectId", params: { subjectId } });

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="text-center">
          <h1 className="text-xl font-bold">Fan topilmadi</h1>
          <button onClick={exit} className="mt-6 rounded bg-black px-5 py-2.5 text-sm text-white">
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return <FullscreenGate bigNumber={variant} onContinue={() => setStarted(true)} />;
  }

  if (!all) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-600">
        Savollar yuklanmoqda...
      </div>
    );
  }

  return (
    <BluebookExam
      subjectName={subject.name}
      examTitle={`Imtihon ${variant} · ${subject.name}`}
      moduleLabel={`Bo'lim 1, Modul ${variant}`}
      questions={questions}
      durationMinutes={90}
      userName={user?.fullName ?? "Talaba"}
      showReference={subjectId === "matematika"}
      onExit={exit}
    />
  );
}