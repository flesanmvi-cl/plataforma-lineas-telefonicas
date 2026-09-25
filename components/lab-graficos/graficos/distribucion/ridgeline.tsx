"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area, LinePath } from "@visx/shape";
import { AxisBottom } from "@visx/axis";
import { GridColumns } from "@visx/grid";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, muestras, OBRAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { curvaVisx } from "../composicion/utilidades";
import { kde, rango, resumen } from "./estadistica";

// Ridgeline: una curva de densidad por obra, apiladas con traslape. Compara la forma de
// muchas distribuciones en poco alto. Al pasar el mouse por una fila se destaca y muestra su mediana.
export function Ridgeline({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <RidgelineSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function RidgelineSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const uid = useId().replace(/:/g, "");
  const [activo, setActivo] = useState<string | null>(null);
  const filas = useMemo(() => {
    const todas = muestras(OBRAS, 70, 83);
    const min = Math.floor(Math.min(...todas.map((m) => m.valor)) / 10) * 10;
    const max = Math.ceil(Math.max(...todas.map((m) => m.valor)) / 10) * 10;
    const puntos = rango(min, max, 70);
    return {
      min,
      max,
      filas: OBRAS.map((o) => {
        const valores = todas.filter((m) => m.grupo === o).map((m) => m.valor);
        return { obra: o, densidad: kde(valores, puntos), est: resumen(valores) };
      }),
    };
  }, []);

  const margen = { arriba: 6, abajo: 22, izq: 70, der: t.etiquetas === "directas" ? 40 : 10 };
  const n = filas.filas.length;
  const paso = (alto - margen.arriba - margen.abajo) / (n + 0.8);
  const altoCresta = paso * 1.8;
  const x = scaleLinear({ domain: [filas.min, filas.max], range: [margen.izq, ancho - margen.der] });
  const maxDens = Math.max(...filas.filas.flatMap((f) => f.densidad.map((d) => d.d)));
  const h = scaleLinear({ domain: [0, maxDens], range: [0, altoCresta] });
  const curva = curvaVisx(t);
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Distribución del rendimiento por obra">
      <defs>
        {filas.filas.map((f, i) => {
          const c = t.colores[i % t.colores.length];
          return (
            <linearGradient key={f.obra} id={`${uid}-g${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={conAlfa(c, 0.85)} />
              <stop offset="1" stopColor={conAlfa(c, 0.08)} />
            </linearGradient>
          );
        })}
        <filter id={`${uid}-sombra`} x="-5%" y="-40%" width="110%" height="180%">
          <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : -2} stdDeviation="4" floodColor={t.acento} floodOpacity="0.35" />
        </filter>
      </defs>
      {t.grillaModo !== "sin" ? (
        <GridColumns
          scale={x}
          top={margen.arriba}
          height={alto - margen.arriba - margen.abajo}
          numTicks={6}
          stroke={t.grilla}
          strokeDasharray={t.grillaModo === "minima" ? "4 4" : undefined}
        />
      ) : null}
      {filas.filas.map((f, i) => {
        const c = t.colores[i % t.colores.length];
        const base = margen.arriba + paso * (i + 1.8);
        const tenue = activo !== null && activo !== f.obra;
        const relleno =
          t.superficie === "degradado"
            ? `url(#${uid}-g${i})`
            : t.superficie === "contorno"
              ? conAlfa(c, 0.1)
              : t.superficie === "glass"
                ? conAlfa(c, 0.55)
                : conAlfa(c, 0.82);
        return (
          <g
            key={f.obra}
            onMouseEnter={() => setActivo(f.obra)}
            onMouseLeave={() => setActivo(null)}
            opacity={tenue ? 0.25 : 1}
            style={{ transition: "opacity 150ms" }}
          >
            <text x={margen.izq - 8} y={base} dy="-0.2em" textAnchor="end" fill={activo === f.obra ? t.texto : t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
              {f.obra.replace("Obra ", "")}
            </text>
            <motion.g
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: t.animacion.duracion / 1000, delay: (i * t.animacion.duracion) / 7000, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
            >
              <Area
                data={f.densidad}
                x={(d) => x(d.x)}
                y0={base}
                y1={(d) => base - h(d.d)}
                curve={curva}
                fill={relleno}
                stroke={t.fondoTarjeta}
                strokeWidth={t.superficie === "contorno" ? 0 : 1}
              />
              <LinePath
                data={f.densidad}
                x={(d) => x(d.x)}
                y={(d) => base - h(d.d)}
                curve={curva}
                stroke={c}
                strokeWidth={t.superficie === "contorno" ? t.grosorLinea : Math.max(1, t.grosorLinea - 0.5)}
                filter={conSombra ? `url(#${uid}-sombra)` : undefined}
              />
            </motion.g>
            {activo === f.obra || t.etiquetas === "directas" ? (
              <g pointerEvents="none">
                <line x1={x(f.est.mediana)} x2={x(f.est.mediana)} y1={base} y2={base - h(maxDens) * 0.55} stroke={t.texto} strokeDasharray="3 3" />
                <text
                  x={activo === f.obra ? x(f.est.mediana) + 4 : ancho - margen.der + 4}
                  y={activo === f.obra ? base - h(maxDens) * 0.55 : base}
                  dy={activo === f.obra ? "0.9em" : "-0.2em"}
                  fill={t.texto}
                  fontFamily={t.fuente}
                  fontSize={t.tamano.eje - 1}
                  fontWeight={600}
                  paintOrder="stroke"
                  stroke={t.fondoTarjeta}
                  strokeWidth={3}
                >
                  {activo === f.obra ? `Mediana ${formato.decimal(f.est.mediana)}` : formato.decimal(f.est.mediana)}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      <AxisBottom
        scale={x}
        top={alto - margen.abajo}
        numTicks={6}
        hideTicks
        stroke={t.eje}
        tickFormat={(v) => formato.entero(Number(v))}
        tickLabelProps={() => ({ fill: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, textAnchor: "middle", dy: "0.2em" })}
      />
    </svg>
  );
}
