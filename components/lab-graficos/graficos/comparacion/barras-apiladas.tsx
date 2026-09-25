"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, OBRAS } from "@/lib/lab-graficos/datos";
import {
  baseEcharts,
  ejeCategoriaEcharts,
  ejeValorEcharts,
  gridEcharts,
  leyendaEcharts,
  rellenoBloqueEcharts,
} from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";

const PARTIDAS = ["Mano de obra", "Materiales", "Equipos", "Subcontratos"];
const OBRAS_CORTAS = OBRAS.slice(0, 5);

/** Costo por partida y obra (millones). */
function costosPorPartida() {
  const r = azar(211);
  return PARTIDAS.map((partida, i) => ({
    partida,
    valores: OBRAS_CORTAS.map(() => Math.round((180 - i * 30) * (0.5 + r()))),
  }));
}

type Modo = "apilado" | "cien";

// Barras apiladas (ECharts) con un control interno para pasar de montos absolutos a 100%.
export function BarrasApiladas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [modo, setModo] = useState<Modo>("apilado");
  const datos = useMemo(() => costosPorPartida(), []);
  const totales = useMemo(() => OBRAS_CORTAS.map((_, k) => datos.reduce((s, d) => s + d.valores[k], 0)), [datos]);

  const option = useMemo<EChartsOption>(() => {
    const cien = modo === "cien";
    const directas = t.etiquetas === "directas";
    const base = baseEcharts(t);
    const radio = Math.min(t.radio, 6);
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: t.grilla, opacity: 0.5 } },
        valueFormatter: (v) => (cien ? formato.porcentaje(Number(v), 1) : `${formato.entero(Number(v))} M`),
      },
      // La leyenda va abajo: arriba a la derecha está el selector Montos/100%.
      legend: leyendaEcharts(t, { top: undefined, bottom: 0, type: "scroll" }),
      grid: gridEcharts(t, { top: 36, bottom: t.etiquetas === "leyenda" ? 28 : 8, right: directas ? 92 : 12 }),
      xAxis: ejeCategoriaEcharts(t, OBRAS_CORTAS.map((o) => o.replace("Obra ", ""))),
      yAxis: ejeValorEcharts(t, cien ? { max: 100, axisLabel: { ...ejeValorEcharts(t).axisLabel, formatter: "{value}%" } } : {}),
      series: datos.map((d, i) => {
        const color = t.colores[i % t.colores.length];
        const ultima = i === datos.length - 1;
        const valores = cien ? d.valores.map((v, k) => Math.round((v / totales[k]) * 1000) / 10) : d.valores;
        return {
          name: d.partida,
          type: "bar" as const,
          stack: "total",
          barWidth: "52%",
          // Solo el segmento superior redondea sus esquinas; los intermedios quedan rectos.
          itemStyle: { ...rellenoBloqueEcharts(t, color), borderRadius: ultima ? [radio, radio, 0, 0] : 0 },
          emphasis: { focus: "series" as const },
          label: {
            show: cien && !directas,
            formatter: (p: { value: unknown }) => (Number(p.value) >= 12 ? `${Math.round(Number(p.value))}%` : ""),
            color: t.superficie === "contorno" ? t.texto : conAlfa("#FFFFFF", 0.92),
            fontFamily: t.fuente,
            fontSize: t.tamano.eje - 1,
          },
          // Con etiquetas directas, el nombre de la partida va a la derecha de la última barra.
          data: valores.map((v, k) =>
            directas && k === valores.length - 1
              ? {
                  value: v,
                  label: {
                    show: true,
                    position: "right" as const,
                    formatter: d.partida,
                    color,
                    fontFamily: t.fuente,
                    fontSize: t.tamano.eje,
                  },
                }
              : v,
          ),
        };
      }),
    };
  }, [t, modo, datos, totales]);

  const opciones: { id: Modo; texto: string }[] = [
    { id: "apilado", texto: "Montos" },
    { id: "cien", texto: "100%" },
  ];

  return (
    <div style={{ position: "relative", height: alto }}>
      <div
        role="group"
        aria-label="Escala de las barras"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1,
          display: "flex",
          gap: 2,
          padding: 2,
          borderRadius: Math.min(t.radio, 999),
          background: t.grilla,
          fontFamily: t.fuente,
        }}
      >
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={modo === o.id}
            onClick={() => setModo(o.id)}
            style={{
              border: 0,
              cursor: "pointer",
              padding: "2px 10px",
              fontSize: t.tamano.eje,
              fontFamily: t.fuente,
              fontWeight: modo === o.id ? 600 : 400,
              borderRadius: Math.max(Math.min(t.radio, 999) - 2, 0),
              background: modo === o.id ? t.fondoTarjeta : "transparent",
              color: modo === o.id ? t.texto : t.textoSuave,
              transition: `background ${Math.min(t.animacion.duracion, 200)}ms`,
            }}
          >
            {o.texto}
          </button>
        ))}
      </div>
      <EChart option={option} alto={alto} />
    </div>
  );
}
