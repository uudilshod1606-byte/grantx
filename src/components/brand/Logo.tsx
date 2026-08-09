import { cn } from "@/lib/utils";

export const BRAND_NAME = "INTIL";

type Tone = "dark" | "light" | "gold";

/**
 * INTIL brand mark.
 *
 * The glyph is a restrained girih-inspired quadrant: an eight-point star
 * reduced to two rotated squares inside a rounded plate — modern Uzbek
 * geometry, no ornament, no graduation cap.
 */
export function LogoMark({
  tone = "dark",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  const plate =
    tone === "light"
      ? "bg-ivory text-obsidian"
      : tone === "gold"
        ? "bg-gold text-obsidian"
        : "bg-obsidian text-champagne";

  return (
    <span
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-[10px]",
        plate,
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.55"
        />
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="1.2"
          transform="rotate(45 12 12)"
        />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({
  tone = "dark",
  showWordmark = true,
  className,
  iconClassName,
  textClassName,
}: {
  tone?: Tone;
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className={iconClassName} />
      {showWordmark && (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-[0.18em]",
            tone === "dark" ? "text-ink" : "text-ivory",
            textClassName,
          )}
        >
          INTIL
        </span>
      )}
    </span>
  );
}

export default Logo;
