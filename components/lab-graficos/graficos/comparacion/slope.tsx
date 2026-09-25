"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, OBRAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { propsTexto, transicionLab, useUidSvg } from "./superficie-svg";

/** Margen operacional (%) por obra en dos cortes. */
function margenes() {
  const r = azar(607);
  return OBRAS.map((obra) => {
    const antes = Math.round((8 + r() * 14) * 10) / 10;
    return { obra, antes, despues: Math.round((antes + (r() - 0.45) * 9) * 10) / 10 };
  });
}

// Slope chart (visx): dos columnas de tiempo unidas por una línea por obra. Las que suben
// llevan el acento; las que bajan, gris. Pasar el mouse sobre una línea la aísla.
export function Slope({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <SlopeSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function SlopeSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => margenes(), []);
  const [activo, setActivo] = useState<string | null>(null);
  const uid = useUidSvg();
  const margen = { izq: 128, der: 128, arr: 30, aba: 10 };
  const xA = margen.izq;
  const xB = Math.max(ancho - margen.der, xA + 60);
  const valores = datos.flatMap((d) => [d.antes, d.despues]);
  const y = scaleLinear({ domain: [Math.min(...valores) - 1, Math.max(...valores) + 1], range: [alto - margen.aba, margen.arr] });
  const colorSube = t.acento;
  const colorBaja = t.oscuro ? t.textoSuave : t.colores[3 % t.colores.length];
  const sombra = t.superficie === "sombras" || t.superficie === "glass";

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Margen por obra, 2025 contra 2026" onMouseLeave={() => setActivo(null)}>
      <defs>
        {[colorSube, colorBaja].map((c, i) => (
          <linearGradient key={c + i} id={`${uid}-l${i}`} gradientUnits="userSpaceOnUse" x1={xA} x2={xB} y1="0" y2="0">
            <stop offset="0" stopColor={conAlfa(c, 0.3)} />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
        {[colorSube, colorBaja].map((c, i) => (
          <filter key={c + i} id={`${uid}-f${i}`} x="-20%" y="-50%" width="140%" height="200%">
            <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 4} stdDeviation={t.superficie === "glass" ? 4 : 3} floodColor={c} floodOpacity={0.45} />
          </filter>
        ))}
      </defs>
      {/* Columnas de tiempo */}
      {[
        { x: xA, texto: "2025" },
        { x: xB, texto: "2026" },
      ].map((c) => (
        <g key={c.texto}>
          <line x1={c.x} x2={c.x} y1={margen.arr - 6} y2={alto - margen.aba} stroke={t.grillaModo === "sin" ? "transparent" : t.eje} />
          <text x={c.x} y={12} textAnchor="middle" {...propsTexto(t, false)} fontWeight={600}>
            {c.texto}
          </text>
        </g>
      ))}
      {datos.map((d, i) => {
        const sube = d.despues >= d.antes;
        const k = sube ? 0 : 1;
        const color = sube ? colorSube : colorBaja;
        const esActivo = activo === d.obra;
        const tenue = activo !== null && !esActivo;
        const yA = y(d.antes);
        const yB = y(d.despues);
        const tr = transicionLab(t, (i * t.animacion.duracion) / 10000);
        const grosor = (esActivo ? 1.8 : 1) * Math.max(t.grosorLinea, 1.5);
        return (
          <g
            key={d.obra}
            opacity={tenue ? 0.18 : 1}
            onMouseEnter={() => setActivo(d.obra)}
            style={{ transition: "opacity 150ms", cursor: "default" }}
          >
            {/* Línea ancha invisible para facilitar el hover */}
            <line x1={xA} y1={yA} x2={xB} y2={yB} stroke="transparent" strokeWidth={14} />
            <motion.line
              x1={xA}
              y1={yA}
              stroke={t.superficie === "degradado" ? `url(#${uid}-l${k})` : color}
              strokeWidth={grosor}
              strokeLinecap="round"
              filter={sombra ? `url(#${uid}-f${k})` : undefined}
              initial={{ x2: xA, y2: yA }}
              animate={{ x2: xB, y2: yB }}
              transition={tr}
            />
            {[
              { cx: xA, cy: yA },
              { cx: xB, cy: yB },
            ].map((p, j) => (
              <circle
                key={j}
                cx={p.cx}
                cy={p.cy}
                r={esActivo ? 5 : 4}
                fill={t.superficie === "contorno" ? t.fondoTarjeta : color}
                stroke={color}
                strokeWidth={t.superficie === "contorno" ? 2 : 0}
              />
            ))}
            <text x={xA - 10} y={yA} dy="0.35em" textAnchor="end" {...propsTexto(t, !esActivo)} fontWeight={esActivo ? 600 : 400}>
              {d.obra.replace("Obra ", "")} · {formato.decimal(d.antes)}%
            </text>
            <text x={xB + 10} y={yB} dy="0.35em" {...propsTexto(t, !esActivo)} fontWeight={esActivo ? 600 : 400} fill={esActivo ? color : t.textoSuave}>
              {formato.decimal(d.despues)}%{esActivo ? ` (${sube ? "+" : "−"}${formato.decimal(Math.abs(d.despues - d.antes))})` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
