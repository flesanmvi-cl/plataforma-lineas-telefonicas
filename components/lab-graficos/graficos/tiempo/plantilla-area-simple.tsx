"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: área simple con relleno sólido semitransparente (sin degradado), pensada
// para volúmenes acumulados.
const DATOS = [
  { label: "Sem 1", valor: 12 },
  { label: "Sem 2", valor: 19 },
  { label: "Sem 3", valor: 15 },
  { label: "Sem 4", valor: 27 },
  { label: "Sem 5", valor: 24 },
  { label: "Sem 6", valor: 32 },
  { label: "Sem 7", valor: 29 },
];

const PAD_X = 16;
const PAD_Y = 16;

export function PlantillaAreaSimple({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <AreaSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function AreaSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const max = Math.max(...DATOS.map((d) => d.valor));
  const paso = (ancho - PAD_X * 2) / (DATOS.length - 1);
  const puntos = DATOS.map((d, i) => ({ x: PAD_X + i * paso, y: scaleLinear(d.valor, 0, max, alto - PAD_Y, PAD_Y) }));
  const linea = buildSmoothPath(puntos);
  const area = buildAreaPath(linea, puntos, alto - PAD_Y);
  const color = t.colores[0];

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de área simple">
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1={PAD_X}
          x2={ancho - PAD_X}
          y1={PAD_Y + f * (alto - PAD_Y * 2)}
          y2={PAD_Y + f * (alto - PAD_Y * 2)}
          stroke={t.grilla}
          strokeWidth={1}
        />
      ))}
      <path d={area} fill={color} opacity={0.18} stroke="none" />
      <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
