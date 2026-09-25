"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, LINEAS } from "@/lib/lab-graficos/datos";
import {
  baseEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  leyendaEcharts,
  rellenoBloqueEcharts,
} from "@/lib/lab-graficos/estilos";

const ANIOS = ["2024", "2025", "2026"];
const CATEGORIAS = LINEAS.slice(0, 4);

/** Ventas por línea de negocio y año (millones), crecimiento suave con ruido. */
function ventasPorAnio() {
  const r = azar(101);
  return ANIOS.map((anio, k) => ({
    anio,
    valores: CATEGORIAS.map((_, i) => Math.round((420 + i * 140 - i * i * 35) * (1 + k * 0.12) * (0.85 + r() * 0.3))),
  }));
}

// Barras agrupadas (ECharts): un grupo por línea de negocio, una barra por año. Clic en la
// leyenda oculta o muestra un año (comportamiento nativo de ECharts).
export function BarrasAgrupadas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const series = useMemo(() => ventasPorAnio(), []);

  const option = useMemo<EChartsOption>(() => {
    const directas = t.etiquetas === "directas";
    const base = baseEcharts(t);
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: t.grilla, opacity: 0.5 } },
        valueFormatter: (v) => `${formato.entero(Number(v))} M`,
      },
      legend: leyendaEcharts(t),
      grid: gridEcharts(t, { right: 12, top: directas ? 20 : 36 }),
      xAxis: ejeCategoriaEcharts(t, CATEGORIAS),
      yAxis: ejeValorEcharts(t),
      series: series.map((s, i) => {
        // El año más reciente lleva el acento; los anteriores, los grises/apoyos de la paleta.
        const color = t.colores[(ANIOS.length - 1 - i) % t.colores.length];
        return {
          name: s.anio,
          type: "bar" as const,
          barGap: "12%",
          barCategoryGap: "28%",
          itemStyle: { ...rellenoBloqueEcharts(t, color), borderRadius: [Math.min(t.radio, 6), Math.min(t.radio, 6), 0, 0] },
          emphasis: { focus: "series" as const },
          // Con etiquetas directas, el año se rotula dentro de la barra del primer grupo.
          data: s.valores.map((v, k) =>
            directas && k === 0
              ? {
                  value: v,
                  label: {
                    show: true,
                    position: "insideBottom" as const,
                    rotate: 90,
                    align: "left" as const,
                    verticalAlign: "middle" as const,
                    offset: [0, -4],
                    formatter: s.anio,
                    color: t.superficie === "contorno" ? color : t.fondoTarjeta,
                    fontFamily: t.fuente,
                    fontSize: t.tamano.eje - 1,
                    fontWeight: 600,
                  },
                }
              : v,
          ),
        };
      }),
    };
  }, [t, series]);

  return <EChart option={option} alto={alto} />;
}
