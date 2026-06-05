import { useEffect, useRef } from "react";
import { Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const ref = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  const lastEmitted = useRef(value);

  const saveSelection = () => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
      savedRange.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection) return false;
    const range = savedRange.current;
    if (range && editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    }
    const fallback = document.createRange();
    fallback.selectNodeContents(editor);
    fallback.collapse(false);
    selection.removeAllRanges();
    selection.addRange(fallback);
    savedRange.current = fallback.cloneRange();
    return true;
  };

  const focusAfterMath = (math: HTMLElement) => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    if (!math.nextSibling) math.after(document.createTextNode(""));
    editor.focus();
    const range = document.createRange();
    range.setStartAfter(math);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange.current = range.cloneRange();
  };

  const serializeEditor = () => {
    const serializeNode = (node: ChildNode): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
      if (!(node instanceof HTMLElement)) return "";
      if (node.matches("math-field[data-grantx-inline-math='true']")) {
        const latex = (
          (node as HTMLElement & { value?: string }).value ??
          node.dataset.latex ??
          ""
        ).trim();
        return latex ? `$${latex}$` : "";
      }
      if (node.tagName === "BR") return "\n";
      const isBlock = ["DIV", "P", "LI"].includes(node.tagName);
      let text = "";
      node.childNodes.forEach((child) => {
        text += serializeNode(child);
      });
      return isBlock ? `\n${text}` : text;
    };

    const editor = ref.current;
    if (!editor) return value;
    let next = "";
    editor.childNodes.forEach((child) => {
      next += serializeNode(child);
    });
    return next.replace(/\u200b/g, "");
  };

  const emitChange = () => {
    const next = serializeEditor();
    lastEmitted.current = next;
    onChange(next);
    saveSelection();
  };

  const configureMathElement = (el: HTMLElement, latex: string) => {
    const math = el as HTMLElement & { value?: string };
    math.className = "grantx-inline-mathfield";
    math.dataset.grantxInlineMath = "true";
    math.dataset.latex = latex;
    math.setAttribute("contenteditable", "false");
    math.setAttribute("default-mode", "math");
    math.setAttribute("math-virtual-keyboard-policy", "manual");
    math.setAttribute("aria-label", "Matematik formula");
    math.value = latex;
    math.addEventListener("input", () => {
      math.dataset.latex = math.value ?? "";
      emitChange();
    });
    math.addEventListener("pointerdown", (event) => event.stopPropagation());
    math.addEventListener("mousedown", (event) => event.stopPropagation());
    math.addEventListener("before-virtual-keyboard-toggle", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    math.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        math.dataset.latex = math.value ?? "";
        emitChange();
        focusAfterMath(math);
      }
    });
    return math;
  };

  const createMathElement = (latex = "") => {
    const math = document.createElement("math-field");
    return configureMathElement(math, latex);
  };

  const renderValueIntoEditor = (source: string) => {
    const editor = ref.current;
    if (!editor) return;
    editor.replaceChildren();
    const regex = /(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(source)) !== null) {
      if (match.index > last) {
        editor.append(
          document.createTextNode(source.slice(last, match.index).replace(/\\\$/g, "$")),
        );
      }
      editor.append(createMathElement(match[1]));
      last = match.index + match[0].length;
    }
    if (last < source.length) {
      editor.append(document.createTextNode(source.slice(last).replace(/\\\$/g, "$")));
    }
  };

  const insertPlainText = (text: string) => {
    const selection = window.getSelection();
    if (!ref.current || !selection) return;
    restoreSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStart(node, text.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange.current = range.cloneRange();
    emitChange();
  };

  const insertFormula = () => {
    const editor = ref.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    editor.focus();
    restoreSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const math = createMathElement("");
    const after = document.createTextNode("");
    range.insertNode(after);
    range.insertNode(math);
    requestAnimationFrame(() => math.focus());
    emitChange();
  };

  useEffect(() => {
    void import("mathlive").then(() => {
      window.mathVirtualKeyboard?.hide?.();
    });
  }, []);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    renderValueIntoEditor(value);
    lastEmitted.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    renderValueIntoEditor(value);
    lastEmitted.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="grantx-rich-editor resize-y overflow-auto whitespace-pre-wrap break-words rounded-md border border-input bg-transparent px-3 py-2 font-sans text-sm leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={{ minHeight: `${Math.max(minRows, 1) * 1.5 + 1.2}rem` }}
        onInput={emitChange}
        onFocus={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            insertPlainText("\n");
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          insertPlainText(e.clipboardData.getData("text/plain"));
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="glass border-white/15 hover:bg-white/10"
          onMouseDown={(e) => {
            saveSelection();
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            insertFormula();
          }}
        >
          <Sigma className="mr-1.5 h-3.5 w-3.5" /> Formula qo'shish
        </Button>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Enter — yangi qator · $formula$ — matematik ifoda
        </span>
      </div>
      {preview && value.trim() && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-1 text-[10px] uppercase text-muted-foreground">Ko'rinishi</div>
          <MathContent latex={value} />
        </div>
      )}
    </div>
  );
}