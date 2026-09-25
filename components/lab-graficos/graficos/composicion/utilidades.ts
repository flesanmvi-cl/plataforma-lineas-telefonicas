/**
 * Utilidades locales de las familias composición y distribución: mezcla de colores y
 * traducción de la superficie del tema a Nivo (que no trae sombras ni degradados propios).
 */
import type { CSSProperties } from "react";
import { linearGradientDef } from "@nivo/core";
import { curveBasis, curveLinear, curveStep } from "@visx/curve";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

function aRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Mezcla dos colores #RRGGBB (p = 0 → a, p = 1 → b). Devuelve #RRGGBB. */
export function mezclar(a: string, b: string, p: number): string {
  const ca = aRgb(a);
  const cb = aRgb(b);
  return (
    "#" +
    ca
      .map((v, i) => Math.round(v + (cb[i] - v) * p))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Interpola una escala de colores (ej. t.secuencial) en p ∈ [0, 1]. */
export function interpolarEscala(escala: string[], p: number): string {
  const q = Math.max(0, Math.min(1, p)) * (escala.length - 1);
  const i = Math.min(Math.floor(q), escala.length - 2);
  return mezclar(escala[i], escala[i + 1], q - i);
}

/** Luminancia relativa aproximada (0-1), para elegir texto claro u oscuro sobre un color. */
export function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Color de texto legible sobre un fondo dado. */
export function textoSobre(fondo: string): string {
  return luminancia(fondo) > 0.6 ? "#231F20" : "#F4F4F4";
}

/** Sombra CSS del contenedor para superficies con sombra (Nivo y SVG sin filtro propio). */
export function filtroSombraCss(t: TokensLab, color = t.acento): CSSProperties {
  if (t.superficie === "sombras") return { filter: `drop-shadow(0 6px 8px ${conAlfa(color, 0.35)})` };
  if (t.superficie === "glass") return { filter: `drop-shadow(0 0 10px ${conAlfa(color, 0.45)})` };
  return {};
}

/**
 * Superficie para gráficos Nivo con relleno por color: colores (tenues en contorno), borde,
 * defs/fill de degradado y la sombra del contenedor.
 */
export function superficieNivo(t: TokensLab, uid: string, colores = t.colores) {
  const contorno = t.superficie === "contorno";
  const glass = t.superficie === "glass";
  const degradado = t.superficie === "degradado";
  return {
    colores: contorno ? colores.map((c) => conAlfa(c, 0.16)) : glass ? colores.map((c) => conAlfa(c, 0.78)) : colores,
    borderWidth: contorno ? 1.5 : glass ? 1 : 0,
    borderColor: contorno
      ? { from: "color" as const, modifiers: [["opacity", 1] as ["opacity", number]] }
      : glass
        ? "rgba(255,255,255,0.45)"
        : { from: "color" as const },
    defs: degradado
      ? [
          linearGradientDef(`${uid}-deg`, [
            { offset: 0, color: "inherit" },
            { offset: 100, color: "inherit", opacity: 0.5 },
          ]),
        ]
      : [],
    fill: degradado ? [{ match: "*" as const, id: `${uid}-deg` }] : [],
    estilo: filtroSombraCss(t),
  };
}

/** Curva de visx según el tema. */
export function curvaVisx(t: TokensLab) {
  if (t.curva === "suave") return curveBasis;
  if (t.curva === "escalonada") return curveStep;
  return curveLinear;
}
