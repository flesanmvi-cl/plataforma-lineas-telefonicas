"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { estiloEyebrow, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

const KPIS = [
  { label: "Ejecución presupuestaria", actual: 842, meta: 1000, unidad: "M CLP" },
  { label: "Contratación anual", actual: 7.8, meta: 8, unidad: "MM CLP" },
  { label: "Cobranza del año", actual: 5.1, meta: 9, unidad: "MM CLP" },
];

// Plantilla actual (KP-104): valor actual sobre la meta y barra lineal recta con el % logrado.
export function PlantillaComparativo({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={170} estirar={false}>
      {KPIS.map((k, i) => {
        const pct = Math.min(100, Math.round((k.actual / k.meta) * 100));
        const decimales = Number.isInteger(k.actual) ? 0 : 1;
        return (
          <TarjetaKpi
            key={k.label}
            t={t}
            color={t.colores[i % t.colores.length]}
            pad={16}
            titulo={<span style={estiloEyebrow(t)}>{k.label}</span>}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0 12px" }}>
              <span style={{ fontSize: t.kpi.cifra, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                {formato.decimal(k.actual, decimales)}
              </span>
              <span style={{ fontSize: 12, color: t.textoSuave, whiteSpace: "nowrap" }}>
                / {formato.decimal(k.meta, decimales)} {k.unidad}
              </span>
            </div>
            <div style={{ height: 8, background: t.grilla, border: `1px solid ${t.eje}` }}>
              <div style={{ height: "100%", width: `${pct}%`, background: t.acento }} />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 10, color: t.textoSuave, fontVariantNumeric: "tabular-nums" }}>
              {pct}% de la meta
            </p>
          </TarjetaKpi>
        );
      })}
    </FilaKpi>
  );
}
