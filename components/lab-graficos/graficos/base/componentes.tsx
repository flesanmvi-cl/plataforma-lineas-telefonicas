"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, Plus, X, XCircle, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { colorSobre, transicionCss } from "../botones/comun";

/*
 * Piezas base reutilizables: avisos en línea, insignias, chips, tarjetas, esqueletos de carga,
 * barra de progreso y estado vacío. Colores de estado desde t.estado; el acento, de la paleta.
 */

// ---------------------------------------------------------------------------------------------
// Avisos

export type TipoAviso = "info" | "exito" | "advertencia" | "error";

const ICONO_AVISO: Record<TipoAviso, LucideIcon> = { info: Info, exito: CheckCircle2, advertencia: AlertTriangle, error: XCircle };

export function colorAviso(t: TokensLab, tipo: TipoAviso) {
  return tipo === "exito" ? t.estado.bueno : tipo === "advertencia" ? t.estado.alerta : tipo === "error" ? t.estado.malo : t.texto;
}

interface PropsAviso {
  tipo?: TipoAviso;
  titulo?: ReactNode;
  children?: ReactNode;
  /** Muestra la «x» para descartar. */
  onCerrar?: () => void;
  acciones?: ReactNode;
  id?: string;
  /** Para recibir el foco (resumen de errores tras enviar). */
  tabIndex?: number;
  style?: CSSProperties;
}

