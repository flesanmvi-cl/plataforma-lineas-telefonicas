"use client";

import { useMemo } from "react";
import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, CustomSeriesRenderItemReturn, EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, TAREAS } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { baseEcharts, degradadoEcharts, ejeValorEcharts, gridEcharts, leyendaEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";

const HOY = 100;
const FASES = Array.from(new Set(TAREAS.map((t) => t.fase)));
const INICIO_OBRA = Date.UTC(2026, 2, 2);

function fechaDeDia(dia: number) {
  return new Date(INICIO_OBRA + dia * 86400000).toLocaleDateString("es-CL", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** Avance esperado a la fecha de hoy según el programa lineal de la tarea. */
function esperado(inicio: number, duracion: number) {
  return Math.round(Math.min(1, Math.max(0, (HOY - inicio) / duracion)) * 100);
}

// Gantt de obra (ECharts custom): cada barra es la duración programada y el relleno interior
// el avance real; la línea «Hoy» permite ver de un vistazo qué va atrasado.
export function GanttObra({ alto }: PropsGraficoLab) {
  const t = useTokens();

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const categorias = TAREAS.map((x) => x.tarea);

    const renderItem = (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI): CustomSeriesRenderItemReturn => {
      const fila = api.value(3) as number;
      const inicio = api.coord([api.value(0), fila]);
      const fin = api.coord([api.value(1), fila]);
      const avance = (api.value(2) as number) / 100;
      const alto = (api.size?.([0, 1]) as number[])[1] * 0.56;
      const ancho = fin[0] - inicio[0];
      const color = api.visual("color") as string;
      const y = inicio[1] - alto / 2;
      const r = Math.min(t.radio / 2, alto / 2);
      const atraso = esperado(api.value(0) as number, (api.value(1) as number) - (api.value(0) as number)) - avance * 100;

      let rellenoAvance: Record<string, unknown> = { fill: color };
      if (t.superficie === "degradado") rellenoAvance = { fill: degradadoEcharts(color, conAlfa(color, 0.55), true) };
      if (t.superficie === "glass") rellenoAvance = { fill: conAlfa(color, 0.8), ...sombraEcharts(t, color) };
      if (t.superficie === "sombras") rellenoAvance = { fill: color, ...sombraEcharts(t, color), shadowBlur: 8, shadowOffsetY: 3 };
      if (t.superficie === "contorno") rellenoAvance = { fill: conAlfa(color, 0.35) };

      return {
        type: "group",
        children: [
          {
            type: "rect",
            shape: { x: inicio[0], y, width: ancho, height: alto, r },
            style: {
              fill: conAlfa(color, t.superficie === "contorno" ? 0.06 : 0.16),
              stroke: t.superficie === "contorno" ? color : undefined,
              lineWidth: t.superficie === "contorno" ? 1.2 : 0,
            },
          },
          {
            type: "rect",
            shape: { x: inicio[0], y, width: ancho * avance, height: alto, r },
            style: rellenoAvance,
          },
          {
            type: "text",
            style: {
              x: fin[0] + 6,
              y: inicio[1],
              text: `${formato.porcentaje(avance * 100)}${atraso > 5 ? `  −${Math.round(atraso)} pp` : ""}`,
              fill: atraso > 5 ? t.acento : t.textoSuave,
              font: `${atraso > 5 ? 600 : 400} ${t.tamano.eje}px ${t.fuente}`,
              verticalAlign: "middle",
            },
          },
        ],
      };
    };

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        formatter: (p) => {
          const { value, seriesName } = p as { value: number[]; seriesName: string };
          const [ini, fin, av, fila] = value;
          const esp = esperado(ini, fin - ini);
          return `<b>${TAREAS[fila].tarea}</b><div style="opacity:.7">${seriesName} · ${fechaDeDia(ini)} → ${fechaDeDia(fin)}</div>Avance real <b>${formato.porcentaje(av)}</b> · esperado ${formato.porcentaje(esp)}`;
        },
      },
      legend: leyendaEcharts(t, { data: FASES }),
      grid: gridEcharts(t, { right: 70, bottom: 22, top: t.etiquetas === "leyenda" ? 32 : 10 }),
      xAxis: ejeValorEcharts(t, {
        min: 0,
        max: 185,
        interval: 30,
        position: "top",
        axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, formatter: (v: number) => fechaDeDia(v) },
      }),
      yAxis: {
        type: "category",
        data: categorias,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: t.texto, fontFamily: t.fuente, fontSize: t.tamano.eje },
        splitLine: { show: t.grillaModo === "completa", lineStyle: { color: t.grilla } },
      },
      series: [
        ...FASES.map((fase, k) => ({
          name: fase,
          type: "custom" as const,
          renderItem,
          itemStyle: { color: t.colores[k % t.colores.length] },
          encode: { x: [0, 1], y: 3 },
          data: TAREAS.map((x, fila) => ({ x, fila }))
            .filter(({ x }) => x.fase === fase)
            .map(({ x, fila }) => [x.inicio, x.inicio + x.duracion, x.avance, fila]),
        })),
        {
          name: "Hoy",
          type: "line" as const,
          data: [],
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: t.acento, type: "solid", width: 1.5 },
            label: { formatter: `Hoy · ${fechaDeDia(HOY)}`, position: "start", color: t.acento, fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 600 },
            data: [{ xAxis: HOY }],
          },
        },
      ],
    };
  }, [t]);

  return <EChart option={option} alto={alto} />;
}
