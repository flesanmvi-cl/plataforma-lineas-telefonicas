"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, REGIONES_CORTAS } from "@/lib/lab-graficos/datos";
import { baseEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

// Dotación por región: el radio de cada pétalo codifica el valor (el ángulo es igual).
const DATOS = (() => {
  const r = azar(47);
  return REGIONES_CORTAS.map((region) => ({ region, valor: Math.round(80 + r() * 420) })).sort((a, b) => b.valor - a.valor);
})();

export function RosaNightingale({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const conLeyenda = t.etiquetas === "leyenda";

  const option = useMemo<EChartsOption>(
    () => ({
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value, percent } = p as { name: string; value: number; percent: number };
          return `<b>${name}</b><br/>${formato.entero(value)} personas · ${formato.porcentaje(percent, 1)}`;
        },
      },
      legend: leyendaEcharts(t, { orient: "vertical", top: "middle", left: "auto", right: 4, itemGap: 7 }),
      series: [
        {
          type: "pie",
          roseType: "area",
          radius: ["14%", conLeyenda ? "88%" : "74%"],
          center: [conLeyenda ? "36%" : "50%", "50%"],
          padAngle: 1,
          itemStyle: { borderRadius: Math.min(t.radio, 6) },
          label: {
            show: !conLeyenda,
            formatter: "{b}",
            color: t.textoSuave,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje - 1,
          },
          labelLine: { show: !conLeyenda, length: 4, length2: 6, lineStyle: { color: t.eje } },
          emphasis: { focus: "self", scaleSize: 4 },
          data: DATOS.map((d, i) => {
            const color = t.colores[i % t.colores.length];
            return { name: d.region, value: d.valor, itemStyle: rellenoBloqueEcharts(t, color) };
          }),
        },
      ],
    }),
    [t, conLeyenda],
  );

  return <EChart option={option} alto={alto} />;
}
