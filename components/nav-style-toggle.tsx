"use client";

import { PanelLeft, PanelTop } from "lucide-react";
import { useNavStyle } from "@/components/nav-style-context";

// Segmented control gemelo del ThemeToggle: deja elegir entre sidebar lateral
// (diseño actual) y nav superior (estilo portal-cia), persistido en
// localStorage vía NavStyleProvider.
export function NavStyleToggle() {
  const { navStyle, setNavStyle } = useNavStyle();

  const base = "inline-flex items-center justify-center w-9 h-9 border transition-colors";
  const active = "border-text bg-text text-surface";
  const idle = "border-border bg-surface text-muted hover:text-text hover:border-text";

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={() => setNavStyle("sidebar")}
        title="Menú lateral"
        aria-label="Menú lateral"
        aria-pressed={navStyle === "sidebar"}
        className={`${base} ${navStyle === "sidebar" ? active : idle}`}
      >
        <PanelLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setNavStyle("topnav")}
        title="Menú superior"
        aria-label="Menú superior"
        aria-pressed={navStyle === "topnav"}
        className={`${base} ${navStyle === "topnav" ? active : idle} -ml-px`}
      >
        <PanelTop className="w-4 h-4" />
      </button>
    </div>
  );
}
