import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "INTIL";

/**
 * Central INTIL brand logo. Change the name/icon here only.
 */
export function Logo({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl gradient-bg glow",
          iconClassName,
        )}
      >
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className={cn("text-xl font-bold tracking-tight", textClassName)}>
        INT<span className="gradient-text">I</span>L
      </span>
    </div>
  );
}

export default Logo;
