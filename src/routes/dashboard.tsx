import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  LineChart,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { attemptsRepo, computeStats, type ExamAttempt } from "@/lib/domain";
import { MILLIY_SUBJECTS } from "@/lib/milliy";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Bosh sahifa — INTIL" },
      {
        name: "description",
        content:
          "INTIL ish maydoni: milliy sertifikat tayyorgarligi, imtihon natijalari va shaxsiy tahlil.",
      },
      { property: "og:title", content: "Bosh sahifa — INTIL" },
      {
        property: "og:description",
        content: "Milliy sertifikat tayyorgarligingizni bir joydan boshqaring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Consecutive active days derived from real attempt timestamps. */
function computeStreak(attempts: ExamAttempt[]) {
  if (!attempts.length) return 0;
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days = new Set(attempts.map((a) => dayKey(new Date(a.finishedAt))));
  const today = new Date();
  let cursor = new Date(today);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-edge bg-white ${className}`}>{children}</div>
  );
}

function IconPlate({ icon: Icon }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deep">
      <Icon className="h-[18px] w-[18px] text-brass" strokeWidth={1.6} />
    </span>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[] | null>(null);

  useEffect(() => {
    setAttempts(attemptsRepo.list(user?.id));
  }, [user?.id]);

  const list = attempts ?? [];
  const stats = useMemo(() => (attempts ? computeStats(list) : null), [attempts]);
  const hasData = list.length > 0;
  const last = list[0];
  const streak = useMemo(() => computeStreak(list), [attempts]);

  const features = [
    {
      icon: Check,
      title: "1 Matematika + 1 Ona tili",
      sub: "Kunlik maqsadli mashq",
    },
    {
      icon: LineChart,
      title: "Progressni kuzating",
      sub: hasData
        ? `${stats?.totalTests} ta imtihon yakunlangan`
        : "Rivojlanishni real vaqtda ko'ring",
    },
    {
      icon: Sparkles,
      title: "Aniq tushuntirish",
      sub: "Har bir javob uchun izoh",
    },
  ];

  return (
    <DashboardShell
      title="Bosh sahifa"
      subtitle={`Xush kelibsiz, ${user?.fullName ?? "talaba"}`}
      streakDays={streak}
    >
      {/* Kunlik mashqlar */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <IconPlate icon={BookOpen} />
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-ink-strong">Kunlik mashqlar</h2>
            <p className="mt-0.5 text-[14px] text-ink-mute">
              Milliy sertifikatga har kuni maqsadli savollar bilan tayyorlaning
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-2xl border border-edge bg-white px-4 py-3.5"
            >
              <f.icon className="h-[18px] w-[18px] shrink-0 text-brass" strokeWidth={1.6} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-ink-strong">
                  {f.title}
                </span>
                <span className="block truncate text-[13px] text-ink-mute">{f.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <div className="mt-5 flex flex-col gap-4 rounded-[20px] bg-deep px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[18px] font-bold text-white">Mashq qilishga tayyormisiz?</p>
          <p className="mt-1 text-[14px] text-white/60">
            {hasData ? "Keyingi imtihonni tanlab davom eting" : "Shaxsiy tayyorgarlik rejasini yoqing"}
          </p>
        </div>
        <Link
          to="/milliy-sertifikat"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[14px] font-semibold text-ink-strong transition-colors hover:bg-[#F3EFE6]"
        >
          {hasData ? "Davom etish" : "Yoqish"}
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </div>

      {/* Pastki ikkita panel */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <IconPlate icon={Calendar} />
            <h3 className="text-[17px] font-bold text-ink-strong">Oxirgi imtihon</h3>
          </div>
          {hasData ? (
            <div className="mt-4">
              <p className="text-[15px] font-medium text-ink-strong">{last.examTitle}</p>
              <p className="mt-1 text-[14px] text-ink-mute">{fmtDate(last.finishedAt)}</p>
              <p className="tabnum mt-3 text-[14px] text-ink-strong">
                {last.correct}/{last.total} to'g'ri
              </p>
            </div>
          ) : (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-mute">
              Hozircha yakunlangan imtihon yo'q. Birinchi imtihoningizdan so'ng sana shu yerda ko'rinadi.
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <IconPlate icon={LineChart} />
            <h3 className="text-[17px] font-bold text-ink-strong">Natijangiz</h3>
          </div>
          {hasData && stats ? (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-ink-mute">Imtihonlar</p>
                <p className="tabnum mt-1.5 text-[24px] font-semibold text-ink-strong">
                  {stats.totalTests}
                </p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-ink-mute">O'rtacha</p>
                <p className="tabnum mt-1.5 text-[24px] font-semibold text-ink-strong">
                  {stats.averagePercent}%
                </p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-ink-mute">Eng yuqori</p>
                <p className="tabnum mt-1.5 text-[24px] font-semibold text-ink-strong">
                  {stats.bestPercent}%
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-mute">
              Hozircha ma'lumot yo'q. Birinchi imtihon natijasi bu yerda ko'rinadi.
            </p>
          )}
        </Card>
      </div>

      {/* Fanlar kesimi — faqat real ma'lumot bo'lsa */}
      {hasData && stats && Object.keys(stats.perSubject).length > 0 && (
        <Card className="mt-5 p-5 sm:p-6">
          <h3 className="text-[17px] font-bold text-ink-strong">Fanlar bo'yicha</h3>
          <ul className="mt-4 space-y-4">
            {Object.entries(stats.perSubject).map(([sid, v]) => {
              const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
              return (
                <li key={sid}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-strong">{MILLIY_SUBJECTS[sid]?.name ?? sid}</span>
                    <span className="tabnum text-ink-mute">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EDE8DC]">
                    <div className="h-full rounded-full bg-brass" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DashboardShell>
  );
}
