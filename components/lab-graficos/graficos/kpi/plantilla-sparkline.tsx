"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";
import { estiloEyebrow, FilaKpi, PuntoAcento, TarjetaKpi } from "./tarjeta-kpi";

const KPIS = [
  { label: "Ingresos semanales", valor: "$ 78,4 M", serie: [40, 55, 48, 62, 58, 70, 66, 78] },
  { label: "HH trabajadas", valor: "41.260", serie: [52, 50, 57, 55, 61, 59, 64, 68] },
  { label: "Despacho de hormigón", valor: "1.184 m³", serie: [70, 66, 72, 61, 64, 58, 60, 55] },
];
const ANCHO = 100;
const ALTO = 32;

// Plantilla actual (KP-105): rótulo y valor a la izquierda, mini sparkline sin ejes a la derecha.
// El trazo va con el color de estado bueno si la serie sube y malo si baja.
export function PlantillaSparkline({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={220} estirar={false}>
      {KPIS.map((k, i) => {
        const min = Math.min(...k.serie);
        const max = Math.max(...k.serie);
        const paso = ANCHO / (k.serie.length - 1);
        const puntos = k.serie.map((v, j) => ({ x: j * paso, y: scaleLinear(v, min, max, ALTO - 2, 2) }));
        const sube = k.serie[k.serie.length - 1] >= k.serie[0];
        return (
          <TarjetaKpi key={k.label} t={t} color={t.colores[i % t.colores.length]} pad={16} titulo={null}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
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
                  <PuntoAcento t={t} color={t.colores[i % t.colores.length]} />
                  {k.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: t.kpi.cifra,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                  }}
                >
                  {k.valor}
                </p>
              </div>
              <svg
                viewBox={`0 0 ${ANCHO} ${ALTO}`}
                style={{ width: 96, height: 32, flexShrink: 0 }}
                role="img"
                aria-label="Mini gráfico de tendencia"
              >
                <path
                  d={buildSmoothPath(puntos)}
                  fill="none"
                  stroke={sube ? t.estado.bueno : t.estado.malo}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </TarjetaKpi>
        );
      })}
    </FilaKpi>
  );
}
