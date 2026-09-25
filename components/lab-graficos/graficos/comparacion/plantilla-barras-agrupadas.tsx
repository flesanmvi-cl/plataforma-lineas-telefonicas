"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { scaleLinear } from "@/lib/chart-geometry";

// Plantilla actual: barras agrupadas de dos series (meta contra real) por trimestre, con leyenda
// debajo. Meta usa el color 3 de la paleta y real el 1, como la original.
const TRIMESTRES = ["T1", "T2", "T3", "T4"];
const SERIES = [
  { nombre: "Meta", indiceColor: 2, valores: [60, 65, 70, 75] },
  { nombre: "Real", indiceColor: 0, valores: [55, 68, 64, 80] },
];

const PAD_X = 16;
const PAD_Y = 16;
const SEPARACION_GRUPO = 14;

export function PlantillaBarrasAgrupadas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const colores = SERIES.map((s) => t.colores[s.indiceColor % t.colores.length]);
  const estiloEje = { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.textoSuave };

  return (
    <div className="flex flex-col" style={{ height: alto }}>
      <div className="min-h-0 flex-1">
        <ParentSize>
          {({ width, height }) =>
            width > 0 && height > 0 ? (
              <AgrupadasSvg ancho={width} alto={height} colores={colores} estiloEje={estiloEje} />
            ) : null
          }
        </ParentSize>
      </div>
      <div className="mt-2 flex gap-3">
        {SERIES.map((s, i) => (
          <span
            key={s.nombre}
            className="flex items-center gap-1.5 uppercase tracking-wider"
            style={{ fontFamily: t.fuente, fontSize: 10, color: t.textoSuave }}
          >
            <span className="h-2 w-2 shrink-0" style={{ background: colores[i] }} />
            {s.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}

function AgrupadasSvg({
  ancho,
  alto,
  colores,
  estiloEje,
}: {
  ancho: number;
  alto: number;
  colores: string[];
  estiloEje: { fontFamily: string; fontSize: number; fill: string };
}) {
  const max = Math.max(...SERIES.flatMap((s) => s.valores));
  const anchoGrupo = (ancho - PAD_X * 2 - SEPARACION_GRUPO * (TRIMESTRES.length - 1)) / TRIMESTRES.length;
  const anchoBarra = (anchoGrupo - 4) / SERIES.length;

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de barras agrupadas">
      {TRIMESTRES.map((trimestre, gi) => {
        const xGrupo = PAD_X + gi * (anchoGrupo + SEPARACION_GRUPO);
        return (
          <g key={trimestre}>
            {SERIES.map((s, si) => {
              const altoBarra = scaleLinear(s.valores[gi], 0, max, 0, alto - PAD_Y * 2);
              return (
                <rect
                  key={s.nombre}
                  x={xGrupo + si * (anchoBarra + 4)}
                  y={alto - PAD_Y - altoBarra}
                  width={anchoBarra}
                  height={altoBarra}
                  fill={colores[si]}
                />
              );
            })}
            <text x={xGrupo + anchoGrupo / 2} y={alto - 4} textAnchor="middle" {...estiloEje}>
              {trimestre}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
