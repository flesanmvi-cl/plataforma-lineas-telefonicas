/**
 * Utilidades compartidas por los campos de formulario del laboratorio. Todo sale de t.campo
 * (estilo, etiqueta, alto, radio y colores por estado) y de la letra y animación del tema.
 */
import type { CSSProperties } from "react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

export interface EstadoCaja {
  foco?: boolean;
  error?: boolean;
  deshabilitado?: boolean;
  /** Área de texto: alto libre y contenido arriba. */
  multilinea?: boolean;
  /** Etiqueta flotante dentro de la caja (relleno y subrayado necesitan más alto). */
  conFlotante?: boolean;
}

/** Transición corta de bordes y anillo (0 si el tema no anima). */
export function transicionCampo(t: TokensLab, props = ["border-color", "box-shadow", "background-color"]) {
  const ms = t.animacion.duracion > 0 ? 150 : 0;
  return props.map((p) => `${p} ${ms}ms ${t.animacion.easingCss}`).join(", ");
}

/** Alto de la caja: el del token, algo más si la etiqueta flota por dentro. */
export function altoCaja(t: TokensLab, conFlotante = false) {
  return conFlotante && t.campo.estilo !== "contorno" ? t.campo.alto + 12 : t.campo.alto;
}

/** Caja del campo (contorno, relleno o subrayado) en su estado: foco, error o deshabilitado. */
export function estiloCaja(t: TokensLab, e: EstadoCaja = {}): CSSProperties {
  const c = t.campo;
  const colorLinea = e.error ? c.error : e.foco ? c.bordeFoco : null;
  const anillo = e.error ? conAlfa(c.error, 0.18) : c.anilloFoco;
  const base: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: e.multilinea ? "flex-start" : "center",
    gap: 8,
    width: "100%",
    minWidth: 0,
    height: e.multilinea ? "auto" : altoCaja(t, e.conFlotante),
    padding: e.multilinea ? "8px 10px" : "0 10px",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta + 1,
    color: e.deshabilitado ? t.textoSuave : t.texto,
    cursor: e.deshabilitado ? "not-allowed" : "text",
    transition: transicionCampo(t),
  };

  if (c.estilo === "subrayado") {
    return {
      ...base,
      paddingLeft: 2,
      paddingRight: 2,
      borderRadius: 0,
      background: e.deshabilitado ? c.deshabilitado : e.foco ? anillo : "transparent",
      border: "none",
      borderBottom: `1px solid ${colorLinea ?? c.borde}`,
      // La línea engrosa al enfocar sin mover el contenido.
      boxShadow: colorLinea && (e.foco || e.error) ? `inset 0 -1px 0 ${colorLinea}` : "none",
    };
  }

  if (c.estilo === "relleno") {
    return {
      ...base,
      borderRadius: c.radio,
      background: e.deshabilitado ? c.deshabilitado : c.fondo,
      border: `1px solid ${colorLinea ?? "transparent"}`,
      boxShadow: e.foco ? `0 0 0 3px ${anillo}` : "none",
    };
  }

  return {
    ...base,
    borderRadius: c.radio,
    background: e.deshabilitado ? c.deshabilitado : c.fondo,
    border: `1px solid ${colorLinea ?? c.borde}`,
    boxShadow: e.foco ? `0 0 0 3px ${anillo}` : "none",
  };
}

/** El control nativo dentro de la caja: sin borde ni fondo propios. */
export function estiloControl(t: TokensLab): CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    font: "inherit",
    color: "inherit",
    colorScheme: t.oscuro ? "dark" : "light",
    // Variable que usa la regla de placeholder (ver EstilosCampos).
    ["--lab-placeholder" as string]: t.campo.placeholder,
  };
}

/** Etiqueta sobre el campo (o a la izquierda). */
export function estiloEtiquetaCampo(t: TokensLab): CSSProperties {
  return {
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
    fontWeight: 600,
    color: t.texto,
    lineHeight: 1.3,
  };
}

/** Texto de ayuda o de error bajo el campo. */
export function estiloMensaje(t: TokensLab, error = false): CSSProperties {
  return {
    fontFamily: t.fuente,
    fontSize: t.tamano.eje,
    lineHeight: 1.35,
    color: error ? t.campo.error : t.textoSuave,
  };
}

/** Ícono, prefijo o sufijo dentro de la caja. */
export function estiloAfijo(t: TokensLab): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    color: t.textoSuave,
    fontSize: t.tamano.etiqueta,
    whiteSpace: "nowrap",
  };
}

/** Lista flotante (sugerencias del combobox y de la búsqueda). */
export function estiloLista(t: TokensLab): CSSProperties {
  return {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 30,
    maxHeight: 240,
    overflowY: "auto",
    margin: 0,
    padding: 4,
    listStyle: "none",
    background: t.fondoTarjeta,
    color: t.texto,
    border: `1px solid ${t.eje}`,
    borderRadius: Math.min(t.radio, 10),
    boxShadow: t.oscuro ? "0 12px 32px rgba(0,0,0,0.6)" : "0 12px 32px rgba(0,0,0,0.14)",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
  };
}

/** Opción de una lista flotante, resaltada si es la activa (teclado o mouse). */
export function estiloOpcion(t: TokensLab, activa: boolean, elegida = false): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 8px",
    borderRadius: Math.max(0, Math.min(t.radio, 10) - 3),
    cursor: "pointer",
    background: activa ? conAlfa(t.texto, 0.07) : "transparent",
    fontWeight: elegida ? 600 : 400,
  };
}

/** Regla de placeholder: los estilos inline no llegan a ::placeholder. */
export const CSS_CAMPOS = `
.lab-campo::placeholder { color: var(--lab-placeholder); opacity: 1; }
.lab-campo:disabled { cursor: not-allowed; }
.lab-campo::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.7; }
`;

// ---------------------------------------------------------------------------------------------
// Formatos es-CL

const cacheFormatos = new Map<number, Intl.NumberFormat>();

/** Número con separador de miles «.» y decimal «,» (es-CL). */
export function formatoNumero(n: number, decimales = 0) {
  let f = cacheFormatos.get(decimales);
  if (!f) {
    f = new Intl.NumberFormat("es-CL", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    cacheFormatos.set(decimales, f);
  }
  return f.format(n);
}

/** Pesos chilenos: «$ 1.234.567». */
export function formatoPesos(n: number) {
  return `$ ${formatoNumero(Math.round(n))}`;
}

/** Lee un número escrito a la chilena («1.234,5») o simple («1234.5»). Vacío o inválido: null. */
export function parsearNumero(texto: string): number | null {
  const limpio = texto.replace(/[^\d,.-]/g, "").trim();
  if (!limpio) return null;
  // Con coma: los puntos son miles. Sin coma y con varios puntos: también son miles.
  let normal = limpio;
  if (limpio.includes(",")) normal = limpio.replace(/\./g, "").replace(",", ".");
  else if ((limpio.match(/\./g) ?? []).length > 1) normal = limpio.replace(/\./g, "");
  else if (/^\d{1,3}\.\d{3}$/.test(limpio)) normal = limpio.replace(".", "");
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

/** Texto sin tildes y en minúsculas, para buscar. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Tamaño de archivo legible (KB, MB). */
export function tamanoArchivo(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatoNumero(bytes / 1024, 0)} KB`;
  return `${formatoNumero(bytes / (1024 * 1024), 1)} MB`;
}

/** Fecha ISO (aaaa-mm-dd) a dd-mm-aaaa, para mostrar en modo lectura. */
export function fechaLegible(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [a, m, d] = iso.split("-");
  return `${d}-${m}-${a}`;
}
