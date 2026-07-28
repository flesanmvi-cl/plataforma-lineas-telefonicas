"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type NavStyle = "sidebar" | "topnav";

const NAV_STYLE_KEY = "nav-style";

interface NavStyleContextValue {
  navStyle: NavStyle;
  setNavStyle: (style: NavStyle) => void;
}

const NavStyleContext = createContext<NavStyleContextValue | null>(null);

// Igual que el patron de "sidebar-collapsed": arranca en "sidebar" (mismo
// render en servidor y en cliente) y solo despues del mount lee localStorage,
// para evitar un mismatch de hidratacion.
export function NavStyleProvider({ children }: { children: ReactNode }) {
  const [navStyle, setNavStyleState] = useState<NavStyle>("sidebar");

  useEffect(() => {
    const stored = localStorage.getItem(NAV_STYLE_KEY);
    if (stored === "topnav" || stored === "sidebar") setNavStyleState(stored);
  }, []);

  function setNavStyle(style: NavStyle) {
    localStorage.setItem(NAV_STYLE_KEY, style);
    setNavStyleState(style);
  }

  return <NavStyleContext.Provider value={{ navStyle, setNavStyle }}>{children}</NavStyleContext.Provider>;
}

export function useNavStyle(): NavStyleContextValue {
  const ctx = useContext(NavStyleContext);
  if (!ctx) throw new Error("useNavStyle debe usarse dentro de NavStyleProvider");
  return ctx;
}
