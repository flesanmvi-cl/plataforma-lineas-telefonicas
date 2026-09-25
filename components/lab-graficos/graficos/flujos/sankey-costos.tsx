"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { FLUJOS, formato } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { baseEcharts, degradadoEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";

const ORIGENES = new Set(FLUJOS.enlaces.map((e) => e.origen));

// Sankey de costos: de cada línea de negocio a sus partidas. Al pasar el mouse por un nodo o
// un enlace se resalta el camino completo (focus «trajectory»).
export function SankeyCostos({ alto }: PropsGraficoLab) {
  const t = useTokens();

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    // Orígenes con los primeros colores de la paleta; partidas en neutros para que el color
    // cuente de dónde viene el costo.
    let kOrigen = 0;
    const colorNodo = new Map<string, string>();
    for (const n of FLUJOS.nodos) colorNodo.set(n, ORIGENES.has(n) ? t.colores[kOrigen++ % t.colores.length] : t.textoSuave);

    const estiloNodo = (c: string) => {
      if (t.superficie === "degradado") return { color: degradadoEcharts(c, conAlfa(c, 0.55)), borderWidth: 0 };
      if (t.superficie === "contorno") return { color: conAlfa(c, 0.15), borderColor: c, borderWidth: 1.5 };
      if (t.superficie === "glass") return { color: conAlfa(c, 0.75), borderColor: "rgba(255,255,255,0.35)", borderWidth: 1, ...sombraEcharts(t, c) };
      if (t.superficie === "sombras") return { color: c, borderWidth: 0, ...sombraEcharts(t, c), shadowOffsetY: 4 };
      return { color: c, borderWidth: 0 };
    };

    const totalPorNodo = new Map<string, number>();
    for (const e of FLUJOS.enlaces) {
      totalPorNodo.set(e.origen, (totalPorNodo.get(e.origen) ?? 0) + e.valor);
      totalPorNodo.set(e.destino, (totalPorNodo.get(e.destino) ?? 0) + e.valor);
    }

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p) => {
          const d = p as unknown as { dataType: string; name: string; data: { source?: string; target?: string; value?: number } };
          if (d.dataType === "edge") {
            const { source = "", target = "", value = 0 } = d.data;
            const pct = (value / (totalPorNodo.get(source) ?? 1)) * 100;
            return `${source} → <b>${target}</b><br/>${formato.millones(value * 100)} · ${formato.porcentaje(pct)} de ${source}`;
          }
          return `<b>${d.name}</b><br/>${formato.millones((totalPorNodo.get(d.name) ?? 0) * 100)}`;
        },
      },
      series: [
        {
          type: "sankey",
          left: 4,
          right: t.etiquetas === "directas" ? 150 : 110,
          top: 8,
          bottom: 8,
          nodeWidth: 12,
          nodeGap: 10,
          nodeAlign: "justify",
          draggable: false,
          layoutIterations: 32,
          emphasis: { focus: "trajectory" },
          blur: { itemStyle: { opacity: 0.25 }, lineStyle: { opacity: 0.06 }, label: { opacity: 0.4 } },
          data: FLUJOS.nodos.map((n) => ({ name: n, itemStyle: estiloNodo(colorNodo.get(n)!) })),
          links: FLUJOS.enlaces.map((e) => ({ source: e.origen, target: e.destino, value: e.valor })),
          lineStyle: {
            color: t.superficie === "degradado" || t.superficie === "glass" ? "gradient" : "source",
            opacity: t.superficie === "contorno" ? 0.15 : 0.32,
            curveness: 0.5,
            borderColor: t.superficie === "contorno" ? t.eje : undefined,
            borderWidth: t.superficie === "contorno" ? 0.5 : 0,
          },
          label: {
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            // Con rótulos directos se suma el monto al nombre.
            formatter: (p) =>
              t.etiquetas === "directas" ? `${p.name}  {v|${formato.millones((totalPorNodo.get(p.name) ?? 0) * 100)}}` : p.name,
            rich: { v: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje } },
          },
        },
      ],
    };
  }, [t]);

  return <EChart option={option} alto={alto} />;
}