/** Aviso en línea: franja de color a la izquierda, ícono y texto. Error se anuncia como alerta. */
export function Aviso({ tipo = "info", titulo, children, onCerrar, acciones, id, tabIndex, style }: PropsAviso) {
  const t = useTokens();
  const color = colorAviso(t, tipo);
  const Icono = ICONO_AVISO[tipo];
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={tipo === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        fontFamily: t.fuente,
        fontSize: t.tamano.etiqueta,
        lineHeight: 1.45,
        color: t.texto,
        background: conAlfa(tipo === "info" ? t.textoSuave : color, t.oscuro ? 0.14 : 0.08),
        border: `1px solid ${conAlfa(tipo === "info" ? t.textoSuave : color, 0.28)}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: Math.min(t.radio, 10),
        outlineColor: color,
        ...style,
      }}
    >
      <Icono size={16} aria-hidden style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {titulo && <div style={{ fontWeight: 700 }}>{titulo}</div>}
        {children && <div style={{ color: titulo ? t.textoSuave : t.texto }}>{children}</div>}
        {acciones && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>{acciones}</div>}
      </div>
      {onCerrar && (
        <button
          type="button"
          aria-label="Cerrar aviso"
          onClick={onCerrar}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            padding: 3,
            border: "none",
            borderRadius: 4,
            background: "transparent",
            color: t.textoSuave,
            cursor: "pointer",
            outlineColor: t.acento,
          }}
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Insignias

export type TonoInsignia = "neutro" | "bueno" | "alerta" | "malo" | "acento";

function colorTono(t: TokensLab, tono: TonoInsignia) {
  return tono === "bueno"
    ? t.estado.bueno
    : tono === "alerta"
      ? t.estado.alerta
      : tono === "malo"
        ? t.estado.malo
        : tono === "acento"
          ? t.acento
          : t.textoSuave;
}

interface PropsInsignia {
  tono?: TonoInsignia;
  variante?: "suave" | "solida" | "contorno";
  /** Punto de color antes del texto (estados). */
  punto?: boolean;
  icono?: LucideIcon;
  children: ReactNode;
  title?: string;
}

export function Insignia({ tono = "neutro", variante = "suave", punto, icono: Icono, children, title }: PropsInsignia) {
  const t = useTokens();
  const color = colorTono(t, tono);
  const solida = variante === "solida";
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 20,
        padding: "0 8px",
        fontFamily: t.fuente,
        fontSize: t.tamano.eje,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        borderRadius: t.boton.radio === 0 ? 2 : t.boton.radio >= 999 ? 999 : Math.min(t.radio, 6),
        color: solida ? colorSobre(color.startsWith("#") ? color : "#231F20") : tono === "neutro" ? t.texto : color,
        background: solida ? color : variante === "contorno" ? "transparent" : conAlfa(color, t.oscuro ? 0.2 : 0.12),
        border: `1px solid ${variante === "contorno" ? conAlfa(color, 0.6) : "transparent"}`,
      }}
    >
      {punto && <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: solida ? "currentColor" : color }} />}
      {Icono && <Icono size={12} aria-hidden />}
      {children}
    </span>
  );
}

/** Conteo numérico en círculo (notificaciones, pendientes). */
export function Conteo({ n, tono = "acento", etiqueta }: { n: number; tono?: TonoInsignia; etiqueta?: string }) {
  const t = useTokens();
  const color = colorTono(t, tono);
  return (
    <span
      aria-label={etiqueta ? `${n} ${etiqueta}` : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 999,
        fontFamily: t.fuente,
        fontSize: 11,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: colorSobre(color),
        background: color,
      }}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

// ---------------------------------------------------------------------------------------------
// Chips

export function radioChip(t: TokensLab) {
  return t.boton.radio === 0 ? 0 : 999;
}

interface PropsChip {
  children: ReactNode;
  /** Filtro: se activa y desactiva (aria-pressed). */
  activo?: boolean;
  onClick?: () => void;
  /** Entrada: muestra la «x» para quitar. */
  onQuitar?: () => void;
  /** Sugerencia: borde punteado y «+». */
  sugerencia?: boolean;
  icono?: LucideIcon;
  conteo?: number;
}

/** Chip de filtro, de entrada (con «x») o de sugerencia (con «+»). */
export function Chip({ children, activo, onClick, onQuitar, sugerencia, icono: Icono, conteo }: PropsChip) {
  const t = useTokens();
  const [hover, setHover] = useState(false);
  const esFiltro = activo !== undefined;
  const alto = t.boton.alto.sm;
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: alto,
    padding: onQuitar ? "0 4px 0 12px" : "0 12px",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
    fontWeight: 500,
    whiteSpace: "nowrap",
    borderRadius: radioChip(t),
    transition: transicionCss(t),
    outlineColor: t.acento,
    outlineOffset: 2,
  };
  const colores: CSSProperties = activo
    ? t.boton.relleno === "suave" || t.superficie === "contorno"
      ? { background: conAlfa(t.acento, 0.12), color: t.acento, border: `1px solid ${t.acento}` }
      : { background: t.texto, color: t.fondoTarjeta, border: `1px solid ${t.texto}` }
    : sugerencia
      ? { background: hover ? conAlfa(t.texto, 0.05) : "transparent", color: t.textoSuave, border: `1px dashed ${conAlfa(t.texto, 0.35)}` }
      : { background: hover && onClick ? conAlfa(t.texto, 0.09) : conAlfa(t.texto, 0.05), color: t.texto, border: `1px solid ${conAlfa(t.texto, 0.14)}` };

  const contenido = (
    <>
      {sugerencia && <Plus size={13} aria-hidden />}
      {Icono && <Icono size={13} aria-hidden />}
      {children}
      {conteo !== undefined && (
        <span style={{ fontSize: t.tamano.eje, opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{conteo}</span>
      )}
    </>
  );

  if (onQuitar) {
    return (
      <span style={{ ...base, ...colores }}>
        {contenido}
        <button
          type="button"
          aria-label={`Quitar ${typeof children === "string" ? children : "filtro"}`}
          onClick={onQuitar}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: alto - 8,
            height: alto - 8,
            padding: 0,
            border: "none",
            borderRadius: radioChip(t),
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            outlineColor: t.acento,
          }}
        >
          <X size={13} aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={esFiltro ? activo : undefined}
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{ ...base, ...colores, cursor: "pointer" }}
    >
      {contenido}
    </button>
  );
}

// ---------------------------------------------------------------------------------------------
// Tarjetas

/** Fondo, borde y sombra de una tarjeta según la superficie del tema. */
export function estiloTarjeta(t: TokensLab, resaltada = false): CSSProperties {
  const borde = resaltada ? t.acento : t.superficie === "contorno" ? t.eje : t.grilla;
  const base: CSSProperties = {
    background: t.fondoTarjeta,
    border: `1px solid ${borde}`,
    borderRadius: t.radio,
    color: t.texto,
    fontFamily: t.fuente,
    boxShadow: resaltada ? `0 0 0 1px ${t.acento}` : "none",
  };
  switch (t.superficie) {
    case "sombras":
      return { ...base, boxShadow: `${resaltada ? `0 0 0 1px ${t.acento}, ` : ""}0 6px 18px -8px rgba(0,0,0,${t.oscuro ? 0.7 : 0.18})` };
    case "degradado":
      return { ...base, background: `linear-gradient(180deg, ${t.fondoTarjeta}, ${t.oscuro ? "#141414" : "#F7F7F7"})` };
    case "glass":
      return {
        ...base,
        background: t.oscuro ? "rgba(35,35,35,0.6)" : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${resaltada ? t.acento : t.oscuro ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.9)"}`,
      };
    case "contorno":
      return { ...base, background: "transparent", border: `1.5px solid ${borde}` };
    default:
      return base;
  }
}

interface PropsTarjeta {
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  icono?: LucideIcon;
  acciones?: ReactNode;
  pie?: ReactNode;
  /** Seleccionable: la tarjeta entera es un botón de opción (aria-pressed). */
  seleccionada?: boolean;
  onSeleccionar?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Tarjeta({ titulo, subtitulo, icono: Icono, acciones, pie, seleccionada, onSeleccionar, children, style }: PropsTarjeta) {
  const t = useTokens();
  const [foco, setFoco] = useState(false);
  const idTitulo = useId();
  const seleccionable = onSeleccionar !== undefined;

  function alTecla(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSeleccionar?.();
    }
  }

