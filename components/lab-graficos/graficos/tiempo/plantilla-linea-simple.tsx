"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: línea simple con puntos, una sola serie y sin relleno. Copia de la de /ui-kit
// ajustada al contenedor y a los tokens del laboratorio.
const DATOS = [
  { label: "Ene", valor: 42 },
  { label: "Feb", valor: 58 },
  { label: "Mar", valor: 51 },
  { label: "Abr", valor: 67 },
  { label: "May", valor: 73 },
  { label: "Jun", valor: 69 },
  { label: "Jul", valor: 82 },
];

const PAD_X = 16;
const PAD_Y = 16;

export function PlantillaLineaSimple({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <LineaSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function LineaSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const valores = DATOS.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const paso = (ancho - PAD_X * 2) / (DATOS.length - 1);
  const puntos = DATOS.map((d, i) => ({ x: PAD_X + i * paso, y: scaleLinear(d.valor, min, max, alto - PAD_Y, PAD_Y) }));
  const color = t.colores[0];

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de línea simple">
      {[0.25, 0.5, 0.75].map((f) => (
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
      <path d={buildSmoothPath(puntos)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map((p, i) => (
        <circle key={DATOS[i].label} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </svg>
  );
}
