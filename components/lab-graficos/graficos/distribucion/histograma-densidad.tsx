"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, muestras } from "@/lib/lab-graficos/datos";
import {
  baseEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  rellenoAreaEcharts,
  rellenoBloqueEcharts,
  sombraEcharts,
} from "@/lib/lab-graficos/estilos";
import { textoSobre } from "../composicion/utilidades";
import { histograma, kde, rango, resumen } from "./estadistica";

const OPCIONES_CLASES = [8, 14, 24];

// Histograma del avance semanal de todas las obras con la curva de densidad encima.
// Las barras usan un eje de categorías y la curva un eje de valor oculto con el mismo rango.
export function HistogramaDensidad({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [clases, setClases] = useState(14);
  const valores = useMemo(() => muestras(undefined, 80).map((m) => m.valor), []);
  const est = useMemo(() => resumen(valores), [valores]);
  const desde = Math.floor(est.min / 5) * 5;
  const hasta = Math.ceil(est.max / 5) * 5;

  const option = useMemo<EChartsOption>(() => {
    const { conteos, ancho } = histograma(valores, desde, hasta, clases);
    const curva = kde(valores, rango(desde, hasta, 80)).map((p) => [p.x, p.d * valores.length * ancho]);
    const colorBarra = t.colores[2 % t.colores.length];
    const colorCurva = t.acento;
    const conLeyenda = t.etiquetas === "leyenda";
    const marca = (valor: number, nombre: string) => ({
      xAxis: valor,
      label: {
        formatter: `${nombre} ${formato.decimal(valor)}`,
        color: t.textoSuave,
        fontFamily: t.fuente,
        fontSize: t.tamano.eje - 1,
        position: "insideEndTop" as const,
      },
    });
    return {
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { seriesIndex, dataIndex } = p as { seriesIndex: number; dataIndex: number };
          if (seriesIndex !== 0) return "";
          const c = conteos[dataIndex];
          return `${formato.decimal(c.desde)} – ${formato.decimal(c.hasta)}<br/><b>${c.n}</b> semanas-obra`;
        },
      },
      grid: gridEcharts(t, { top: conLeyenda ? 30 : 22, right: 12 }),
      xAxis: [
        ejeCategoriaEcharts(
          t,
          conteos.map((c) => formato.entero(c.desde)),
          { axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, interval: Math.ceil(clases / 7) - 1 } },
        ),
        { type: "value", min: desde, max: hasta, show: false },
      ],
      yAxis: ejeValorEcharts(t),
      series: [
        {
          name: "Frecuencia",
          type: "bar",
          data: conteos.map((c) => c.n),
          barCategoryGap: "8%",
          itemStyle: { ...rellenoBloqueEcharts(t, colorBarra), borderRadius: [Math.min(t.radio, 4), Math.min(t.radio, 4), 0, 0] },
          emphasis: { itemStyle: { color: t.acento } },
        },
        {
          name: "Densidad",
          type: "line",
          xAxisIndex: 1,
          data: curva,
          smooth: t.curva !== "recta",
          showSymbol: false,
          silent: true,
          lineStyle: { width: t.grosorLinea, color: colorCurva, ...sombraEcharts(t, colorCurva) },
          areaStyle: rellenoAreaEcharts(t, colorCurva),
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: t.texto, type: "dashed", width: 1 },
            data: [marca(est.mediana, "Mediana")],
          },
          z: 3,
        },
      ],
    };
  }, [t, valores, est, desde, hasta, clases]);

  return (
    <div style={{ position: "relative", height: alto }}>
      <EChart option={option} alto={alto} />
      <div
        role="group"
        aria-label="Cantidad de clases"
        style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 2, fontFamily: t.fuente, fontSize: t.tamano.eje }}
      >
        {OPCIONES_CLASES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={clases === n}
            onClick={() => setClases(n)}
            style={{
              border: `1px solid ${clases === n ? t.acento : t.eje}`,
              background: clases === n ? t.acento : "transparent",
              color: clases === n ? textoSobre(t.acento) : t.textoSuave,
              borderRadius: Math.min(t.radio, 999),
              padding: "1px 8px",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