  return (
    <div
      role={seleccionable ? "button" : undefined}
      tabIndex={seleccionable ? 0 : undefined}
      aria-pressed={seleccionable ? Boolean(seleccionada) : undefined}
      aria-labelledby={seleccionable && titulo ? idTitulo : undefined}
      onClick={onSeleccionar}
      onKeyDown={seleccionable ? alTecla : undefined}
      onFocus={(e) => setFoco(e.currentTarget === e.target && e.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFoco(false)}
      style={{
        ...estiloTarjeta(t, seleccionada),
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: seleccionable ? "pointer" : undefined,
        outline: foco ? `2px solid ${t.acento}` : "none",
        outlineOffset: 2,
        transition: transicionCss(t, ["border-color", "box-shadow"]),
        ...style,
      }}
    >
      {(titulo || acciones) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px 0" }}>
          {Icono && (
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: Math.min(t.radio, 8),
                background: conAlfa(t.acento, 0.1),
                color: t.acento,
              }}
            >
              <Icono size={16} />
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {titulo && (
              <div id={idTitulo} style={{ fontSize: t.tamano.etiqueta + 1, fontWeight: 700, lineHeight: 1.3 }}>
                {titulo}
              </div>
            )}
            {subtitulo && <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, marginTop: 2 }}>{subtitulo}</div>}
          </div>
          {acciones}
          {seleccionable && (
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                borderRadius: 999,
                border: `1.5px solid ${seleccionada ? t.acento : conAlfa(t.texto, 0.3)}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {seleccionada && <span style={{ width: 7, height: 7, borderRadius: 999, background: t.acento }} />}
            </span>
          )}
        </div>
      )}
      {children && <div style={{ padding: "10px 14px 12px", fontSize: t.tamano.etiqueta, color: t.textoSuave, lineHeight: 1.45 }}>{children}</div>}
      {pie && (
        <div style={{ marginTop: "auto", padding: "8px 14px", borderTop: `1px solid ${t.grilla}`, display: "flex", gap: 8, alignItems: "center" }}>
          {pie}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Carga

const CSS_ESQUELETO = `
@keyframes lab-brillo { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@media (prefers-reduced-motion: reduce) { .lab-esqueleto { animation: none !important; } }
`;

/** Bloque de carga con brillo que recorre (quieto si el tema no anima o el usuario lo pide). */
export function Esqueleto({ ancho = "100%", alto = 12, redondo, style }: { ancho?: number | string; alto?: number; redondo?: boolean; style?: CSSProperties }) {
  const t = useTokens();
  const a = conAlfa(t.texto, t.oscuro ? 0.08 : 0.06);
  const b = conAlfa(t.texto, t.oscuro ? 0.16 : 0.11);
  return (
    <span
      aria-hidden
      className="lab-esqueleto"
      style={{
        display: "block",
        width: ancho,
        height: alto,
        flexShrink: 0,
        borderRadius: redondo ? 999 : Math.min(t.radio, 6),
        background: `linear-gradient(90deg, ${a} 25%, ${b} 37%, ${a} 63%)`,
        backgroundSize: "400% 100%",
        animation: t.animacion.duracion > 0 ? "lab-brillo 1.4s ease infinite" : "none",
        ...style,
      }}
    >
      <style href="lab-esqueleto" precedence="medium">
        {CSS_ESQUELETO}
      </style>
    </span>
  );
}

/** Barra de progreso determinada (con valor) o indeterminada (sin valor). */
export function BarraProgreso({ valor, etiqueta, tono = "acento" }: { valor?: number; etiqueta: string; tono?: TonoInsignia }) {
  const t = useTokens();
  const color = colorTono(t, tono);
  const indeterminada = valor === undefined;
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminada ? undefined : Math.round(valor)}
      style={{ position: "relative", height: 6, borderRadius: 999, overflow: "hidden", background: conAlfa(t.texto, 0.08) }}
    >
      {indeterminada ? (
        <motion.span
          style={{ position: "absolute", top: 0, bottom: 0, width: "35%", borderRadius: 999, background: color }}
          animate={t.animacion.duracion > 0 ? { left: ["-35%", "100%"] } : { left: "0%" }}
          transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
        />
      ) : (
        <motion.span
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, background: color }}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(0, valor))}%` }}
          transition={{ duration: t.animacion.duracion / 1000 / 2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Estado vacío

interface PropsVacio {
  icono: LucideIcon;
  titulo: string;
  children?: ReactNode;
  acciones?: ReactNode;
  compacto?: boolean;
}

export function EstadoVacio({ icono: Icono, titulo, children, acciones, compacto }: PropsVacio) {
  const t = useTokens();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: compacto ? "16px 12px" : "28px 16px",
        fontFamily: t.fuente,
        color: t.texto,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: compacto ? 40 : 52,
          height: compacto ? 40 : 52,
          borderRadius: 999,
          background: conAlfa(t.texto, 0.06),
          color: t.textoSuave,
          marginBottom: 4,
        }}
      >
        <Icono size={compacto ? 18 : 22} />
      </span>
      <div style={{ fontSize: t.tamano.etiqueta + 2, fontWeight: 700 }}>{titulo}</div>
      {children && <div style={{ maxWidth: 340, fontSize: t.tamano.etiqueta, color: t.textoSuave, lineHeight: 1.45 }}>{children}</div>}
      {acciones && <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 6 }}>{acciones}</div>}
    </div>
  );
}
