"use client";

import { useId, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { ETAPAS, formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

/** Texto legible (neutro oscuro o blanco) sobre un color de fondo #RRGGBB. */
function textoSobre(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#231F20" : "#FFFFFF";
}

// Pipeline en chevrones: cada etapa con su conteo, la tasa de paso entre etapas y una barra
// con lo que queda del total inicial. Pasar el mouse, enfocar o hacer clic fija una etapa.
export function PipelineChevrones({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize debounceTime={40}>{({ width }) => (width > 0 ? <PipelineSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function PipelineSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [fija, setFija] = useState<number | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);
  const activa = sobre ?? fija;
  const n = ETAPAS.length;
  const inicial = ETAPAS[0].valor;
  const tonos = [...t.secuencial].reverse();
  const altoChevron = Math.min(78, alto * 0.34);
  const punta = Math.min(18, altoChevron / 3);
  const hueco = 4;
  const anchoChevron = (ancho - (n - 1) * hueco + (n - 1) * punta) / n;
  const y0 = 8;
  const yPastilla = y0 + altoChevron + 20;
  const yBarra = yPastilla + 28;
  const dur = t.animacion.duracion / 1000;
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";

  const xDe = (i: number) => i * (anchoChevron - punta + hueco);
  const forma = (i: number) => {
    const x = xDe(i);
    const w = anchoChevron;
    const h = altoChevron;
    const cola = i === 0 ? `${x},${y0 + h}` : `${x},${y0 + h} ${x + punta},${y0 + h / 2}`;
    const fin = i === n - 1 ? `${x + w},${y0} ${x + w},${y0 + h}` : `${x + w - punta},${y0} ${x + w},${y0 + h / 2} ${x + w - punta},${y0 + h}`;
    return `${x},${y0} ${fin} ${cola}`;
  };

  const [detalle1, detalle2] =
    activa !== null
      ? activa === 0
        ? [`${ETAPAS[0].etapa} · ${formato.entero(inicial)}`, "Oportunidades de entrada al pipeline"]
        : [
            `${ETAPAS[activa].etapa} · ${formato.entero(ETAPAS[activa].valor)}`,
            `Pasa el ${formato.porcentaje((ETAPAS[activa].valor / ETAPAS[activa - 1].valor) * 100)} desde ${ETAPAS[activa - 1].etapa} · ${formato.porcentaje((ETAPAS[activa].valor / inicial) * 100, 1)} del total`,
          ]
      : [`Conversión total ${formato.porcentaje((ETAPAS[n - 1].valor / inicial) * 100, 1)}`, "Elige una etapa para ver el detalle"];

  return (
    <svg width={ancho} height={alto} role="group" aria-label="Pipeline comercial por etapas">
      <defs>
        {ETAPAS.map((_, i) => (
          <linearGradient key={i} id={`${uid}-g${i}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={tonos[i % tonos.length]} />
            <stop offset="1" stopColor={conAlfa(tonos[i % tonos.length], 0.6)} />
          </linearGradient>
        ))}
        <filter id={`${uid}-sombra`} x="-10%" y="-20%" width="120%" height="160%">
          <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 5} stdDeviation="5" floodColor={t.acento} floodOpacity="0.35" />
        </filter>
      </defs>

      {ETAPAS.map((e, i) => {
        const color = tonos[i % tonos.length];
        const relleno =
          t.superficie === "degradado"
            ? `url(#${uid}-g${i})`
            : t.superficie === "contorno"
              ? conAlfa(color, 0.12)
              : t.superficie === "glass"
                ? conAlfa(color, 0.78)
                : color;
        const colorTexto = t.superficie === "contorno" ? t.texto : textoSobre(color);
        const tenue = activa !== null && activa !== i;
        const cx = xDe(i) + anchoChevron / 2 + (i === 0 ? -punta / 4 : punta / 4);
        return (
          <motion.g
            key={e.etapa}
            role="button"
            tabIndex={0}
            aria-pressed={fija === i}
            aria-label={`${e.etapa}: ${formato.entero(e.valor)}`}
            onMouseEnter={() => setSobre(i)}
            onMouseLeave={() => setSobre(null)}
            onFocus={() => setSobre(i)}
            onBlur={() => setSobre(null)}
            onClick={() => setFija((f) => (f === i ? null : i))}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                setFija((f) => (f === i ? null : i));
              }
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: tenue ? 0.4 : 1, x: 0, y: activa === i ? -3 : 0 }}
            transition={{ duration: dur * 0.6, delay: 0, opacity: { duration: 0.15 }, x: { duration: dur * 0.6, delay: i * dur * 0.12 } }}
            style={{ cursor: "pointer", outline: "none" }}
          >
            <polygon
              points={forma(i)}
              fill={relleno}
              stroke={t.superficie === "contorno" ? color : fija === i ? t.texto : "none"}
              strokeWidth={t.superficie === "contorno" || fija === i ? 1.5 : 0}
              strokeLinejoin="round"
              filter={conSombra ? `url(#${uid}-sombra)` : undefined}
            />
            <text x={cx} y={y0 + altoChevron / 2 - 8} textAnchor="middle" fill={colorTexto} fontFamily={t.fuente} fontSize={t.tamano.eje} opacity={0.85}>
              {e.etapa}
            </text>
            <text x={cx} y={y0 + altoChevron / 2 + 12} textAnchor="middle" fill={colorTexto} fontFamily={t.fuente} fontSize={t.tamano.etiqueta + 4} fontWeight={700}>
              {formato.entero(e.valor)}
            </text>
          </motion.g>
        );
      })}

      {/* Tasa de paso entre etapas */}
      {ETAPAS.slice(1).map((e, k) => {
        const i = k + 1;
        const x = xDe(i) + punta / 2 - hueco / 2;
        const tasa = (e.valor / ETAPAS[k].valor) * 100;
        const resaltada = activa === i;
        return (
          <g key={`paso-${e.etapa}`}>
            <line x1={x} x2={x} y1={y0 + altoChevron + 2} y2={yPastilla - 9} stroke={t.eje} />
            <rect
              x={x - 24}
              y={yPastilla - 9}
              width={48}
              height={18}
              rx={9}
              fill={resaltada ? t.acento : t.fondoTarjeta}
              stroke={resaltada ? t.acento : t.eje}
            />
            <text x={x} y={yPastilla} dy="0.35em" textAnchor="middle" fill={resaltada ? "#FFFFFF" : t.texto} fontFamily={t.fuente} fontSize={t.tamano.eje} fontWeight={600}>
              {formato.porcentaje(tasa)}
            </text>
          </g>
        );
      })}

      {/* Lo que queda del total inicial */}
      {ETAPAS.map((e, i) => {
        const x = xDe(i) + (i === 0 ? 0 : punta);
        const w = anchoChevron - punta;
        const share = e.valor / inicial;
        return (
          <g key={`barra-${e.etapa}`} opacity={activa !== null && activa !== i ? 0.45 : 1}>
            <rect x={x} y={yBarra} width={w} height={6} rx={3} fill={t.grilla} />
            <motion.rect
              x={x}
              y={yBarra}
              height={6}
              rx={3}
              fill={t.acento}
              initial={{ width: 0 }}
              animate={{ width: w * share }}
              transition={{ duration: dur, delay: dur * 0.3 + i * dur * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <text x={x} y={yBarra + 20} fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
              {formato.porcentaje(share * 100, 1)}
            </text>
          </g>
        );
      })}

      <text x={0} y={alto - 24} fill={t.texto} fontFamily={t.fuente} fontSize={t.tamano.etiqueta} fontWeight={600}>
        {detalle1}
      </text>
      <text x={0} y={alto - 6} fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
        {detalle2}
      </text>
    </svg>
  );
}
