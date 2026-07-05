import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Superscript,
  Subscript,
  List,
  ListOrdered,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel?: string;
  className?: string;
};

/**
 * Word-style rich text editor. Normal typing is a plain contentEditable
 * surface — no MathLive interception, spaces and Uzbek text behave
 * naturally. MathLive is only used from the "Formula" toolbar button,
 * which opens an inline panel to author a formula and inserts it at
 * the cursor as a non-editable rendered span.
 *
 * Stored value is HTML. Rendering for students uses the same HTML via
 * MathContent, so what the admin authors is exactly what students see.
 */
export function RichEditor({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  ariaLabel,
  className,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const mfHostRef = useRef<HTMLDivElement>(null);
  const mfRef = useRef<any>(null);

  // Seed innerHTML once on mount. We deliberately do NOT re-sync on every
  // value change to preserve caret position while typing.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const textOnly = editorRef.current.textContent?.trim() ?? "";
    const hasEmbed = editorRef.current.querySelector(".formula-embed");
    onChange(textOnly.length === 0 && !hasEmbed ? "" : html);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current?.contains(sel.anchorNode)
    ) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const runCommand = (cmd: string) => {
    restoreSelection();
    document.execCommand(cmd, false);
    emitChange();
    saveSelection();
  };

  const openFormula = async () => {
    saveSelection();
    setFormulaOpen(true);
    try {
      await import("mathlive");
    } catch (e) {
      console.error("MathLive load failed", e);
    }
  };

  // Mount <math-field> when the formula panel opens.
  useEffect(() => {
    if (!formulaOpen || !mfHostRef.current) return;
    const host = mfHostRef.current;
    let mf: any;
    try {
      mf = document.createElement("math-field");
      mf.setAttribute("math-virtual-keyboard-policy", "manual");
      mf.style.width = "100%";
      mf.style.minHeight = "56px";
      mf.style.padding = "8px 12px";
      mf.style.border = "1px solid hsl(var(--input))";
      mf.style.borderRadius = "6px";
      mf.style.background = "transparent";
      mf.value = "";
      host.innerHTML = "";
      host.appendChild(mf);
      mfRef.current = mf;
      setTimeout(() => mf.focus?.(), 0);
    } catch (e) {
      console.error("MathLive init failed", e);
    }
    return () => {
      if (mf && mf.parentNode === host) host.removeChild(mf);
      mfRef.current = null;
    };
  }, [formulaOpen]);

  const insertFormula = async () => {
    const latex = (mfRef.current?.value ?? "").trim();
    if (!latex) {
      setFormulaOpen(false);
      return;
    }
    let markup = latex;
    try {
      const ml: any = await import("mathlive");
      if (typeof ml.convertLatexToMarkup === "function") {
        markup = ml.convertLatexToMarkup(latex);
      }
    } catch (e) {
      console.error(e);
    }

    const html = `<span class="formula-embed" data-latex="${escapeAttr(
      latex,
    )}" contenteditable="false">${markup}</span>&nbsp;`;

    // Focus the editor and insert at the saved caret/selection position.
    // Using the saved Range directly is more reliable than execCommand,
    // especially inside a dialog where focus transitions can reset the
    // active selection before execCommand runs.
    editorRef.current?.focus();
    const range = savedRangeRef.current;
    const sel = window.getSelection();
    console.log("[insertFormula] latex:", latex, "range:", range, "editor contains range:", editorRef.current?.contains(range?.commonAncestorContainer ?? null));
    if (range && editorRef.current?.contains(range.commonAncestorContainer)) {
      if (!range.collapsed) {
        range.deleteContents();
      }
      const fragment = range.createContextualFragment(html);
      console.log("[insertFormula] fragment:", fragment);
      range.insertNode(fragment);
      console.log("[insertFormula] inserted");
      range.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      console.log("[insertFormula] fallback to execCommand");
      restoreSelection();
      document.execCommand("insertHTML", false, html);
    }

    setFormulaOpen(false);
    emitChange();
    saveSelection();
    // Return focus to the editor so the admin can keep typing.
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent",
        className,
      )}
    >
      {formulaOpen && (
        <div className="space-y-2 border-b border-input/70 bg-black/20 p-2">
          <div className="text-xs text-muted-foreground">
            Formula muharriri (MathLive)
          </div>
          <div ref={mfHostRef} />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1 text-xs hover:bg-white/10"
              onClick={() => setFormulaOpen(false)}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
              onClick={() => {
                console.log("Qo'shish button clicked");
                insertFormula();
              }}
            >
              Qo'shish
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1 border-b border-input/70 px-2 py-1">
        <ToolbarBtn onClick={() => runCommand("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => runCommand("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => runCommand("underline")} title="Underline">
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarBtn
          onClick={() => runCommand("superscript")}
          title="Superscript"
        >
          <Superscript className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => runCommand("subscript")} title="Subscript">
          <Subscript className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarBtn
          onClick={() => runCommand("insertUnorderedList")}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => runCommand("insertOrderedList")}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarBtn
          onClick={() => (formulaOpen ? setFormulaOpen(false) : openFormula())}
          title="Insert Formula"
        >
          <Sigma className="h-3.5 w-3.5" />
          <span className="ml-1 text-xs">Formula</span>
        </ToolbarBtn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        className="rich-editor px-3 py-2 text-base text-foreground outline-none focus:outline-none"
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={() => {
          saveSelection();
          emitChange();
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex items-center rounded px-2 py-1 text-xs text-foreground hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}