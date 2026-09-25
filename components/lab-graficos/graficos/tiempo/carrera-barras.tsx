"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { Pause, Play, RotateCcw } from "lucide-react";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, MESES, OBRAS } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { baseEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

// Facturación acumulada (MM$) por obra, mes a mes; cada obra con su propio ritmo para que el
// ranking cambie en el año.
function acumuladoPorObra() {
  const r = azar(91);
  return OBRAS.map((obra, k) => {
    const ritmo = MESES.map((_, i) => 20 + r() * 30 + (k % 3 === 0 ? i * 4 : k % 3 === 1 ? (11 - i) * 3.5 : Math.sin(i / 2) * 18 + 10));
    let suma = 0;
    return { obra, valores: ritmo.map((v) => Math.round((suma += v))) };
  });
}

// Carrera de barras (ECharts realtimeSort): Play avanza mes a mes y las barras se reordenan
// animadas. Arranca en pausa y se detiene sola si la tarjeta sale de la pantalla.
export function CarreraBarras({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(acumuladoPorObra, []);
  const [mes, setMes] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const paso = Math.max(700, t.animacion.duracion + 300);
  const altoControles = 34;

  useEffect(() => {
    if (!corriendo) return;
    const id = window.setInterval(() => {
      setMes((m) => {
        if (m >= MESES.length - 1) {
          setCorriendo(false);
          return m;
        }
        return m + 1;
      });
    }, paso);
    return () => window.clearInterval(id);
  }, [corriendo, paso]);

  // Pausa si deja de verse.
  useEffect(() => {
    const el = contenedor.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) setCorriendo(false);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const animar = t.animacion.duracion > 0;
    return {
      ...base,
      animationDuration: animar ? 400 : 0,
      animationDurationUpdate: animar ? paso : 0,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
      tooltip: { ...base.tooltip, trigger: "item", valueFormatter: (v) => formato.millones(Number(v)) },
      grid: { left: 8, right: 64, top: 4, bottom: 4, containLabel: true },
      xAxis: {
        type: "value",
        max: "dataMax",
        axisLabel: { show: false },
        splitLine: { show: t.grillaModo !== "sin", lineStyle: { color: t.grilla, type: t.grillaModo === "minima" ? "dashed" : "solid" } },
      },
      yAxis: {
        type: "category",
        data: datos.map((d) => d.obra),
        inverse: true,
        animationDuration: animar ? 300 : 0,
        animationDurationUpdate: animar ? 300 : 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: t.texto, fontFamily: t.fuente, fontSize: t.tamano.eje },
      },
      series: [
        {
          type: "bar",
          realtimeSort: true,
          barWidth: "62%",
          data: datos.map((d, k) => {
            const color = t.colores[k % t.colores.length];
            return { value: d.valores[mes], name: d.obra, itemStyle: rellenoBloqueEcharts(t, color, true) };
          }),
          label: {
            show: true,
            position: "right",
            valueAnimation: animar,
            color: t.texto,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            fontWeight: 600,
            formatter: (p) => formato.entero(Number(p.value)),
          },
        },
      ],
      graphic: [
        {
          type: "text",
          right: 72,
          bottom: 12,
          silent: true,
          style: {
            text: `${MESES[mes]} 2026`,
            fill: conAlfa(t.texto, 0.22),
            font: `700 ${Math.round(t.tamano.valor * 1.4)}px ${t.fuente}`,
          },
        },
      ],
    };
  }, [t, datos, mes, paso]);

  const boton = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: Math.min(t.radio, 999),
    border: `1px solid ${t.eje}`,
    background: t.fondoTarjeta,
    color: t.texto,
    cursor: "pointer",
  } as const;

  return (
    <div ref={contenedor} style={{ height: alto }}>
      <EChart fusionar option={option} alto={alto - altoControles} />
      <div style={{ height: altoControles, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          style={{ ...boton, background: corriendo ? t.fondoTarjeta : t.acento, color: corriendo ? t.texto : "#FFFFFF", borderColor: corriendo ? t.eje : t.acento }}
          aria-label={corriendo ? "Pausar" : "Reproducir"}
          onClick={() => {
            if (!corriendo && mes >= MESES.length - 1) setMes(0);
            setCorriendo((c) => !c);
          }}
        >
          {corriendo ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          style={boton}
          aria-label="Volver al inicio"
          onClick={() => {
            setCorriendo(false);
            setMes(0);
          }}
        >
          <RotateCcw size={14} />
        </button>
        <input
          type="range"
          min={0}
          max={MESES.length - 1}
          value={mes}
          aria-label="Mes"
          aria-valuetext={`${MESES[mes]} 2026`}
          onChange={(e) => {
            setCorriendo(false);
            setMes(Number(e.target.value));
          }}
          style={{ flex: 1, accentColor: t.acento }}
        />
        <span style={{ fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave, minWidth: 30, textAlign: "right" }}>{MESES[mes]}</span>
      </div>
    </div>
  );
}
