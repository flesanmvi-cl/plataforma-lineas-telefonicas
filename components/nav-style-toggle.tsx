"use client";

import { PanelLeft, PanelTop } from "lucide-react";
import { useNavStyle } from "@/components/nav-style-context";

// Toggle on/off gemelo del ThemeToggle: deja elegir entre sidebar lateral
// (diseño actual) y nav superior (estilo portal-cia), persistido en
// localStorage vía NavStyleProvider.
export function NavStyleToggle() {
  const { navStyle, setNavStyle } = useNavStyle();

  return (
    <div className="toggle-pill">
      <button
        type="button"
        onClick={() => setNavStyle("sidebar")}
        title="Menú lateral"
        aria-label="Menú lateral"
        aria-pressed={navStyle === "sidebar"}
        className={`toggle-pill-option ${navStyle === "sidebar" ? "is-active" : ""}`}
      >
        <PanelLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setNavStyle("topnav")}
        title="Menú superior"
        aria-label="Menú superior"
        aria-pressed={navStyle === "topnav"}
        className={`toggle-pill-option ${navStyle === "topnav" ? "is-active" : ""}`}
      >
        <PanelTop className="w-4 h-4" />
      </button>
    </div>
  );
}
