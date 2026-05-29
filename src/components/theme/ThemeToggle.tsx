import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Mavzuni almashtirish"
      className={
        "group relative inline-flex h-9 w-16 items-center rounded-full border border-white/15 bg-white/5 px-1 transition-all duration-500 hover:border-primary/40 hover:bg-white/10 " +
        className
      }
    >
      <span
        className={
          "flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-all duration-500 " +
          (isDark
            ? "translate-x-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
            : "translate-x-7 bg-gradient-to-br from-amber-300 to-orange-400 text-white")
        }
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}