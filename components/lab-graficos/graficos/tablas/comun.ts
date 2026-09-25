/**
 * Utilidades compartidas por las tablas enriquecidas (y la escala de color de los mapas).
 * Todo sale de los tokens del laboratorio: letra, densidad, radio, superficie y colores.
 */
import type { CSSProperties } from "react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

function hexARgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbAHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Interpola una escala de colores (#RRGGBB) en f ∈ [0, 1]. */
export function colorEnEscala(escala: string[], f: number): string {
  const x = Math.min(1, Math.max(0, f)) * (escala.length - 1);
  const i = Math.min(escala.length - 2, Math.floor(x));
  const a = hexARgb(escala[i]);
  const b = hexARgb(escala[i + 1]);
  const k = x - i;
  return rgbAHex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
}

/** Luminancia relativa (WCAG) de un #RRGGBB. */
export function luminancia(hex: string) {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexARgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Texto legible sobre un fondo dado (casi negro o casi blanco). */
export function textoSobre(fondo: string) {
  return luminancia(fondo) > 0.4 ? "#231F20" : "#FFFFFF";
}

/** Alto de fila según la densidad del tema. */
export function altoFila(t: TokensLab) {
  return t.tema.densidad === "compacta" ? 32 : 40;
}

/** Contenedor de tabla: alto fijo con scroll y letra del tema. */
export function estiloContenedor(t: TokensLab, alto: number): CSSProperties {
  return {
    height: alto,
    overflow: "auto",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
    color: t.texto,
    fontVariantNumeric: "tabular-nums",
  };
}

/** Celda de encabezado fija arriba. */
export function estiloEncabezado(t: TokensLab): CSSProperties {
  return {
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: t.fondoTarjeta,
    color: t.textoSuave,
    fontSize: t.tamano.eje,
    fontWeight: 600,
    textAlign: "left",
    padding: "0 10px",
    height: altoFila(t),
    borderBottom: `1px solid ${t.eje}`,
    whiteSpace: "nowrap",
  };
}

export function estiloCelda(t: TokensLab): CSSProperties {
  return { padding: "0 10px", height: altoFila(t), borderBottom: `1px solid ${t.grilla}`, whiteSpace: "nowrap" };
}

/** Relleno de una barra HTML (dentro de celda) según la superficie del tema. */
export function rellenoBarra(t: TokensLab, color: string): CSSProperties {
  const radio = Math.min(t.radio, 6);
  const base: CSSProperties = { borderRadius: radio, background: color };
  switch (t.superficie) {
    case "degradado":
      return { ...base, background: `linear-gradient(90deg, ${conAlfa(color, 0.45)}, ${color})` };
    case "contorno":
      return { ...base, background: conAlfa(color, 0.15), boxShadow: `inset 0 0 0 1.5px ${color}` };
    case "sombras":
      return { ...base, boxShadow: `0 3px 8px ${conAlfa(color, 0.45)}` };
    case "glass":
      return {
        ...base,
        background: conAlfa(color, 0.7),
        boxShadow: `0 0 10px ${conAlfa(color, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
      };
    default:
      return base;
  }
}

/** Transición CSS según la animación del tema (vacía si es «sin»). */
export function transicion(t: TokensLab, propiedad: string) {
  return t.animacion.duracion > 0 ? `${propiedad} ${t.animacion.duracion}ms ${t.animacion.easingCss}` : "none";
}

/** Fondo de fila al pasar el mouse. */
export function fondoResaltado(t: TokensLab) {
  return conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", 0.04);
}
