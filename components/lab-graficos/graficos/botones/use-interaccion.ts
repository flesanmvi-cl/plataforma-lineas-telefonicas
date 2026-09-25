"use client";

import { useState, type FocusEvent, type KeyboardEvent } from "react";

/**
 * Estado real de un control (hover, presionado, foco visible) para estilos inline, que no
 * tienen :hover ni :focus-visible. Devuelve los manejadores listos para esparcir en el elemento.
 */
export function useInteraccion() {
  const [hover, setHover] = useState(false);
  const [activo, setActivo] = useState(false);
  const [foco, setFoco] = useState(false);

  const manejadores = {
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => {
      setHover(false);
      setActivo(false);
    },
    onPointerDown: () => setActivo(true),
    onPointerUp: () => setActivo(false),
    onFocus: (e: FocusEvent<HTMLElement>) => {
      let visible = true;
      try {
        visible = e.currentTarget.matches(":focus-visible");
      } catch {}
      setFoco(visible);
    },
    onBlur: () => {
      setFoco(false);
      setActivo(false);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === " " || e.key === "Enter") setActivo(true);
    },
    onKeyUp: () => setActivo(false),
  };

  return { hover, activo, foco, manejadores };
}
