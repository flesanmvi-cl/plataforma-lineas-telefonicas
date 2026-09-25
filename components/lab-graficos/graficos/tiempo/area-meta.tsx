"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import {
  baseEcharts,
  curvaEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  rellenoAreaEcharts,
  sombraEcharts,
} from "@/lib/lab-graficos/estilos";

const SEMANAS_ANIO = Array.from({ length: 52 }, (_, i) => `S${i + 1}`);
const EVENTO = 19;

// Rendimiento semanal (% del plan) con una caída por lluvias en la semana del evento.
function rendimiento() {
  const r = azar(61);
  return SEMANAS_ANIO.map((_, i) => {
    const base = 78 + i * 0.35 + Math.sin(i / 4) * 5 + (r() - 0.5) * 10;
    const caida = i >= EVENTO && i <= EVENTO + 2 ? 26 - (i - EVENTO) * 8 : 0;
    return Math.round(base - caida);
  });
}

// Área con zoom (dataZoom), meta como línea, banda objetivo sombreada y anotación de evento.
export function AreaMeta({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const valores = useMemo(rendimiento, []);

  const option = useMemo<EChartsOption>(() => {
    const color = t.acento;
    const base = baseEcharts(t);
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: t.textoSuave, type: "dashed" } },
        valueFormatter: (v) => formato.porcentaje(Number(v)),
      },
      grid: gridEcharts(t, { top: 24, bottom: 36, right: 48 }),
      xAxis: ejeCategoriaEcharts(t, SEMANAS_ANIO, { boundaryGap: false }),
      yAxis: ejeValorEcharts(t, { min: 40, max: 110, axisLabel: { show: t.grillaModo !== "sin", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, formatter: "{value}%" } }),
      dataZoom: [
        { type: "inside", start: 20, end: 80, zoomOnMouseWheel: "shift", moveOnMouseWheel: false },
        {
          type: "slider",
          start: 20,
          end: 80,
          height: 16,
          bottom: 4,
          borderColor: "transparent",
          backgroundColor: conAlfa(t.textoSuave, 0.08),
          fillerColor: conAlfa(color, 0.15),
          handleStyle: { color: t.fondoTarjeta, borderColor: color },
          moveHandleStyle: { color: conAlfa(color, 0.5) },
          dataBackground: { lineStyle: { color: t.textoSuave, opacity: 0.5 }, areaStyle: { color: conAlfa(t.textoSuave, 0.15) } },
          selectedDataBackground: { lineStyle: { color }, areaStyle: { color: conAlfa(color, 0.2) } },
          textStyle: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
          brushSelect: false,
        },
      ],
      series: [
        {
          name: "Rendimiento",
          type: "line",
          data: valores,
          ...curvaEcharts(t),
          symbol: "circle",
          symbolSize: 6,
          showSymbol: false,
          lineStyle: { width: t.grosorLinea, color, ...sombraEcharts(t, color) },
          itemStyle: { color },
          areaStyle: rellenoAreaEcharts(t, color),
          markArea: {
            silent: true,
            itemStyle: { color: conAlfa(t.textoSuave, t.superficie === "contorno" ? 0.04 : 0.1), borderColor: t.superficie === "contorno" ? conAlfa(t.textoSuave, 0.4) : undefined, borderWidth: t.superficie === "contorno" ? 1 : 0, borderType: "dashed" },
            label: { show: true, position: "insideTopLeft", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, formatter: "Banda objetivo" },
            data: [[{ yAxis: 85 }, { yAxis: 100 }]],
          },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: t.texto, type: "dashed", width: 1.5 },
            label: { position: "end", color: t.texto, fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 600, formatter: "Meta 92%" },
            data: [{ yAxis: 92 }],
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 38,
            itemStyle: { color, ...sombraEcharts(t, color) },
            label: { color: "#FFFFFF", fontFamily: t.fuente, fontSize: 10, fontWeight: 700, formatter: "!" },
            tooltip: { formatter: "Semana 20: paro por lluvias (3 días)" },
            data: [{ name: "Lluvias", coord: [SEMANAS_ANIO[EVENTO], valores[EVENTO]] }],
          },
        },
      ],
    };
  }, [t, valores]);

  return <EChart option={option} alto={alto} />;
}
