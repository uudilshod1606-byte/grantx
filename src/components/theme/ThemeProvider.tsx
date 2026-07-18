import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

export type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function applyLight() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.classList.add("light");
  root.dataset.theme = "light";
}

/**
 * GrantX currently ships light mode only. Dark mode has been intentionally
 * disabled — the provider always forces "light" and ignores any previously
 * saved preference, so every visitor sees the same look regardless of what
 * they may have toggled before this change shipped.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyLight();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme: "light",
      toggle: () => {},
      setTheme: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "light" as Theme, toggle: () => {}, setTheme: () => {} };
  return ctx;
}
