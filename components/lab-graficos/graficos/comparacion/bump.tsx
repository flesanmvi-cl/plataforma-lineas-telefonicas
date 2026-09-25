"use client";

import { useMemo } from "react";
import { ResponsiveBump, type BumpCustomLayerProps } from "@nivo/bump";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { MESES, rankingMensual } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";

type Punto = { x: string; y: number };
type Extra = Record<string, unknown>;

/** Puesto (1 = mejor) de cada obra por mes, a partir de los valores de rankingMensual. */
function rankings() {
  const base = rankingMensual();
  const meses = MESES.slice(0, base[0].valores.length);
  const puestos = meses.map((_, m) => [...base].sort((a, b) => b.valores[m] - a.valores[m]).map((d) => d.obra));
  return base.map((d) => ({
    id: d.obra.replace("Obra ", ""),
    data: meses.map((mes, m) => ({ x: mes, y: puestos[m].indexOf(d.obra) + 1 })),
  }));
}

// Halo bajo cada línea: así se nota la superficie degradado/glass en un bump de Nivo, que no
// admite rellenos con gradiente en sus trazos.
function CapaHalo({ series, lineGenerator }: BumpCustomLayerProps<Punto, Extra>) {
  return (
    <g>
      {series.map((s) => (
        <path
          key={s.id}
          d={lineGenerator(s.linePoints) ?? undefined}
          fill="none"
          stroke={s.color}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={s.opacity * 0.16}
        />
      ))}
    </g>
  );
}

// Bump chart (Nivo): evolución del puesto de cada obra en el ranking mensual de productividad.
// Pasar el mouse sobre una línea la resalta y atenúa el resto.
export function Bump({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => rankings(), []);
  const { animate, motionConfig } = movimientoNivo(t);
  const directas = t.etiquetas === "directas";
  const contorno = t.superficie === "contorno";
  const halo = t.superficie === "degradado" || t.superficie === "glass";
  const sombra = t.superficie === "sombras" || t.superficie === "glass";

  return (
    <div
      style={{
        height: alto,
        filter: sombra ? `drop-shadow(0 ${t.superficie === "glass" ? 0 : 4}px 6px ${conAlfa(t.acento, 0.3)})` : undefined,
      }}
    >
      <ResponsiveBump<Punto, Extra>
        data={datos}
        colors={t.colores}
        theme={temaNivo(t)}
        animate={animate}
        motionConfig={motionConfig}
        interpolation={t.curva === "suave" ? "smooth" : "linear"}
        xPadding={0.5}
        lineWidth={Math.max(t.grosorLinea + 1, 2)}
        activeLineWidth={Math.max(t.grosorLinea + 3, 4)}
        inactiveLineWidth={Math.max(t.grosorLinea, 1.5)}
        inactiveOpacity={0.2}
        pointSize={8}
        activePointSize={12}
        inactivePointSize={4}
        pointColor={contorno ? t.fondoTarjeta : { from: "serie.color" }}
        pointBorderWidth={contorno ? 2 : 0}
        activePointBorderWidth={contorno ? 3 : 0}
        pointBorderColor={{ from: "serie.color" }}
        startLabel={directas}
        startLabelTextColor={{ from: "color" }}
        endLabel
        endLabelTextColor={{ from: "color" }}
        enableGridX={t.grillaModo === "completa"}
        enableGridY={t.grillaModo !== "sin"}
        axisTop={{ tickSize: 0, tickPadding: 8 }}
        axisBottom={null}
        axisLeft={directas ? null : { tickSize: 0, tickPadding: 8, format: (v) => `${v}°` }}
        layers={halo ? ["grid", "axes", CapaHalo, "lines", "labels", "points", "mesh"] : ["grid", "axes", "lines", "labels", "points", "mesh"]}
        margin={{ top: 26, right: 84, bottom: 8, left: directas ? 84 : 32 }}
      />
    </div>
  );
}
