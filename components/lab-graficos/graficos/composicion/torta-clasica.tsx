"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { baseEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

const DATOS = [
  { nombre: "Mano de obra", valor: 36 },
  { nombre: "Materiales", valor: 29 },
  { nombre: "Equipos", valor: 17 },
  { nombre: "Subcontratos", valor: 12 },
  { nombre: "Gastos generales", valor: 6 },
];

// Torta clásica, como contraste: sectores separados y rótulos con guía. Clic en un sector
// lo desplaza hacia afuera para destacarlo.
export function TortaClasica({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const conLeyenda = t.etiquetas === "leyenda";

  const option = useMemo<EChartsOption>(
    () => ({
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, percent } = p as { name: string; percent: number };
          return `<b>${name}</b>: ${formato.porcentaje(percent, 1)} del costo`;
        },
      },
      legend: leyendaEcharts(t, { top: "auto", bottom: 0, left: "center" }),
      series: [
        {
          type: "pie",
          radius: conLeyenda ? "58%" : "62%",
          center: ["50%", conLeyenda ? "46%" : "50%"],
          selectedMode: "single",
          selectedOffset: 10,
          padAngle: 2.5,
          startAngle: 100,
          data: DATOS.map((d, i) => {
            const color = t.colores[i % t.colores.length];
            return {
              name: d.nombre,
              value: d.valor,
              selected: i === 0,
              itemStyle: { ...rellenoBloqueEcharts(t, color), borderRadius: Math.min(t.radio, 4) },
            };
          }),
          label: {
            show: true,
            alignTo: "labelLine",
            edgeDistance: 6,
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            formatter: conLeyenda ? "{d}%" : "{b}\n{d}%",
            lineHeight: 14,
          },
          labelLine: { show: true, length: 10, length2: 12, smooth: 0.2, lineStyle: { color: t.textoSuave, width: 1 } },
          emphasis: { scaleSize: 5, label: { fontWeight: 700 } },
        },
      ],
    }),
    [t, conLeyenda],
  );

  return <EChart option={option} alto={alto} />;
}
