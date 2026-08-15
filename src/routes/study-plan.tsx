import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Sparkles, Target } from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getLatestStudyPlan, getStudentProfile, type StudentProfileInput } from "@/lib/learning";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/study-plan")({
  component: StudyPlanPage,
  head: () => ({ meta: [{ title: "Study Plan — INTIL" }] }),
});

type AiTask = { subject?: string; topic?: string; minutes?: number; task?: string };
type AiDay = { day?: number; focus?: string; total_minutes?: number; tasks?: AiTask[] };
type AiPlan = { title?: string; summary?: string; days?: AiDay[]; rules?: string[] };

function StudyPlanPage() {
  return <ProtectedRoute><StudyPlanContent /></ProtectedRoute>;
}

function StudyPlanContent() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, sp] = await Promise.all([getLatestStudyPlan(user.id), getStudentProfile(user.id)]);
        if (!cancelled) { setPlan(p?.plan ?? null); setProfile(sp); }
      } catch (error) {
        console.error("[INTIL] study plan load", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const days = plan?.days ?? [];
  const examDate = profile?.exam_date ? new Date(`${profile.exam_date}T23:59:59`) : null;
  const daysLeft = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000)) : null;

  return (
    <DashboardShell title="Study Plan" subtitle="AI sizning maqsadingizga mos tayyorgarlik yo‘lini boshqaradi">
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[28px] border border-[#E5D9C7] bg-[linear-gradient(135deg,#FFFDF8,#F7EFE2)] p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C78B2D]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#B47719]"><Sparkles className="h-4 w-4"/> INTIL AI · STUDY PLAN</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-[#29231D] sm:text-4xl">{loading ? "Rejangiz tayyorlanmoqda…" : plan?.title ?? "Shaxsiy rejangiz"}</h1>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#766D63]">{plan?.summary ?? "Onboardingni yakunlang — INTIL siz uchun fanlar, kuchsiz nuqtalar va imtihon muddatiga asoslangan reja tuzadi."}</p>
            </div>
            <div className="flex gap-3">
              {daysLeft !== null && <div className="rounded-2xl border border-[#E4D7C3] bg-white/70 px-5 py-4"><Clock3 className="h-4 w-4 text-[#B47719]"/><p className="mt-2 text-2xl font-semibold text-[#29231D]">{daysLeft}</p><p className="text-[11px] text-[#8B8175]">kun qoldi</p></div>}
              {profile?.target_score && <div className="rounded-2xl border border-[#E4D7C3] bg-white/70 px-5 py-4"><Target className="h-4 w-4 text-[#B47719]"/><p className="mt-2 text-2xl font-semibold text-[#29231D]">{profile.target_score}</p><p className="text-[11px] text-[#8B8175]">target ball</p></div>}
            </div>
          </div>
        </section>

        {!loading && !plan && (
          <section className="rounded-[24px] border border-[#E7DED1] bg-white p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#B47719]" />
            <h2 className="mt-4 text-xl font-semibold text-[#29231D]">Hali shaxsiy reja yaratilmagan</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#766D63]">Imtihon, fanlar, kuchsiz mavzular va kunlik vaqtingizni belgilang. INTIL shu ma’lumotlardan foydalanib real kunlik reja yaratadi.</p>
            <Link to="/onboarding" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-semibold text-white">Rejamni yaratish <ArrowRight className="h-4 w-4"/></Link>
          </section>
        )}

        {days.length > 0 && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {days.map((day, i) => (
                <section key={day.day ?? i} className="rounded-[24px] border border-[#E7DED1] bg-white p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#B47719]">{String(day.day ?? i + 1).padStart(2, "0")} · KUN</p><h2 className="mt-2 text-lg font-semibold text-[#29231D]">{day.focus ?? "Bugungi fokus"}</h2></div>
                    {day.total_minutes && <span className="rounded-full bg-[#F7F0E4] px-3 py-1.5 text-[11px] font-semibold text-[#5F5549]">{day.total_minutes} daq.</span>}
                  </div>
                  <div className="mt-5 space-y-2.5">
                    {(day.tasks ?? []).map((task, j) => (
                      <div key={j} className="flex items-start gap-3 rounded-2xl bg-[#FAF8F3] p-3.5">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#B47719]" />
                        <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-[#29231D]">{task.subject}{task.topic ? ` · ${task.topic}` : ""}</p><p className="mt-1 text-[12px] leading-5 text-[#766D63]">{task.task}</p></div>
                        {task.minutes && <span className="shrink-0 text-[11px] text-[#8B8175]">{task.minutes} daq.</span>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {plan?.rules?.length ? <section className="rounded-[24px] border border-[#E7DED1] bg-[#FFFDF8] p-5 sm:p-6"><h2 className="text-sm font-semibold text-[#29231D]">INTIL qoidalari</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{plan.rules.map((rule,i)=><div key={i} className="rounded-2xl border border-[#E9E0D3] bg-white p-4 text-[12px] leading-5 text-[#766D63]"><span className="font-semibold text-[#B47719]">0{i+1}</span><p className="mt-2">{rule}</p></div>)}</div></section> : null}
          </>
        )}

        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#29231D]"><ArrowLeft className="h-4 w-4"/> Dashboardga qaytish</Link>
      </div>
    </DashboardShell>
  );
}
