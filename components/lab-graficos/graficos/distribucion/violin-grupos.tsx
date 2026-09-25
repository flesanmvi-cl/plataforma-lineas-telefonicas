"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Area } from "@visx/shape";
import { AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, muestras, OBRAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { curvaVisx } from "../composicion/utilidades";
import { kde, rango, resumen } from "./estadistica";

const GRUPOS = OBRAS.slice(0, 4);

// Violín por obra (KDE calculado a mano): la forma completa de la distribución más la caja
// interior con cuartiles y mediana. Al pasar el mouse se destaca la obra y aparece su resumen.
export function ViolinGrupos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <ViolinSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function ViolinSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const uid = useId().replace(/:/g, "");
  const [activo, setActivo] = useState<string | null>(null);
  const grupos = useMemo(() => {
    const todas = muestras(GRUPOS, 90, 51);
    const min = Math.min(...todas.map((m) => m.valor));
    const max = Math.max(...todas.map((m) => m.valor));
    const puntos = rango(min - 6, max + 6, 60);
    return GRUPOS.map((g) => {
      const valores = todas.filter((m) => m.grupo === g).map((m) => m.valor);
      return { grupo: g, densidad: kde(valores, puntos), est: resumen(valores) };
    });
  }, []);

  const margen = { arriba: 8, abajo: 22, izq: 34, der: 8 };
  const dominio = [grupos[0].densidad[0].x, grupos[0].densidad[grupos[0].densidad.length - 1].x];
  const y = scaleLinear({ domain: dominio, range: [alto - margen.abajo, margen.arriba], nice: true });
  const x = scaleBand({ domain: GRUPOS, range: [margen.izq, ancho - margen.der], padding: 0.12 });
  const maxDens = Math.max(...grupos.flatMap((g) => g.densidad.map((d) => d.d)));
  const mitad = x.bandwidth() / 2;
  const w = scaleLinear({ domain: [0, maxDens], range: [0, mitad] });
  const curva = curvaVisx(t);
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";
  const directas = t.etiquetas === "directas";

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Distribución del rendimiento semanal por obra">
      <defs>
        {grupos.map((g, i) => {
          const c = t.colores[i % t.colores.length];
          return (
            <linearGradient key={g.grupo} id={`${uid}-g${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={conAlfa(c, 0.25)} />
              <stop offset="0.5" stopColor={c} />
              <stop offset="1" stopColor={conAlfa(c, 0.25)} />
            </linearGradient>
          );
        })}
        <filter id={`${uid}-sombra`} x="-30%" y="-20%" width="160%" height="140%">
          <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 4} stdDeviation="5" floodColor={t.acento} floodOpacity="0.35" />
        </filter>
      </defs>
      {t.grillaModo !== "sin" ? (
        <GridRows
          scale={y}
          left={margen.izq}
          width={ancho - margen.izq - margen.der}
          numTicks={5}
          stroke={t.grilla}
          strokeDasharray={t.grillaModo === "minima" ? "4 4" : undefined}
        />
      ) : null}
      <AxisLeft
        scale={y}
        left={margen.izq}
        numTicks={5}
        hideAxisLine
        hideTicks
        tickFormat={(v) => formato.entero(Number(v))}
        tickLabelProps={() => ({ fill: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, textAnchor: "end", dx: -4, dy: "0.33em" })}
      />
      {grupos.map((g, i) => {
        const c = t.colores[i % t.colores.length];
        const cx = (x(g.grupo) ?? 0) + mitad;
        const tenue = activo !== null && activo !== g.grupo;
        const relleno =
          t.superficie === "degradado"
            ? `url(#${uid}-g${i})`
            : t.superficie === "contorno"
              ? conAlfa(c, 0.14)
              : t.superficie === "glass"
                ? conAlfa(c, 0.7)
                : c;
        const anchoCaja = Math.max(4, mitad * 0.14);
        return (
          <g
            key={g.grupo}
            onMouseEnter={() => setActivo(g.grupo)}
            onMouseLeave={() => setActivo(null)}
            opacity={tenue ? 0.3 : 1}
            style={{ transition: "opacity 150ms", cursor: "default" }}
          >
            <motion.g
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: t.animacion.duracion / 1000, delay: (i * t.animacion.duracion) / 6000, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <Area
                data={g.densidad}
                x0={(d) => cx - w(d.d)}
                x1={(d) => cx + w(d.d)}
                y={(d) => y(d.x)}
                curve={curva}
                fill={relleno}
                stroke={t.superficie === "contorno" ? c : t.superficie === "glass" ? "rgba(255,255,255,0.5)" : "none"}
                strokeWidth={t.superficie === "contorno" ? 1.5 : 1}
                filter={conSombra ? `url(#${uid}-sombra)` : undefined}
              />
            </motion.g>
            {/* Caja interior: cuartiles y mediana */}
            <rect
              x={cx - anchoCaja / 2}
              y={y(g.est.q3)}
              width={anchoCaja}
              height={Math.max(1, y(g.est.q1) - y(g.est.q3))}
              rx={Math.min(t.radio / 3, anchoCaja / 2)}
              fill={t.superficie === "contorno" ? c : t.fondoTarjeta}
              opacity={0.9}
            />
            <circle cx={cx} cy={y(g.est.mediana)} r={3} fill={t.superficie === "contorno" ? t.fondoTarjeta : t.texto} />
            <text x={cx} y={alto - 6} textAnchor="middle" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
              {g.grupo.replace("Obra ", "")}
            </text>
            {directas || activo === g.grupo ? (
              <text
                x={cx + anchoCaja / 2 + 4}
                y={y(g.est.mediana)}
                dy="0.35em"
                fill={t.texto}
                fontFamily={t.fuente}
                fontSize={t.tamano.eje - 1}
                fontWeight={600}
                paintOrder="stroke"
                stroke={t.fondoTarjeta}
                strokeWidth={3}
              >
                {formato.decimal(g.est.mediana)}
              </text>
            ) : null}
          </g>
        );
      })}
      {activo ? <ResumenFlotante t={t} est={grupos.find((g) => g.grupo === activo)!.est} nombre={activo} ancho={ancho} /> : null}
    </svg>
  );
}

function ResumenFlotante({ t, est, nombre, ancho }: { t: TokensLab; est: ReturnType<typeof resumen>; nombre: string; ancho: number }) {
  const lineas = [nombre, `Mediana ${formato.decimal(est.mediana)}`, `Q1–Q3 ${formato.decimal(est.q1)} – ${formato.decimal(est.q3)}`, `n = ${est.n}`];
  const w = 150;
  return (
    <g transform={`translate(${ancho - w - 4}, 4)`} pointerEvents="none">
      <rect width={w} height={lineas.length * 15 + 10} rx={Math.min(t.radio, 10)} fill={t.tooltip.fondo} stroke={t.tooltip.borde} />
      {lineas.map((l, i) => (
        <text key={l} x={10} y={18 + i * 15} fill={t.tooltip.texto} fontFamily={t.fuente} fontSize={11} fontWeight={i === 0 ? 700 : 400}>
          {l}
        </text>
      ))}
    </g>
  );
}
