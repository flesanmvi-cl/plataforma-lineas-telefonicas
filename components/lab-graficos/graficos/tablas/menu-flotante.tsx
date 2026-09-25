"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as TeclaReact, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { duracionCorta, estiloFlotante } from "./comun";

// Menú o panel flotante anclado a un botón. Se dibuja en un portal con posición fija para que
// no lo recorte el scroll de la tabla. Cierra con Esc, clic fuera o scroll, y devuelve el foco
// al botón que lo abrió. Con rol «menu», las flechas recorren los [role=menuitem].
export function MenuFlotante({
  t,
  ancla,
  rol = "menu",
  etiqueta,
  alinear = "right",
  onCerrar,
  children,
}: {
  t: TokensLab;
  ancla: HTMLElement;
  rol?: "menu" | "dialog";
  etiqueta: string;
  alinear?: "left" | "right";
  onCerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const r = ancla.getBoundingClientRect();
    const ancho = ref.current?.offsetWidth ?? 180;
    const alto = ref.current?.offsetHeight ?? 160;
    const left = alinear === "right" ? r.right - ancho : r.left;
    // Si no cabe abajo, se abre hacia arriba.
    const top = r.bottom + 4 + alto > window.innerHeight ? r.top - 4 - alto : r.bottom + 4;
    setPos({ top: Math.max(8, top), left: Math.max(8, Math.min(left, window.innerWidth - ancho - 8)) });
  }, [ancla, alinear]);

  // Referencia al último onCerrar, para no reinstalar los listeners en cada render.
  const cerrarRef = useRef(onCerrar);
  useEffect(() => {
    cerrarRef.current = onCerrar;
  });

  // Al abrir, el foco pasa al primer elemento del menú.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(rol === "menu" ? "[role=menuitem]" : "input, button")?.focus();
  }, [rol]);

  useEffect(() => {
    const salir = () => cerrarRef.current();
    const cerrar = () => {
      salir();
      ancla.focus();
    };
    const alPulsar = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !ancla.contains(e.target as Node)) salir();
    };
    const alScroll = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) salir();
    };
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
      }
    };
    document.addEventListener("mousedown", alPulsar);
    document.addEventListener("keydown", alTecla);
    window.addEventListener("scroll", alScroll, true);
    window.addEventListener("resize", salir);
    return () => {
      document.removeEventListener("mousedown", alPulsar);
      document.removeEventListener("keydown", alTecla);
      window.removeEventListener("scroll", alScroll, true);
      window.removeEventListener("resize", salir);
    };
  }, [ancla]);

  const alTeclaMenu = (e: TeclaReact) => {
    if (rol !== "menu" || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault();
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const sig = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[sig]?.focus();
  };

  const segundos = duracionCorta(t);
  return createPortal(
    <motion.div
      ref={ref}
      role={rol}
      aria-label={etiqueta}
      onKeyDown={alTeclaMenu}
      initial={segundos > 0 ? { opacity: 0, y: -4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: segundos }}
      style={{
        ...estiloFlotante(t),
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: 60,
        minWidth: 170,
        padding: 4,
      }}
    >
      {children}
    </motion.div>,
    document.body,
  );
}

/** Opción de menú (role=menuitem) con el estilo del tema. */
export function OpcionMenu({
  t,
  children,
  peligro = false,
  onElegir,
}: {
  t: TokensLab;
  children: ReactNode;
  peligro?: boolean;
  onElegir: () => void;
}) {
  const [encima, setEncima] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onElegir}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={() => setEncima(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "6px 10px",
        font: "inherit",
        textAlign: "left",
        color: peligro ? t.estado.malo : t.texto,
        background: encima ? t.tabla.hover : "transparent",
        border: "none",
        borderRadius: Math.min(t.radio, 6),
        cursor: "pointer",
        outline: "none",
      }}
    >
      {children}
    </button>
  );
}
