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

/**
 * Milliy Sertifikat Mathematics has two different grouped formats:
 * - 33–35: one shared stem + A–F matching choices
 * - 36–45: open questions, each question containing a) and b) parts
 *
 * Older Excel imports could accidentally save a 36–45 row as
 * "moslashtirish" when option cells were present. The exam runner should
 * still respect the official question number/group and render it as open.
 */
function normalizeMilliyQuestion(question: Question): Question {
  if (question.kind !== "milliy") return question;

  const groupId = question.groupId?.trim() ?? "";
  const numberMatch = groupId.match(/^(\d{1,2})(?:[-_].*)?$/);
  const groupNumber = numberMatch ? Number(numberMatch[1]) : null;

  if (groupNumber !== null && groupNumber >= 36 && groupNumber <= 45) {
    return {
      ...question,
      questionType: "ochiq",
      options: [],
      correctIndex: undefined,
    };
  }

  if (groupNumber !== null && groupNumber >= 33 && groupNumber <= 35) {
    return {
      ...question,
      questionType: "moslashtirish",
    };
  }

  // Also repair an ungrouped open row when the data clearly contains an
  // answer text and no meaningful multiple-choice options.
  if (
    question.answerText?.trim() &&
    question.options.filter((option) => option.trim()).length === 0
  ) {
    return {
      ...question,
      questionType: "ochiq",
      correctIndex: undefined,
    };
  }

  return question;
}

export const Route = createFileRoute("/imtihon/$subjectId/$examId")({
  component: BluebookExamPage,
  head: ({ params }) => {
    const name = MILLIY_SUBJECTS[params.subjectId]?.name ?? "Milliy Sertifikat";
    const label =
      params.examId === MASHQ_EXAM_ID
        ? "Mashq qilish"
        : params.examId.startsWith("mashq-")
          ? params.examId.slice("mashq-".length)
          : params.examId;
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
  const isMashq = examId === MASHQ_EXAM_ID || examId.startsWith("mashq-");
  const mashqLabel = examId.startsWith("mashq-") ? examId.slice("mashq-".length) : null;
  const examLabel = isMashq ? (mashqLabel || "Mashq qilish") : examId;

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
    const pool = all.filter((q) => q.kind === "milliy" && q.subjectId === subjectId);

    const matched =
      examId === MASHQ_EXAM_ID
        ? pool.filter((q) => q.examCategory === "mashq")
        : isMashq
          ? pool.filter(
              (q) =>
                q.examCategory === "mashq" &&
                (q.examLabel?.trim() || "Mashq") === mashqLabel,
            )
          : pool.filter(
              (q) =>
                q.examCategory !== "mashq" &&
                (q.examLabel?.trim() || LEGACY_LABEL) === examId,
            );

    return matched
      .map(normalizeMilliyQuestion)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [all, subjectId, examId, isMashq, mashqLabel]);

  const exit = () => {
    navigate({ to: "/milliy-sertifikat/$subjectId", params: { subjectId } });
  };

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
