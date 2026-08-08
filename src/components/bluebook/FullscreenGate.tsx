import { useEffect, useRef, useState } from "react";
import { Maximize } from "lucide-react";

/**
 * Bluebook-style fullscreen prompt shown before the exam starts.
 * Neutral (black/white) design — intentionally independent of the site theme.
 */
export function FullscreenGate({
  bigNumber,
  onContinue,
}: {
  bigNumber: string | number;
  onContinue: () => void;
}) {
  const [autoTried, setAutoTried] = useState(false);
  const doneRef = useRef(false);

  const requestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      /* browser blocked it — user can continue without fullscreen */
    }
  };

  const enter = async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    await requestFullscreen();
    onContinue();
  };

  // After 10 seconds of inactivity, try fullscreen automatically.
  useEffect(() => {
    const t = setTimeout(async () => {
      setAutoTried(true);
      await requestFullscreen();
      if (document.fullscreenElement && !doneRef.current) {
        doneRef.current = true;
        onContinue();
      }
    }, 10000);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-6 text-black">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border-2 border-black text-5xl font-bold tabular-nums">
          {bigNumber}
        </div>
        <h1 className="text-2xl font-bold">To'liq ekran rejimini yoqing</h1>
        <p className="mt-3 text-sm text-gray-600">
          Davom etish uchun to'liq ekran tajribasiga qayting.
        </p>
        <button
          type="button"
          onClick={enter}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-base font-semibold text-white transition hover:bg-gray-800"
        >
          <Maximize className="h-5 w-5" />
          To'liq ekranga o'tish
        </button>
        <p className="mt-6 text-xs text-gray-500">
          To'liq ekranga o'ta olmayapsizmi?{" "}
          <button
            type="button"
            onClick={() => {
              doneRef.current = true;
              onContinue();
            }}
            className="font-semibold text-black underline underline-offset-2"
          >
            To'liq ekransiz davom etish
          </button>
        </p>
        {autoTried && !document.fullscreenElement && (
          <p className="mt-4 text-xs text-gray-400">
            Brauzer avtomatik to'liq ekranga ruxsat bermadi — tugmani bosing.
          </p>
        )}
      </div>
    </div>
  );
}