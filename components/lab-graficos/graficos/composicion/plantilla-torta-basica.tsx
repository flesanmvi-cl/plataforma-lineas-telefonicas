"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { arcSlicePath, toSlices } from "@/lib/chart-geometry";

// Plantilla actual: torta básica con leyenda lateral y porcentaje por sector. El SVG usa viewBox
// fijo y escala al alto disponible (sin pasar de la mitad del ancho, para dejar sitio a la leyenda).
const DATOS = [
  { label: "Construcción", valor: 45 },
  { label: "Minería", valor: 25 },
  { label: "Vialidad", valor: 18 },
  { label: "Otros", valor: 12 },
];

const CX = 80;
const CY = 80;
const RADIO = 70;

export function PlantillaTortaBasica({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const sectores = toSlices(DATOS);
  const color = (i: number) => t.colores[i % t.colores.length];

  return (
    <div className="flex items-center justify-center gap-5" style={{ height: alto }}>
      <svg
        viewBox="0 0 160 160"
        className="shrink-0"
        style={{ width: alto, maxWidth: "55%", aspectRatio: "1 / 1" }}
        role="img"
        aria-label="Gráfico de torta"
      >
        {sectores.map((s, i) => (
          <path
            key={s.label}
            d={arcSlicePath(CX, CY, RADIO, 0, s.startAngle, s.endAngle)}
            fill={color(i)}
            stroke={t.fondoTarjeta}
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <ul className="flex flex-col gap-1.5">
        {sectores.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center gap-2"
            style={{ fontFamily: t.fuente, fontSize: 11, color: t.textoSuave }}
          >
            <span className="h-2 w-2 shrink-0" style={{ background: color(i) }} />
            {s.label} <span style={{ opacity: 0.7 }}>· {Math.round(s.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
