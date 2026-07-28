"use client";

import { useState, type MouseEvent } from "react";
import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// GL-204 · Línea con tooltip interactivo on-hover (sin librería: mueve el
// mouse sobre el SVG, calcula el punto más cercano por posición X).
const DATA = [
  { label: "Ene", valor: 3.2 },
  { label: "Feb", valor: 3.8 },
  { label: "Mar", valor: 3.5 },
  { label: "Abr", valor: 4.1 },
  { label: "May", valor: 4.6 },
  { label: "Jun", valor: 4.3 },
  { label: "Jul", valor: 5.0 },
  { label: "Ago", valor: 4.8 },
];

const W = 320;
const H = 170;
const PAD_X = 16;
const PAD_Y = 16;
const AXIS_H = 14;

export function GL204LineaTooltip() {
  const [hover, setHover] = useState<number | null>(null);
  const valores = DATA.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const step = (W - PAD_X * 2) / (DATA.length - 1);
  const points = DATA.map((d, i) => ({
    x: PAD_X + i * step,
    y: scaleLinear(d.valor, min, max, H - PAD_Y - AXIS_H, PAD_Y),
  }));
  const path = buildSmoothPath(points);

  function onMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xSvg = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((xSvg - PAD_X) / step);
    setHover(Math.min(DATA.length - 1, Math.max(0, idx)));
  }

  const activo = hover !== null ? points[hover] : null;
  const dato = hover !== null ? DATA[hover] : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto cursor-crosshair"
      role="img"
      aria-label="Gráfico de línea con tooltip"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <path d={path} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={hover === i ? 4 : 2.5}
          fill="var(--color-chart-1)"
          opacity={hover === null || hover === i ? 1 : 0.4}
        />
      ))}
      {activo && dato && (
        <g>
          <line
            x1={activo.x}
            x2={activo.x}
            y1={PAD_Y}
            y2={H - PAD_Y - AXIS_H}
            stroke="var(--color-border-strong)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <g transform={`translate(${Math.min(Math.max(activo.x - 24, 0), W - 48)}, ${Math.max(activo.y - 26, 0)})`}>
            <rect width={48} height={20} fill="var(--color-text)" opacity={0.9} />
            <text x={24} y={14} textAnchor="middle" fontSize={10} fill="var(--color-bg)" fontFamily="var(--font-label)">
              {dato.valor}
            </text>
          </g>
        </g>
      )}
      <text x={PAD_X} y={H - 2} fontSize={9} fill="var(--color-faint)" fontFamily="var(--font-label)">
        {DATA[0].label}
      </text>
      <text x={W - PAD_X} y={H - 2} textAnchor="end" fontSize={9} fill="var(--color-faint)" fontFamily="var(--font-label)">
        {DATA[DATA.length - 1].label}
      </text>
    </svg>
  );
}
