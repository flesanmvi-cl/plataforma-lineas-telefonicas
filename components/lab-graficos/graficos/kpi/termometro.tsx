"use client";

import { useState } from "react";
import { AxisLeft } from "@visx/axis";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { DefsSuperficie, estiloBloqueSvg, propsTexto, transicionLab, useUidSvg } from "../comparacion/superficie-svg";

/** Avance acumulado del año contra su meta anual (millones o %). */
const INDICADORES = [
  { nombre: "Ventas", real: 9.4, meta: 12, unidad: "MM" },
  { nombre: "Adjudicación", real: 7.8, meta: 8, unidad: "MM" },
  { nombre: "Cobranza", real: 5.1, meta: 9, unidad: "MM" },
  { nombre: "Contratación", real: 10.6, meta: 10, unidad: "MM" },
];

// Termómetro (visx + motion): progreso vertical de cada indicador contra su meta anual. El
// relleno sube desde el bulbo; la meta es una marca horizontal. Pasar el mouse muestra el detalle.
export function Termometro({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <TermometroSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function TermometroSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const [activo, setActivo] = useState<number | null>(null);
  const uid = useUidSvg();
  const izq = t.grillaModo === "sin" ? 8 : 34;
  const x = scaleBand({ domain: INDICADORES.map((d) => d.nombre), range: [izq, ancho - 8], padding: 0.3 });
  const tubo = Math.min(Math.max(x.bandwidth() * 0.28, 10), 18);
  const bulbo = tubo * 0.95;
  // Abajo queda espacio para el bulbo y los dos rótulos (nombre y detalle).
  const margen = { izq, der: 8, arr: 26, aba: bulbo * 2 + 34 };
  // Cada indicador se muestra como % de su meta; el tope de la escala es 120%.
  const y = scaleLinear({ domain: [0, 120], range: [alto - margen.aba, margen.arr] });
  const colorOk = t.acento;
  const colorBajo = t.oscuro ? t.textoSuave : t.colores[2 % t.colores.length];

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Avance anual contra meta por indicador">
      <DefsSuperficie uid={uid} colores={[colorOk, colorBajo]} t={t} />
      {t.grillaModo !== "sin" && (
        <>
          {[0, 50, 100].map((v) => (
            <line
              key={v}
              x1={margen.izq}
              x2={ancho - margen.der}
              y1={y(v)}
              y2={y(v)}
              stroke={t.grilla}
              strokeDasharray={t.grillaModo === "minima" ? "3 3" : undefined}
            />
          ))}
          <AxisLeft
            scale={y}
            left={margen.izq - 4}
            tickValues={t.grillaModo === "completa" ? [0, 25, 50, 75, 100, 120] : [0, 50, 100]}
            tickFormat={(v) => `${v}%`}
            hideAxisLine
            hideTicks
            tickLabelProps={() => ({ ...propsTexto(t, true, t.tamano.eje - 1), textAnchor: "end", dy: "0.33em" })}
          />
        </>
      )}
      {INDICADORES.map((d, i) => {
        const pct = (d.real / d.meta) * 100;
        const cumple = pct >= 100;
        const k = cumple ? 0 : 1;
        const color = cumple ? colorOk : colorBajo;
        const cx = (x(d.nombre) ?? 0) + x.bandwidth() / 2;
        const base = y(0);
        const tope = y(Math.min(pct, 120));
        const tenue = activo !== null && activo !== i;
        const estilo = estiloBloqueSvg(t, uid, k, color);
        return (
          <g
            key={d.nombre}
            opacity={tenue ? 0.35 : 1}
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
            style={{ transition: "opacity 150ms", cursor: "default" }}
          >
            <rect x={x(d.nombre)} y={margen.arr - 20} width={x.bandwidth()} height={alto - margen.arr + 20} fill="transparent" />
            {/* Tubo vacío */}
            <rect
              x={cx - tubo / 2}
              y={y(120)}
              width={tubo}
              height={base - y(120) + bulbo}
              rx={tubo / 2}
              fill={t.superficie === "contorno" ? "transparent" : conAlfa(t.texto, t.oscuro ? 0.08 : 0.06)}
              stroke={t.superficie === "contorno" ? t.eje : undefined}
            />
            <circle cx={cx} cy={base + bulbo} r={bulbo} fill={estilo.fill} stroke={estilo.stroke} strokeWidth={estilo.strokeWidth} filter={estilo.filter} />
            {/* Relleno que sube desde el bulbo */}
            <motion.rect
              x={cx - tubo * 0.3}
              width={tubo * 0.6}
              rx={tubo * 0.3}
              {...estilo}
              initial={{ y: base, height: bulbo }}
              animate={{ y: tope, height: base - tope + bulbo }}
              transition={transicionLab(t, i * 0.1)}
            />
            {/* Meta (100%) */}
            <line x1={cx - tubo} x2={cx + tubo} y1={y(100)} y2={y(100)} stroke={t.texto} strokeWidth={2} strokeLinecap="round" />
            {i === 0 && (
              <text x={cx + tubo + 4} y={y(100)} dy="0.35em" {...propsTexto(t, true, t.tamano.eje - 1)}>
                Meta
              </text>
            )}
            <motion.text
              x={cx}
              textAnchor="middle"
              {...propsTexto(t, false)}
              fontWeight={600}
              initial={{ y: base - 8, opacity: 0 }}
              animate={{ y: tope - 8, opacity: 1 }}
              transition={transicionLab(t, i * 0.1)}
            >
              {formato.porcentaje(pct)}
            </motion.text>
            <text x={cx} y={alto - 16} textAnchor="middle" {...propsTexto(t, activo !== i)} fontWeight={activo === i ? 600 : 400}>
              {d.nombre}
            </text>
            <text x={cx} y={alto - 2} textAnchor="middle" {...propsTexto(t, true, t.tamano.eje - 1)}>
              {activo === i ? `${formato.decimal(d.real)} de ${formato.decimal(d.meta, 0)} ${d.unidad}` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
