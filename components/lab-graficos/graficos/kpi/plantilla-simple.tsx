"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { estiloEyebrow, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

const KPIS = [
  { label: "Avance físico", valor: "68%", variacion: 4.2 },
  { label: "Obras activas", valor: "24", variacion: 8.3 },
  { label: "Margen bruto", valor: "18,4%", variacion: -1.1 },
];

// Plantilla actual (KP-101): rótulo, valor grande y variación contra el mes anterior, en una fila
// de tres tarjetas como iría en un tablero. Solo cambian la letra, los colores y la cifra del tema.
export function PlantillaSimple({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={150} estirar={false}>
      {KPIS.map((k, i) => {
        const positivo = k.variacion >= 0;
        const Flecha = positivo ? ArrowUp : ArrowDown;
        return (
          <TarjetaKpi
            key={k.label}
            t={t}
            color={t.colores[i % t.colores.length]}
            pad={16}
            titulo={<span style={estiloEyebrow(t)}>{k.label}</span>}
          >
            <div style={{ fontSize: t.kpi.cifra, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 4 }}>
              {k.valor}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                marginTop: 4,
                fontSize: 12,
                color: positivo ? t.estado.bueno : t.estado.malo,
              }}
            >
              <Flecha size={12} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
              {formato.decimal(Math.abs(k.variacion))}% vs mes anterior
            </div>
          </TarjetaKpi>
        );
      })}
    </FilaKpi>
  );
}
