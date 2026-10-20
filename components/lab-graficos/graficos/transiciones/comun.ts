"use client";

import { useId, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

// View Transitions nativas del navegador (document.startViewTransition). Next 15 trae
// <ViewTransition> de React solo como experimental, así que las muestras usan la API del DOM
// directo con flushSync: funciona igual en cualquier pantalla y no necesita banderas.

type DocConVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function vtSoportado(): boolean {
  return typeof document !== "undefined" && typeof (document as DocConVT).startViewTransition === "function";
}

/** Si el navegador soporta View Transitions (false en el servidor, sin romper la hidratación). */
export function useVtSoportado(): boolean {
  return useSyncExternalStore(
    () => () => {},
    vtSoportado,
    () => false,
  );
}

/** Nombres únicos por instancia: la misma muestra puede estar varias veces en el comparador. */
export function useNombresVT(prefijo: string) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (parte: string | number) => `${prefijo}-${id}-${parte}`;
}

/**
 * Aplica `cambio` dentro de una View Transition que solo anima los elementos con nombre (la
 * página no hace el fundido general). Sin soporte o con `activo` falso, aplica el cambio directo.
 * `clases` se ponen en <html> mientras dura la transición (dirección, tipo de efecto).
 */
export function transicionLocal(activo: boolean, ms: number, cambio: () => void, clases: string[] = []) {
  const doc = document as DocConVT;
  if (!activo || !doc.startViewTransition) {
    cambio();
    return null;
  }
  const raiz = document.documentElement;
  const todas = ["mv-vt-local", ...clases];
  raiz.style.setProperty("--mv-vt-ms", `${Math.round(ms)}ms`);
  raiz.classList.add(...todas);
  const vt = doc.startViewTransition(() => flushSync(cambio));
  vt.finished.finally(() => raiz.classList.remove(...todas));
  return vt;
}

export const docVT = () => document as DocConVT;
