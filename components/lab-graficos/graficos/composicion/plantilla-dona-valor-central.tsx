"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { arcSlicePath, toSlices } from "@/lib/chart-geometry";

// Plantilla actual: dona de un solo indicador (avance %) con la cifra al centro. El resto del
// anillo va en el tono de la grilla. viewBox fijo que escala al alto disponible.
const DATOS = [
  { label: "Completado", valor: 68 },
  { label: "Restante", valor: 32 },
];

const CX = 80;
const CY = 80;
const RADIO_EXT = 70;
const RADIO_INT = 48;

export function PlantillaDonaValorCentral({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const sectores = toSlices(DATOS);
  const principal = DATOS[0];

  return (
    <div className="flex items-center justify-center" style={{ height: alto }}>
      <svg
        viewBox="0 0 160 160"
        style={{ height: alto, maxWidth: "100%", aspectRatio: "1 / 1" }}
        role="img"
        aria-label="Gráfico de dona con valor central"
      >
        {sectores.map((s, i) => (
          <path
            key={s.label}
            d={arcSlicePath(CX, CY, RADIO_EXT, RADIO_INT, s.startAngle, s.endAngle)}
            fill={i === 0 ? t.colores[0] : t.grilla}
          />
        ))}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fontSize={26}
          fontWeight={800}
          fontStyle="italic"
          fill={t.texto}
          fontFamily={t.fuente}
        >
          {principal.valor}%
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize={9} fill={t.textoSuave} fontFamily={t.fuente} letterSpacing={1}>
          {principal.label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
