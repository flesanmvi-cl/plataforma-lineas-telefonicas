"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, jerarquia, type NodoJerarquia } from "@/lib/lab-graficos/datos";
import { baseEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { mezclar, textoSobre } from "./utilidades";

interface NodoMapa {
  name: string;
  value: number;
  children?: NodoMapa[];
  itemStyle: Record<string, unknown>;
  label: { color: string };
  upperLabel: { color: string };
}

function suma(n: NodoJerarquia): number {
  return n.valor ?? (n.hijos ?? []).reduce((s, h) => s + suma(h), 0);
}

// Color de la línea en todos sus niveles; cada hijo varía levemente para distinguirse.
function aMapa(t: TokensLab, nodo: NodoJerarquia, color: string, nivel: number, orden: number): NodoMapa {
  const tono = nivel === 1 ? color : mezclar(color, t.fondoTarjeta, 0.12 + (orden % 3) * 0.12 + (nivel - 2) * 0.1);
  const texto = t.superficie === "contorno" ? t.texto : textoSobre(tono);
  return {
    name: nodo.nombre,
    value: suma(nodo),
    itemStyle: { ...rellenoBloqueEcharts(t, tono), borderColor: t.superficie === "contorno" ? tono : t.fondoTarjeta },
    label: { color: texto },
    upperLabel: { color: texto },
    children: nodo.hijos?.map((h, k) => aMapa(t, h, color, nivel + 1, k)),
  };
}

// Treemap que muestra un nivel a la vez: clic en un bloque para entrar y migas abajo para volver.
export function TreemapDrilldown({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const raiz = useMemo(() => jerarquia(), []);

  const option = useMemo<EChartsOption>(() => {
    const radio = Math.min(t.radio, 6);
    const etiqueta = { fontFamily: t.fuente, fontSize: t.tamano.eje };
    return {
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value, treePathInfo } = p as { name: string; value: number; treePathInfo: { name: string }[] };
          const camino = treePathInfo.slice(1, -1).map((n) => n.name).join(" › ");
          return `${camino ? `<span style="opacity:.7">${camino}</span><br/>` : ""}<b>${name}</b>: ${formato.millones(value)}`;
        },
      },
      series: [
        {
          type: "treemap",
          name: "Grupo",
          top: 0,
          left: 0,
          right: 0,
          bottom: 30,
          roam: false,
          leafDepth: 1,
          nodeClick: "zoomToNode",
          squareRatio: 0.8,
          data: raiz.hijos?.map((h, i) => aMapa(t, h, t.colores[i % t.colores.length], 1, i)),
          label: {
            ...etiqueta,
            formatter: (p: unknown) => {
              const { name, value } = p as { name: string; value: number };
              return `{n|${name}}\n{v|${formato.millones(value)}}`;
            },
            rich: {
              n: { fontFamily: t.fuente, fontSize: t.tamano.eje, fontWeight: 600, lineHeight: 16 },
              v: { fontFamily: t.fuente, fontSize: t.tamano.eje - 1, opacity: 0.8 },
            },
          },
          upperLabel: { show: true, height: 20, ...etiqueta, fontWeight: 600 },
          itemStyle: { borderRadius: radio, gapWidth: 3, borderWidth: 0 },
          levels: [
            { itemStyle: { gapWidth: 3, borderWidth: 0 } },
            { itemStyle: { gapWidth: 2, borderWidth: 1 } },
            { itemStyle: { gapWidth: 2, borderWidth: 1 } },
          ],
          breadcrumb: {
            show: true,
            bottom: 2,
            left: 0,
            height: 22,
            emptyItemWidth: 24,
            itemStyle: {
              color: t.grilla,
              borderColor: t.eje,
              borderWidth: 1,
              shadowBlur: 0,
              textStyle: { color: t.texto, fontFamily: t.fuente, fontSize: t.tamano.eje },
            },
            emphasis: { itemStyle: { color: t.eje, textStyle: { color: t.texto } } },
          },
        },
      ],
    };
  }, [t, raiz]);

  return <EChart option={option} alto={alto} />;
}
