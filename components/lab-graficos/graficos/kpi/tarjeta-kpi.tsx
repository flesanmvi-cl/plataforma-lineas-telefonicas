"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { CifraAnimada } from "./cifra-animada";

// Piezas comunes de las tarjetas KPI del laboratorio (no son entradas del catálogo): fondo de la
// tarjeta interna según la superficie, acento (franja o punto) según t.kpi, fila responsiva,
// cifra principal con el tamaño elegido y chip de variación con los colores de estado.

/** Fondo, borde y sombra de una tarjeta KPI interna, pensada para ir dentro de la tarjeta de la galería. */
export function estiloTarjeta(t: TokensLab, color: string = t.acento): CSSProperties {
  const radio = Math.min(t.radio, 16);
  switch (t.superficie) {
    case "contorno":
      return { borderRadius: radio, border: `1px solid ${t.eje}`, background: "transparent" };
    case "sombras":
      return {
        borderRadius: radio,
        background: t.fondoTarjeta,
        border: `1px solid ${t.grilla}`,
        boxShadow: t.oscuro
          ? "0 10px 24px -12px rgba(0,0,0,0.8)"
          : `0 10px 22px -14px ${conAlfa(color, 0.45)}, 0 1px 3px rgba(0,0,0,0.06)`,
      };
    case "degradado":
      return {
        borderRadius: radio,
        border: `1px solid ${t.grilla}`,
        background: `linear-gradient(160deg, ${conAlfa(color, t.oscuro ? 0.18 : 0.1)}, ${conAlfa(color, 0)} 70%)`,
      };
    case "glass":
      return {
        borderRadius: radio,
        background: t.oscuro ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
        border: `1px solid ${t.oscuro ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)"}`,
        boxShadow: `0 10px 30px -14px ${conAlfa(color, 0.5)}`,
        backdropFilter: "blur(8px)",
      };
    default:
      return { borderRadius: radio, background: t.fondoTarjeta, border: `1px solid ${t.grilla}` };
  }
}

/** Alto de la franja de acento, en px. */
export const ALTO_FRANJA = 3;

interface PropsTarjeta {
  t: TokensLab;
  titulo: ReactNode;
  /** Color del acento (franja o punto) y del tinte de la superficie. */
  color?: string;
  /** Contenido a la derecha del título (chip, ícono, estado). */
  extra?: ReactNode;
  children?: ReactNode;
  pad?: number;
  /** Ignora el acento del tema (para plantillas que traen el suyo). */
  sinAcento?: boolean;
  estilo?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/** Tarjeta KPI con título, acento del tema y contenido libre en columna. */
export function TarjetaKpi({
  t,
  titulo,
  color = t.acento,
  extra,
  children,
  pad = 12,
  sinAcento,
  estilo,
  onMouseEnter,
  onMouseLeave,
}: PropsTarjeta) {
  const franja = !sinAcento && t.kpi.acento === "franja";
  const punto = !sinAcento && t.kpi.acento === "punto";
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        ...estiloTarjeta(t, color),
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        padding: pad,
        paddingTop: pad + (franja ? ALTO_FRANJA : 0),
        fontFamily: t.fuente,
        color: t.texto,
        ...estilo,
      }}
    >
      {franja && <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: ALTO_FRANJA, background: color }} />}
      {titulo != null && (
        <TituloKpi t={t} color={color} punto={punto} extra={extra}>
          {titulo}
        </TituloKpi>
      )}
      {children}
    </div>
  );
}

/** Punto de acento suelto, para tarjetas que dibujan su propio título (solo con acento «punto»). */
export function PuntoAcento({ t, color }: { t: TokensLab; color: string }) {
  if (t.kpi.acento !== "punto") return null;
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: color, marginRight: 6, verticalAlign: "middle" }}
    />
  );
}

