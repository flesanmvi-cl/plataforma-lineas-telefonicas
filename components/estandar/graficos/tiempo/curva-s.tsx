"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/estandar/echart";
import { useTokens } from "@/components/estandar/tema-context";
import type { PropsGraficoLab } from "@/components/estandar/tipos";
import { curvaS, formato } from "@/lib/estandar/datos";
import { conAlfa } from "@/lib/estandar/tema";
import {
  baseEcharts,
  curvaEcharts,
  degradadoEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  leyendaEcharts,
  sombraEcharts,
} from "@/lib/estandar/estilos";

// Curva S de avance físico: programado vs real acumulado, con la brecha sombreada entre
// ambas (series apiladas: una base invisible = real, y la brecha encima).
export function CurvaS({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => curvaS(), []);

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const cReal = t.acento;
    const cProg = t.colores[1 % t.colores.length];
    const semanas = datos.map((d) => d.semana);
    const ultimo = datos.reduce((k, d, i) => (d.real !== null ? i : k), 0);
    const brecha = datos[ultimo].programado - (datos[ultimo].real ?? 0);
    const curva = curvaEcharts(t);
    const rellenoBrecha =
      t.superficie === "degradado" || t.superficie === "glass"
        ? degradadoEcharts(conAlfa(cReal, 0.35), conAlfa(cReal, 0.08))
        : conAlfa(cReal, t.superficie === "contorno" ? 0.06 : 0.16);

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: t.textoSuave, type: "dashed" } },
        formatter: (ps) => {
          const i = (ps as { dataIndex: number }[])[0].dataIndex;
          const d = datos[i];
          const fila = (color: string, nombre: string, v: string) =>
            `<div style="display:flex;gap:8px;align-items:center"><span style="width:8px;height:8px;border-radius:2px;background:${color}"></span>${nombre}<b style="margin-left:auto">${v}</b></div>`;
          const desv = d.real !== null ? d.real - d.programado : null;
          return [
            `<div style="opacity:.7;margin-bottom:2px">Semana ${i + 1}</div>`,
            fila(cProg, "Programado", formato.porcentaje(d.programado, 1)),
            d.real !== null ? fila(cReal, "Real", formato.porcentaje(d.real, 1)) : "",
            desv !== null ? `<div style="margin-top:2px">Desviación <b>${desv > 0 ? "+" : ""}${formato.decimal(desv)} pp</b></div>` : "",
          ].join("");
        },
      },
      legend: leyendaEcharts(t, { data: ["Programado", "Real", "Brecha"] }),
      grid: gridEcharts(t, { right: t.etiquetas === "directas" ? 80 : 16 }),
      xAxis: ejeCategoriaEcharts(t, semanas, { boundaryGap: false, axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, interval: 3 } }),
      yAxis: ejeValorEcharts(t, { max: 100, axisLabel: { show: t.grillaModo !== "sin", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, formatter: "{value}%" } }),
      series: [
        {
          name: "base",
          type: "line",
          stack: "brecha",
          data: datos.map((d) => d.real),
          ...curva,
          symbol: "none",
          lineStyle: { opacity: 0 },
          silent: true,
          tooltip: { show: false },
        },
        {
          name: "Brecha",
          type: "line",
          stack: "brecha",
          data: datos.map((d) => (d.real !== null ? Math.max(0, d.programado - d.real) : null)),
          ...curva,
          symbol: "none",
          lineStyle: { opacity: 0 },
          itemStyle: { color: conAlfa(cReal, 0.35) },
          areaStyle: { color: rellenoBrecha },
          silent: true,
        },
        {
          name: "Programado",
          type: "line",
          data: datos.map((d) => d.programado),
          ...curva,
          symbol: "none",
          lineStyle: { width: t.grosorLinea, color: cProg, type: "dashed" },
          itemStyle: { color: cProg },
          endLabel: { show: t.etiquetas === "directas", formatter: "Programado", color: cProg, fontFamily: t.fuente, fontSize: t.tamano.eje },
        },
        {
          name: "Real",
          type: "line",
          data: datos.map((d) => d.real),
          ...curva,
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { width: t.grosorLinea + 0.5, color: cReal, ...sombraEcharts(t, cReal) },
          itemStyle: { color: cReal },
          markPoint: {
            symbol: "roundRect",
            symbolSize: [78, 22],
            symbolOffset: [0, -20],
            itemStyle: { color: t.tooltip.fondo, borderColor: t.tooltip.borde, borderWidth: 1 },
            label: {
              color: t.tooltip.texto,
              fontFamily: t.fuente,
              fontSize: t.tamano.eje,
              fontWeight: 600,
              formatter: `${brecha >= 0 ? "−" : "+"}${formato.decimal(Math.abs(brecha))} pp`,
            },
            data: [{ name: "Brecha al corte", coord: [semanas[ultimo], datos[ultimo].real ?? 0] }],
          },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: t.textoSuave, type: "dotted" },
            label: { formatter: "Corte", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, position: "insideEndTop" },
            data: [{ xAxis: semanas[ultimo] }],
          },
          endLabel: { show: t.etiquetas === "directas", formatter: "Real", color: cReal, fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 600 },
        },
      ],
    };
  }, [t, datos]);

  return <EChart option={option} alto={alto} />;
}
