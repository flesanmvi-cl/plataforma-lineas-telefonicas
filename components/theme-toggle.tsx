"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-flex w-18 h-9 border border-border" aria-hidden />;
  }

  const base = "inline-flex items-center justify-center w-9 h-9 border transition-colors";
  const active = "border-text bg-text text-surface";
  const idle = "border-border bg-surface text-muted hover:text-text hover:border-text";

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Tema claro"
        aria-label="Tema claro"
        aria-pressed={resolvedTheme === "light"}
        className={`${base} ${resolvedTheme === "light" ? active : idle}`}
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Tema oscuro"
        aria-label="Tema oscuro"
        aria-pressed={resolvedTheme === "dark"}
        className={`${base} ${resolvedTheme === "dark" ? active : idle} -ml-px`}
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
