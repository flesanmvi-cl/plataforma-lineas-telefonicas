"use client";

import type { ComponentPropsWithRef, ReactNode, SyntheticEvent } from "react";
import { motion } from "motion/react";
import { Loader2, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { anilloFoco, estiloVariante, transicionCss, type TamanoBoton, type VarianteBoton } from "./comun";
import { useInteraccion } from "./use-interaccion";

export interface PropsBotonLab extends Omit<ComponentPropsWithRef<"button">, "children"> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  /** Ícono antes del texto (o el único, con soloIcono). */
  icono?: LucideIcon;
  /** Ícono después del texto (flecha, chevron). */
  iconoDerecha?: LucideIcon;
  /** Botón cuadrado de solo ícono: exige aria-label (y conviene title). */
  soloIcono?: boolean;
  cargando?: boolean;
  /** Fuerza la apariencia de un estado, para mostrarlo en la vitrina. */
  forzar?: "hover" | "activo" | "foco";
  /** Ocupa todo el ancho disponible. */
  bloque?: boolean;
  children?: ReactNode;
}

export const TAMANO_ICONO: Record<TamanoBoton, number> = { sm: 14, md: 16, lg: 18 };
const RELLENO_X: Record<TamanoBoton, number> = { sm: 10, md: 14, lg: 20 };

/** Encadena el manejador propio con el que viene por props. */
function unir<E extends SyntheticEvent>(propio: (e: E) => void, externo?: (e: E) => void) {
  return (e: E) => {
    propio(e);
    externo?.(e);
  };
}

/** Spinner de carga que gira siempre (es información, no adorno). */
export function Girador({ tamano }: { tamano: number }) {
  return (
    <motion.span
      aria-hidden
      style={{ display: "inline-flex" }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    >
      <Loader2 size={tamano} />
    </motion.span>
  );
}

/**
 * Botón base del laboratorio: toma caja, peso, radio, relleno, sombra, alto y tamaño de texto
 * de t.boton; colores de t.acento / t.estado / t.texto, y la superficie del tema.
 */
export function BotonLab({
  variante = "solido",
  tamano = "md",
  icono: Icono,
  iconoDerecha: IconoDerecha,
  soloIcono,
  cargando,
  forzar,
  bloque,
  disabled,
  type = "button",
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  ...resto
}: PropsBotonLab) {
  const t = useTokens();
  const { hover, activo, foco, manejadores: m } = useInteraccion();
  const inactivo = Boolean(disabled || cargando);
  const enHover = !inactivo && (hover || forzar === "hover");
  const presionado = !inactivo && (activo || forzar === "activo");
  const alto = t.boton.alto[tamano];
  const tamIcono = TAMANO_ICONO[tamano];
  const esTexto = variante === "texto";

  return (
    <button
      type={type}
      disabled={inactivo}
      aria-busy={cargando || undefined}
      onPointerEnter={unir(m.onPointerEnter, onPointerEnter)}
      onPointerLeave={unir(m.onPointerLeave, onPointerLeave)}
      onPointerDown={unir(m.onPointerDown, onPointerDown)}
      onPointerUp={unir(m.onPointerUp, onPointerUp)}
      onFocus={unir(m.onFocus, onFocus)}
      onBlur={unir(m.onBlur, onBlur)}
      onKeyDown={unir(m.onKeyDown, onKeyDown)}
      onKeyUp={unir(m.onKeyUp, onKeyUp)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: tamano === "lg" ? 8 : 6,
        flexShrink: 0,
        height: alto,
        width: soloIcono ? alto : bloque ? "100%" : undefined,
        padding: soloIcono ? 0 : `0 ${esTexto ? 4 : RELLENO_X[tamano]}px`,
        fontFamily: t.fuente,
        fontSize: t.boton.tamanoTexto[tamano],
        fontWeight: t.boton.fontWeight,
        textTransform: t.boton.textTransform,
        letterSpacing: t.boton.letterSpacing,
        lineHeight: 1,
        whiteSpace: "nowrap",
        borderRadius: t.boton.radio,
        cursor: inactivo ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transform: presionado && t.animacion.duracion > 0 ? "scale(0.97)" : "none",
        transition: `${transicionCss(t)}, outline-color 0ms`,
        WebkitTapHighlightColor: "transparent",
        ...estiloVariante(t, variante, { hover: enHover, activo: presionado }),
        ...anilloFoco(t, foco || forzar === "foco"),
        ...style,
      }}
      {...resto}
    >
      {cargando ? <Girador tamano={tamIcono} /> : Icono ? <Icono size={tamIcono} aria-hidden /> : null}
      {!soloIcono && children}
      {!soloIcono && IconoDerecha && <IconoDerecha size={tamIcono} aria-hidden />}
    </button>
  );
}
