"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { ETAPAS, formato } from "@/lib/lab-graficos/datos";
import { baseEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

/** Texto legible (neutro oscuro o blanco) sobre un color de fondo #RRGGBB. */
function textoSobre(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#231F20" : "#FFFFFF";
}

// Embudo comercial (ECharts funnel): cada etapa con su volumen y la conversión desde la
// etapa anterior; el tooltip suma la conversión acumulada desde el inicio.
export function Embudo({ alto }: PropsGraficoLab) {
  const t = useTokens();

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    // Escala secuencial de oscuro a claro: la etapa de entrada pesa más.
    const tonos = [...t.secuencial].reverse().slice(0, ETAPAS.length);
    const inicial = ETAPAS[0].valor;
    const directas = t.etiquetas === "directas";

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p) => {
          const i = (p as unknown as { dataIndex: number }).dataIndex;
          const e = ETAPAS[i];
          const previa = i > 0 ? ETAPAS[i - 1] : null;
          return [
            `<b>${e.etapa}</b> · ${formato.entero(e.valor)} oportunidades`,
            previa ? `<br/>${formato.porcentaje((e.valor / previa.valor) * 100)} pasa desde ${previa.etapa}` : "",
            i > 0 ? `<br/>${formato.porcentaje((e.valor / inicial) * 100, 1)} del total inicial` : "",
          ].join("");
        },
      },
      legend: leyendaEcharts(t, { data: ETAPAS.map((e) => e.etapa) }),
      series: [
        {
          type: "funnel",
          left: 8,
          top: t.etiquetas === "leyenda" ? 32 : 8,
          bottom: 8,
          width: directas ? "55%" : "64%",
          minSize: "18%",
          sort: "none",
          gap: 3,
          data: ETAPAS.map((e, i) => ({
            name: e.etapa,
            value: e.valor,
            itemStyle: rellenoBloqueEcharts(t, tonos[i % tonos.length]),
            label: { color: directas || t.superficie === "contorno" ? t.texto : textoSobre(tonos[i % tonos.length]) },
          })),
          label: {
            show: true,
            position: directas ? "right" : "inside",
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            formatter: (p) => {
              const i = p.dataIndex;
              const conv = i > 0 ? `{c|${formato.porcentaje((ETAPAS[i].valor / ETAPAS[i - 1].valor) * 100)} ↓}` : "{c|entrada}";
              return directas ? `{n|${p.name}}  {v|${formato.entero(Number(p.value))}}\n${conv}` : `{v|${formato.entero(Number(p.value))}}`;
            },
            rich: {
              n: { color: t.texto, fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 600 },
              v: { fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 700 },
              c: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje - 1, padding: [2, 0, 0, 0] },
            },
          },
          labelLine: { show: directas, lineStyle: { color: t.eje } },
          emphasis: { label: { fontWeight: 700 }, itemStyle: { opacity: 1 } },
          blur: { itemStyle: { opacity: 0.4 } },
        },
        // Con leyenda, la conversión va en una columna a la derecha del embudo.
        ...(directas
          ? []
          : [
              {
                type: "funnel" as const,
                silent: true,
                left: "68%",
                width: "30%",
                top: 32,
                bottom: 8,
                sort: "none" as const,
                gap: 3,
                minSize: "100%",
                maxSize: "100%",
                itemStyle: { color: "transparent" },
                data: ETAPAS.map((e) => ({ name: e.etapa, value: 1 })),
                label: {
                  show: true,
                  position: "inside" as const,
                  align: "left" as const,
                  color: t.textoSuave,
                  fontFamily: t.fuente,
                  fontSize: t.tamano.eje,
                  formatter: (p: { dataIndex: number }) =>
                    p.dataIndex > 0 ? `${formato.porcentaje((ETAPAS[p.dataIndex].valor / ETAPAS[p.dataIndex - 1].valor) * 100)} pasa` : "Entrada",
                },
                labelLine: { show: false },
                tooltip: { show: false },
              },
            ]),
      ],
    };
  }, [t]);

  return <EChart option={option} alto={alto} />;
}