/** Título de la tarjeta: texto suave, punto de acento opcional y contenido a la derecha. */
export function TituloKpi({
  t,
  color,
  punto,
  extra,
  children,
}: {
  t: TokensLab;
  color: string;
  punto: boolean;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.tamano.eje, color: t.textoSuave, minWidth: 0 }}>
      {punto && <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }} />}
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span>
      {extra !== undefined && <span style={{ marginLeft: "auto", flexShrink: 0, display: "inline-flex" }}>{extra}</span>}
    </div>
  );
}

/** Fila responsiva de tarjetas: tantas columnas como quepan con el ancho mínimo. */
export function FilaKpi({
  alto,
  minimo = 180,
  gap = 10,
  estirar = true,
  children,
}: {
  alto: number;
  minimo?: number;
  gap?: number;
  /** Las tarjetas llenan el alto disponible; si no, toman su alto natural y se centran. */
  estirar?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minimo}px, 100%), 1fr))`,
        gridAutoRows: estirar ? "1fr" : "auto",
        alignContent: estirar ? "stretch" : "center",
        gap,
        height: alto,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

/** Cifra principal con el tamaño elegido (t.kpi.cifra) y conteo animado. */
export function CifraKpi({
  t,
  valor,
  formatear,
  retraso = 0,
  escala = 1,
  color,
}: {
  t: TokensLab;
  valor: number;
  formatear: (v: number) => string;
  retraso?: number;
  escala?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        fontSize: Math.round(t.kpi.cifra * escala),
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: color ?? t.texto,
        whiteSpace: "nowrap",
      }}
    >
      <CifraAnimada valor={valor} formatear={formatear} t={t} retraso={retraso} />
    </div>
  );
}

/** Chip de variación: la flecha sigue la dirección y el color sigue si el cambio es favorable. */
export function ChipVariacion({
  t,
  texto,
  direccion,
  bueno,
  sufijo,
}: {
  t: TokensLab;
  texto: string;
  direccion: "sube" | "baja" | "igual";
  /** true favorable, false desfavorable, null neutro. */
  bueno: boolean | null;
  sufijo?: string;
}) {
  const color = bueno === null ? t.textoSuave : bueno ? t.estado.bueno : t.estado.malo;
  const Flecha = direccion === "sube" ? ArrowUpRight : direccion === "baja" ? ArrowDownRight : Minus;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: t.tamano.eje, whiteSpace: "nowrap" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: "1px 7px 1px 4px",
          borderRadius: 999,
          fontWeight: 600,
          color,
          background: conAlfa(color, t.oscuro ? 0.2 : 0.1),
          border: t.superficie === "contorno" ? `1px solid ${conAlfa(color, 0.5)}` : "1px solid transparent",
        }}
      >
        <Flecha size={13} strokeWidth={2.4} aria-hidden />
        {texto}
      </span>
      {sufijo && <span style={{ color: t.textoSuave }}>{sufijo}</span>}
    </span>
  );
}

/** Rótulo en mayúsculas espaciadas, como el .label-eyebrow de la plantilla actual. */
export function estiloEyebrow(t: TokensLab): CSSProperties {
  return { fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: t.textoSuave };
}

/** Estilo de relleno de una barra HTML según la superficie (progreso, meta, etc.). */
export function estiloBarra(t: TokensLab, color: string): CSSProperties {
  switch (t.superficie) {
    case "degradado":
      return { background: `linear-gradient(90deg, ${conAlfa(color, 0.5)}, ${color})` };
    case "contorno":
      return { background: conAlfa(color, 0.16), boxShadow: `inset 0 0 0 1.5px ${color}` };
    case "sombras":
      return { background: color, boxShadow: `0 3px 8px -2px ${conAlfa(color, 0.55)}` };
    case "glass":
      return { background: conAlfa(color, 0.75), boxShadow: `0 0 10px ${conAlfa(color, 0.5)}, inset 0 1px 0 rgba(255,255,255,0.45)` };
    default:
      return { background: color };
  }
}
