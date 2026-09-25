"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, seriesPorLinea } from "@/lib/lab-graficos/datos";
import {
  baseEcharts,
  curvaEcharts,
  degradadoEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  leyendaEcharts,
  sombraEcharts,
} from "@/lib/lab-graficos/estilos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

// En un apilado al 100% las áreas deben ser casi opacas para leerse como partes del total.
function rellenoParte(t: TokensLab, color: string) {
  if (t.superficie === "degradado") return { color: degradadoEcharts(color, conAlfa(color, 0.45)), opacity: 1 };
  if (t.superficie === "contorno") return { color: conAlfa(color, 0.14), opacity: 1 };
  if (t.superficie === "glass") return { color: conAlfa(color, 0.62), opacity: 1 };
  return { color, opacity: 0.88 };
}

// Participación mensual de cada línea en el total: muestra cómo cambia la mezcla, no el volumen.
export function AreaApilada100({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const partes = useMemo(() => {
    const series = seriesPorLinea(4, 29);
    const totales = MESES.map((_, m) => series.reduce((s, x) => s + x.valores[m], 0));
    return series.map((s) => ({ nombre: s.nombre, valores: s.valores.map((v, m) => Math.round((v / totales[m]) * 1000) / 10) }));
  }, []);

  const option = useMemo<EChartsOption>(
    () => ({
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: t.textoSuave, type: "dashed" } },
        valueFormatter: (v: unknown) => formato.porcentaje(Number(v), 1),
      },
      legend: leyendaEcharts(t),
      grid: gridEcharts(t, { right: t.etiquetas === "directas" ? 88 : 12 }),
      xAxis: ejeCategoriaEcharts(t, MESES, { boundaryGap: false }),
      yAxis: ejeValorEcharts(t, { max: 100, axisLabel: { show: t.grillaModo !== "sin", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, formatter: "{value}%" } }),
      series: partes.map((s, i) => {
        const color = t.colores[i % t.colores.length];
        return {
          name: s.nombre,
          type: "line" as const,
          stack: "total",
          data: s.valores,
          ...curvaEcharts(t),
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { width: t.superficie === "contorno" ? t.grosorLinea : 1, color: t.superficie === "contorno" ? color : t.fondoTarjeta, ...sombraEcharts(t, color) },
          itemStyle: { color },
          areaStyle: rellenoParte(t, color),
          emphasis: { focus: "series" as const },
          endLabel: {
            show: t.etiquetas === "directas",
            formatter: (p: unknown) => {
              const { seriesName, value } = p as { seriesName: string; value: number };
              return `${seriesName} ${formato.porcentaje(value)}`;
            },
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje - 1,
            offset: [4, 8],
          },
        };
      }),
    }),
    [t, partes],
  );

  return <EChart option={option} alto={alto} />;
}
