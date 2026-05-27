import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  Languages,
  Landmark,
  Atom,
  FlaskConical,
  Leaf,
  Award,
  Flame,
  Target,
  Trophy,
  Star,
  Medal,
  Crown,
  Gem,
  Sparkles,
} from "lucide-react";

/**
 * GrantX domain model.
 *
 * Pure types + catalogs + tiny localStorage repositories. The shapes match
 * what we'll store in Supabase later — repositories can be swapped one-for-one
 * with supabase-js calls without touching the UI.
 */

export type Difficulty = "easy" | "medium" | "hard";
export type ExamKind = "dtm" | "milliy";
export type DtmBlock = "mandatory" | "main1" | "main2";

/** DTM scoring constants (real Uzbekistan DTM format). */
export const DTM_POINTS = {
  mandatory: 1.1,
  main1: 3.1,
  main2: 2.1,
} as const;
export const DTM_QUESTIONS_PER_SUBJECT = {
  mandatory: 10,
  main1: 30,
  main2: 30,
} as const;
export const DTM_MAX_SCORE = 189; // 3*10*1.1 + 30*3.1 + 30*2.1
export const DTM_DURATION_MINUTES = 180;

export type Subject = {
  id: string;
  name: string;
  icon: LucideIcon;
  kinds: ExamKind[];
};

export const SUBJECTS: Subject[] = [
  { id: "ona-tili", name: "Ona tili", icon: Languages, kinds: ["dtm"] },
  { id: "ona-tili-adabiyot", name: "Ona tili va adabiyot", icon: BookOpen, kinds: ["milliy"] },
  { id: "matematika", name: "Matematika", icon: Calculator, kinds: ["dtm", "milliy"] },
  { id: "tarix", name: "Tarix", icon: Landmark, kinds: ["dtm", "milliy"] },
  { id: "fizika", name: "Fizika", icon: Atom, kinds: ["dtm", "milliy"] },
  { id: "kimyo", name: "Kimyo", icon: FlaskConical, kinds: ["dtm", "milliy"] },
  { id: "biologiya", name: "Biologiya", icon: Leaf, kinds: ["dtm", "milliy"] },
  { id: "ingliz-tili", name: "Ingliz tili", icon: Languages, kinds: ["dtm"] },
  { id: "cefr-english", name: "CEFR English", icon: Languages, kinds: ["milliy"] },
];

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}

export function subjectsByKind(kind: ExamKind) {
  return SUBJECTS.filter((s) => s.kinds.includes(kind));
}

/** Question record — Supabase-ready. */
export type Question = {
  id: string;
  subjectId: string;
  kind: ExamKind;
  /** For DTM only — which block this question belongs to. */
  block?: DtmBlock | null;
  category?: string;
  difficulty?: Difficulty;
  /** Admin-defined points awarded for a correct answer. */
  points?: number;
  /** Optional image (data URL or remote URL). */
  imageUrl?: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
};

/** Exam template — admin-defined exam structure. */
export type ExamTemplate = {
  id: string;
  title: string;
  kind: ExamKind;
  subjectIds: string[];
  durationMinutes: number;
  questionsPerSubject: number;
  difficulty?: Difficulty;
  createdAt: string;
};

/** Per-user exam attempt. */
export type ExamAttempt = {
  id: string;
  userId: string;
  examTitle: string;
  kind: ExamKind;
  subjectIds: string[];
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percent: number;
  durationSeconds: number;
  startedAt: string;
  finishedAt: string;
};

/* -------------------------------------------------------------------------- */
/*  Ranks                                                                     */
/* -------------------------------------------------------------------------- */

export type RankTier = {
  id: string;
  name: string;
  minXp: number;
  icon: LucideIcon;
  tone: string;
  ring: string;
};

