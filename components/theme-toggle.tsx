"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Antes de montar no se conoce el tema: se reserva el mismo alto/ancho de la
  // pastilla para que no haya salto de layout.
  if (!mounted) {
    return (
      <span className="toggle-pill" aria-hidden>
        <span className="toggle-pill-option" />
        <span className="toggle-pill-option" />
      </span>
    );
  }

  return (
    <div className="toggle-pill">
      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Tema claro"
        aria-label="Tema claro"
        aria-pressed={resolvedTheme === "light"}
        className={`toggle-pill-option ${resolvedTheme === "light" ? "is-active" : ""}`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Tema oscuro"
        aria-label="Tema oscuro"
        aria-pressed={resolvedTheme === "dark"}
        className={`toggle-pill-option ${resolvedTheme === "dark" ? "is-active" : ""}`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
