"use client";

import { useId } from "react";
import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: línea con área en degradado vertical, para tendencias acumuladas (avance,
// ingresos). useId evita choques del <linearGradient> si se dibuja más de una vez en la página.
const DATOS = [
  { label: "S1", valor: 120 },
  { label: "S2", valor: 145 },
  { label: "S3", valor: 132 },
  { label: "S4", valor: 168 },
  { label: "S5", valor: 190 },
  { label: "S6", valor: 176 },
];

const PAD_X = 16;
const PAD_Y = 16;

export function PlantillaLineaArea({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <AreaSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function AreaSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const idDegradado = useId().replace(/:/g, "");
  const valores = DATOS.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const paso = (ancho - PAD_X * 2) / (DATOS.length - 1);
  const puntos = DATOS.map((d, i) => ({
    x: PAD_X + i * paso,
    y: scaleLinear(d.valor, min * 0.85, max, alto - PAD_Y, PAD_Y),
  }));
  const linea = buildSmoothPath(puntos);
  const area = buildAreaPath(linea, puntos, alto - PAD_Y);
  const color = t.colores[0];

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de línea con área">
      <defs>
        <linearGradient id={idDegradado} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${idDegradado})`} stroke="none" />
      <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
