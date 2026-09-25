"use client";

import { useId, useMemo } from "react";
import { ResponsiveBoxPlot, type BoxPlotCustomLayerProps } from "@nivo/boxplot";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, muestras, OBRAS } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { superficieNivo } from "../composicion/utilidades";

const GRUPOS = OBRAS.slice(0, 5);

// Caja y bigotes del rendimiento semanal por obra: mediana, cuartiles y rango en un vistazo.
// El eje ya nombra cada obra, así que no lleva leyenda; con etiquetas directas se rotula la mediana.
export function BoxplotGrupos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const uid = useId().replace(/:/g, "");
  const datos = useMemo(() => muestras(GRUPOS, 50, 33).map((m) => ({ grupo: m.grupo, valor: m.valor })), []);
  const sup = superficieNivo(t, uid);
  const { animate, motionConfig } = movimientoNivo(t);
  const directas = t.etiquetas === "directas";

  // Con etiquetas directas, la mediana se rotula al final del bigote de cada obra.
  const capaMedianas = ({ boxPlots }: BoxPlotCustomLayerProps<{ grupo: string; valor: number }>) => (
    <g pointerEvents="none">
      {boxPlots.map((b) => (
        <text
          key={b.key}
          x={b.coordinates.values[4] + 6}
          y={b.coordinates.index + b.bandwidth / 2}
          dy="0.35em"
          fill={t.texto}
          fontFamily={t.fuente}
          fontSize={t.tamano.eje - 1}
          fontWeight={600}
        >
          {formato.decimal(b.data.values[2])}
        </text>
      ))}
    </g>
  );

  return (
    <div style={{ height: alto, ...sup.estilo }}>
      <ResponsiveBoxPlot
        data={datos}
        groupBy="grupo"
        groups={GRUPOS}
        value="valor"
        layout="horizontal"
        margin={{ top: 6, right: directas ? 36 : 12, bottom: 24, left: 88 }}
        padding={0.34}
        colorBy="group"
        colors={sup.colores}
        borderRadius={Math.min(t.radio / 2, 5)}
        borderWidth={sup.borderWidth || 1}
        borderColor={t.superficie === "plana" || t.superficie === "sombras" ? { from: "color", modifiers: [["darker", 0.4]] } : sup.borderColor}
        medianWidth={2.5}
        medianColor={t.superficie === "contorno" ? { from: "color", modifiers: [["opacity", 1]] } : t.fondoTarjeta}
        whiskerWidth={1.5}
        whiskerEndSize={0.5}
        whiskerColor={t.textoSuave}
        activeOpacity={1}
        inactiveOpacity={0.3}
        defs={sup.defs}
        fill={sup.fill}
        theme={{ ...temaNivo(t), translation: {} }}
        animate={animate}
        motionConfig={motionConfig}
        enableGridX={t.grillaModo !== "sin"}
        enableGridY={t.grillaModo === "completa"}
        axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: 6 }}
        axisLeft={{ tickSize: 0, tickPadding: 8 }}
        valueFormat={(v) => formato.decimal(v)}
        layers={["grid", "axes", "boxPlots", "markers", ...(directas ? [capaMedianas] : [])]}
      />
    </div>
  );
}
