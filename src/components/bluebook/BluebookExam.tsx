import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Highlighter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Flag,
  ChevronUp,
  X,
} from "lucide-react";
import { buildQuestionSlots, type Question } from "@/lib/domain";
import { MathContent } from "@/components/math/MathContent";
import { ReferencePanel } from "./ReferencePanel";

const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;
const PART_LABELS = ["a", "b", "c", "d"] as const;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function stripHtml(v: string) {
  return v.replace(/<[^>]+>/g, "");
}

/** Very simple open-answer comparison (whitespace/case/comma-vs-dot insensitive). */
function normalizeAnswer(v: string): string {
  return stripHtml(v).replace(/\s+/g, "").replace(/,/g, ".").toLowerCase();
}

type AnswerValue = { kind: "option"; index: number } | { kind: "text"; value: string };

export type BluebookExamProps = {
  subjectName: string;
  examTitle: string;
  moduleLabel?: string;
  questions: Question[];
  durationMinutes: number;
  userName: string;
  /** Reference (formula) panel is only available for Milliy Matematika. */
  showReference?: boolean;
  onExit: () => void;
  /** Fired once, with the real computed result, when the exam is submitted. */
  onComplete?: (result: {
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    percent: number;
    durationSeconds: number;
    startedAt: string;
    finishedAt: string;
  }) => void;
};

/**
 * Digital-SAT (Bluebook) style exam surface.
 * Deliberately uses raw neutral colours (white / black / gray) instead of the
 * INTIL design tokens so the site's cream + gold theme can never leak in.
 */
