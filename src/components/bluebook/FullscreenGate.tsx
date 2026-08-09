import { useEffect, useRef, useState } from "react";
import { Maximize, ArrowLeft } from "lucide-react";

/**
 * Pre-exam screen. Deliberately neutral (ivory / obsidian, no gold noise) so it
 * reads as a calm threshold between the app and the exam surface.
 * Every value shown here is passed in from real exam configuration.
 */
export function FullscreenGate({
  subjectName,
  examTitle,
  questionCount,
  durationMinutes,
  onContinue,
  onExit,
}: {
  subjectName: string;
  examTitle: string;
  questionCount: number;
  durationMinutes: number;
  onContinue: () => void;
  onExit?: () => void;
}) {
  const [blocked, setBlocked] = useState(false);
  const doneRef = useRef(false);

  const requestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      /* browser blocked it — the exam still runs windowed */
    }
  };

  const enter = async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    await requestFullscreen();
    onContinue();
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!document.fullscreenElement) setBlocked(true);
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  const facts: [string, string][] = [
    ["Savollar soni", `${questionCount} ta`],
    ["Davomiylik", `${durationMinutes} daqiqa`],
    ["Rejim", "To'liq ekran"],
    ["Kalkulyator", "Ruxsat etilmaydi"],
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#FAF7F1] px-6 py-10 text-[#171717]">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="mb-10 inline-flex items-center gap-2 self-start text-[13px] text-[#6F6A62] transition-colors hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </button>
        )}

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9F7830]">
          Milliy sertifikat · {subjectName}
        </p>
        <h1 className="mt-5 text-[30px] font-semibold leading-[1.15] sm:text-[38px]">
          Imtihonni boshlashga tayyormisiz?
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#6F6A62]">
          {examTitle}. Imtihon to'liq ekran rejimida o'tadi va vaqt boshlanishi bilan sanaladi.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 border-y border-[rgba(30,25,18,0.10)] py-8 sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-[#6F6A62]">{k}</dt>
              <dd className="mt-2 text-[15px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-8 space-y-2.5 text-sm leading-relaxed text-[#6F6A62]">
          <li>Har bir savol uchun faqat bitta javob tanlanadi.</li>
          <li>Savolni keyin ko'rib chiqish uchun bayroqcha bilan belgilab qo'yish mumkin.</li>
          <li>Vaqt tugagach imtihon avtomatik yakunlanadi.</li>
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={enter}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0B0B0C] px-6 text-[15px] font-medium text-[#F6F1E8] transition-colors hover:bg-[#151516]"
          >
            <Maximize className="h-4 w-4" />
            Imtihonni boshlash
          </button>
          <button
            type="button"
            onClick={() => {
              doneRef.current = true;
              onContinue();
            }}
            className="text-[13px] text-[#6F6A62] underline underline-offset-4 transition-colors hover:text-[#171717]"
          >
            To'liq ekransiz davom etish
          </button>
        </div>

        {blocked && (
          <p className="mt-6 text-xs text-[#6F6A62]">
            Brauzer to'liq ekranga avtomatik o'tishga ruxsat bermadi — tugmani bosing.
          </p>
        )}
      </div>
    </div>
  );
}
