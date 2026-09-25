"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { CASCADA, formato } from "@/lib/lab-graficos/datos";
import { baseEcharts, ejeCategoriaEcharts, ejeValorEcharts, gridEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

// Cálculo de la cascada: base invisible + tramo visible por tipo, y el nivel acumulado tras cada paso.
function tramos() {
  let nivel = 0;
  return CASCADA.map((c) => {
    if (c.tipo === "total") {
      nivel = c.valor;
      return { ...c, base: 0, alza: null, baja: null, total: c.valor, nivel };
    }
    const desde = nivel;
    nivel += c.valor;
    return c.valor >= 0
      ? { ...c, base: desde, alza: c.valor, baja: null, total: null, nivel }
      : { ...c, base: nivel, alza: null, baja: -c.valor, total: null, nivel };
  });
}

// Cascada (waterfall) con barras apiladas: una serie invisible sostiene cada tramo; alzas,
// bajas y totales en series separadas para distinguirlos y filtrarlos desde la leyenda.
export function Cascada({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const filas = useMemo(tramos, []);

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const cAlza = t.colores[3 % t.colores.length];
    const cBaja = t.acento;
    const cTotal = t.colores[1 % t.colores.length];
    const nombres = filas.map((f) => f.nombre);
    const etiqueta = (signo: "+" | "−" | "") => ({
      show: true,
      position: "top" as const,
      color: t.texto,
      fontFamily: t.fuente,
      fontSize: t.tamano.eje,
      fontWeight: 600,
      formatter: (p: { value: unknown }) => (p.value == null || p.value === "-" ? "" : `${signo}${formato.entero(Number(p.value))}`),
    });
    const barra = {
      type: "bar" as const,
      stack: "cascada",
      barWidth: "56%",
      emphasis: { focus: "series" as const },
    };

    // Conectores punteados entre el tope de un tramo y el inicio del siguiente.
    const conectores = filas.slice(0, -1).map((f, i) => [
      { coord: [i, f.nivel], symbol: "none" },
      { coord: [i + 1, f.nivel], symbol: "none" },
    ]);

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: t.grilla, opacity: 0.5 } },
        formatter: (ps) => {
          const i = (ps as { dataIndex: number }[])[0].dataIndex;
          const f = filas[i];
          if (f.tipo === "total") return `<b>${f.nombre}</b><br/>${formato.millones(f.valor)}`;
          return `<b>${f.nombre}</b><br/>${f.valor > 0 ? "+" : "−"}${formato.millones(Math.abs(f.valor))}<div style="opacity:.7">Acumulado ${formato.millones(f.nivel)}</div>`;
        },
      },
      legend: leyendaEcharts(t, { data: ["Alza", "Baja", "Total"] }),
      grid: gridEcharts(t, { right: 12, top: t.etiquetas === "leyenda" ? 40 : 22 }),
      xAxis: ejeCategoriaEcharts(t, nombres, { axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, interval: 0, width: 70, overflow: "break" } }),
      yAxis: ejeValorEcharts(t),
      series: [
        {
          ...barra,
          name: "base",
          itemStyle: { color: "transparent", borderColor: "transparent" },
          emphasis: { disabled: true },
          tooltip: { show: false },
          silent: true,
          data: filas.map((f) => f.base),
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: t.textoSuave, type: "dashed", width: 1 },
            label: { show: false },
            data: conectores as never,
          },
        },
        { ...barra, name: "Alza", itemStyle: rellenoBloqueEcharts(t, cAlza), label: etiqueta("+"), data: filas.map((f) => f.alza ?? "-") },
        { ...barra, name: "Baja", itemStyle: rellenoBloqueEcharts(t, cBaja), label: { ...etiqueta("−"), position: "bottom" as const }, data: filas.map((f) => f.baja ?? "-") },
        { ...barra, name: "Total", itemStyle: rellenoBloqueEcharts(t, cTotal), label: etiqueta(""), data: filas.map((f) => f.total ?? "-") },
      ],
    };
  }, [t, filas]);

  return <EChart option={option} alto={alto} />;
}