export function BluebookExam({
  subjectName,
  examTitle,
  moduleLabel = "Bo'lim 1, Modul 1",
  questions,
  durationMinutes,
  userName,
  showReference = false,
  onExit,
  onComplete,
}: BluebookExamProps) {
  // Group consecutive same-groupId rows (33-35 moslashtirish, 36-a/36-b ochiq).
  const slots = useMemo(() => buildQuestionSlots(questions), [questions]);
  const total = slots.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [clockHidden, setClockHidden] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [highlightOn, setHighlightOn] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeMatchSub, setActiveMatchSub] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const reportedRef = useRef(false);

  const group = slots[index] ?? [];
  const flagKey = group[0]?.groupId ? `group:${group[0].groupId}` : group[0]?.id ?? String(index);

  useEffect(() => {
    setActiveMatchSub(0);
  }, [index]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  // Highlight selected text inside the question body.
  const applyHighlight = useCallback(() => {
    if (!highlightOn) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!bodyRef.current?.contains(range.commonAncestorContainer)) return;
    const mark = document.createElement("mark");
    mark.style.backgroundColor = "#fde68a";
    mark.style.color = "inherit";
    try {
      range.surroundContents(mark);
    } catch {
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }
    sel.removeAllRanges();
  }, [highlightOn]);

  const score = useMemo(() => {
    let correct = 0;
    for (const item of questions) {
      const a = answers[item.id];
      if (!a) continue;
      if (item.questionType === "ochiq") {
        if (a.kind === "text" && item.answerText && normalizeAnswer(a.value) === normalizeAnswer(item.answerText)) {
          correct++;
        }
      } else if (a.kind === "option" && a.index === item.correctIndex) {
        correct++;
      }
    }
    return correct;
  }, [answers, questions]);

  const answeredRawCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, questions]
  );

  // Report the real result exactly once.
  useEffect(() => {
    if (!submitted || reportedRef.current || !questions.length) return;
    reportedRef.current = true;
    const finishedAt = new Date().toISOString();
    onComplete?.({
      total: questions.length,
      correct: score,
      incorrect: answeredRawCount - score,
      unanswered: questions.length - answeredRawCount,
      percent: Math.round((score / questions.length) * 100),
      durationSeconds: durationMinutes * 60 - secondsLeft,
      startedAt: startedAtRef.current,
      finishedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const exitExam = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
    onExit();
  };

  const setOptionAnswer = (questionId: string, idx: number) => {
    setAnswers((a) => ({ ...a, [questionId]: { kind: "option", index: idx } }));
  };
  const setTextAnswer = (questionId: string, value: string) => {
    setAnswers((a) => ({ ...a, [questionId]: { kind: "text", value } }));
  };

  if (!total) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
        <div className="text-center">
          <h1 className="text-xl font-bold">Bu imtihonda savollar mavjud emas</h1>
          <button
            onClick={exitExam}
            className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-[#FAF7F1] px-6 py-14 text-[#171717]">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9F7830]">
            {examTitle}
          </p>
          <h1 className="mt-5 text-[32px] font-semibold leading-tight sm:text-[40px]">
            Imtihon yakunlandi.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#6F6A62]">
            Quyidagi ko'rsatkich — test natijasi. Rasmiy sertifikat balli Rash modeli asosida
            alohida hisoblanadi.
          </p>

          <div className="mt-12 flex items-end gap-4 border-b border-[rgba(30,25,18,0.10)] pb-8">
            <span className="text-[72px] font-semibold leading-none tabular-nums">{percent}</span>
            <span className="pb-2 text-2xl text-[#6F6A62]">%</span>
            <span className="pb-3 pl-2 text-sm text-[#6F6A62]">
              {score} / {questions.length} to'g'ri javob
            </span>
          </div>

          <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6F6A62]">
            Natijangiz tahlili
          </h2>
          <dl className="mt-6 grid grid-cols-3 gap-x-8 gap-y-6">
            {([
              ["To'g'ri", score],
              ["Noto'g'ri", answeredRawCount - score],
              ["Javobsiz", questions.length - answeredRawCount],
            ] as [string, number][]).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.1em] text-[#6F6A62]">{k}</dt>
                <dd className="mt-2 text-[28px] font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          <button
            onClick={exitExam}
            className="mt-12 inline-flex h-12 items-center rounded-xl bg-[#0B0B0C] px-6 text-[15px] font-medium text-[#F6F1E8] transition-colors hover:bg-[#151516]"
          >
            Yakunlash
          </button>
        </div>
      </div>
    );
  }

  const isMoslashtirish = group.length > 0 && group[0].questionType === "moslashtirish";
  const isOpenGroup = group.length > 1 && group[0].questionType === "ochiq";
  const isSingle = group.length === 1 && group[0].questionType !== "moslashtirish";

  const groupAnsweredCount = group.filter((q) => answers[q.id] !== undefined).length;
  const groupComplete = group.length > 0 && groupAnsweredCount === group.length;

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-gray-300 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold md:text-base">
            {moduleLabel}: {subjectName}
          </div>
          <button
            type="button"
            onClick={() => setDirectionsOpen(true)}
            className="mt-0.5 text-xs text-gray-600 underline underline-offset-2 hover:text-black"
          >
            Yo'riqnoma
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-lg font-bold tabular-nums md:text-2xl">
            {clockHidden ? "—:—" : fmt(secondsLeft)}
          </div>
          <button
            type="button"
            onClick={() => setClockHidden((v) => !v)}
            className="mt-0.5 inline-flex items-center gap-1 rounded border border-gray-400 px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-100"
          >
            {clockHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {clockHidden ? "Ko'rsatish" : "Yashirish"}
          </button>
        </div>

        <div className="flex items-start gap-4">
          {showReference && (
            <button
              type="button"
              onClick={() => setRefOpen((v) => !v)}
              className={[
                "flex flex-col items-center rounded px-2 py-1 text-[11px] text-gray-800 hover:bg-gray-100",
                refOpen ? "bg-gray-100" : "",
              ].join(" ")}
            >
              <BookOpen className="h-5 w-5" />
              Qo'llanmalar
            </button>
          )}
          <button
            type="button"
            onClick={() => setHighlightOn((v) => !v)}
            className={[
              "flex flex-col items-center rounded px-2 py-1 text-[11px] text-gray-800 hover:bg-gray-100",
              highlightOn ? "bg-gray-200 font-semibold" : "",
            ].join(" ")}
          >
            <Highlighter className="h-5 w-5" />
            Belgilash
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex flex-col items-center rounded px-2 py-1 text-[11px] text-gray-800 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-5 w-5" />
              Ko'proq
            </button>
            {moreOpen && (
              <div className="absolute right-0 z-30 mt-1 w-52 rounded border border-gray-300 bg-white py-1 shadow-lg">
                <button
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setMoreOpen(false);
                    setSubmitted(true);
                  }}
                >
                  Imtihonni yakunlash
                </button>
                <button
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setMoreOpen(false);
                    void exitExam();
                  }}
                >
                  Imtihondan chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-10 md:py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-300 pb-3">
              <span className="flex h-7 w-7 items-center justify-center bg-black text-sm font-bold text-white">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => setFlags((f) => ({ ...f, [flagKey]: !f[flagKey] }))}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-black"
              >
                <Flag
                  className={["h-4 w-4", flags[flagKey] ? "fill-black text-black" : ""].join(" ")}
                />
                Ko'rib chiqish uchun belgilash
              </button>
            </div>

            <div ref={bodyRef} onMouseUp={applyHighlight}>
              {isSingle && (
                <SingleQuestion
                  question={group[0]}
                  answer={answers[group[0].id]}
                  onSelectOption={(idx) => setOptionAnswer(group[0].id, idx)}
                  onChangeText={(v) => setTextAnswer(group[0].id, v)}
                />
              )}

              {isMoslashtirish && (
                <MatchingGroup
                  group={group}
                  answers={answers}
                  activeSub={activeMatchSub}
                  onSelectSub={setActiveMatchSub}
                  onSelectOption={setOptionAnswer}
                />
              )}

              {isOpenGroup && (
                <OpenGroup group={group} answers={answers} onChangeText={setTextAnswer} />
              )}
            </div>
          </div>
        </main>

        {refOpen && showReference && (
          <div className="hidden md:block">
            <ReferencePanel onClose={() => setRefOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile reference overlay */}
      {refOpen && showReference && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <ReferencePanel onClose={() => setRefOpen(false)} />
        </div>
      )}

      {/* Footer */}
      <footer className="relative flex items-center justify-between gap-3 border-t border-gray-300 px-4 py-3 md:px-6">
        <div className="hidden truncate text-sm font-semibold md:block md:w-1/4">{userName}</div>

        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => setGridOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Savol {index + 1} / {total}
            <ChevronUp className={["h-4 w-4 transition", gridOpen ? "rotate-180" : ""].join(" ")} />
          </button>
        </div>

        <div className="flex justify-end gap-2 md:w-1/4">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-full border border-gray-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40 md:px-5"
          >
            Orqaga
          </button>
          {index === total - 1 ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 md:px-5"
            >
              Yakunlash
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 md:px-5"
            >
              Keyingi
            </button>
          )}
        </div>

        {gridOpen && (
          <div className="absolute bottom-16 left-1/2 z-30 w-[min(92vw,560px)] -translate-x-1/2 rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold">{examTitle}</span>
              <button onClick={() => setGridOpen(false)} aria-label="Yopish">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1">
                <i className="h-3 w-3 border border-dashed border-black" /> Joriy
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-3 w-3 bg-black" /> Javob berilgan
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-3 w-3 border border-gray-400 bg-white" /> Javobsiz
              </span>
              <span className="inline-flex items-center gap-1">
                <Flag className="h-3 w-3" /> Belgilangan
              </span>
            </div>
            <div className="grid max-h-56 grid-cols-8 gap-2 overflow-y-auto sm:grid-cols-10">
              {slots.map((g, i) => {
                const answered = g.length > 0 && g.every((q) => answers[q.id] !== undefined);
                const current = i === index;
                const key = g[0]?.groupId ? `group:${g[0].groupId}` : g[0]?.id ?? String(i);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setIndex(i);
                      setGridOpen(false);
                    }}
                    className={[
                      "relative flex h-8 w-8 items-center justify-center border text-xs font-semibold",
                      current ? "border-2 border-dashed border-black" : "border-gray-400",
                      answered ? "bg-black text-white" : "bg-white text-black",
                    ].join(" ")}
                  >
                    {i + 1}
                    {flags[key] && (
                      <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-white stroke-black" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </footer>

      {/* Directions */}
      {directionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 text-black shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Yo'riqnoma</h2>
              <button onClick={() => setDirectionsOpen(false)} aria-label="Yopish">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-gray-700">
              <p>Yopiq savollarda faqat bitta to'g'ri javobni tanlang.</p>
              <p>Ochiq savollarda javobingizni maydonga aniq va sodda holatda yozing.</p>
              <p>
                Moslashtirish turidagi savollarda pastdagi savolni bosib faollashtiring, so'ng
                o'ngdan mos javobni tanlang.
              </p>
              <p>
                Savolni keyinroq qayta ko'rib chiqmoqchi bo'lsangiz, bayroqcha bilan belgilab
                qo'ying.
              </p>
              <p>Vaqt tugagach imtihon avtomatik yakunlanadi.</p>
            </div>
            <button
              onClick={() => setDirectionsOpen(false)}
              className="mt-6 w-full rounded bg-black px-4 py-2.5 text-sm font-semibold text-white"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Single yopiq/ochiq question                                               */
/* -------------------------------------------------------------------------- */

function SingleQuestion({
  question,
  answer,
  onSelectOption,
  onChangeText,
}: {
  question: Question;
  answer: AnswerValue | undefined;
  onSelectOption: (idx: number) => void;
  onChangeText: (v: string) => void;
}) {
  return (
    <>
      <div className="text-[17px] leading-relaxed text-black">
        <MathContent latex={question.text} />
      </div>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Savol rasmi"
          className="mt-4 max-h-80 rounded border border-gray-300"
        />
      )}

      {question.questionType === "ochiq" ? (
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Javobingizni yozing:</label>
          {/* TODO: bu yerga loyihangizdagi MathLive komponentini ulang */}
          <input
            type="text"
            value={answer?.kind === "text" ? answer.value : ""}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Javob..."
            className="w-full max-w-md rounded-lg border border-gray-400 px-4 py-3 text-[16px] outline-none focus:border-black"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {question.options.slice(0, 4).map((opt, i) => {
            const selected = answer?.kind === "option" && answer.index === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectOption(i)}
                className={[
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3.5 text-left transition",
                  selected ? "border-2 border-black bg-gray-100" : "border-gray-400 hover:bg-gray-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    selected ? "border-black bg-black text-white" : "border-gray-500 text-gray-700",
                  ].join(" ")}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-[16px] leading-relaxed text-black">
                  <MathContent latex={opt} inline />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Moslashtirish group (33-35 style — tap-to-select, IELTS-style)            */
/* -------------------------------------------------------------------------- */

function MatchingGroup({
  group,
  answers,
  activeSub,
  onSelectSub,
  onSelectOption,
}: {
  group: Question[];
  answers: Record<string, AnswerValue>;
  activeSub: number;
  onSelectSub: (i: number) => void;
  onSelectOption: (questionId: string, idx: number) => void;
}) {
  const intro = group[0].groupIntro || group[0].text;
  const options = group[0].options;
  const activeQuestion = group[activeSub];

  return (
    <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
      <div>
        {group[0].imageUrl && (
          <img
            src={group[0].imageUrl}
            alt="Savol rasmi"
            className="mb-4 max-h-72 rounded border border-gray-300"
          />
        )}
        <div className="text-[16px] leading-relaxed text-black">
          <MathContent latex={intro} />
        </div>

        <div className="mt-5 space-y-2">
          {group.map((gq, i) => {
            const a = answers[gq.id];
            const pickedLabel = a?.kind === "option" ? LETTERS[a.index] : null;
            const isActive = i === activeSub;
            return (
              <button
                key={gq.id}
                type="button"
                onClick={() => onSelectSub(i)}
                className={[
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition",
                  isActive ? "border-2 border-black bg-gray-100" : "border-gray-400 hover:bg-gray-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    pickedLabel ? "border-black bg-black text-white" : "border-gray-500 text-gray-700",
                  ].join(" ")}
                >
                  {pickedLabel ?? "?"}
                </span>
                <span className="text-[15px] leading-relaxed text-black">
                  <MathContent latex={gq.text} inline />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 md:sticky md:top-4 md:h-fit">
        <div className="mb-3 text-xs text-gray-600">
          <span className="font-semibold text-black">{activeSub + 1}-savol</span> uchun javobni tanlang:
        </div>
        <div className="space-y-2">
          {options.map((optText, idx) => {
            const a = answers[activeQuestion.id];
            const selected = a?.kind === "option" && a.index === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOption(activeQuestion.id, idx)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition",
                  selected ? "border-2 border-black bg-gray-100" : "border-gray-400 hover:bg-gray-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    selected ? "border-black bg-black text-white" : "border-gray-500 text-gray-700",
                  ].join(" ")}
                >
                  {LETTERS[idx]}
                </span>
                <span className="text-[15px] text-black">
                  <MathContent latex={optText} inline />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Two-part ochiq group (36-a / 36-b — shown together on one screen)         */
/* -------------------------------------------------------------------------- */

function OpenGroup({
  group,
  answers,
  onChangeText,
}: {
  group: Question[];
  answers: Record<string, AnswerValue>;
  onChangeText: (questionId: string, v: string) => void;
}) {
  return (
    <div className="space-y-8">
      {group.map((q, i) => {
        const a = answers[q.id];
        return (
          <div key={q.id} className={i > 0 ? "border-t border-gray-200 pt-6" : ""}>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              {PART_LABELS[i] ?? i + 1}) qism
            </div>
            <div className="text-[16px] leading-relaxed text-black">
              <MathContent latex={q.text} />
            </div>
            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt="Savol rasmi"
                className="mt-4 max-h-72 rounded border border-gray-300"
              />
            )}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Javob: {PART_LABELS[i] ?? i + 1})
              </label>
              {/* TODO: bu yerga loyihangizdagi MathLive komponentini ulang */}
              <input
                type="text"
                value={a?.kind === "text" ? a.value : ""}
                onChange={(e) => onChangeText(q.id, e.target.value)}
                placeholder="Javob..."
                className="w-full max-w-md rounded-lg border border-gray-400 px-4 py-3 text-[16px] outline-none focus:border-black"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
