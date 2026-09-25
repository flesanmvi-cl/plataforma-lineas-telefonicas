"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, LINEAS, puntosDispersion } from "@/lib/lab-graficos/datos";
import { baseEcharts, ejeValorEcharts, gridEcharts, leyendaEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { mezclar } from "../composicion/utilidades";

const LINEAS_USADAS = LINEAS.slice(0, 4);

function estiloBurbuja(t: TokensLab, color: string) {
  const sombra = sombraEcharts(t, color);
  if (t.superficie === "degradado")
    return {
      color: {
        type: "radial" as const,
        x: 0.35,
        y: 0.3,
        r: 0.8,
        colorStops: [
          { offset: 0, color: mezclar(color, "#FFFFFF", 0.55) },
          { offset: 1, color },
        ],
      },
      opacity: 0.92,
    };
  if (t.superficie === "contorno") return { color: conAlfa(color, 0.14), borderColor: color, borderWidth: 1.5 };
  if (t.superficie === "glass") return { color: conAlfa(color, 0.55), borderColor: "rgba(255,255,255,0.5)", borderWidth: 1, ...sombra };
  return { color: conAlfa(color, 0.78), borderColor: t.fondoTarjeta, borderWidth: 1, ...sombra };
}

// Costo contra plazo por proyecto; el tamaño de la burbuja es la dotación. Rueda del mouse o
// pellizco para acercar, arrastre para mover y la leyenda para filtrar líneas.
export function DispersionBurbujas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const puntos = useMemo(() => puntosDispersion(), []);
  const [conZoom, setConZoom] = useState(false);
  const [version, setVersion] = useState(0);
  const directas = t.etiquetas === "directas";

  const option = useMemo<EChartsOption>(() => {
    void version;
    const eje = (nombre: string) =>
      ejeValorEcharts(t, {
        name: nombre,
        nameLocation: "middle",
        nameTextStyle: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje - 1 },
        scale: true,
      });
    return {
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          // Cada punto es { value: [...] } (para rotular solo algunos), así que se lee value, no data.
          const { seriesName, value: data, color } = p as { seriesName: string; value: [number, number, number, string]; color: string };
          const punto = `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${typeof color === "string" ? color : t.acento};margin-right:6px"></span>`;
          return `${punto}<b>${data[3]}</b> · ${seriesName}<br/>Plazo ${data[0]} meses<br/>Costo ${formato.millones(data[1])}<br/>Dotación ${data[2]} personas`;
        },
      },
      legend: leyendaEcharts(t),
      grid: gridEcharts(t, { left: 16, bottom: 18, right: 16 }),
      xAxis: { ...eje("Plazo (meses)"), nameGap: 22 },
      yAxis: { ...eje("Costo (M$)"), nameGap: 34, axisLabel: { show: t.grillaModo !== "sin", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje } },
      dataZoom: [
        { type: "inside", xAxisIndex: 0, filterMode: "none" },
        { type: "inside", yAxisIndex: 0, filterMode: "none" },
      ],
      series: LINEAS_USADAS.map((linea, i) => {
        const color = t.colores[i % t.colores.length];
        const propios = puntos.filter((p) => p.linea === linea);
        const mayor = propios.reduce((m, p) => (p.tamano > m.tamano ? p : m), propios[0]);
        return {
          name: linea,
          type: "scatter" as const,
          data: propios.map((p) => ({
            value: [p.plazo, p.costo, p.tamano, p.id],
            // Con etiquetas directas se rotula la burbuja mayor de cada línea.
            label: { show: directas && p.id === mayor.id },
          })),
          symbolSize: (v: number[]) => 6 + Math.sqrt(v[2]) * 3.2,
          itemStyle: estiloBurbuja(t, color),
          label: {
            show: false,
            formatter: linea,
            position: "top",
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje - 1,
            fontWeight: 600,
          },
          emphasis: { focus: "series" as const, scale: 1.15 },
        };
      }),
    };
  }, [t, puntos, directas, version]);

  const eventos = useMemo(() => ({ datazoom: () => setConZoom(true) }), []);

  return (
    <div style={{ position: "relative", height: alto }}>
      <EChart option={option} alto={alto} eventos={eventos} />
      {conZoom ? (
        <button
          type="button"
          onClick={() => {
            setConZoom(false);
            setVersion((v) => v + 1);
          }}
          style={{
            position: "absolute",
            top: t.etiquetas === "leyenda" ? 22 : 0,
            right: 0,
            border: `1px solid ${t.eje}`,
            background: t.fondoTarjeta,
            color: t.texto,
            borderRadius: Math.min(t.radio, 999),
            padding: "1px 10px",
            cursor: "pointer",
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
          }}
        >
          Restablecer zoom
        </button>
      ) : null}
    </div>
  );
}
