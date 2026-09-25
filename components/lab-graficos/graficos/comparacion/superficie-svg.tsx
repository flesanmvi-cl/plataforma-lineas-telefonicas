"use client";

import { Fragment, useId } from "react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

// Utilidades locales para gráficos SVG propios (visx + motion) de las familias comparación y KPI:
// traducen la superficie del tema a <defs>, rellenos y filtros sin repetir lógica en cada archivo.

/** Id apto para url(#...): useId trae «:» que rompen la referencia. */
export function useUidSvg() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Degradado (g{i}) y sombra (s{i}) por color, para usar con estiloBloqueSvg / filtroSvg. */
export function DefsSuperficie({
  uid,
  colores,
  t,
  horizontal = false,
}: {
  uid: string;
  colores: string[];
  t: TokensLab;
  horizontal?: boolean;
}) {
  const glass = t.superficie === "glass";
  return (
    <defs>
      {colores.map((c, i) => (
        <Fragment key={i}>
          <linearGradient id={`${uid}-g${i}`} x1="0" y1={horizontal ? "0" : "1"} x2={horizontal ? "1" : "0"} y2="0">
            <stop offset="0" stopColor={conAlfa(c, 0.4)} />
            <stop offset="1" stopColor={c} />
          </linearGradient>
          <filter id={`${uid}-s${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy={glass ? 0 : 4}
              stdDeviation={glass ? 5 : 3.5}
              floodColor={c}
              floodOpacity={glass ? 0.6 : 0.42}
            />
          </filter>
        </Fragment>
      ))}
    </defs>
  );
}

/** Filtro de sombra (solo con superficie sombras o glass). */
export function filtroSvg(t: TokensLab, uid: string, i: number): string | undefined {
  return t.superficie === "sombras" || t.superficie === "glass" ? `url(#${uid}-s${i})` : undefined;
}

export interface EstiloBloque {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  filter?: string;
}

/** Relleno, borde y sombra de un bloque (barra, punto, segmento) según la superficie. */
export function estiloBloqueSvg(t: TokensLab, uid: string, i: number, color: string): EstiloBloque {
  switch (t.superficie) {
    case "degradado":
      return { fill: `url(#${uid}-g${i})` };
    case "contorno":
      return { fill: conAlfa(color, 0.14), stroke: color, strokeWidth: 1.5 };
    case "sombras":
      return { fill: color, filter: filtroSvg(t, uid, i) };
    case "glass":
      return { fill: conAlfa(color, 0.72), stroke: "rgba(255,255,255,0.45)", strokeWidth: 1, filter: filtroSvg(t, uid, i) };
    default:
      return { fill: color };
  }
}

/** Transición de motion según el tema (0 ms = sin animación). */
export function transicionLab(t: TokensLab, retraso = 0) {
  const expresiva = t.tema.animacion === "expresiva";
  return {
    duration: t.animacion.duracion / 1000,
    delay: t.animacion.duracion > 0 ? retraso : 0,
    ease: (expresiva ? [0.34, 1.56, 0.64, 1] : [0.22, 1, 0.36, 1]) as [number, number, number, number],
  };
}

/** Texto SVG con la letra y color del tema. */
export function propsTexto(t: TokensLab, suave = true, tamano?: number) {
  return { fill: suave ? t.textoSuave : t.texto, fontFamily: t.fuente, fontSize: tamano ?? t.tamano.eje };
}
