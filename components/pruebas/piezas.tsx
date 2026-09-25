"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import {
  anilloFoco,
  estiloPista,
  radioInterno,
  transicionCss,
  transicionMotion,
} from "@/components/lab-graficos/graficos/botones/comun";
import { useInteraccion } from "@/components/lab-graficos/graficos/botones/use-interaccion";
import { moverConFlechas } from "@/components/lab-graficos/graficos/controles/comun";

// Piezas comunes de las pantallas de prueba (/pruebas/*): el bloque de tablero y los controles
// de filtro, controlados desde afuera. Todo color, letra y radio sale de los tokens del estándar.

/** Tarjeta de tablero con título de bloque, detalle a la derecha y acciones opcionales. */
export function Bloque({
  titulo,
  detalle,
  acciones,
  className,
  children,
}: {
  titulo: ReactNode;
  /** Texto chico al lado del título (período, unidad, corte). */
  detalle?: ReactNode;
  acciones?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const t = useTokens();
  return (
    <section className={cn("card flex flex-col gap-3 p-4 min-w-0", className)} style={{ borderRadius: t.radio, fontFamily: t.fuente }}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
        <h2 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: t.texto }}>{titulo}</h2>
        {detalle && <span style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>{detalle}</span>}
        {acciones && <div className="ml-auto flex flex-wrap items-center gap-2">{acciones}</div>}
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Aviso discreto de que las cifras son de ejemplo. */
export function AvisoEjemplo({ texto = "Datos de ejemplo" }: { texto?: string }) {
  const t = useTokens();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: t.boton.alto.sm,
        padding: "0 10px",
        borderRadius: 999,
        border: `1px dashed ${t.eje}`,
        color: t.textoSuave,
        fontFamily: t.fuente,
        fontSize: t.tamano.eje,
        whiteSpace: "nowrap",
      }}
    >
      <FlaskConical size={13} aria-hidden />
      {texto}
    </span>
  );
}

/** Rótulo chico sobre un grupo de filtros. */
export function estiloRotulo(t: TokensLab): CSSProperties {
  return {
    fontFamily: t.fuente,
    fontSize: t.tamano.eje - 1,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: t.textoSuave,
  };
}

export interface OpcionSegmentado<T extends string> {
  id: T;
  texto: string;
}

/** Selección exclusiva en pastilla que se desliza (mismo estilo que el control del laboratorio). */
export function Segmentado<T extends string>({
  etiqueta,
  opciones,
  valor,
  onCambio,
}: {
  etiqueta: string;
  opciones: OpcionSegmentado<T>[];
  valor: T;
  onCambio: (valor: T) => void;
}) {
  const t = useTokens();
  const idLayout = useId();
  const [foco, setFoco] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const elegida = Math.max(0, opciones.findIndex((o) => o.id === valor));

  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      style={{ display: "inline-flex", ...estiloPista(t), padding: 3, borderRadius: t.boton.radio, gap: 2 }}
    >
      {opciones.map((op, i) => {
        const activa = i === elegida;
        return (
          <button
            key={op.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            tabIndex={activa ? 0 : -1}
            onClick={() => onCambio(op.id)}
            onKeyDown={(e) => moverConFlechas(e, i, opciones.length, (k) => onCambio(opciones[k].id), (k) => refs.current[k]?.focus())}
            onFocus={(e) => setFoco(e.currentTarget.matches(":focus-visible") ? i : null)}
            onBlur={() => setFoco(null)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              height: t.boton.alto.sm,
              padding: "0 12px",
              border: "0 solid transparent",
              backgroundColor: "transparent",
              color: activa ? t.texto : t.textoSuave,
              fontFamily: t.fuente,
              fontSize: t.boton.tamanoTexto.sm,
              fontWeight: t.boton.fontWeight,
              textTransform: t.boton.textTransform,
              letterSpacing: t.boton.letterSpacing,
              whiteSpace: "nowrap",
              cursor: "pointer",
              borderRadius: radioInterno(t),
              transition: transicionCss(t),
              ...anilloFoco(t, foco === i),
            }}
          >
            {activa && (
              <motion.span
                layoutId={`${idLayout}-pastilla`}
                transition={transicionMotion(t)}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radioInterno(t),
                  background: t.oscuro ? conAlfa(t.texto, 0.14) : t.fondoTarjeta,
                  boxShadow: t.superficie === "contorno" ? `inset 0 0 0 1px ${t.eje}` : "0 1px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)",
                }}
              />
            )}
            <span style={{ position: "relative" }}>{op.texto}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Chip de filtro de selección múltiple con contador opcional (estilo del laboratorio). */
export function ChipFiltro({ texto, n, activo, onClick }: { texto: string; n?: number; activo: boolean; onClick: () => void }) {
  const t = useTokens();
  const { hover, foco, manejadores } = useInteraccion();
  const solido = t.boton.relleno === "solido" && t.superficie !== "contorno";
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      {...manejadores}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: t.boton.alto.sm,
        padding: "0 10px",
        borderRadius: t.boton.radio >= 999 ? 999 : Math.min(t.boton.radio, 8),
        border: `1px solid ${activo ? t.acento : conAlfa(t.texto, hover ? 0.4 : 0.2)}`,
        backgroundColor: activo ? conAlfa(t.acento, solido ? 0.12 : 0.08) : hover ? conAlfa(t.texto, 0.04) : "transparent",
        color: activo ? t.texto : t.textoSuave,
        fontFamily: t.fuente,
        fontSize: t.tamano.etiqueta,
        fontWeight: activo ? 600 : 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: transicionCss(t),
        ...anilloFoco(t, foco),
      }}
    >
      {activo && <Check size={14} strokeWidth={2.5} aria-hidden style={{ color: t.acento }} />}
      {texto}
      {n !== undefined && (
        <span
          style={{
            fontSize: t.tamano.eje - 1,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            padding: "1px 6px",
            borderRadius: 999,
            background: activo ? conAlfa(t.acento, 0.16) : conAlfa(t.texto, 0.07),
            color: activo ? t.acento : t.textoSuave,
          }}
        >
          {n}
        </span>
      )}
    </button>
  );
}
