"use client";

import { Building2, HardHat, Users, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { estiloEyebrow, estiloTarjeta, FilaKpi } from "./tarjeta-kpi";

const KPIS: { label: string; valor: string; icono: LucideIcon }[] = [
  { label: "Obras activas", valor: "24", icono: Building2 },
  { label: "Trabajadores en obra", valor: "3.412", icono: Users },
  { label: "Frentes de trabajo", valor: "57", icono: HardHat },
];

// Plantilla actual (KP-102): ícono en caja y franja de color arriba, para distinguir categorías de
// indicadores. La franja es parte del diseño, por eso no suma el acento del tema.
export function PlantillaIconoFranja({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={170} estirar={false}>
      {KPIS.map((k, i) => {
        const color = t.colores[i % t.colores.length];
        const Icono = k.icono;
        return (
          <div key={k.label} style={{ ...estiloTarjeta(t, color), overflow: "hidden", minWidth: 0, fontFamily: t.fuente }}>
            <div style={{ height: 4, background: color }} />
            <div style={{ padding: 16, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${t.eje}`,
                  color,
                }}
              >
                <Icono size={20} aria-hidden />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    ...estiloEyebrow(t),
                    margin: "0 0 4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {k.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: t.kpi.cifra,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                    color: t.texto,
                  }}
                >
                  {k.valor}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </FilaKpi>
  );
}
