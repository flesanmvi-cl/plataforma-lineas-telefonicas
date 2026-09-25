"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, REGIONES_CORTAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { DefsSuperficie, estiloBloqueSvg, propsTexto, transicionLab, useUidSvg } from "./superficie-svg";

/** Obras adjudicadas por región, ordenadas de mayor a menor. */
function adjudicadas() {
  const r = azar(503);
  return REGIONES_CORTAS.map((region) => ({ region, valor: Math.round(4 + r() * 38) })).sort((a, b) => b.valor - a.valor);
}

// Lollipop ordenado (visx + motion): tallo y punto entran desde cero en cascada. Sobre el
// promedio, acento; bajo el promedio, gris de apoyo. Pasar el mouse resalta la fila.
export function Lollipop({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <LollipopSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function LollipopSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => adjudicadas(), []);
  const [activo, setActivo] = useState<string | null>(null);
  const uid = useUidSvg();
  const promedio = datos.reduce((s, d) => s + d.valor, 0) / datos.length;
  const margen = { izq: 92, der: 36, arr: 18, aba: 4 };
  const x = scaleLinear({ domain: [0, Math.max(...datos.map((d) => d.valor)) * 1.05], range: [margen.izq, ancho - margen.der] });
  const y = scaleBand({ domain: datos.map((d) => d.region), range: [margen.arr, alto - margen.aba], padding: 0.2 });
  const colorAlto = t.acento;
  const colorBajo = t.oscuro ? t.textoSuave : t.colores[2 % t.colores.length];
  const radioPunto = Math.max(4, Math.min(y.bandwidth() / 2.6, 8));

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Obras adjudicadas por región">
      <DefsSuperficie uid={uid} colores={[colorAlto, colorBajo]} t={t} />
      {/* Promedio como referencia */}
      <line x1={x(promedio)} x2={x(promedio)} y1={margen.arr - 4} y2={alto - margen.aba} stroke={t.textoSuave} strokeDasharray="3 3" />
      <text x={x(promedio)} y={margen.arr - 8} textAnchor="middle" {...propsTexto(t)}>
        Promedio {formato.decimal(promedio)}
      </text>
      {datos.map((d, i) => {
        const cy = (y(d.region) ?? 0) + y.bandwidth() / 2;
        const sobre = d.valor >= promedio;
        const color = sobre ? colorAlto : colorBajo;
        const tenue = activo !== null && activo !== d.region;
        const estilo = estiloBloqueSvg(t, uid, sobre ? 0 : 1, color);
        const tr = transicionLab(t, (i * t.animacion.duracion) / 9000);
        return (
          <g
            key={d.region}
            opacity={tenue ? 0.3 : 1}
            onMouseEnter={() => setActivo(d.region)}
            onMouseLeave={() => setActivo(null)}
            style={{ transition: "opacity 150ms", cursor: "default" }}
          >
            {/* Franja de la fila activa */}
            <rect
              x={0}
              y={y(d.region)}
              width={ancho}
              height={y.bandwidth()}
              fill={activo === d.region ? conAlfa(color, 0.07) : "transparent"}
              rx={Math.min(t.radio / 2, 6)}
            />
            <text x={margen.izq - 12} y={cy} dy="0.35em" textAnchor="end" {...propsTexto(t, activo !== d.region)}>
              {d.region}
            </text>
            <motion.line
              x1={margen.izq}
              y1={cy}
              y2={cy}
              stroke={conAlfa(color, t.superficie === "contorno" ? 0.6 : 0.85)}
              strokeWidth={Math.max(1.5, t.grosorLinea)}
              strokeLinecap="round"
              initial={{ x2: margen.izq }}
              animate={{ x2: x(d.valor) }}
              transition={tr}
            />
            <motion.circle
              cy={cy}
              r={radioPunto}
              {...estilo}
              strokeWidth={t.superficie === "contorno" ? 2 : estilo.strokeWidth}
              initial={{ cx: margen.izq }}
              animate={{ cx: x(d.valor) }}
              transition={tr}
            />
            <motion.text
              y={cy}
              dy="0.35em"
              {...propsTexto(t, false)}
              fontWeight={600}
              initial={{ x: margen.izq + radioPunto + 6, opacity: 0 }}
              animate={{ x: x(d.valor) + radioPunto + 6, opacity: 1 }}
              transition={tr}
            >
              {d.valor}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}
