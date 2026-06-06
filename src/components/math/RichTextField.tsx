import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  ariaLabel?: string;
  preview?: boolean;
};

const SYMBOLS = [
  "π", "√", "²", "³", "≤", "≥", "≠", "°", "×", "÷", "∞", "α", "β", "γ",
];

/**
 * Lightweight textarea with a simple math-symbols toolbar above it. Enter
 * inserts a newline natively, paste keeps original formatting, and clicking
 * a symbol inserts it at the current caret position.
 *
 * The `preview` prop is accepted for backwards compatibility and ignored.
 */
export function RichTextField({
  value,
  onChange,
  placeholder,
  className,
  minRows = 4,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const insertSymbol = (sym: string) => {
    const el = ref.current;
    if (!el) {
      onChange(value + sym);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + sym + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + sym.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1 rounded-md border border-input bg-muted/40 p-1.5">
        {SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertSymbol(s)}
            className="h-7 min-w-7 rounded-md border border-transparent bg-background px-2 text-sm font-medium text-foreground transition hover:border-input hover:bg-accent hover:text-accent-foreground"
            aria-label={`${s} belgisini qo'shish`}
          >
            {s}
          </button>
        ))}
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={minRows}
        className="resize-y whitespace-pre-wrap font-sans leading-relaxed"
      />
    </div>
  );
}