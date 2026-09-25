"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, OBRAS } from "@/lib/lab-graficos/datos";
import { baseEcharts, ejeValorEcharts, gridEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

const META = 85;

/** Cumplimiento del programa por obra (%), ordenado de mayor a menor. */
function cumplimiento() {
  const r = azar(409);
  return OBRAS.map((obra) => ({ obra, valor: Math.round(62 + r() * 42) })).sort((a, b) => a.valor - b.valor);
}

// Barras horizontales (ECharts) con la cifra rotulada en la punta y una línea de meta
// (markLine). Las obras que cumplen llevan el acento; las que no, un gris de apoyo.
export function BarrasMeta({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => cumplimiento(), []);

  const option = useMemo<EChartsOption>(() => {
    const cumple = t.acento;
    const bajo = t.colores[2 % t.colores.length];
    const base = baseEcharts(t);
    const leyenda = t.etiquetas === "leyenda";
    const r = Math.min(t.radio, 6);
    const serie = (nombre: string, color: string, filtro: (v: number) => boolean) => ({
      name: nombre,
      type: "bar" as const,
      stack: "unico",
      barWidth: "56%",
      itemStyle: { ...rellenoBloqueEcharts(t, color, true), borderRadius: [0, r, r, 0] },
      label: {
        show: true,
        position: "right" as const,
        formatter: (p: { value: unknown }) => (p.value == null || p.value === "-" ? "" : formato.porcentaje(Number(p.value))),
        color: t.texto,
        fontFamily: t.fuente,
        fontSize: t.tamano.eje,
        fontWeight: 600,
      },
      emphasis: { focus: "series" as const },
      data: datos.map((d) => (filtro(d.valor) ? d.valor : "-")),
    });
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value } = p as { name: string; value: number };
          const dif = value - META;
          return `<b>${name}</b><br/>${formato.porcentaje(value)} · ${dif >= 0 ? "+" : ""}${dif} pp contra la meta`;
        },
      },
      legend: leyendaEcharts(t, { data: ["Cumple", "Bajo meta"] }),
      grid: gridEcharts(t, { right: 40, top: leyenda ? 32 : 18 }),
      xAxis: ejeValorEcharts(t, { max: 110, axisLabel: { ...ejeValorEcharts(t).axisLabel, formatter: "{value}%" } }),
      yAxis: {
        type: "category",
        data: datos.map((d) => d.obra),
        axisLine: { lineStyle: { color: t.eje } },
        axisTick: { show: false },
        axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
      },
      series: [
        {
          ...serie("Cumple", cumple, (v) => v >= META),
          markLine: {
            symbol: "none",
            silent: true,
            lineStyle: { color: t.texto, type: "dashed", width: 1.5 },
            label: {
              show: true,
              position: "end",
              formatter: `Meta ${META}%`,
              color: t.texto,
              fontFamily: t.fuente,
              fontSize: t.tamano.eje,
              fontWeight: 600,
            },
            data: [{ xAxis: META }],
          },
        },
        serie("Bajo meta", bajo, (v) => v < META),
      ],
    };
  }, [t, datos]);

  return <EChart option={option} alto={alto} />;
}
