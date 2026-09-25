"use client";

import { useState, type MouseEvent } from "react";
import { curveLinear, curveMonotoneX, curveStepAfter } from "@visx/curve";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import { motion } from "motion/react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { useUidSvg } from "../comparacion/superficie-svg";

/** Curva de visx equivalente a la del tema. */
export function curvaVisx(t: TokensLab) {
  if (t.curva === "suave") return curveMonotoneX;
  if (t.curva === "escalonada") return curveStepAfter;
  return curveLinear;
}

interface PropsSparkline {
  valores: number[];
  ancho: number;
  alto: number;
  color: string;
  t: TokensLab;
  /** Recibe el índice bajo el mouse (null al salir) para mostrar el valor fuera del SVG. */
  onHover?: (i: number | null) => void;
  /** Índice marcado desde fuera (ej. el mes que se mira en otra sparkline de la grilla). */
  marca?: number | null;
}

// Sparkline reutilizable de la familia KPI (no es un gráfico del catálogo por sí solo). Área
// según la superficie, último punto destacado con pulso y guía vertical al pasar el mouse.
export function Sparkline({ valores, ancho, alto, color, t, onHover, marca = null }: PropsSparkline) {
  const uid = useUidSvg();
  const [propio, setHover] = useState<number | null>(null);
  const hover = propio ?? marca;
  const pad = 5;
  const x = scaleLinear({ domain: [0, valores.length - 1], range: [pad, Math.max(ancho - pad, pad + 1)] });
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const y = scaleLinear({ domain: [min - (max - min) * 0.1, max + (max - min) * 0.1], range: [alto - pad, pad] });
  const ultimo = valores.length - 1;
  const sombra = t.superficie === "sombras" || t.superficie === "glass";
  const rellenoArea =
    t.superficie === "contorno"
      ? "transparent"
      : t.superficie === "degradado" || t.superficie === "glass"
        ? `url(#${uid}-area)`
        : conAlfa(color, 0.1);
  const puntos = valores.map((v, i) => ({ i, v }));

  function mover(e: MouseEvent<SVGRectElement>) {
    const caja = e.currentTarget.getBoundingClientRect();
    const i = Math.max(0, Math.min(ultimo, Math.round(x.invert(e.clientX - caja.left))));
    setHover(i);
    onHover?.(i);
  }

  function salir() {
    setHover(null);
    onHover?.(null);
  }

  if (ancho <= 0 || alto <= 0) return null;

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={t.superficie === "glass" ? 0.3 : 0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id={`${uid}-sombra`} x="-10%" y="-50%" width="120%" height="200%">
          <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 3} stdDeviation={t.superficie === "glass" ? 3 : 2.5} floodColor={color} floodOpacity={0.5} />
        </filter>
      </defs>
      <AreaClosed data={puntos} x={(d) => x(d.i)} y={(d) => y(d.v)} yScale={y} curve={curvaVisx(t)} fill={rellenoArea} />
      <motion.g
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: t.animacion.duracion / 1000, ease: [0.22, 1, 0.36, 1] }}
      >
        <LinePath
          data={puntos}
          x={(d) => x(d.i)}
          y={(d) => y(d.v)}
          curve={curvaVisx(t)}
          stroke={color}
          strokeWidth={Math.max(t.grosorLinea, 1.5)}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={sombra ? `url(#${uid}-sombra)` : undefined}
        />
      </motion.g>
      {/* Último punto: pulso suave si hay animación */}
      {t.animacion.duracion > 0 && (
        <motion.circle
          cx={x(ultimo)}
          cy={y(valores[ultimo])}
          fill={color}
          initial={{ r: 3, opacity: 0.5 }}
          animate={{ r: 9, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: t.animacion.duracion / 1000 }}
        />
      )}
      <circle
        cx={x(ultimo)}
        cy={y(valores[ultimo])}
        r={3.5}
        fill={t.superficie === "contorno" ? t.fondoTarjeta : color}
        stroke={color}
        strokeWidth={t.superficie === "contorno" ? 2 : 0}
      />
      {hover !== null && (
        <g pointerEvents="none">
          <line x1={x(hover)} x2={x(hover)} y1={0} y2={alto} stroke={t.textoSuave} strokeDasharray="2 2" />
          <circle cx={x(hover)} cy={y(valores[hover])} r={3.5} fill={t.fondoTarjeta} stroke={color} strokeWidth={2} />
        </g>
      )}
      <rect x={0} y={0} width={ancho} height={alto} fill="transparent" onMouseMove={mover} onMouseLeave={salir} />
    </svg>
  );
}
