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
import type { Question } from "@/lib/domain";
import { MathContent } from "@/components/math/MathContent";
import { ReferencePanel } from "./ReferencePanel";

const LETTERS = ["A", "B", "C", "D"] as const;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [clockHidden, setClockHidden] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [highlightOn, setHighlightOn] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const reportedRef = useRef(false);

  const q = questions[index];

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
      if (answers[item.id] === item.correctIndex) correct++;
    }
    return correct;
  }, [answers, questions]);

  // Report the real result exactly once.
  useEffect(() => {
    if (!submitted || reportedRef.current || !total) return;
    reportedRef.current = true;
    const answered = questions.filter((q) => answers[q.id] !== undefined).length;
    const finishedAt = new Date().toISOString();
    onComplete?.({
      total,
      correct: score,
      incorrect: answered - score,
      unanswered: total - answered,
      percent: Math.round((score / total) * 100),
      durationSeconds: durationMinutes * 60 - secondsLeft,
      startedAt: startedAtRef.current,
      finishedAt,
    });
  }, [submitted, total, questions, answers, score, durationMinutes, secondsLeft, onComplete]);

  const exitExam = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
    onExit();
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
    const percent = Math.round((score / total) * 100);
    const answered = questions.filter((q) => answers[q.id] !== undefined).length;
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
              {score} / {total} to'g'ri javob
            </span>
          </div>

          <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6F6A62]">
            Natijangiz tahlili
          </h2>
          <dl className="mt-6 grid grid-cols-3 gap-x-8 gap-y-6">
            {([
              ["To'g'ri", score],
              ["Noto'g'ri", answered - score],
              ["Javobsiz", total - answered],
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
                onClick={() =>
                  setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-black"
              >
                <Flag
                  className={["h-4 w-4", flags[q.id] ? "fill-black text-black" : ""].join(" ")}
                />
                Ko'rib chiqish uchun belgilash
              </button>
            </div>

            <div ref={bodyRef} onMouseUp={applyHighlight}>
              <div className="text-[17px] leading-relaxed text-black">
                <MathContent latex={q.text} />
              </div>
              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Savol rasmi"
                  className="mt-4 max-h-80 rounded border border-gray-300"
                />
              )}

              <div className="mt-6 space-y-3">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      className={[
                        "flex w-full items-start gap-3 rounded-lg border px-4 py-3.5 text-left transition",
                        selected
                          ? "border-2 border-black bg-gray-100"
                          : "border-gray-400 hover:bg-gray-50",
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
              {questions.map((item, i) => {
                const answered = answers[item.id] !== undefined;
                const current = i === index;
                return (
                  <button
                    key={item.id}
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
                    {flags[item.id] && (
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
              <p>Har bir savolga faqat bitta to'g'ri javobni tanlang.</p>
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