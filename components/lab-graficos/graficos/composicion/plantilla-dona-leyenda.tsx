"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { arcSlicePath, toSlices } from "@/lib/chart-geometry";

// Plantilla actual: dona por estado de un portafolio (en plazo, en riesgo, atrasado) con leyenda y
// porcentajes al lado. Usa los colores semánticos de estado, no la paleta categórica.
const DATOS = [
  { label: "En plazo", valor: 52 },
  { label: "En riesgo", valor: 28 },
  { label: "Atrasado", valor: 20 },
];

const CX = 70;
const CY = 70;
const RADIO_EXT = 62;
const RADIO_INT = 40;

export function PlantillaDonaLeyenda({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const sectores = toSlices(DATOS);
  const colores = [t.estado.bueno, t.estado.alerta, t.estado.malo];

  return (
    <div className="flex items-center justify-center gap-5" style={{ height: alto }}>
      <svg
        viewBox="0 0 140 140"
        className="shrink-0"
        style={{ width: alto, maxWidth: "50%", aspectRatio: "1 / 1" }}
        role="img"
        aria-label="Gráfico de dona con leyenda"
      >
        {sectores.map((s, i) => (
          <path
            key={s.label}
            d={arcSlicePath(CX, CY, RADIO_EXT, RADIO_INT, s.startAngle, s.endAngle)}
            fill={colores[i % colores.length]}
          />
        ))}
      </svg>
      <ul className="flex min-w-32 flex-col gap-2" style={{ fontFamily: t.fuente, fontSize: 12 }}>
        {sectores.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0" style={{ background: colores[i % colores.length] }} />
            <span style={{ color: t.texto }}>{s.label}</span>
            <span className="ml-auto tabular-nums" style={{ color: t.textoSuave }}>
              {Math.round(s.pct * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
