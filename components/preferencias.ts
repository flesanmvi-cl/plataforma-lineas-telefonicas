"use client";

import { useEffect, useSyncExternalStore } from "react";

// SHELL · preferencias de cada usuario («Mi personalización»). Por ahora se guardan en este
// navegador; el plan es llevarlas a la tabla `preferencias_usuario` del esquema de cada
// plataforma para que sigan al usuario en cualquier equipo. El tema lo maneja next-themes y el
// estilo del acceso a portales, components/portales/estilo.ts.

export interface Preferencias {
  /** Escala de toda la plataforma (la raíz rem), no solo del texto. */
  texto: "chico" | "normal" | "grande";
  densidad: "compacta" | "comoda";
  reducirAnimaciones: boolean;
}

const POR_DEFECTO: Preferencias = { texto: "normal", densidad: "compacta", reducirAnimaciones: false };
const CLAVE = "cia-preferencias";
const EVENTO = "cia-preferencias";

let cache: { crudo: string | null; valor: Preferencias } = { crudo: null, valor: POR_DEFECTO };

function leer(): Preferencias {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {}
  // useSyncExternalStore exige la misma referencia mientras no cambie el valor guardado.
  if (crudo === cache.crudo) return cache.valor;
  let valor = POR_DEFECTO;
  try {
    valor = { ...POR_DEFECTO, ...(crudo ? JSON.parse(crudo) : {}) };
  } catch {}
  cache = { crudo, valor };
  return valor;
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function usePreferencias(): [Preferencias, (cambio: Partial<Preferencias>) => void, () => void] {
  const preferencias = useSyncExternalStore(suscribir, leer, () => POR_DEFECTO);
  function guardar(siguiente: Preferencias | null) {
    try {
      if (siguiente) localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      else localStorage.removeItem(CLAVE);
    } catch {}
    window.dispatchEvent(new Event(EVENTO));
  }
  // Se parte de lo guardado (no del render) para que dos cambios seguidos no se pisen.
  return [preferencias, (cambio) => guardar({ ...leer(), ...cambio }), () => guardar(null)];
}

/** Aplica las preferencias a la página (atributos en <html> que lee app/shell.css). Se monta una
 * vez en el AppShell. */
export function AplicarPreferencias() {
  const [p] = usePreferencias();
  useEffect(() => {
    const raiz = document.documentElement;
    if (p.texto === "normal") raiz.removeAttribute("data-texto");
    else raiz.setAttribute("data-texto", p.texto);
    raiz.setAttribute("data-densidad", p.densidad);
    raiz.toggleAttribute("data-reducir-animaciones", p.reducirAnimaciones);
  }, [p]);
  return null;
}
