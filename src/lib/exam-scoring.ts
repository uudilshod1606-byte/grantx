/**
 * Milliy Sertifikat ball hisoblash tizimi.
 *
 * Barcha raqamlar konfiguratsiya fayllaridan olinadi:
 *  - src/config/ball-tizimi.json  — har bir fan, har bir savol raqamining balli
 *  - src/config/esse-jadval.json  — esse xom balli (0-24) → 75 ballik shkala
 *
 * Bu faylda hech qanday ball qo'lda yozilmagan.
 */
import ballTizimi from "@/config/ball-tizimi.json";
import esseJadval from "@/config/esse-jadval.json";

type SubjectPoints = Record<string, number | string[] | undefined>;

const POINTS = ballTizimi as unknown as Record<string, SubjectPoints>;
const ESSAY_TABLE = esseJadval as unknown as Record<string, number>;

/** subjectId (route/DB) → "ball-tizimi.json" dagi fan nomi. */
const SUBJECT_NAMES: Record<string, string> = {
  matematika: "Matematika",
  fizika: "Fizika",
  tarix: "Tarix",
  kimyo: "Kimyo",
  biologiya: "Biologiya",
  "ona-tili": "Ona tili va adabiyot",
  "ona-tili-adabiyot": "Ona tili va adabiyot",
};

export type QuestionSlotType = "yopiq" | "moslashtirish" | "ochiq" | "qisqa-ochiq" | "yozma" | "esse";

export type SubjectStructure = {
  subjectName: string;
  /** Umumiy savollar soni. */
  totalQuestions: number;
  closed: [number, number];
  matching: [number, number];
  /** a/b qismli ochiq savollar (bo'lmasa null). */
  open: [number, number] | null;
  /** Bitta qismli qisqa ochiq savollar (Kimyo/Biologiya 36-40). */
  shortOpen: [number, number] | null;
  /** Admin baholaydigan kengaytirilgan yozma savollar (Kimyo/Biologiya 41-43). */
  written: [number, number] | null;
  /** Ona tili 45 — esse. */
  essay: number | null;
  /** "A" = oddiy yig'indi, "B" = test + yozma bo'lim o'rtachasi. */
  method: "A" | "B";
  /** "B" usuli uchun test bo'limining savol oralig'i. */
  testRange: [number, number];
};

const STRUCTURES: Record<string, SubjectStructure> = {
  Matematika: { subjectName: "Matematika", totalQuestions: 45, closed: [1, 32], matching: [33, 35], open: [36, 45], shortOpen: null, written: null, essay: null, method: "A", testRange: [1, 45] },
  Fizika: { subjectName: "Fizika", totalQuestions: 45, closed: [1, 32], matching: [33, 35], open: [36, 45], shortOpen: null, written: null, essay: null, method: "A", testRange: [1, 45] },
  Tarix: { subjectName: "Tarix", totalQuestions: 45, closed: [1, 32], matching: [33, 35], open: [36, 45], shortOpen: null, written: null, essay: null, method: "A", testRange: [1, 45] },
  "Ona tili va adabiyot": { subjectName: "Ona tili va adabiyot", totalQuestions: 45, closed: [1, 32], matching: [33, 35], open: [36, 44], shortOpen: null, written: null, essay: 45, method: "B", testRange: [1, 44] },
  Biologiya: { subjectName: "Biologiya", totalQuestions: 43, closed: [1, 32], matching: [33, 35], open: null, shortOpen: [36, 40], written: [41, 43], essay: null, method: "B", testRange: [1, 40] },
  Kimyo: { subjectName: "Kimyo", totalQuestions: 43, closed: [1, 32], matching: [33, 35], open: null, shortOpen: [36, 40], written: [41, 43], essay: null, method: "B", testRange: [1, 40] },
};

export function subjectNameFor(subjectId: string): string | null {
  return SUBJECT_NAMES[subjectId] ?? null;
}

export function structureFor(subjectId: string): SubjectStructure | null {
  const name = subjectNameFor(subjectId);
  return name ? STRUCTURES[name] ?? null : null;
}

function inRange(n: number, r: [number, number] | null): boolean {
  return !!r && n >= r[0] && n <= r[1];
}

/** Savol raqamiga qarab fan strukturasidagi turi. */
export function slotTypeFor(subjectId: string, questionNumber: number): QuestionSlotType | null {
  const s = structureFor(subjectId);
  if (!s) return null;
  if (s.essay === questionNumber) return "esse";
  if (inRange(questionNumber, s.written)) return "yozma";
  if (inRange(questionNumber, s.shortOpen)) return "qisqa-ochiq";
  if (inRange(questionNumber, s.open)) return "ochiq";
  if (inRange(questionNumber, s.matching)) return "moslashtirish";
  if (inRange(questionNumber, s.closed)) return "yopiq";
  return null;
}

/** "ball-tizimi.json" dan aniq ball. Fan yoki savol topilmasa null. */
export function pointsForQuestionNumber(subjectId: string, questionNumber: number): number | null {
  const name = subjectNameFor(subjectId);
  if (!name) return null;
  const table = POINTS[name];
  const v = table?.[String(questionNumber)];
  return typeof v === "number" ? v : null;
}

/** Fanning umumiy maksimal balli ("max" yoki barcha savollar yig'indisi). */
export function subjectMaxPoints(subjectId: string): number | null {
  const name = subjectNameFor(subjectId);
  if (!name) return null;
  const table = POINTS[name];
  if (!table) return null;
  const max = table["max"];
  if (typeof max === "number") return max;
  return sumRange(subjectId, [1, structureFor(subjectId)?.totalQuestions ?? 0]);
}

