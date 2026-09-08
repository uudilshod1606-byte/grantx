import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  Timer,
  XCircle,
} from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { EmptyState, Skeleton } from "@/components/intil/ui";
import { MathContent } from "@/components/math/MathContent";
import { cn } from "@/lib/utils";
import {
  BANK_CATEGORIES,
  BANK_SUBJECTS,
  attemptsRepo,
  questionsRepo,
  type Question,
} from "@/lib/domain";

type BankSearch = {
  subject: string;
  categories: string;
  mode: "timed" | "untimed";
  volume: string;
};

export const Route = createFileRoute("/savollar-banki/mashq")({
  validateSearch: (search: Record<string, unknown>): BankSearch => ({
    subject: typeof search.subject === "string" ? search.subject : "fizika",
    categories: typeof search.categories === "string" ? search.categories : "",
    mode: search.mode === "untimed" ? "untimed" : "timed",
    volume: typeof search.volume === "string" ? search.volume : "all",
  }),
  component: () => (
    <ProtectedRoute>
      <BankSessionPage />
    </ProtectedRoute>
  ),
  head: () => ({
    meta: [{ title: "Mashq sessiyasi — Savollar banki · INTIL" }, { name: "robots", content: "noindex" }],
  }),
});

const LETTERS = ["A", "B", "C", "D"];
const SECONDS_PER_QUESTION = 90;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Stage = "loading" | "preview" | "running" | "done";

function BankSessionPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const subject = BANK_SUBJECTS.find((s) => s.id === search.subject);
  const categoryNames = new Map((BANK_CATEGORIES[search.subject] ?? []).map((c) => [c.id, c.name]));
  const wantedCategories = useMemo(
    () => new Set(search.categories.split(",").filter(Boolean)),
    [search.categories],
  );

  const [all, setAll] = useState<Question[] | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [stage, setStage] = useState<Stage>("loading");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    questionsRepo
      .list()
      .then((rows) => {
        if (!alive) return;
        setAll(rows);
      })
      .catch(() => alive && setAll([]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (all === null) return;
    const matched = all.filter(
      (q) =>
        q.kind === "bank" &&
        q.subjectId === search.subject &&
        (wantedCategories.size === 0 || wantedCategories.has(q.category ?? "")),
    );
    const shuffled = shuffle(matched);
    const limit = search.volume === "all" ? shuffled.length : Number(search.volume) || shuffled.length;
    setPool(shuffled.slice(0, limit));
    setStage("preview");
  }, [all, search.subject, search.volume, wantedCategories]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStage("done");
    if (user) {
      const correct = pool.filter((q) => answers[q.id] === q.correctIndex).length;
      const unanswered = pool.filter((q) => answers[q.id] === undefined).length;
      const total = pool.length;
      attemptsRepo.add({
        userId: user.id,
        examTitle: `Savollar banki · ${subject?.name ?? search.subject}`,
        kind: "bank",
        subjectIds: [search.subject],
        total,
        correct,
        incorrect: total - correct - unanswered,
        unanswered,
        percent: total ? Math.round((correct / total) * 100) : 0,
        durationSeconds:
          search.mode === "timed" ? pool.length * SECONDS_PER_QUESTION - secondsLeft : 0,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (stage !== "running" || search.mode !== "timed") return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, secondsLeft, search.mode]);

  const startSession = () => {
    finishedRef.current = false;
    setIndex(0);
    setAnswers({});
    setChecked({});
    setSecondsLeft(pool.length * SECONDS_PER_QUESTION);
    setStage("running");
  };

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6">
        <EmptyState
          title="Fan topilmadi."
          description="Savollar banki sahifasidan qaytadan tanlang."
          cta={
            <Link to="/savollar-banki" className="text-sm font-medium text-ink underline">
              Savollar bankiga qaytish
            </Link>
          }
        />
      </div>
    );
  }

  if (stage === "loading" || all === null) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-6 py-16">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6">
        <EmptyState
          title="Tanlangan mavzular bo'yicha savol topilmadi."
          description="Boshqa mavzularni tanlab ko'ring."
          cta={
            <Link to="/savollar-banki" className="text-sm font-medium text-ink underline">
              Savollar bankiga qaytish
            </Link>
          }
        />
      </div>
    );
  }

  if (stage === "preview") {
    const catLabel =
      wantedCategories.size === 0
        ? "Barcha mavzular"
        : [...wantedCategories].map((id) => categoryNames.get(id) ?? id).join(", ");
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6">
        <div className="w-full max-w-lg rounded-[24px] border border-hairline bg-card p-8">
          <p className="eyebrow">Savollar banki</p>
          <h1 className="mt-3 text-2xl font-semibold text-ink">{subject.name} · mashq sessiyasi</h1>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <dt className="text-ink-soft">Mavzular</dt>
              <dd className="max-w-[60%] text-right font-medium text-ink">{catLabel}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <dt className="text-ink-soft">Savollar soni</dt>
              <dd className="tabnum font-medium text-ink">{pool.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Rejim</dt>
              <dd className="flex items-center gap-1.5 font-medium text-ink">
                {search.mode === "timed" ? <Timer className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                {search.mode === "timed"
                  ? `Vaqtli · ${formatTime(pool.length * SECONDS_PER_QUESTION)}`
                  : "Vaqtsiz"}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex gap-3">
            <Link
              to="/savollar-banki"
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-hairline text-sm font-medium text-ink-soft transition-colors hover:bg-ivory"
            >
              Orqaga
            </Link>
            <button
              type="button"
              onClick={startSession}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-obsidian text-sm font-medium text-ivory transition-colors hover:bg-obsidian-soft"
            >
              Boshlash
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    const correct = pool.filter((q) => answers[q.id] === q.correctIndex).length;
    const total = pool.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="mx-auto min-h-screen max-w-2xl px-6 py-14">
        <div className="rounded-[24px] border border-hairline bg-card p-8 text-center">
          <p className="eyebrow">Sessiya yakunlandi</p>
          <p className="tabnum mt-4 text-[52px] font-semibold leading-none text-ink">{percent}%</p>
          <p className="mt-2 text-sm text-ink-soft">
            {correct} / {total} savolga to'g'ri javob berdingiz
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/savollar-banki"
              className="flex h-11 items-center justify-center rounded-xl border border-hairline px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-ivory"
            >
              Yana mashq qilish
            </Link>
            <Link
              to="/dashboard"
              className="flex h-11 items-center justify-center rounded-xl bg-obsidian px-5 text-sm font-medium text-ivory transition-colors hover:bg-obsidian-soft"
            >
              Bosh sahifa
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {pool.map((q, i) => {
            const given = answers[q.id];
            const isCorrect = given === q.correctIndex;
            return (
              <div key={q.id} className="rounded-2xl border border-hairline bg-card p-5">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft">Savol {i + 1}</p>
                    <MathContent latex={q.text} className="mt-1 text-[15px] text-ink" />
                    <div className="mt-3 space-y-1 text-sm">
                      {given !== undefined && (
                        <p className={isCorrect ? "text-emerald-700" : "text-red-600"}>
                          Sizning javobingiz: {LETTERS[given]}) {q.options[given]}
                        </p>
                      )}
                      {!isCorrect && q.correctIndex !== undefined && (
                        <p className="text-ink">
                          To'g'ri javob: {LETTERS[q.correctIndex]}) {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="mt-2 rounded-lg bg-ivory p-3 text-xs leading-relaxed text-ink-soft">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // running
  const question = pool[index];
  const isLast = index === pool.length - 1;

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-hairline bg-page/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/savollar-banki" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Chiqish
          </Link>
          <span className="tabnum text-sm text-ink-soft">
            Savol {index + 1} / {pool.length}
          </span>
          {search.mode === "timed" ? (
            <span
              className={cn(
                "tabnum flex items-center gap-1.5 text-sm font-medium",
                secondsLeft <= 30 ? "text-red-600" : "text-ink",
              )}
            >
              <Timer className="h-4 w-4" /> {formatTime(Math.max(0, secondsLeft))}
            </span>
          ) : (
            <span className="text-sm text-ink-soft">{Object.keys(checked).length} tekshirildi</span>
          )}
        </div>
        <div className="h-1 w-full bg-obsidian/[0.06]">
          <div
            className="h-full bg-gold transition-[width] duration-300"
            style={{ width: `${((index + 1) / pool.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-[24px] border border-hairline bg-card p-6 sm:p-8">
          <p className="eyebrow">
            {subject.name}
            {question.category ? ` · ${categoryNames.get(question.category) ?? question.category}` : ""}
          </p>
          <MathContent latex={question.text} className="mt-4 text-[17px] leading-relaxed text-ink" />
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              className="mt-4 max-h-[280px] rounded-xl border border-hairline object-contain"
            />
          )}

          <div className="mt-6 space-y-2.5">
            {question.options.map((option, i) => {
              const selected = answers[question.id] === i;
              const isChecked = !!checked[question.id];
              const isCorrectOption = i === question.correctIndex;
              let stateClass = selected
                ? "border-obsidian bg-obsidian text-ivory"
                : "border-hairline bg-card text-ink hover:border-gold/40 hover:bg-ivory";
              if (isChecked) {
                if (isCorrectOption) stateClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                else if (selected) stateClass = "border-red-400 bg-red-50 text-red-700";
                else stateClass = "border-hairline bg-card text-ink-soft opacity-70";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: i }))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors disabled:cursor-default",
                    stateClass,
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                      isChecked
                        ? isCorrectOption
                          ? "border-emerald-500 text-emerald-700"
                          : selected
                          ? "border-red-400 text-red-600"
                          : "border-hairline text-ink-soft"
                        : selected
                        ? "border-ivory/60 text-ivory"
                        : "border-hairline text-ink-soft",
                    )}
                  >
                    {isChecked && isCorrectOption ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : isChecked && selected ? <XCircle className="h-3.5 w-3.5" /> : LETTERS[i]}
                  </span>
                  <MathContent latex={option} inline className="text-[15px]" />
                </button>
              );
            })}
          </div>

          {checked[question.id] && (
            <div
              className={cn(
                "mt-5 rounded-xl border p-4",
                answers[question.id] === question.correctIndex
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50",
              )}
            >
              <p className={cn("text-sm font-medium", answers[question.id] === question.correctIndex ? "text-emerald-800" : "text-red-700")}>
                {answers[question.id] === question.correctIndex
                  ? "To'g'ri javob!"
                  : `Noto'g'ri. To'g'ri javob: ${question.correctIndex !== undefined ? LETTERS[question.correctIndex] : "—"}`}
              </p>
              {question.explanation && (
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{question.explanation}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-hairline px-4 text-sm font-medium text-ink-soft transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Oldingi
          </button>

          {!checked[question.id] ? (
            <button
              type="button"
              onClick={() => setChecked((prev) => ({ ...prev, [question.id]: true }))}
              disabled={answers[question.id] === undefined}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-obsidian px-5 text-sm font-medium text-ivory transition-colors hover:bg-obsidian-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> Tekshirish
            </button>
          ) : isLast ? (
            <button
              type="button"
              onClick={finish}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-obsidian px-5 text-sm font-medium text-ivory transition-colors hover:bg-obsidian-soft"
            >
              <Flag className="h-4 w-4" /> Yakunlash
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(pool.length - 1, i + 1))}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-obsidian px-5 text-sm font-medium text-ivory transition-colors hover:bg-obsidian-soft"
            >
              Keyingi <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
