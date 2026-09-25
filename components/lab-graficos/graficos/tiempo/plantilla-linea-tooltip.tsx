"use client";

import { useState, type MouseEvent } from "react";
import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: línea con tooltip al pasar el mouse, sin librería. Toma la posición X del
// mouse, busca el punto más cercano y dibuja la guía punteada con el valor encima.
const DATOS = [
  { label: "Ene", valor: 3.2 },
  { label: "Feb", valor: 3.8 },
  { label: "Mar", valor: 3.5 },
  { label: "Abr", valor: 4.1 },
  { label: "May", valor: 4.6 },
  { label: "Jun", valor: 4.3 },
  { label: "Jul", valor: 5.0 },
  { label: "Ago", valor: 4.8 },
];

const PAD_X = 16;
const PAD_Y = 16;
const ALTO_EJE = 14;

export function PlantillaLineaTooltip({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <TooltipSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function TooltipSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const [hover, setHover] = useState<number | null>(null);
  const valores = DATOS.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const paso = (ancho - PAD_X * 2) / (DATOS.length - 1);
  const puntos = DATOS.map((d, i) => ({
    x: PAD_X + i * paso,
    y: scaleLinear(d.valor, min, max, alto - PAD_Y - ALTO_EJE, PAD_Y),
  }));
  const color = t.colores[0];

  function alMover(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * ancho;
    const idx = Math.round((x - PAD_X) / paso);
    setHover(Math.min(DATOS.length - 1, Math.max(0, idx)));
  }

  const activo = hover !== null ? puntos[hover] : null;
  const dato = hover !== null ? DATOS[hover] : null;

  return (
    <svg
      width={ancho}
      height={alto}
      className="cursor-crosshair"
      role="img"
      aria-label="Gráfico de línea con tooltip"
      onMouseMove={alMover}
      onMouseLeave={() => setHover(null)}
    >
      <path d={buildSmoothPath(puntos)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map((p, i) => (
        <circle
          key={DATOS[i].label}
          cx={p.x}
          cy={p.y}
          r={hover === i ? 4 : 2.5}
          fill={color}
          opacity={hover === null || hover === i ? 1 : 0.4}
        />
      ))}
      {activo && dato && (
        <g pointerEvents="none">
          <line
            x1={activo.x}
            x2={activo.x}
            y1={PAD_Y}
            y2={alto - PAD_Y - ALTO_EJE}
            stroke={t.eje}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <g transform={`translate(${Math.min(Math.max(activo.x - 24, 0), ancho - 48)}, ${Math.max(activo.y - 26, 0)})`}>
            <rect width={48} height={20} fill={t.tooltip.fondo} opacity={0.9} />
            <text x={24} y={14} textAnchor="middle" fontSize={10} fill={t.tooltip.texto} fontFamily={t.fuente}>
              {dato.valor}
            </text>
          </g>
        </g>
      )}
      <text x={PAD_X} y={alto - 2} fontSize={t.tamano.eje} fill={t.textoSuave} fontFamily={t.fuente}>
        {DATOS[0].label}
      </text>
      <text x={ancho - PAD_X} y={alto - 2} textAnchor="end" fontSize={t.tamano.eje} fill={t.textoSuave} fontFamily={t.fuente}>
        {DATOS[DATOS.length - 1].label}
      </text>
    </svg>
  );
}
