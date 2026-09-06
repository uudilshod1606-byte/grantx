import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { attemptsRepo, buildQuestionSlots, questionsRepo, type Question } from "@/lib/domain";
import { useAuth } from "@/lib/auth";
import { recalculateAdaptivePlan } from "@/lib/learning";
import { BluebookExam } from "@/components/bluebook/BluebookExam";
import { FullscreenGate } from "@/components/bluebook/FullscreenGate";
import { MILLIY_SUBJECTS } from "@/lib/milliy";
import { getQuestionPoints, gradeFor75, SCORE_DISCLAIMER } from "@/lib/exam-scoring";
import { writtenRepo } from "@/lib/written-submissions";

const DURATION_MINUTES = 90;
const LEGACY_LABEL = "Imtihon 1";
const MASHQ_EXAM_ID = "mashq";
const LETTERS = ["A", "B", "C", "D", "E", "F"];

type CapturedAnswer = { kind: "option"; index: number } | { kind: "text"; value: string };

function normalizeMilliyQuestion(question: Question): Question {
  if (question.kind !== "milliy") return question;
  const groupId = question.groupId?.trim() ?? "";
  const numberMatch = groupId.match(/^(\d{1,2})(?:[-_].*)?$/);
  const groupNumber = numberMatch ? Number(numberMatch[1]) : null;
  if (groupNumber !== null && groupNumber >= 36 && groupNumber <= 45) {
    return { ...question, questionType: "ochiq", options: [], correctIndex: undefined, groupIntro: null };
  }
  if (groupNumber !== null && groupNumber >= 33 && groupNumber <= 35) return { ...question, questionType: "moslashtirish" };
  if (question.answerText?.trim() && question.options.filter((option) => option.trim()).length === 0) {
    return { ...question, questionType: "ochiq", correctIndex: undefined };
  }
  return question;
}

function questionNumber(question: Question, index: number) {
  const match = question.groupId?.match(/^(\d{1,2})/);
  return match ? Number(match[1]) : index + 1;
}

function currentQuestionNumber() {
  const node = document.querySelector("main span.bg-black");
  const value = Number(node?.textContent?.trim());
  return Number.isInteger(value) ? value : null;
}

function findQuestionForNumber(questions: Question[], number: number) {
  const indexed = questions.map((q, index) => ({ q, index, n: questionNumber(q, index) }));
  const exact = indexed.find((item) => item.n === number && item.q.questionType !== "moslashtirish");
  if (exact) return exact.q;
  const group = indexed.filter((item) => item.n === number);
  return group[0]?.q ?? null;
}

function findOpenQuestionForPart(questions: Question[], number: number, part: "a" | "b") {
  const group = questions.filter((q, index) => questionNumber(q, index) === number);
  if (!group.length) return null;
  return group[part === "a" ? 0 : Math.min(1, group.length - 1)] ?? null;
}

