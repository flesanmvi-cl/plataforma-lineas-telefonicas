"use client";

import { useMemo, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { colorEnEscala } from "@/components/lab-graficos/graficos/tablas/comun";
import { valoresPorRegion } from "@/lib/lab-graficos/datos";
import { baseEcharts, rellenoBloqueEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { AvisoMapa } from "./aviso-mapa";
import { nombreCorto, REGIONES, registrarChile } from "./chile-geo";

type ModuloEcharts = typeof import("echarts");
interface EventoItem {
  seriesIndex?: number;
  dataIndex?: number;
  name?: string;
}

// Coropleta de Chile por región con un ranking de barras al lado. Pasar el mouse por una
// región resalta su barra y al revés: el mapa ubica, el ranking permite comparar.
export function CoropletaChile({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const contenedor = useRef<HTMLDivElement>(null);
  const modulo = useRef<ModuloEcharts | null>(null);
  const [error, setError] = useState(false);

  const datos = useMemo(() => {
    const valores = valoresPorRegion();
    return REGIONES.map((r) => ({ ...r, valor: valores[r.codigo] ?? 0 })).sort((a, b) => b.valor - a.valor);
  }, []);

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const radio = Math.min(t.radio, 6);
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value } = p as { name: string; value: number };
          return `${name}<br/><span style="opacity:.75">Índice de actividad</span> <b>${value ?? "sin dato"}</b>`;
        },
      },
      visualMap: {
        type: "continuous",
        seriesIndex: 0,
        min: 0,
        max: 100,
        left: 0,
        bottom: 4,
        itemWidth: 10,
        itemHeight: Math.max(60, Math.min(110, alto * 0.3)),
        text: ["100", "0"],
        textGap: 6,
        calculable: false,
        inRange: { color: t.secuencial },
        textStyle: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
      },
      grid: { left: "40%", right: 36, top: 6, bottom: 6, containLabel: true },
      xAxis: { type: "value", max: 100, show: false },
      yAxis: {
        type: "category",
        inverse: true,
        data: datos.map((d) => nombreCorto(d.nombre)),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje - 1, margin: 8 },
      },
      series: [
        {
          type: "map",
          map: "chile",
          roam: true,
          scaleLimit: { min: 0.8, max: 8 },
          aspectScale: 0.8,
          left: 42,
          top: 6,
          bottom: 6,
          width: "22%",
          selectedMode: false,
          data: datos.map((d) => ({ name: d.nombre, value: d.valor })),
          label: { show: false },
          itemStyle: {
            areaColor: t.grilla,
            borderColor: t.superficie === "contorno" ? t.texto : t.fondoTarjeta,
            borderWidth: t.superficie === "contorno" ? 0.8 : 0.6,
            ...sombraEcharts(t, t.secuencial[t.secuencial.length - 2]),
          },
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: conAlfa(t.texto, 0.8), borderColor: t.fondoTarjeta, borderWidth: 1 },
          },
        },
        {
          type: "bar",
          barWidth: "62%",
          data: datos.map((d) => {
            const color = colorEnEscala(t.secuencial, d.valor / 100);
            return { name: d.nombre, value: d.valor, itemStyle: { ...rellenoBloqueEcharts(t, color, true), borderRadius: [0, radio, radio, 0] } };
          }),
          label: {
            show: true,
            position: "right",
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            fontWeight: 600,
          },
          emphasis: { itemStyle: { borderColor: t.texto, borderWidth: 1.5 }, label: { fontWeight: 700 } },
        },
      ],
    };
  }, [t, datos, alto]);

  const eventos = useMemo(() => {
    const instancia = () => {
      const el = contenedor.current?.firstElementChild as HTMLElement | null;
      return el && modulo.current ? modulo.current.getInstanceByDom(el) : undefined;
    };
    // Resalta la contraparte: región del mapa (serie 0) ↔ barra del ranking (serie 1).
    const espejo = (tipo: "highlight" | "downplay") => (p: unknown) => {
      const e = p as EventoItem;
      const chart = instancia();
      if (!chart || e.seriesIndex === undefined || e.dataIndex === undefined) return;
      const nombre = e.seriesIndex === 0 ? e.name : datos[e.dataIndex]?.nombre;
      const idx = datos.findIndex((d) => d.nombre === nombre);
      if (idx < 0) return;
      if (e.seriesIndex === 0) chart.dispatchAction({ type: tipo, seriesIndex: 1, dataIndex: idx });
      else chart.dispatchAction({ type: tipo, seriesIndex: 0, name: nombre });
    };
    return { mouseover: espejo("highlight"), mouseout: espejo("downplay") };
  }, [datos]);

  if (error) return <AvisoMapa alto={alto} texto="No se pudo cargar el mapa de regiones." />;

  return (
    <div ref={contenedor}>
      <EChart
        option={option}
        alto={alto}
        eventos={eventos}
        preparar={async (echarts) => {
          modulo.current = echarts;
          try {
            await registrarChile(echarts);
          } catch {
            setError(true);
          }
        }}
      />
    </div>
  );
}
