"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { arcSlicePath } from "@/lib/chart-geometry";
import { estiloEyebrow, FilaKpi, PuntoAcento, TarjetaKpi } from "./tarjeta-kpi";

const KPIS = [
  { label: "Cumplimiento de plazo", pct: 74 },
  { label: "Calidad de entregas", pct: 91 },
  { label: "Cobranza al día", pct: 42 },
];

// Plantilla actual (KP-103): gauge semicircular con el color según umbral (desde 80 bueno, desde
// 50 alerta, bajo 50 malo). La cifra dentro del arco escala con el tamaño de cifra del tema.
export function PlantillaGauge({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const cx = 90;
  const cy = 88;
  return (
    <FilaKpi alto={alto} minimo={170} estirar={false}>
      {KPIS.map((k) => {
        const pct = Math.min(100, Math.max(0, k.pct));
        const color = pct >= 80 ? t.estado.bueno : pct >= 50 ? t.estado.alerta : t.estado.malo;
        return (
          <TarjetaKpi key={k.label} t={t} color={color} pad={16} titulo={null} estilo={{ alignItems: "center" }}>
            <svg viewBox="0 0 180 96" style={{ width: "100%", maxWidth: 220 }} role="img" aria-label={`${k.label}: ${pct}%`}>
              <path d={arcSlicePath(cx, cy, 78, 58, -90, 90)} fill={t.grilla} />
              <path d={arcSlicePath(cx, cy, 78, 58, -90, -90 + (pct / 100) * 180)} fill={color} />
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fontSize={Math.round(t.kpi.cifra * 0.875)}
                fontWeight={700}
                fill={t.texto}
                fontFamily={t.fuente}
              >
                {pct}%
              </text>
            </svg>
            <p style={{ ...estiloEyebrow(t), margin: "4px 0 0", textAlign: "center" }}>
              <PuntoAcento t={t} color={color} />
              {k.label}
            </p>
          </TarjetaKpi>
        );
      })}
    </FilaKpi>
  );
}
