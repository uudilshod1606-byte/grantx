import { MathField } from "./MathField";
import { cn } from "@/lib/utils";

type Props = {
  latex: string;
  className?: string;
  inline?: boolean;
};

/**
 * Read-only renderer for admin-authored MathLive content. Uses the same
 * MathLive engine as the editor so what the admin writes is exactly what
 * the student sees.
 */
export function MathContent({ latex, className, inline = false }: Props) {
  if (!latex) return null;
  return (
    <MathField
      value={latex}
      readOnly
      minHeight={0}
      className={cn(inline ? "inline-block align-middle" : "block", className)}
    />
  );
}
