import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass } from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { BrandVisual } from "@/components/intil/BrandVisual";
import {
  ActivityItem,
  ButtonLink,
  EmptyState,
  Eyebrow,
  InfoTip,
  MetricDisplay,
  Panel,
  ProgressIndicator,
  SectionHeader,
  Skeleton,
  StatusBadge,
} from "@/components/intil/ui";
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

function firstName(full?: string | null) {
  const n = (full ?? "").trim().split(" ").filter(Boolean);
  return n[0] ?? "talaba";
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

function DashboardContent() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[] | null>(null);

  useEffect(() => {
    // Attempts are stored locally per user until the backend takes over.
    setAttempts(attemptsRepo.list(user?.id));
  }, [user?.id]);

  const stats = useMemo(() => (attempts ? computeStats(attempts) : null), [attempts]);
  const loading = attempts === null;
  const hasData = !!attempts?.length;
  const last = attempts?.[0];

  return (
    <AppShell breadcrumb={[{ label: "INTIL", to: "/dashboard" }, { label: "Bosh sahifa" }]}>
      {/* ---------------------------------------------------------------- */}
      {/*  Hero                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="rise relative overflow-hidden rounded-[28px] bg-obsidian text-ivory">
        <div className="girih pointer-events-none absolute inset-0 opacity-[0.35]" />
        <div className="pointer-events-none absolute -right-24 -top-24 hidden h-[520px] w-[520px] opacity-90 md:block">
          <BrandVisual className="h-full w-full" />
        </div>

        <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 md:max-w-[62%]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-champagne">
              Milliy sertifikat
            </p>
            <h1 className="mt-5 text-[30px] font-semibold leading-[1.12] text-ivory sm:text-[42px]">
              Assalomu alaykum, {firstName(user?.fullName)}.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory/60">
              {hasData
                ? "Tayyorgarlik davom etmoqda. Keyingi imtihonni tanlab, natijangizni mustahkamlang."
                : "Tayyorgarligingiz shu yerdan boshlanadi. Birinchi imtihon darajangizni aniqlaydi."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink to="/milliy-sertifikat" variant="gold" size="lg">
              {hasData ? "Imtihonni tanlash" : "Boshlash"}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <Link
              to="/testlar"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/12 px-5 text-[15px] text-ivory/75 transition-colors hover:border-champagne/40 hover:text-ivory"
            >
              Imtihonlarim
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Keyingi qadam                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Bugungi tayyorgarlik"
          title="Keyingi qadam"
          description="Har kuni bitta aniq harakat — tayyorgarlikning eng ishonchli yo'li."
        />

        {loading ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Panel className="p-6 sm:p-8">
              <Eyebrow>{hasData ? "Tavsiya" : "Diagnostika"}</Eyebrow>
              <h3 className="mt-3 text-[22px] font-semibold leading-snug text-ink">
                {hasData ? "Tayyorgarlikni davom ettiring." : "Darajangizni aniqlang."}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                {hasData
                  ? `Oxirgi imtihoningiz — ${last?.examTitle}. Yangi variantni ishlab, natijangizni solishtiring.`
                  : "Birinchi diagnostik testdan boshlang. Natija asosida kuchli va zaif tomonlaringiz aniqlanadi."}
              </p>
              <div className="mt-7">
                <ButtonLink to="/milliy-sertifikat" size="md">
                  {hasData ? "Davom ettirish" : "Boshlash"}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </Panel>

            <div className="rounded-[24px] border border-hairline bg-ivory p-6 sm:p-8">
              <Eyebrow>Baholash</Eyebrow>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Platformadagi ko'rsatkich — <span className="font-medium text-ink">test natijasi</span>:
                to'g'ri javoblar ulushi. Bu rasmiy sertifikat balli emas. Rasmiy natija Rash modeli
                asosida, savol qiyinligi hisobga olingan holda hisoblanadi.
              </p>
              <div className="mt-5">
                <InfoTip label="Rash modeli haqida">
                  Rash modelida har bir savolning qiyinlik darajasi hisobga olinadi, shuning uchun
                  bir xil sondagi to'g'ri javob har doim ham bir xil rasmiy ballni bermaydi.
                </InfoTip>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Natijangiz                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Ko'rsatkichlar"
          title="Natijangiz"
          description="Faqat siz ishlagan imtihonlardan olingan haqiqiy ma'lumot."
        />

        {loading ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        ) : !hasData || !stats ? (
          <EmptyState
            icon={Compass}
            title="Natijangiz hali shakllanmagan."
            description="Birinchi imtihoningizdan so'ng bu yerda shaxsiy tahlilingiz paydo bo'ladi."
            cta={
              <ButtonLink to="/milliy-sertifikat" size="md">
                Testni boshlash
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
        ) : (
          <div className="mt-8 grid divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <div className="pb-6 sm:pb-0 lg:pr-8">
              <MetricDisplay label="Ishlangan imtihonlar" value={stats.totalTests} />
            </div>
            <div className="py-6 sm:py-0 lg:px-8">
              <MetricDisplay label="O'rtacha natija" value={stats.averagePercent} suffix="%" />
            </div>
            <div className="py-6 sm:py-0 lg:px-8">
              <MetricDisplay label="Eng yuqori natija" value={stats.bestPercent} suffix="%" />
            </div>
            <div className="pt-6 sm:pt-0 lg:pl-8">
              <MetricDisplay
                label="Haftalik faollik"
                value={stats.weeklyActivity}
                hint="So'nggi 7 kun ichida yakunlangan imtihonlar"
              />
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Fanlar + faoliyat                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-14 grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader eyebrow="Tahlil" title="Fanlar bo'yicha" />
          {loading ? (
            <div className="mt-6 space-y-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ) : !hasData || !stats || !Object.keys(stats.perSubject).length ? (
            <EmptyState
              title="Fanlar kesimi hali bo'sh."
              description="Yetarli ma'lumot to'plangach, har bir fan bo'yicha tahlilingiz shu yerda paydo bo'ladi."
            />
          ) : (
            <ul className="mt-6 space-y-6">
              {Object.entries(stats.perSubject).map(([sid, v]) => {
                const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
                return (
                  <li key={sid}>
                    <ProgressIndicator
                      label={MILLIY_SUBJECTS[sid]?.name ?? sid}
                      value={pct}
                    />
                    <p className="mt-1.5 text-xs text-ink-soft">
                      {v.attempts} ta imtihon
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <SectionHeader
            eyebrow="Tarix"
            title="Oxirgi faoliyat"
            action={
              hasData ? (
                <Link
                  to="/testlar"
                  className="inline-flex items-center gap-1 text-[13px] text-ink-soft transition-colors hover:text-gold-muted"
                >
                  Barchasi <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : undefined
            }
          />
          {loading ? (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : !hasData ? (
            <EmptyState
              title="Faoliyat tarixi bo'sh."
              description="Yakunlangan imtihonlaringiz shu yerda, eng yangilaridan boshlab ko'rinadi."
            />
          ) : (
            <ul className="mt-4">
              {attempts!.slice(0, 6).map((a) => (
                <ActivityItem
                  key={a.id}
                  title={a.examTitle}
                  timestamp={fmtDate(a.finishedAt)}
                  right={
                    <StatusBadge tone="done">
                      <span className="tabnum">{a.correct}/{a.total}</span>
                    </StatusBadge>
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}
