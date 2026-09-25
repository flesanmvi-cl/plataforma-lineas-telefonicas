"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { baseEcharts, degradadoEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";

const INDICADORES = [
  { id: "cumplimiento", nombre: "Cumplimiento", valor: 78 },
  { id: "productividad", nombre: "Productividad", valor: 91 },
  { id: "cobranza", nombre: "Cobranza", valor: 54 },
];

/** Umbrales del indicador: bajo 60 es alerta, de 60 a 85 atención, sobre 85 en meta. */
const UMBRALES = [60, 85];

// Gauge (ECharts) con tres bandas de umbral bajo el arco de progreso. Los botones cambian el
// indicador y la aguja se desplaza al nuevo valor.
export function Gauge({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [sel, setSel] = useState(INDICADORES[0].id);
  const ind = INDICADORES.find((i) => i.id === sel) ?? INDICADORES[0];
  const altoBotones = 30;

  const option = useMemo<EChartsOption>(() => {
    const color = t.acento;
    // Bandas de umbral: intensidades del acento (de tenue a pleno), sin inventar colores.
    const bandas: [number, string][] = [
      [UMBRALES[0] / 100, conAlfa(color, t.oscuro ? 0.3 : 0.22)],
      [UMBRALES[1] / 100, conAlfa(color, t.oscuro ? 0.55 : 0.5)],
      [1, color],
    ];
    const relleno =
      t.superficie === "degradado"
        ? degradadoEcharts(conAlfa(color, 0.35), color, true)
        : t.superficie === "contorno"
          ? conAlfa(color, 0.15)
          : t.superficie === "glass"
            ? conAlfa(color, 0.75)
            : color;
    const nivel = ind.valor < UMBRALES[0] ? "Alerta" : ind.valor < UMBRALES[1] ? "Atención" : "En meta";
    return {
      ...baseEcharts(t),
      animationDurationUpdate: Math.max(t.animacion.duracion, 0),
      animationEasingUpdate: t.animacion.easing as "cubicOut" | "elasticOut" | "linear",
      tooltip: { show: false },
      series: [
        {
          type: "gauge",
          startAngle: 205,
          endAngle: -25,
          min: 0,
          max: 100,
          center: ["50%", "62%"],
          radius: "92%",
          splitNumber: 10,
          // Bandas de umbral (arco delgado exterior)
          axisLine: { lineStyle: { width: 6, color: bandas } },
          // Progreso (arco grueso interior)
          progress: {
            show: true,
            width: 14,
            roundCap: t.radio >= 6,
            itemStyle: {
              color: relleno,
              borderColor: t.superficie === "contorno" ? color : undefined,
              borderWidth: t.superficie === "contorno" ? 1.5 : 0,
              ...sombraEcharts(t, color),
            },
          },
          pointer: {
            show: true,
            length: "58%",
            width: 4,
            offsetCenter: [0, 0],
            itemStyle: { color: t.texto },
          },
          anchor: {
            show: true,
            size: 12,
            showAbove: true,
            itemStyle: { color: t.fondoTarjeta, borderColor: t.texto, borderWidth: 3 },
          },
          axisTick: { show: t.grillaModo !== "sin", distance: -24, length: 4, lineStyle: { color: t.eje, width: 1 } },
          splitLine: { show: t.grillaModo !== "sin", distance: -26, length: 8, lineStyle: { color: t.textoSuave, width: 1 } },
          axisLabel: {
            show: t.grillaModo === "completa",
            distance: -8,
            color: t.textoSuave,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje - 1,
            formatter: (v: number) => (UMBRALES.includes(v) || v === 0 || v === 100 ? `${v}` : ""),
          },
          title: {
            show: true,
            offsetCenter: [0, "62%"],
            color: t.textoSuave,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
          },
          detail: {
            valueAnimation: t.animacion.duracion > 0,
            offsetCenter: [0, "34%"],
            formatter: (v: number) => `{v|${formato.porcentaje(Math.round(v))}}`,
            rich: {
              v: { color: t.texto, fontFamily: t.fuente, fontSize: t.kpi.cifra, fontWeight: 600 },
            },
          },
          data: [{ value: ind.valor, name: `${ind.nombre} · ${nivel}` }],
        },
      ],
    };
  }, [t, ind]);

  return (
    <div style={{ height: alto, display: "flex", flexDirection: "column" }}>
      <div role="group" aria-label="Indicador" style={{ display: "flex", gap: 4, height: altoBotones, justifyContent: "center" }}>
        {INDICADORES.map((i) => {
          const on = i.id === sel;
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(i.id)}
              style={{
                height: 24,
                padding: "0 10px",
                cursor: "pointer",
                borderRadius: 999,
                border: `1px solid ${on ? t.acento : t.eje}`,
                background: on ? conAlfa(t.acento, 0.1) : "transparent",
                color: on ? t.texto : t.textoSuave,
                fontFamily: t.fuente,
                fontSize: t.tamano.eje,
                fontWeight: on ? 600 : 400,
              }}
            >
              {i.nombre}
            </button>
          );
        })}
      </div>
      <EChart fusionar option={option} alto={alto - altoBotones} />
    </div>
  );
}