export const RANKS: RankTier[] = [
  { id: "bronze", name: "Bronze", minXp: 0, icon: Medal, tone: "text-amber-600", ring: "from-amber-700/40 to-amber-500/20" },
  { id: "silver", name: "Silver", minXp: 500, icon: Award, tone: "text-slate-300", ring: "from-slate-400/40 to-slate-200/20" },
  { id: "gold", name: "Gold", minXp: 2000, icon: Trophy, tone: "text-yellow-400", ring: "from-yellow-500/40 to-yellow-300/20" },
  { id: "platinum", name: "Platinum", minXp: 5000, icon: Crown, tone: "text-cyan-300", ring: "from-cyan-400/40 to-cyan-200/20" },
  { id: "diamond", name: "Diamond", minXp: 10000, icon: Gem, tone: "text-fuchsia-300", ring: "from-fuchsia-400/40 to-fuchsia-200/20" },
];

export function rankForXp(xp: number): RankTier {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  return current;
}

export function nextRank(xp: number): RankTier | null {
  return RANKS.find((r) => r.minXp > xp) ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Achievements                                                              */
/* -------------------------------------------------------------------------- */

export type AchievementDef = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  check: (s: UserStats) => boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-test", name: "Birinchi imtihon", description: "Birinchi testingizni yakunladingiz", icon: Sparkles, check: (s) => s.totalTests >= 1 },
  { id: "ten-tests", name: "10 imtihon", description: "10 ta testni yakunladingiz", icon: Target, check: (s) => s.totalTests >= 10 },
  { id: "100-correct", name: "100 to'g'ri javob", description: "100 ta savolga to'g'ri javob berdingiz", icon: Star, check: (s) => s.totalCorrect >= 100 },
  { id: "streak-7", name: "7 kunlik streak", description: "7 kun ketma-ket faol bo'ldingiz", icon: Flame, check: (s) => s.streak >= 7 },
  { id: "top-10", name: "TOP 10 talaba", description: "Reytingda TOP 10 ga kirdingiz", icon: Crown, check: (s) => s.topRank > 0 && s.topRank <= 10 },
];

/* -------------------------------------------------------------------------- */
/*  Aggregated user stats (derived from attempts)                             */
/* -------------------------------------------------------------------------- */

export type UserStats = {
  totalTests: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuestions: number;
  averagePercent: number;
  bestPercent: number;
  xp: number;
  streak: number;
  weeklyActivity: number;
  topRank: number; // 0 = unranked
  perSubject: Record<string, { correct: number; total: number; attempts: number }>;
};

export const EMPTY_STATS: UserStats = {
  totalTests: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  totalQuestions: 0,
  averagePercent: 0,
  bestPercent: 0,
  xp: 0,
  streak: 0,
  weeklyActivity: 0,
  topRank: 0,
  perSubject: {},
};

export function computeStats(attempts: ExamAttempt[]): UserStats {
  if (!attempts.length) return EMPTY_STATS;
  const stats = { ...EMPTY_STATS, perSubject: {} as UserStats["perSubject"] };
  stats.totalTests = attempts.length;
  let pctSum = 0;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  for (const a of attempts) {
    stats.totalCorrect += a.correct;
    stats.totalIncorrect += a.incorrect;
    stats.totalQuestions += a.total;
    pctSum += a.percent;
    if (a.percent > stats.bestPercent) stats.bestPercent = a.percent;
    if (new Date(a.finishedAt).getTime() >= weekAgo) stats.weeklyActivity++;
    const perSubject = a.total ? Math.floor(a.total / Math.max(1, a.subjectIds.length)) : 0;
    const perCorrect = a.correct / Math.max(1, a.subjectIds.length);
    for (const sid of a.subjectIds) {
      const cur = stats.perSubject[sid] ?? { correct: 0, total: 0, attempts: 0 };
      cur.correct += perCorrect;
      cur.total += perSubject;
      cur.attempts += 1;
      stats.perSubject[sid] = cur;
    }
  }
  stats.averagePercent = Math.round(pctSum / attempts.length);
  stats.xp = stats.totalCorrect * 10 + stats.totalTests * 25;
  return stats;
}

/* -------------------------------------------------------------------------- */
/*  LocalStorage repositories (Supabase-ready interface)                      */
/* -------------------------------------------------------------------------- */

