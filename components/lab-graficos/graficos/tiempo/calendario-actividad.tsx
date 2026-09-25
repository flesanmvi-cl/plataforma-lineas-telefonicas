"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { actividadDiaria, formato, MESES } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { baseEcharts, degradadoEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";

const TRAMOS = [0, 15, 30, 45, 60];
const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

function tramoDe(v: number) {
  let k = 0;
  for (let i = 0; i < TRAMOS.length; i++) if (v >= TRAMOS[i]) k = i;
  return k;
}

// Calendario de actividad tipo GitHub (ECharts calendar + heatmap). El color de cada día se
// calcula por tramo para poder aplicar la superficie celda a celda; los tramos de la leyenda
// son botones que atenúan el resto.
export function CalendarioActividad({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const dias = useMemo(() => actividadDiaria(), []);
  const [foco, setFoco] = useState<number | null>(null);
  const escala = t.secuencial.slice(1, 6);
  const altoLeyenda = 28;

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const radio = Math.min(t.radio / 3, 3);
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        formatter: (p) => {
          const [fecha, valor] = (p as unknown as { value: [string, number] }).value;
          const d = new Date(`${fecha}T12:00:00`);
          const texto = d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
          return `<div style="opacity:.7">${texto}</div><b>${formato.entero(valor)}</b> partes diarios`;
        },
      },
      // ECharts exige un visualMap para todo heatmap; va oculto porque cada día ya trae su
      // color por tramo (la leyenda es HTML).
      visualMap: { show: false, type: "piecewise", pieces: TRAMOS.map((min, k) => ({ min, max: (TRAMOS[k + 1] ?? 1000) - 0.001, color: escala[k] })) },
      calendar: {
        range: "2026",
        top: 22,
        left: 28,
        right: 6,
        bottom: 4,
        cellSize: ["auto", "auto"],
        splitLine: { show: t.grillaModo !== "sin", lineStyle: { color: t.eje, width: 1 } },
        itemStyle: { color: "transparent", borderColor: t.fondoTarjeta, borderWidth: 2 },
        yearLabel: { show: false },
        dayLabel: { firstDay: 1, nameMap: DIAS_SEMANA, color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje - 1 },
        monthLabel: { nameMap: MESES, color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: dias.map((d) => {
            const k = tramoDe(d.valor);
            const c = escala[k];
            const tenue = foco !== null && foco !== k;
            let estilo: Record<string, unknown> = { color: c, borderRadius: radio };
            if (t.superficie === "degradado") estilo = { ...estilo, color: degradadoEcharts(c, conAlfa(c, 0.55)) };
            if (t.superficie === "contorno") estilo = { ...estilo, color: conAlfa(c, 0.25), borderColor: c, borderWidth: 1 };
            if (t.superficie === "glass") estilo = { ...estilo, color: conAlfa(c, 0.7), ...sombraEcharts(t, c), shadowBlur: 6 };
            if (t.superficie === "sombras" && k >= 3) estilo = { ...estilo, ...sombraEcharts(t, c), shadowBlur: 6, shadowOffsetY: 2 };
            return { value: [d.fecha, d.valor], itemStyle: { ...estilo, opacity: tenue ? 0.15 : 1 } };
          }),
          emphasis: { itemStyle: { borderColor: t.texto, borderWidth: 1.5 } },
        },
      ],
    };
  }, [t, dias, escala, foco]);

  return (
    <div style={{ height: alto }}>
      <EChart option={option} alto={alto - altoLeyenda} />
      <div style={{ height: altoLeyenda, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave }}>
        <span style={{ marginRight: 4 }}>Menos</span>
        {escala.map((c, k) => (
          <button
            key={c + k}
            type="button"
            aria-pressed={foco === k}
            aria-label={`Resaltar tramo desde ${TRAMOS[k]} partes`}
            title={`${TRAMOS[k]}${TRAMOS[k + 1] ? `–${TRAMOS[k + 1] - 1}` : " o más"}`}
            onClick={() => setFoco((f) => (f === k ? null : k))}
            onMouseEnter={() => setFoco(k)}
            onMouseLeave={() => setFoco(null)}
            style={{
              width: 14,
              height: 14,
              padding: 0,
              borderRadius: Math.min(t.radio / 3, 3),
              background: c,
              border: foco === k ? `2px solid ${t.texto}` : `1px solid ${conAlfa(t.textoSuave, 0.2)}`,
              cursor: "pointer",
            }}
          />
        ))}
        <span style={{ marginLeft: 4 }}>Más</span>
      </div>
    </div>
  );
}
