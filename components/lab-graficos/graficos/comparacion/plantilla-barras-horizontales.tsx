"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { scaleLinear } from "@/lib/chart-geometry";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Plantilla actual: barras horizontales para rankings con etiquetas largas, con riel de fondo y
// el valor en la punta.
const DATOS = [
  { label: "Obra Vespucio", valor: 92 },
  { label: "Obra Aysén", valor: 78 },
  { label: "Obra Toro", valor: 65 },
  { label: "Obra Dolores", valor: 54 },
  { label: "Obra Colina", valor: 41 },
];

const PAD_IZQ = 100;
const PAD_DER = 34;
const SEPARACION = 6;
// La original usa filas de 24 px; aquí se estiran al alto disponible, con un tope para no engordar.
const ALTO_FILA_MAX = 32;

export function PlantillaBarrasHorizontales({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <BarrasSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function BarrasSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const max = Math.max(...DATOS.map((d) => d.valor));
  const altoFila = Math.min(ALTO_FILA_MAX, (alto - SEPARACION * (DATOS.length - 1)) / DATOS.length);
  const altoTotal = DATOS.length * (altoFila + SEPARACION) - SEPARACION;
  const y0 = Math.max(0, (alto - altoTotal) / 2);
  const riel = Math.max(0, ancho - PAD_IZQ - PAD_DER);

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de barras horizontales">
      {DATOS.map((d, i) => {
        const anchoBarra = scaleLinear(d.valor, 0, max, 0, riel);
        const y = y0 + i * (altoFila + SEPARACION);
        return (
          <g key={d.label}>
            <text
              x={PAD_IZQ - 8}
              y={y + altoFila / 2}
              dy="0.35em"
              textAnchor="end"
              fontSize={t.tamano.eje}
              fill={t.textoSuave}
              fontFamily={t.fuente}
            >
              {d.label}
            </text>
            <rect x={PAD_IZQ} y={y} width={riel} height={altoFila} fill={t.grilla} />
            <rect x={PAD_IZQ} y={y} width={anchoBarra} height={altoFila} fill={t.colores[0]} />
            <text
              x={PAD_IZQ + anchoBarra + 6}
              y={y + altoFila / 2}
              dy="0.35em"
              fontSize={t.tamano.eje}
              fill={t.texto}
              fontFamily={t.fuente}
              fontWeight={600}
            >
              {d.valor}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