const KEY_QUESTIONS = "grantx.questions";
const KEY_EXAMS = "grantx.exams";
const KEY_ATTEMPTS = "grantx.attempts";
const KEY_ADMINS = "grantx.admins";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}
function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const questionsRepo = {
  list: () => read<Question>(KEY_QUESTIONS),
  add: (q: Omit<Question, "id" | "createdAt" | "updatedAt">) => {
    const all = read<Question>(KEY_QUESTIONS);
    const now = new Date().toISOString();
    const created: Question = { ...q, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    write(KEY_QUESTIONS, [created, ...all]);
    return created;
  },
  update: (id: string, patch: Partial<Question>) => {
    const all = read<Question>(KEY_QUESTIONS);
    const next = all.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q));
    write(KEY_QUESTIONS, next);
  },
  remove: (id: string) => {
    write(KEY_QUESTIONS, read<Question>(KEY_QUESTIONS).filter((q) => q.id !== id));
  },
};

export const examsRepo = {
  list: () => read<ExamTemplate>(KEY_EXAMS),
  add: (e: Omit<ExamTemplate, "id" | "createdAt">) => {
    const created: ExamTemplate = { ...e, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    write(KEY_EXAMS, [created, ...read<ExamTemplate>(KEY_EXAMS)]);
    return created;
  },
  remove: (id: string) => write(KEY_EXAMS, read<ExamTemplate>(KEY_EXAMS).filter((e) => e.id !== id)),
};

export const attemptsRepo = {
  list: (userId?: string) => {
    const all = read<ExamAttempt>(KEY_ATTEMPTS);
    return userId ? all.filter((a) => a.userId === userId) : all;
  },
  add: (a: Omit<ExamAttempt, "id">) => {
    const created: ExamAttempt = { ...a, id: crypto.randomUUID() };
    write(KEY_ATTEMPTS, [created, ...read<ExamAttempt>(KEY_ATTEMPTS)]);
    return created;
  },
};

/* -------------------------------------------------------------------------- */
/*  Admin allowlist                                                           */
/* -------------------------------------------------------------------------- */

export const DEFAULT_ADMINS = ["dilshoduktamov34@gmail.com"];

export function getAdminEmails(): string[] {
  if (typeof window === "undefined") return DEFAULT_ADMINS;
  try {
    const raw = localStorage.getItem(KEY_ADMINS);
    if (!raw) return DEFAULT_ADMINS;
    return JSON.parse(raw) as string[];
  } catch {
    return DEFAULT_ADMINS;
  }
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export const DIFFICULTIES: { id: Difficulty; name: string }[] = [
  { id: "easy", name: "Oson" },
  { id: "medium", name: "O'rtacha" },
  { id: "hard", name: "Qiyin" },
];

/* -------------------------------------------------------------------------- */
/*  Admin subject catalog — segregated by kind + DTM block                    */
/* -------------------------------------------------------------------------- */

export type AdminSubject = { id: string; name: string };

export const ADMIN_SUBJECTS: {
  dtmMandatory: AdminSubject[];
  dtmMain: AdminSubject[];
  milliy: AdminSubject[];
} = {
  dtmMandatory: [
    { id: "ona-tili", name: "Ona tili" },
    { id: "matematika-m", name: "Matematika (majburiy)" },
    { id: "tarix-m", name: "Tarix (majburiy)" },
  ],
  dtmMain: [
    { id: "matematika", name: "Matematika" },
    { id: "fizika", name: "Fizika" },
    { id: "kimyo", name: "Kimyo" },
    { id: "biologiya", name: "Biologiya" },
    { id: "geografiya", name: "Geografiya" },
    { id: "ingliz", name: "Ingliz tili" },
    { id: "adabiyot", name: "Adabiyot" },
    { id: "tarix", name: "Tarix" },
    { id: "huquq", name: "Huquq" },
    { id: "informatika", name: "Informatika" },
  ],
  milliy: [
    { id: "cefr-english", name: "CEFR English" },
    { id: "matematika", name: "Matematika" },
    { id: "ona-tili-adabiyot", name: "Ona tili va adabiyot" },
    { id: "tarix", name: "Tarix" },
    { id: "fizika", name: "Fizika" },
    { id: "biologiya", name: "Biologiya" },
    { id: "kimyo", name: "Kimyo" },
  ],
};

export function defaultPointsFor(kind: ExamKind, block?: DtmBlock | null): number {
  if (kind === "dtm" && block) return DTM_POINTS[block];
  return 1;
}