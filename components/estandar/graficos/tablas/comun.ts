/**
 * Utilidades compartidas por las tablas enriquecidas (y la escala de color de los mapas).
 * Todo sale de los tokens del laboratorio: letra, densidad, radio, superficie y colores.
 */
import type { CSSProperties } from "react";
import { conAlfa, type TokensLab } from "@/lib/estandar/tema";

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

/** Alto de fila según la densidad del tema (token de tabla). */
export function altoFila(t: TokensLab) {
  return t.tabla.altoFila;
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

/** El <table> en sí: bordes separados para que funcionen las celdas fijas (sticky). */
export function estiloTabla(): CSSProperties {
  return { width: "100%", borderCollapse: "separate", borderSpacing: 0 };
}

/** Fondo opaco del encabezado (si el token es transparente, se usa el de la tarjeta para el sticky). */
export function fondoEncabezado(t: TokensLab) {
  return t.tabla.encabezadoFondo === "transparent" ? t.fondoTarjeta : t.tabla.encabezadoFondo;
}

/** Posición de la celda para decidir bordes de grilla. */
export interface PosCelda {
  /** Índice de columna: desde la segunda se dibuja la línea vertical en modo «grilla». */
  col?: number;
}

/** Celda de encabezado fija arriba, con fondo, texto y caja según el token de tabla. */
export function estiloEncabezado(t: TokensLab, pos: PosCelda = {}): CSSProperties {
  const { tabla } = t;
  const conFondo = tabla.encabezadoFondo !== "transparent";
  return {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: fondoEncabezado(t),
    color: tabla.encabezadoTexto,
    fontSize: tabla.encabezadoMayusculas ? t.tamano.eje - 1 : t.tamano.eje,
    fontWeight: 600,
    textTransform: tabla.encabezadoMayusculas ? "uppercase" : "none",
    letterSpacing: tabla.encabezadoMayusculas ? "0.07em" : "0",
    textAlign: "left",
    padding: "0 10px",
    height: tabla.altoFila,
    borderBottom: tabla.bordes === "ninguno" && conFondo ? "none" : `1px solid ${t.eje}`,
    borderLeft: tabla.bordes === "grilla" && (pos.col ?? 0) > 0 ? `1px solid ${conFondo ? "transparent" : tabla.borde}` : undefined,
    whiteSpace: "nowrap",
  };
}

/** Celda de cuerpo: alto de fila y bordes según el token (filas, grilla o ninguno). */
export function estiloCelda(t: TokensLab, pos: PosCelda = {}): CSSProperties {
  const { tabla } = t;
  return {
    padding: "0 10px",
    height: tabla.altoFila,
    borderBottom: tabla.bordes === "ninguno" ? "none" : `1px solid ${tabla.borde}`,
    borderLeft: tabla.bordes === "grilla" && (pos.col ?? 0) > 0 ? `1px solid ${tabla.borde}` : undefined,
    whiteSpace: "nowrap",
  };
}

/** Celda numérica (derecha). */
export function estiloCeldaNum(t: TokensLab, pos: PosCelda = {}): CSSProperties {
  return { ...estiloCelda(t, pos), textAlign: "right" };
}

/** Fondo de la fila: hover si está activa; si no, zebra en las impares (si el tema la pide). */
export function fondoFila(t: TokensLab, fila: number, activa = false): string {
  if (activa) return t.tabla.hover;
  return fila % 2 === 1 && t.tabla.zebra ? t.tabla.zebra : "transparent";
}

/** Igual que fondoFila pero opaco, para celdas fijas (sticky) que tapan a otras al hacer scroll. */
export function fondoFilaOpaco(t: TokensLab, fila: number, activa = false): string {
  const f = fondoFila(t, fila, activa);
  return f === "transparent" ? t.fondoTarjeta : `linear-gradient(${f}, ${f}), ${t.fondoTarjeta}`;
}

/** Pie de tabla fijo abajo (totales). */
export function estiloPie(t: TokensLab, pos: PosCelda = {}): CSSProperties {
  return {
    ...estiloCeldaNum(t, pos),
    position: "sticky",
    bottom: 0,
    zIndex: 1,
    background: t.fondoTarjeta,
    borderTop: `1.5px solid ${t.texto}`,
    borderBottom: "none",
    fontWeight: 700,
  };
}

/** Oculta a la vista pero deja el contenido para lectores de pantalla (captions, etiquetas). */
export const ocultoVisual: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/** Botón chico de barra de herramientas de tabla (paginación, «Columnas», «Limpiar»). */
export function estiloBotonTabla(t: TokensLab, activo = false): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: t.boton.alto.sm,
    minWidth: t.boton.alto.sm,
    padding: "0 10px",
    font: "inherit",
    fontSize: t.tamano.eje,
    fontWeight: 600,
    color: activo ? t.fondoTarjeta : t.texto,
    background: activo ? t.texto : "transparent",
    border: `1px solid ${activo ? t.texto : t.eje}`,
    borderRadius: Math.min(t.boton.radio, 999),
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

/** Campo de texto o select compacto para filtros y edición. */
export function estiloCampo(t: TokensLab): CSSProperties {
  return {
    height: t.boton.alto.sm,
    padding: "0 8px",
    font: "inherit",
    fontSize: t.tamano.eje,
    color: t.texto,
    background: t.fondoTarjeta,
    border: `1px solid ${t.eje}`,
    borderRadius: Math.min(t.radio, 8),
    outlineColor: t.acento,
  };
}

/** Superficie flotante (menús, barra de acciones). */
export function estiloFlotante(t: TokensLab): CSSProperties {
  return {
    background: t.fondoTarjeta,
    color: t.texto,
    border: `1px solid ${t.eje}`,
    borderRadius: Math.min(t.radio, 10),
    boxShadow: t.oscuro ? "0 12px 32px rgba(0,0,0,0.6)" : "0 12px 32px rgba(0,0,0,0.14)",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
  };
}

/** Duración de transiciones cortas de interfaz (motion), acotada; 0 si el tema no anima. */
export function duracionCorta(t: TokensLab) {
  return Math.min(t.animacion.duracion, 250) / 1000;
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

/** Fondo de fila al pasar el mouse (token de tabla). */
export function fondoResaltado(t: TokensLab) {
  return t.tabla.hover;
}

export type Estado = "En plazo" | "En riesgo" | "Atrasado";
export const ESTADOS: Estado[] = ["En plazo", "En riesgo", "Atrasado"];

/** Color semántico de un estado de obra. */
export function colorEstado(t: TokensLab, estado: Estado) {
  return estado === "En plazo" ? t.estado.bueno : estado === "En riesgo" ? t.estado.alerta : t.estado.malo;
}
