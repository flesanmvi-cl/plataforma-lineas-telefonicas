"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { MESES, seriesPorLinea } from "@/lib/lab-graficos/datos";
import {
  baseEcharts,
  curvaEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  leyendaEcharts,
  rellenoAreaEcharts,
  sombraEcharts,
} from "@/lib/lab-graficos/estilos";

// Gráfico de referencia (ECharts): así se arma un gráfico del laboratorio que obedece al
// tema. Todo color, letra, curva, superficie y animación sale de los tokens.
export function LineaMultiserie({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const series = useMemo(() => seriesPorLinea(3), []);

  const option = useMemo<EChartsOption>(
    () => ({
      ...baseEcharts(t),
      tooltip: { ...baseEcharts(t).tooltip, trigger: "axis", axisPointer: { type: "line", lineStyle: { color: t.textoSuave, type: "dashed" } } },
      legend: leyendaEcharts(t),
      grid: gridEcharts(t),
      xAxis: ejeCategoriaEcharts(t, MESES, { boundaryGap: false }),
      yAxis: ejeValorEcharts(t),
      series: series.map((s, i) => {
        const color = t.colores[i % t.colores.length];
        return {
          name: s.nombre,
          type: "line" as const,
          data: s.valores,
          ...curvaEcharts(t),
          symbol: "circle",
          symbolSize: 6,
          showSymbol: false,
          lineStyle: { width: t.grosorLinea, color, ...sombraEcharts(t, color) },
          itemStyle: { color },
          // Solo la primera serie lleva área: con tres rellenos se ensucia.
          areaStyle: i === 0 ? rellenoAreaEcharts(t, color) : undefined,
          emphasis: { focus: "series" as const },
          endLabel: {
            show: t.etiquetas === "directas",
            formatter: "{a}",
            color,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
          },
        };
      }),
    }),
    [t, series],
  );

  return <EChart option={option} alto={alto} />;
}
