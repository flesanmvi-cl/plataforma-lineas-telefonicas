"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { matrizCalor, OBRAS, SEMANAS } from "@/lib/lab-graficos/datos";
import { baseEcharts, degradadoEcharts, ejeCategoriaEcharts } from "@/lib/lab-graficos/estilos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { interpolarEscala, mezclar, textoSobre } from "../composicion/utilidades";

const COLUMNAS = SEMANAS.slice(0, 12);

// El color de cada celda se calcula aquí (no lo pinta visualMap) para poder aplicarle la
// superficie; visualMap solo filtra por rango con su control deslizante.
function estiloCelda(t: TokensLab, color: string) {
  const radio = Math.min(t.radio / 2, 5);
  const base = { borderRadius: radio, borderColor: t.fondoTarjeta, borderWidth: 2 };
  if (t.superficie === "degradado") return { ...base, color: degradadoEcharts(mezclar(color, t.fondoTarjeta, 0.35), color) };
  if (t.superficie === "contorno") return { ...base, color: conAlfa(color, 0.3), borderColor: color, borderWidth: 1 };
  if (t.superficie === "glass") return { ...base, color: conAlfa(color, 0.8), borderColor: "rgba(255,255,255,0.4)", borderWidth: 1 };
  if (t.superficie === "sombras") return { ...base, color, shadowBlur: 6, shadowOffsetY: 2, shadowColor: conAlfa(color, 0.45) };
  return { ...base, color };
}

// Avance semanal (%) por obra: patrones de semanas flojas o de obras rezagadas de un vistazo.
export function HeatmapObras({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const celdas = useMemo(() => matrizCalor(), []);

  const option = useMemo<EChartsOption>(() => {
    const min = 20;
    const max = 100;
    const directas = t.etiquetas === "directas";
    return {
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { data } = p as { data: { value: [number, number, number] } };
          const [x, y, v] = data.value;
          return `${OBRAS[y]} · ${COLUMNAS[x]}<br/><b>${v}%</b> de cumplimiento`;
        },
      },
      grid: { left: 8, right: 8, top: 4, bottom: 40, containLabel: true },
      xAxis: ejeCategoriaEcharts(t, COLUMNAS, { splitLine: { show: false }, axisLine: { show: false } }),
      yAxis: {
        ...ejeCategoriaEcharts(t, OBRAS, { splitLine: { show: false }, axisLine: { show: false } }),
        inverse: true,
      },
      visualMap: {
        type: "continuous",
        min,
        max,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 140,
        text: ["100%", "20%"],
        textGap: 6,
        textStyle: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
        handleStyle: { borderColor: t.eje },
        inRange: { opacity: 1 },
        outOfRange: { opacity: 0.12 },
        controller: { inRange: { color: t.secuencial }, outOfRange: { color: [t.grilla] } },
      },
      series: [
        {
          type: "heatmap",
          data: celdas.map((c) => {
            const color = interpolarEscala(t.secuencial, (c.valor - min) / (max - min));
            return {
              value: [c.x, c.y, c.valor],
              itemStyle: estiloCelda(t, color),
              label: { color: t.superficie === "contorno" ? t.texto : textoSobre(color) },
            };
          }),
          label: { show: directas, fontFamily: t.fuente, fontSize: t.tamano.eje - 2 },
          emphasis: { itemStyle: { borderColor: t.texto, borderWidth: 1.5 } },
          progressive: 0,
        },
      ],
    };
  }, [t, celdas]);

  return <EChart option={option} alto={alto} />;
}
