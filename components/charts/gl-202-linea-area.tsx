"use client";

import { useId } from "react";
import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// GL-202 · Línea con área de relleno en gradiente — buena para tendencias
// acumuladas (avance, ingresos). useId() evita colisión de <linearGradient>
// si el componente se renderiza más de una vez en la misma página.
const DATA = [
  { label: "S1", valor: 120 },
  { label: "S2", valor: 145 },
  { label: "S3", valor: 132 },
  { label: "S4", valor: 168 },
  { label: "S5", valor: 190 },
  { label: "S6", valor: 176 },
];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;

export function GL202LineaArea() {
  const gradId = useId();
  const valores = DATA.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const step = (W - PAD_X * 2) / (DATA.length - 1);
  const points = DATA.map((d, i) => ({
    x: PAD_X + i * step,
    y: scaleLinear(d.valor, min * 0.85, max, H - PAD_Y, PAD_Y),
  }));
  const line = buildSmoothPath(points);
  const area = buildAreaPath(line, points, H - PAD_Y);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de línea con área">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path d={line} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
