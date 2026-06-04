import { useRef, useState } from "react";
import { Sigma, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MathField } from "./MathField";
import { MathContent } from "./MathContent";
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

/**
 * Plain-text editor that preserves Enter, spaces, blank lines and pasted
 * formatting exactly as typed. Math formulas can be inserted via the
 * "Insert formula" button — they are stored inline as `$...$` LaTeX and
 * rendered beautifully by {@link MathContent}.
 */
export function RichTextField({
  value,
  onChange,
  placeholder,
  className,
  minRows = 4,
  ariaLabel,
  preview = true,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const caretRef = useRef<{ start: number; end: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [latex, setLatex] = useState("");

  const rememberCaret = () => {
    const el = ref.current;
    if (!el) return;
    caretRef.current = {
      start: el.selectionStart ?? value.length,
      end: el.selectionEnd ?? value.length,
    };
  };

  const insertFormula = () => {
    const expr = latex.trim();
    if (!expr) {
      setOpen(false);
      setLatex("");
      return;
    }
    const el = ref.current;
    const snippet = `$${expr}$`;
    const caret = caretRef.current ?? { start: value.length, end: value.length };
    const next = value.slice(0, caret.start) + snippet + value.slice(caret.end);
    onChange(next);
    setOpen(false);
    setLatex("");
    if (el) {
      requestAnimationFrame(() => {
        el.focus();
        const c = caret.start + snippet.length;
        el.setSelectionRange(c, c);
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={rememberCaret}
        onKeyUp={rememberCaret}
        onMouseUp={rememberCaret}
        onBlur={rememberCaret}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={minRows}
        className="resize-y whitespace-pre-wrap font-sans text-sm leading-relaxed"
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="glass border-white/15 hover:bg-white/10"
          onMouseDown={(e) => {
            // Preserve caret position in the textarea before focus shifts.
            rememberCaret();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <Sigma className="mr-1.5 h-3.5 w-3.5" /> Formula qo'shish
        </Button>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Enter — yangi qator · $formula$ — matematik ifoda
        </span>
      </div>
      {open && (
        <div
          className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-3"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">Matematik formula</div>
            <button
              type="button"
              onClick={() => { setOpen(false); setLatex(""); }}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Yopish"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <MathField
            value={latex}
            onChange={setLatex}
            placeholder="Misol: \frac{a}{b} = \sqrt{x^2 + 1}"
            minHeight="4rem"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Matn ichiga{" "}
              <code className="rounded bg-white/10 px-1">$...$</code> sifatida joylashtiriladi.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertFormula(); }}
              className="gradient-bg text-primary-foreground"
            >
              Joylashtirish
            </Button>
          </div>
        </div>
      )}
      {preview && value.trim() && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-1 text-[10px] uppercase text-muted-foreground">
            Ko'rinishi
          </div>
          <MathContent latex={value} />
        </div>
      )}
    </div>
  );
}