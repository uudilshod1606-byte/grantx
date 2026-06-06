import { cn } from "@/lib/utils";

type Props = {
  latex: string;
  className?: string;
  inline?: boolean;
};

/**
 * Renders plain text exactly as authored — preserving spaces, line breaks
 * and blank paragraphs. Math symbols inserted from the toolbar are just
 * regular unicode characters, so no special handling is required.
 *
 * The `latex` prop name is retained for backwards-compatibility with
 * existing call sites.
 */
export function MathContent({ latex, className, inline = false }: Props) {
  if (!latex) return null;
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={cn(
        "whitespace-pre-wrap break-words",
        inline ? "inline" : "block",
        className,
      )}
    >
      {latex}
    </Tag>
  );
}