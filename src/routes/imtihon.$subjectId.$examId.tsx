import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { attemptsRepo, buildQuestionSlots, questionsRepo, type Question } from "@/lib/domain";
import { useAuth } from "@/lib/auth";
import { BluebookExam } from "@/components/bluebook/BluebookExam";
import { FullscreenGate } from "@/components/bluebook/FullscreenGate";
import { MILLIY_SUBJECTS } from "@/lib/milliy";

const DURATION_MINUTES = 90;
const LEGACY_LABEL = "Imtihon 1";
const MASHQ_EXAM_ID = "mashq";

export const Route = createFileRoute("/imtihon/$subjectId/$examId")({
  component: BluebookExamPage,
  head: ({ params }) => {
    const name = MILLIY_SUBJECTS[params.subjectId]?.name ?? "Milliy Sertifikat";
    const label = params.examId === MASHQ_EXAM_ID ? "Mashq qilish" : params.examId;
    const title = `${name} — ${label} · INTIL`;
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
  const isMashq = examId === MASHQ_EXAM_ID;
  const examLabel = isMashq ? "Mashq qilish" : examId;

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
    // Savollar endi "qo'shilish tartibi" bo'yicha emas, balki har bir
    // savolning o'zida saqlangan aniq bo'lim (original/mashq) va — original
    // bo'lsa — sana/nomi (examLabel) bo'yicha filtrlanadi.
    const pool = all.filter((q) => q.kind === "milliy" && q.subjectId === subjectId);
    const matched = isMashq
      ? pool.filter((q) => q.examCategory === "mashq")
      : pool.filter((q) => q.examCategory !== "mashq" && (q.examLabel?.trim() || LEGACY_LABEL) === examId);
    return matched.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [all, subjectId, examId, isMashq]);

  const exit = () => navigate({ to: "/milliy-sertifikat/$subjectId", params: { subjectId } });

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] px-6 text-[#171717]">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Fan topilmadi</h1>
          <button
            onClick={() => navigate({ to: "/milliy-sertifikat" })}
            className="mt-6 rounded-xl bg-[#0B0B0C] px-5 py-2.5 text-sm font-medium text-[#F6F1E8]"
          >
            Fanlar ro'yxati
          </button>
        </div>
      </div>
    );
  }

  if (!all) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] text-sm text-[#6F6A62]">
        Imtihon tayyorlanmoqda...
      </div>
    );
  }

  if (!started) {
    return (
      <FullscreenGate
        subjectName={subject.name}
        examTitle={examLabel}
        questionCount={buildQuestionSlots(questions).length}
        durationMinutes={DURATION_MINUTES}
        onContinue={() => setStarted(true)}
        onExit={exit}
      />
    );
  }

  return (
    <BluebookExam
      subjectName={subject.name}
      examTitle={`${examLabel} · ${subject.name}`}
      moduleLabel={isMashq ? "Mashq" : `Bo'lim 1 · ${examLabel}`}
      questions={questions}
      durationMinutes={DURATION_MINUTES}
      userName={user?.fullName ?? "Talaba"}
      showReference={subjectId === "matematika"}
      onExit={exit}
      onComplete={(result) => {
        if (!user) return;
        attemptsRepo.add({
          userId: user.id,
          examTitle: `${subject.name} · ${examLabel}`,
          kind: "milliy",
          subjectIds: [subjectId],
          total: result.total,
          correct: result.correct,
          incorrect: result.incorrect,
          unanswered: result.unanswered,
          percent: result.percent,
          durationSeconds: result.durationSeconds,
          startedAt: result.startedAt,
          finishedAt: result.finishedAt,
        });
      }}
    />
  );
}