export function sumRange(subjectId: string, range: [number, number]): number {
  let sum = 0;
  for (let n = range[0]; n <= range[1]; n++) sum += pointsForQuestionNumber(subjectId, n) ?? 0;
  return round2(sum);
}

/** "B" usulidagi test bo'limining maksimal xom balli. */
export function testSectionMax(subjectId: string): number {
  const s = structureFor(subjectId);
  return s ? sumRange(subjectId, s.testRange) : 0;
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/* -------------------------------------------------------------------------- */
/*  Esse: 12 mezon                                                            */
/* -------------------------------------------------------------------------- */

export type EssayCriterion = { id: string; name: string; guide: string };

export const ESSAY_CRITERIA: EssayCriterion[] = [
  { id: "uslub", name: "Publitsistik uslub", guide: "2=to'liq publitsistik; 1.5=ayrim joyda chekingan; 1=qisman; 0.5=to'liq badiiy; 0=to'liq so'zlashuv uslubida." },
  { id: "qarashlar", name: "Ikki qarash + shaxsiy fikr", guide: "2=ikkala qarash+shaxsiy fikr to'liq; 1.5=ikkala qarash bor, shaxsiy fikr yo'q; 1=bitta qarash to'liq; 0.5=bitta qarash qisman; 0=yoritilmagan." },
  { id: "dalillash", name: "Dalillash", guide: "2=ikkala qarash dalillangan; 1.5=bitta qarash dalillangan; 1=ikkala qarash uchun ayrim dalil mos emas; 0.5=ikkala qarash dalili mos emas; 0=dalillanmagan." },
  { id: "tuzilish", name: "Kirish-asosiy-xulosa", guide: "2=uchalasi to'liq; 1.5=ikkitasi to'liq; 1=ikki qism yuzaki; 0.5=bitta qism to'liq; 0=bitta qism yuzaki." },
  { id: "mantiq", name: "Mantiqiy qurilish / xatboshilar", guide: "2=xato yo'q; 1.5=1-2 xato; 1=3-4 xato; 0.5=5-6 xato; 0=7+ xato yoki xatboshisiz." },
  { id: "izchillik", name: "Izchillik / takror", guide: "2=takror yo'q; 1.5=1-2 takror; 1=3-4 takror; 0.5=5-6 takror+izchillik buzilgan; 0=7+ takror+izchillik buzilgan." },
  { id: "imlo", name: "Imlo", guide: "2=0 xato; 1.5=1-2; 1=3-4; 0.5=5-6; 0=7+." },
  { id: "punktuatsiya", name: "Punktuatsiya", guide: "2=0 xato; 1.5=1-2; 1=3-4; 0.5=5-6; 0=7+." },
  { id: "qoshimchalar", name: "Qo'shimchalar", guide: "2=0 xato; 1.5=1-2; 1=3-4; 0.5=5-6; 0=7+." },
  { id: "soz-qollash", name: "So'z qo'llash", guide: "2=0 xato; 1.5=1-2; 1=3-4; 0.5=5-6; 0=7+." },
  { id: "lugat", name: "Lug'at boyligi", guide: "2=xilma-xillik+tasviriy ifodalar unumli; 1.5=ayrim joyda; 1=xilma-xillik bor, ayrim noo'rin; 0.5=xilma-xillik yo'q+noo'rin; 0=xilma-xillik yo'q, ishlatilmagan." },
  { id: "nutq-sofligi", name: "Nutq sofligi", guide: "2=sheva/vulgarizm/parazit so'z yo'q; 1.5=1-2 ta, g'alizlik yo'q; 1=3-4 ta+g'alizlik bor; 0.5=5-6 ta+g'alizlik; 0=7+ ta+g'alizlik." },
];

export const ESSAY_MAX_RAW = ESSAY_CRITERIA.length * 2; // 24

/** 12 mezon xom balli (0-24) → 75 ballik natija, faqat "esse-jadval.json" bo'yicha. */
export function essayRawTo75(raw: number): number {
  const clamped = Math.max(0, Math.min(ESSAY_MAX_RAW, raw));
  const step = Math.round(clamped * 2) / 2;
  const exact = ESSAY_TABLE[step.toFixed(1)];
  if (typeof exact === "number") return exact;
  // Jadval 2.5 dan boshlanadi — undan past xom ball uchun natija yo'q.
  return 0;
}

/* -------------------------------------------------------------------------- */
/*  Yakuniy ball                                                              */
/* -------------------------------------------------------------------------- */

/** USUL A — oddiy yig'indi (Matematika, Fizika, Tarix). */
export function finalScoreMethodA(subjectId: string, rawScore: number): number {
  const max = subjectMaxPoints(subjectId) ?? 0;
  if (!max) return 0;
  return round2((rawScore / max) * 75);
}

/** Test bo'limi xom balini 75 ballik shkalaga o'tkazadi ("B" usuli). */
export function testSection75(subjectId: string, testRaw: number): number {
  const max = testSectionMax(subjectId);
  if (!max) return 0;
  return round2((testRaw / max) * 75);
}

/** USUL B — test bo'limi va yozma bo'lim natijalarining o'rtachasi. */
export function finalScoreMethodB(test75: number, writtenResult75: number): number {
  return round2((test75 + writtenResult75) / 2);
}

/* -------------------------------------------------------------------------- */
/*  Daraja jadvali                                                            */
/* -------------------------------------------------------------------------- */

export function gradeFor(score75: number): string | null {
  if (score75 >= 70) return "A+";
  if (score75 >= 65) return "A";
  if (score75 >= 60) return "B+";
  if (score75 >= 55) return "B";
  if (score75 >= 50) return "C+";
  if (score75 >= 46) return "C";
  return null;
}

export const SCORE_DISCLAIMER =
  "Bu taxminiy natija, rasmiy UZBMB hisob-kitobidan farq qilishi mumkin.";
