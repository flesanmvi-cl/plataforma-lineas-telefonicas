"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, REGIONES_CORTAS } from "@/lib/lab-graficos/datos";
import { baseEcharts, ejeValorEcharts, gridEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

/** Variación % de ventas contra el período anterior, por región (ordenada de menor a mayor). */
function variaciones() {
  const r = azar(307);
  return REGIONES_CORTAS.map((region) => ({ region, variacion: Math.round((r() - 0.42) * 400) / 10 })).sort(
    (a, b) => a.variacion - b.variacion,
  );
}

// Barras divergentes (ECharts): el eje cero al centro; los extremos de la escala divergente
// separan alzas de bajas. La cifra va siempre en la punta de cada barra.
export function BarrasDivergentes({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => variaciones(), []);

  const option = useMemo<EChartsOption>(() => {
    const div = t.divergente;
    const sube = div[div.length - 1];
    // En oscuro, el extremo negro de la escala no se ve: se usa el paso siguiente.
    const baja = t.oscuro ? div[1] : div[0];
    const base = baseEcharts(t);
    const limite = Math.ceil(Math.max(...datos.map((d) => Math.abs(d.variacion))) / 5) * 5 + 5;
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value } = p as { name: string; value: number };
          return `<b>${name}</b><br/>${value >= 0 ? "+" : ""}${formato.decimal(value)}% vs período anterior`;
        },
      },
      grid: gridEcharts(t, { top: 8, right: 12, left: 8 }),
      xAxis: ejeValorEcharts(t, {
        min: -limite,
        max: limite,
        axisLabel: { ...ejeValorEcharts(t).axisLabel, formatter: "{value}%" },
      }),
      yAxis: {
        type: "category",
        data: datos.map((d) => d.region),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
      },
      series: [
        {
          type: "bar",
          barWidth: "58%",
          data: datos.map((d) => {
            const color = d.variacion >= 0 ? sube : baja;
            const r = Math.min(t.radio, 6);
            return {
              value: d.variacion,
              itemStyle: {
                ...rellenoBloqueEcharts(t, color, true),
                // Redondea solo la punta, del lado hacia donde crece la barra.
                borderRadius: d.variacion >= 0 ? [0, r, r, 0] : [r, 0, 0, r],
              },
              label: {
                show: true,
                position: d.variacion >= 0 ? ("right" as const) : ("left" as const),
                formatter: `${d.variacion >= 0 ? "+" : ""}${formato.decimal(d.variacion)}%`,
                color: t.texto,
                fontFamily: t.fuente,
                fontSize: t.tamano.eje,
                fontWeight: 600,
              },
            };
          }),
          markLine: {
            symbol: "none",
            silent: true,
            label: { show: false },
            lineStyle: { color: t.textoSuave, type: "solid", width: 1 },
            data: [{ xAxis: 0 }],
          },
          emphasis: { itemStyle: { opacity: 1 } },
        },
      ],
    };
  }, [t, datos]);

  return <EChart option={option} alto={alto} />;
}
