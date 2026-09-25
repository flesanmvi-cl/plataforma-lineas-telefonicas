/**
 * Traducción de los tokens del laboratorio a cada librería (ECharts, Nivo) y efectos de
 * superficie reutilizables. Un gráfico del laboratorio arma su opción/propiedades con
 * estas funciones para que obedezca el panel «Tema» sin repetir lógica.
 */
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

// ---------------------------------------------------------------- ECharts

/** Base común de toda opción ECharts: paleta, letra, animación y tooltip. */
export function baseEcharts(t: TokensLab) {
  return {
    color: t.colores,
    backgroundColor: "transparent",
    textStyle: { fontFamily: t.fuente, color: t.texto, fontSize: t.tamano.etiqueta },
    animation: t.animacion.duracion > 0,
    animationDuration: t.animacion.duracion,
    animationEasing: t.animacion.easing as "cubicOut" | "elasticOut" | "linear",
    animationDurationUpdate: Math.min(t.animacion.duracion, 500),
    animationEasingUpdate: "cubicOut" as const,
    tooltip: tooltipEcharts(t),
  };
}

export function tooltipEcharts(t: TokensLab) {
  return {
    backgroundColor: t.tooltip.fondo,
    borderColor: t.tooltip.borde,
    borderWidth: 1,
    padding: [8, 12] as [number, number],
    textStyle: { color: t.tooltip.texto, fontFamily: t.fuente, fontSize: 12 },
    extraCssText: `border-radius:${Math.min(t.radio, 12)}px;box-shadow:${t.tooltip.sombra};${
      t.tema.tooltip === "tarjeta" ? "backdrop-filter:blur(10px);" : ""
    }`,
  };
}

/** Grilla (área de dibujo) con márgenes según si hay leyenda. */
export function gridEcharts(t: TokensLab, extra: Record<string, unknown> = {}) {
  return { left: 8, right: t.etiquetas === "directas" ? 64 : 12, top: t.etiquetas === "leyenda" ? 36 : 16, bottom: 8, containLabel: true, ...extra };
}

export function leyendaEcharts(t: TokensLab, extra: Record<string, unknown> = {}) {
  return {
    show: t.etiquetas === "leyenda",
    top: 0,
    left: 0,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
    ...extra,
  };
}

export function ejeCategoriaEcharts(t: TokensLab, data: (string | number)[], extra: Record<string, unknown> = {}) {
  return {
    type: "category" as const,
    data,
    boundaryGap: true,
    axisLine: { lineStyle: { color: t.eje } },
    axisTick: { show: false },
    axisLabel: { color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
    splitLine: { show: t.grillaModo === "completa", lineStyle: { color: t.grilla } },
    ...extra,
  };
}

export function ejeValorEcharts(t: TokensLab, extra: Record<string, unknown> = {}) {
  return {
    type: "value" as const,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: t.grillaModo !== "sin", color: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje },
    splitLine: {
      show: t.grillaModo !== "sin",
      lineStyle: { color: t.grilla, type: t.grillaModo === "minima" ? ("dashed" as const) : ("solid" as const) },
    },
    ...extra,
  };
}

/** Curva de líneas y áreas según el tema. */
export function curvaEcharts(t: TokensLab): { smooth?: number | boolean; step?: "middle" | false } {
  if (t.curva === "suave") return { smooth: 0.35, step: false };
  if (t.curva === "escalonada") return { smooth: false, step: "middle" };
  return { smooth: false, step: false };
}

/** Sombra de la serie (itemStyle/lineStyle) según la superficie. */
export function sombraEcharts(t: TokensLab, color: string) {
  if (t.superficie === "sombras") return { shadowBlur: 14, shadowColor: conAlfa(color, 0.45), shadowOffsetY: 8 };
  if (t.superficie === "glass") return { shadowBlur: 18, shadowColor: conAlfa(color, 0.6), shadowOffsetY: 0 };
  return {};
}

/** Degradado vertical (arriba → abajo) en formato ECharts, sin importar echarts.graphic. */
export function degradadoEcharts(desde: string, hasta: string, horizontal = false) {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: horizontal ? 1 : 0,
    y2: horizontal ? 0 : 1,
    colorStops: [
      { offset: 0, color: desde },
      { offset: 1, color: hasta },
    ],
  };
}

/** Relleno de un área bajo una línea. */
export function rellenoAreaEcharts(t: TokensLab, color: string) {
  if (t.superficie === "degradado") return { color: degradadoEcharts(conAlfa(color, 0.45), conAlfa(color, 0)) };
  if (t.superficie === "glass") return { color: degradadoEcharts(conAlfa(color, 0.3), conAlfa(color, 0.02)) };
  if (t.superficie === "contorno") return { color: "transparent" };
  return { color: conAlfa(color, 0.1) };
}

/** Relleno de barras, sectores o bloques. */
export function rellenoBloqueEcharts(t: TokensLab, color: string, horizontal = false) {
  const base = { borderRadius: Math.min(t.radio, 8), ...sombraEcharts(t, color) };
  if (t.superficie === "degradado") return { ...base, color: degradadoEcharts(color, conAlfa(color, 0.55), horizontal) };
  if (t.superficie === "contorno") return { ...base, color: conAlfa(color, 0.12), borderColor: color, borderWidth: 1.5 };
  if (t.superficie === "glass") return { ...base, color: conAlfa(color, 0.75), borderColor: "rgba(255,255,255,0.35)", borderWidth: 1 };
  return { ...base, color };
}

// ---------------------------------------------------------------- Nivo

/** Tema Nivo equivalente a los tokens. */
export function temaNivo(t: TokensLab) {
  return {
    background: "transparent",
    text: { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.textoSuave },
    axis: {
      domain: { line: { stroke: t.eje, strokeWidth: 1 } },
      ticks: { line: { stroke: t.eje, strokeWidth: 1 }, text: { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.textoSuave } },
      legend: { text: { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.textoSuave } },
    },
    grid: { line: { stroke: t.grilla, strokeWidth: 1, strokeDasharray: t.grillaModo === "minima" ? "4 4" : undefined } },
    legends: { text: { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.textoSuave } },
    labels: { text: { fontFamily: t.fuente, fontSize: t.tamano.eje, fill: t.texto } },
    tooltip: {
      container: {
        background: t.tooltip.fondo,
        color: t.tooltip.texto,
        fontFamily: t.fuente,
        fontSize: 12,
        borderRadius: Math.min(t.radio, 12),
        boxShadow: t.tooltip.sombra,
        border: `1px solid ${t.tooltip.borde}`,
      },
    },
  };
}

/** Configuración de animación para Nivo (react-spring). */
export function movimientoNivo(t: TokensLab): { animate: boolean; motionConfig: string } {
  if (t.animacion.duracion === 0) return { animate: false, motionConfig: "default" };
  return { animate: true, motionConfig: t.tema.animacion === "expresiva" ? "wobbly" : "gentle" };
}

// ---------------------------------------------------------------- SVG propio (visx)

/** Id seguro para <defs> de un SVG (degradados, filtros) dentro de un gráfico. */
export function idSvg(base: string, sufijo: string) {
  return `${base}-${sufijo}`.replace(/[^a-zA-Z0-9_-]/g, "");
}
