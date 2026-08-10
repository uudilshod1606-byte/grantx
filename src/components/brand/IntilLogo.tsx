import { cn } from "@/lib/utils";

/**
 * Original INTIL logo: gold gradient square plate with an "I" glyph,
 * next to the "INT/L" wordmark (diagonal stroke between T and L).
 * Single source of truth — used identically on every internal page.
 */
export function IntilLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#E4C47A] via-[#C99A3D] to-[#9F7830] shadow-[0_1px_2px_rgba(23,19,16,0.18)]"
      >
        <span className="text-[17px] font-bold leading-none text-white">I</span>
      </span>
      {showWordmark && (
        <span className="flex items-baseline text-[16px] font-bold tracking-[0.04em] text-ink-strong">
          INT
          <span className="mx-[1px] text-[#B8863C]">/</span>
          L
        </span>
      )}
    </span>
  );
}

export default IntilLogo;