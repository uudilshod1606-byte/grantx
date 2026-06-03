import { useDeferredValue, useRef, useState } from "react";
import { Sigma } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [latex, setLatex] = useState("");
  const previewValue = useDeferredValue(value);

  const insertFormula = () => {
    const expr = latex.trim();
    setOpen(false);
    setLatex("");
    if (!expr) return;
    const el = ref.current;
    const snippet = `$${expr}$`;
    if (!el) {
      onChange(`${value}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + snippet.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
          onClick={() => setOpen((v) => !v)}
          className="glass border-white/15 hover:bg-white/10"
        >
          <Sigma className="mr-1.5 h-3.5 w-3.5" /> Formula qo'shish
        </Button>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Enter — yangi qator · $formula$ — matematik ifoda
        </span>
      </div>
      {open && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <MathField
            value={latex}
            onChange={setLatex}
            placeholder="Misol: \\frac{a}{b} = \\sqrt{x^2 + 1}"
            minHeight="4rem"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={insertFormula}
              className="gradient-bg text-primary-foreground"
            >
              Joylashtirish
            </Button>
          </div>
        </div>
      )}
      {preview && previewValue.trim() && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-1 text-[10px] uppercase text-muted-foreground">
            Ko'rinishi
          </div>
          <MathContent latex={previewValue} />
        </div>
      )}
    </div>
  );
}