export const Route = createFileRoute("/imtihon/$subjectId/$examId")({
  component: BluebookExamPage,
  head: ({ params }) => {
    const name = MILLIY_SUBJECTS[params.subjectId]?.name ?? "Milliy Sertifikat";
    const label = params.examId === MASHQ_EXAM_ID ? "Mashq qilish" : params.examId.startsWith("mashq-") ? params.examId.slice("mashq-".length) : params.examId;
    const title = `${name} — ${label} · INTIL`;
    const description = `${name} fanidan Milliy Sertifikat imtihonini to'liq ekran rejimida topshiring.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] };
  },
});

function BluebookExamPage() {
  const { subjectId, examId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [all, setAll] = useState<Question[] | null>(null);
  const [writtenSubmitted, setWrittenSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const capturedAnswers = useRef<Record<string, CapturedAnswer>>({});
  const subject = MILLIY_SUBJECTS[subjectId];
  const isMashq = examId === MASHQ_EXAM_ID || examId.startsWith("mashq-");
  const mashqLabel = examId.startsWith("mashq-") ? examId.slice("mashq-".length) : null;
  const examLabel = isMashq ? (mashqLabel || "Mashq qilish") : examId;

  useEffect(() => {
    let alive = true;
    questionsRepo.list().then((rows) => { if (alive) setAll(rows); }).catch(() => { if (alive) setAll([]); });
    return () => { alive = false; };
  }, []);

  const questions = useMemo(() => {
    if (!all) return [];
    const pool = all.filter((q) => q.kind === "milliy" && q.subjectId === subjectId);
    const matched = examId === MASHQ_EXAM_ID
      ? pool.filter((q) => q.examCategory === "mashq")
      : isMashq
        ? pool.filter((q) => q.examCategory === "mashq" && (q.examLabel?.trim() || "Mashq") === mashqLabel)
        : pool.filter((q) => q.examCategory !== "mashq" && (q.examLabel?.trim() || LEGACY_LABEL) === examId);
    return matched.map(normalizeMilliyQuestion).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [all, subjectId, examId, isMashq, mashqLabel]);

  useEffect(() => {
    if (!started || writtenSubmitted) return;
    const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement | null;
      if (!input) return;
      const number = currentQuestionNumber();
      if (!number) return;
      const part = input.placeholder.trim().toLowerCase().startsWith("b)") ? "b" : "a";
      const q = findOpenQuestionForPart(questions, number, part);
      if (q) capturedAnswers.current[q.id] = { kind: "text", value: input.value };
    };
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const letter = button.querySelector("span")?.textContent?.trim().toUpperCase();
      if (!letter || !LETTERS.includes(letter)) return;
      const number = currentQuestionNumber();
      if (!number) return;
      const q = findQuestionForNumber(questions, number);
      if (q) capturedAnswers.current[q.id] = { kind: "option", index: LETTERS.indexOf(letter) };
    };
    document.addEventListener("input", handleInput, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [started, writtenSubmitted, questions]);

  const exit = () => navigate({ to: "/milliy-sertifikat/$subjectId", params: { subjectId } });

  if (!subject) return <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] px-6 text-[#171717]"><div className="max-w-sm text-center"><h1 className="text-xl font-semibold">Fan topilmadi</h1><button onClick={() => navigate({ to: "/milliy-sertifikat" })} className="mt-6 rounded-xl bg-[#0B0B0C] px-5 py-2.5 text-sm font-medium text-[#F6F1E8]">Fanlar ro'yxati</button></div></div>;
  if (!all) return <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] text-sm text-[#6F6A62]">Imtihon tayyorlanmoqda...</div>;

  if (writtenSubmitted) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] px-6 text-[#171717]"><div className="max-w-xl rounded-3xl border border-[#E7E0D5] bg-white p-10 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">✓</div><h1 className="mt-6 text-2xl font-semibold">{subjectId === "ona-tili-adabiyot" ? "Esse yuborildi" : "Yozma ish yuborildi"}</h1><p className="mt-4 text-base leading-7 text-[#6F6A62]">{subjectId === "ona-tili-adabiyot" ? "Esse natijasi 24 soat ichida chiqadi." : "Yozma ishlaringiz admin tomonidan tekshiriladi. Tasdiqlangandan keyin yakuniy natijangiz hisoblanadi."}</p>{submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}<button onClick={() => navigate({ to: "/natijalar" })} className="mt-7 rounded-xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white">Natijalarim</button></div></div>;
  }

  if (!started) return <FullscreenGate subjectName={subject.name} examTitle={examLabel} questionCount={buildQuestionSlots(questions).length} durationMinutes={DURATION_MINUTES} onContinue={() => setStarted(true)} onExit={exit} />;

  const isMethodB = subjectId === "kimyo" || subjectId === "biologiya" || subjectId === "ona-tili-adabiyot";
  const isWrittenNumber = (n: number) => (subjectId === "ona-tili-adabiyot" && n === 45) || ((subjectId === "kimyo" || subjectId === "biologiya") && n >= 41 && n <= 43);
  const testEnd = subjectId === "ona-tili-adabiyot" ? 44 : 40;

  const finish = async (result: { total: number; correct: number; incorrect: number; unanswered: number; percent: number; durationSeconds: number; startedAt: string; finishedAt: string }) => {
    if (!user) return;
    setSubmitError(null);

    if (isMethodB) {
      let testRaw = 0;
      let testMax = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const n = questionNumber(q, i);
        if (n < 1 || n > testEnd || isWrittenNumber(n)) continue;
        const points = getQuestionPoints(subjectId, n, q.points ?? 0);
        testMax += points;
        const captured = capturedAnswers.current[q.id];
        const correct = captured?.kind === "option"
          ? q.correctIndex != null && captured.index === q.correctIndex
          : captured?.kind === "text" && !!q.answerText?.trim() && captured.value.trim().toLowerCase() === q.answerText.trim().toLowerCase();
        if (correct) testRaw += points;
      }

      const written = questions.filter((q, i) => isWrittenNumber(questionNumber(q, i)));
      const submissions = written.map((q, i) => {
        const n = questionNumber(q, i);
        const captured = capturedAnswers.current[q.id];
        return {
          userId: user.id,
          userEmail: user.email ?? "",
          userName: user.fullName ?? "Talaba",
          attemptId: crypto.randomUUID(),
          subjectId,
          subjectName: subject.name,
          examLabel,
          submissionKind: subjectId === "ona-tili-adabiyot" ? "esse" as const : "yozma" as const,
          questionNumber: n,
          questionText: [q.groupIntro, q.text].filter(Boolean).join("\n\n"),
          answerText: captured?.kind === "text" ? captured.value : "",
          maxPoints: subjectId === "ona-tili-adabiyot" ? 24 : 25,
          testRaw,
          testMax,
          scoringMethod: "B" as const,
        };
      }).filter((item) => item.answerText.trim().length > 0);

      if (submissions.length) {
        try {
          await Promise.all(submissions.map((submission) => writtenRepo.submit(submission)));
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : "Yozma ishni saqlab bo'lmadi.");
          return;
        }
      }
      attemptsRepo.add({ userId: user.id, examTitle: `${subject.name} · ${examLabel}`, kind: "milliy", subjectIds: [subjectId], total: result.total, correct: result.correct, incorrect: result.incorrect, unanswered: result.unanswered, percent: result.percent, durationSeconds: result.durationSeconds, startedAt: result.startedAt, finishedAt: result.finishedAt });
      setWrittenSubmitted(true);
    } else {
      attemptsRepo.add({ userId: user.id, examTitle: `${subject.name} · ${examLabel}`, kind: "milliy", subjectIds: [subjectId], total: result.total, correct: result.correct, incorrect: result.incorrect, unanswered: result.unanswered, percent: result.percent, durationSeconds: result.durationSeconds, startedAt: result.startedAt, finishedAt: result.finishedAt });
    }
    void recalculateAdaptivePlan().catch((error) => console.warn("[INTIL] adaptive AI refresh skipped", error));
  };

  return <BluebookExam
    subjectName={subject.name}
    examTitle={`${examLabel} · ${subject.name}`}
    moduleLabel={isMashq ? "Mashq" : `Bo'lim 1 · ${examLabel}`}
    questions={questions}
    durationMinutes={DURATION_MINUTES}
    userName={user?.fullName ?? "Talaba"}
    showReference={subjectId === "matematika"}
    onExit={exit}
    onComplete={(result) => { void finish(result); }}
  />;
}
