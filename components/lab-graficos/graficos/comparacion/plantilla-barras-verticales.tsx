"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: barras verticales simples de una serie, sin ejes ni valores, con el mes bajo
// cada barra.
const DATOS = [
  { label: "Ene", valor: 45 },
  { label: "Feb", valor: 62 },
  { label: "Mar", valor: 38 },
  { label: "Abr", valor: 71 },
  { label: "May", valor: 55 },
  { label: "Jun", valor: 80 },
];

const PAD_X = 16;
const PAD_Y = 16;
const SEPARACION = 10;

export function PlantillaBarrasVerticales({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <BarrasSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function BarrasSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const max = Math.max(...DATOS.map((d) => d.valor));
  const anchoBarra = (ancho - PAD_X * 2 - SEPARACION * (DATOS.length - 1)) / DATOS.length;

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de barras verticales">
      {DATOS.map((d, i) => {
        const altoBarra = scaleLinear(d.valor, 0, max, 0, alto - PAD_Y * 2);
        const x = PAD_X + i * (anchoBarra + SEPARACION);
        return (
          <g key={d.label}>
            <rect x={x} y={alto - PAD_Y - altoBarra} width={anchoBarra} height={altoBarra} fill={t.colores[0]} />
            <text
              x={x + anchoBarra / 2}
              y={alto - 4}
              textAnchor="middle"
              fontSize={t.tamano.eje}
              fill={t.textoSuave}
              fontFamily={t.fuente}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
