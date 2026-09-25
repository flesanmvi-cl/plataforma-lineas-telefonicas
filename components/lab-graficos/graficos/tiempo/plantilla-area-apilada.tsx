"use client";

import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// Plantilla actual: área apilada de dos series acumuladas (mano de obra + materiales), con
// leyenda debajo. Usa los colores 1 y 3 de la paleta, como la original.
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const SERIE_A = [20, 25, 22, 30, 28, 35];
const SERIE_B = [15, 18, 20, 17, 24, 22];

const PAD_X = 16;
const PAD_Y = 16;

export function PlantillaAreaApilada({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const colorA = t.colores[0];
  const colorB = t.colores[2 % t.colores.length];
  const leyenda = [
    { nombre: "Mano de obra", color: colorA },
    { nombre: "Materiales", color: colorB },
  ];

  return (
    <div className="flex flex-col" style={{ height: alto }}>
      <div className="min-h-0 flex-1">
        <ParentSize>
          {({ width, height }) =>
            width > 0 && height > 0 ? <ApiladaSvg ancho={width} alto={height} colorA={colorA} colorB={colorB} /> : null
          }
        </ParentSize>
      </div>
      <div className="mt-2 flex gap-3">
        {leyenda.map((it) => (
          <span
            key={it.nombre}
            className="flex items-center gap-1.5 uppercase tracking-wider"
            style={{ fontFamily: t.fuente, fontSize: 10, color: t.textoSuave }}
          >
            <span className="h-2 w-2 shrink-0" style={{ background: it.color }} />
            {it.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApiladaSvg({ ancho, alto, colorA, colorB }: { ancho: number; alto: number; colorA: string; colorB: string }) {
  const max = Math.max(...MESES.map((_, i) => SERIE_A[i] + SERIE_B[i]));
  const paso = (ancho - PAD_X * 2) / (MESES.length - 1);
  const baseA = SERIE_A.map((v, i) => ({ x: PAD_X + i * paso, y: scaleLinear(v, 0, max, alto - PAD_Y, PAD_Y) }));
  const topeB = SERIE_A.map((v, i) => ({ x: PAD_X + i * paso, y: scaleLinear(v + SERIE_B[i], 0, max, alto - PAD_Y, PAD_Y) }));

  const lineaA = buildSmoothPath(baseA);
  const areaA = buildAreaPath(lineaA, baseA, alto - PAD_Y);
  const lineaB = buildSmoothPath(topeB);
  // El área de B va entre su curva y la de A, no hasta la línea base.
  const ultimo = baseA[baseA.length - 1];
  const areaB = `${lineaB} L${ultimo.x},${ultimo.y} ${baseA
    .slice()
    .reverse()
    .map((p) => `L${p.x},${p.y}`)
    .join(" ")} Z`;

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Gráfico de área apilada">
      <path d={areaB} fill={colorB} opacity={0.35} stroke="none" />
      <path d={areaA} fill={colorA} opacity={0.35} stroke="none" />
      <path d={lineaA} fill="none" stroke={colorA} strokeWidth={2} />
      <path d={lineaB} fill="none" stroke={colorB} strokeWidth={2} />
    </svg>
  );
}
