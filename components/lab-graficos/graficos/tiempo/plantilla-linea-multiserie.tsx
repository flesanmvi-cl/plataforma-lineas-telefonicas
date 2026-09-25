"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// Plantilla actual: tres líneas comparativas con leyenda debajo. Usa los colores 1, 3 y 5 de la
// paleta, igual que la original con --color-chart-1/3/5.
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const SERIES = [
  { nombre: "Obra A", indiceColor: 0, valores: [30, 45, 40, 55, 62, 58] },
  { nombre: "Obra B", indiceColor: 2, valores: [50, 48, 60, 57, 70, 75] },
  { nombre: "Obra C", indiceColor: 4, valores: [20, 28, 35, 30, 45, 52] },
];

const PAD_X = 16;
const PAD_Y = 12;

export function PlantillaLineaMultiserie({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const colores = SERIES.map((s) => t.colores[s.indiceColor % t.colores.length]);

  return (
    <div className="flex flex-col" style={{ height: alto }}>
      <div className="min-h-0 flex-1">
        <ParentSize>
          {({ width, height }) =>
            width > 0 && height > 0 ? <LineasSvg ancho={width} alto={height} colores={colores} /> : null
          }
        </ParentSize>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
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

function LineasSvg({ ancho, alto, colores }: { ancho: number; alto: number; colores: string[] }) {
  const todos = SERIES.flatMap((s) => s.valores);
  const min = Math.min(...todos);
  const max = Math.max(...todos);
  const paso = (ancho - PAD_X * 2) / (MESES.length - 1);

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de línea multiserie">
      {SERIES.map((s, si) => {
        const puntos = s.valores.map((v, i) => ({ x: PAD_X + i * paso, y: scaleLinear(v, min, max, alto - PAD_Y, PAD_Y) }));
        return (
          <path
            key={s.nombre}
            d={buildSmoothPath(puntos)}
            fill="none"
            stroke={colores[si]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
