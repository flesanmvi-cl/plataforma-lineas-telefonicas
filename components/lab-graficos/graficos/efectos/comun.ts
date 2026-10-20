"use client";

import { useCallback } from "react";
import { useReducedMotion } from "motion/react";
import type { TokensLab } from "@/lib/lab-graficos/tema";

/**
 * Cuánto se mueve una muestra de la sección Movimiento. Sigue la animación del tema («Sin»
 * apaga todo, «Expresiva» va al doble de lento que «Suave») y respeta «reducir movimiento»
 * del sistema operativo: con eso activo, las muestras quedan quietas en su estado final.
 */
export function useMovimiento(t: TokensLab) {
  const reducido = useReducedMotion();
  const activo = t.animacion.duracion > 0 && !reducido;
  const escala = activo ? t.animacion.duracion / 600 : 0;
  // Estable entre renders: las muestras la usan como dependencia de sus intervalos.
  const seg = useCallback((s: number) => s * (escala || 1), [escala]);
  /** `seg`: segundos base (pensados para «Suave») escalados según el tema. */
  return { activo, escala, seg };
}

/** Datos de ejemplo compartidos por las muestras de movimiento. */
export const OBRAS_MV = [
  { codigo: "P-2014", nombre: "Hospital Antofagasta", negocio: "Edificación", avance: 68.4, programado: 71.0 },
  { codigo: "P-2023", nombre: "Planta concentradora Calama", negocio: "Minería", avance: 41.2, programado: 47.5 },
  { codigo: "P-2029", nombre: "Puente Concepción", negocio: "Infraestructura", avance: 90.1, programado: 88.0 },
  { codigo: "P-2035", nombre: "Torre de oficinas Lima", negocio: "Edificación", avance: 22.7, programado: 24.0 },
  { codigo: "P-2041", nombre: "Depósito de relaves Copiapó", negocio: "Minería", avance: 55.0, programado: 61.3 },
  { codigo: "P-2047", nombre: "Autopista Rancagua", negocio: "Infraestructura", avance: 12.4, programado: 10.9 },
  { codigo: "P-2053", nombre: "Colegio Temuco", negocio: "Edificación", avance: 97.6, programado: 100 },
  { codigo: "P-2059", nombre: "Campamento Moquegua", negocio: "Minería", avance: 33.9, programado: 32.0 },
  { codigo: "P-2065", nombre: "Centro logístico Bogotá", negocio: "Infraestructura", avance: 76.3, programado: 80.2 },
] as const;

export const pct = (v: number) => `${v.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
