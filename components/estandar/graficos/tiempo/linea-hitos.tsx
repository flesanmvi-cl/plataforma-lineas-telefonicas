"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/estandar/tema-context";
import type { PropsGraficoLab } from "@/components/estandar/tipos";
import { HITOS, TAREAS } from "@/lib/estandar/datos";
import { conAlfa, type TokensLab } from "@/lib/estandar/tema";

const HOY = 100;
const FIN = 180;
const INICIO_OBRA = Date.UTC(2026, 2, 2);

function fechaDeDia(dia: number) {
  return new Date(INICIO_OBRA + dia * 86400000).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

// Tramos por fase, a partir de las tareas (desde la primera que parte hasta la última que termina).
function tramosPorFase() {
  const fases = new Map<string, { desde: number; hasta: number }>();
  for (const x of TAREAS) {
    const f = fases.get(x.fase);
    const hasta = x.inicio + x.duracion;
    fases.set(x.fase, f ? { desde: Math.min(f.desde, x.inicio), hasta: Math.max(f.hasta, hasta) } : { desde: x.inicio, hasta });
  }
  return Array.from(fases, ([fase, r]) => ({ fase, ...r }));
}

// Línea de tiempo de obra: fases como tramos, avance hasta hoy y los hitos como rombos.
// Pasar el mouse o enfocar un hito (teclado) muestra su ficha.
export function LineaHitos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize debounceTime={40}>{({ width }) => (width > 0 ? <LineaHitosSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function LineaHitosSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fases = useMemo(tramosPorFase, []);
  const [activo, setActivo] = useState<number | null>(null);
  const m = { izq: 18, der: 18 };
  const x = scaleLinear({ domain: [0, FIN], range: [m.izq, ancho - m.der] });
  const ejeY = alto * 0.5;
  const dur = t.animacion.duracion / 1000;
  const acento = t.acento;
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";
  const rellenoAvance =
    t.superficie === "degradado" ? `url(#${uid}-grad)` : t.superficie === "contorno" ? conAlfa(acento, 0.2) : t.superficie === "glass" ? conAlfa(acento, 0.8) : acento;

  const hito = activo !== null ? HITOS[activo] : null;

  return (
    <div style={{ position: "relative", width: ancho, height: alto }}>
      <svg width={ancho} height={alto} role="img" aria-label="Línea de tiempo de la obra con hitos">
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={conAlfa(acento, 0.35)} />
            <stop offset="1" stopColor={acento} />
          </linearGradient>
          <filter id={`${uid}-sombra`} x="-10%" y="-100%" width="120%" height="300%">
            <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 4} stdDeviation="4" floodColor={acento} floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Fases como tramos bajo el eje */}
        {fases.map((f, k) => {
          const color = t.colores[(k + 1) % t.colores.length];
          const y0 = ejeY + 22;
          return (
            <g key={f.fase}>
              <motion.rect
                x={x(f.desde)}
                y={y0 + (k % 2) * 16}
                height={10}
                rx={Math.min(t.radio / 3, 5)}
                fill={t.superficie === "contorno" ? conAlfa(color, 0.15) : conAlfa(color, 0.55)}
                stroke={t.superficie === "contorno" ? color : undefined}
                initial={{ width: 0 }}
                animate={{ width: x(f.hasta) - x(f.desde) }}
                transition={{ duration: dur, delay: dur * 0.15 * k, ease: [0.22, 1, 0.36, 1] }}
              />
              <text x={x(f.desde)} y={y0 + (k % 2) * 16 + 22} fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje - 1}>
                {f.fase}
              </text>
            </g>
          );
        })}

        {/* Riel y avance hasta hoy */}
        <rect x={x(0)} y={ejeY - 3} width={x(FIN) - x(0)} height={6} rx={3} fill={t.grilla} />
        <motion.rect
          x={x(0)}
          y={ejeY - 3}
          height={6}
          rx={3}
          fill={rellenoAvance}
          stroke={t.superficie === "contorno" ? acento : undefined}
          filter={conSombra ? `url(#${uid}-sombra)` : undefined}
          initial={{ width: 0 }}
          animate={{ width: x(HOY) - x(0) }}
          transition={{ duration: dur * 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <line x1={x(HOY)} x2={x(HOY)} y1={ejeY - 30} y2={ejeY + 12} stroke={t.texto} strokeWidth={1.5} />
        <text x={x(HOY)} y={ejeY - 34} textAnchor="middle" fill={t.texto} fontFamily={t.fuente} fontSize={t.tamano.eje} fontWeight={600}>
          Hoy
        </text>

        {/* Hitos */}
        {HITOS.map((h, i) => {
          const cumplido = h.dia <= HOY;
          const cx = x(h.dia);
          const arriba = i % 2 === 0;
          const esActivo = activo === i;
          const tam = esActivo ? 9 : 7;
          const anclaje = i === 0 ? "start" : i === HITOS.length - 1 ? "end" : "middle";
          return (
            <g
              key={h.nombre}
              role="button"
              tabIndex={0}
              aria-label={`${h.nombre}, día ${h.dia}, ${cumplido ? "cumplido" : "pendiente"}`}
              onMouseEnter={() => setActivo(i)}
              onMouseLeave={() => setActivo(null)}
              onFocus={() => setActivo(i)}
              onBlur={() => setActivo(null)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {arriba && <line x1={cx} x2={cx} y1={ejeY - 44} y2={ejeY} stroke={t.eje} strokeDasharray="2 3" />}
              <g transform={`rotate(45 ${cx} ${ejeY})`}>
                <motion.rect
                  x={cx - tam}
                  y={ejeY - tam}
                  width={tam * 2}
                  height={tam * 2}
                  rx={Math.min(t.radio / 4, 3)}
                  fill={cumplido ? acento : t.fondoTarjeta}
                  stroke={cumplido ? (esActivo ? t.texto : acento) : t.textoSuave}
                  strokeWidth={cumplido ? (esActivo ? 2 : 0) : 2}
                  filter={conSombra && cumplido ? `url(#${uid}-sombra)` : undefined}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: dur * 0.6, delay: dur * 0.4 + i * dur * 0.2, type: t.tema.animacion === "expresiva" ? "spring" : "tween" }}
                  style={{ transformOrigin: "center", transformBox: "fill-box" }}
                />
              </g>
              <text
                x={cx}
                y={arriba ? ejeY - 52 : ejeY - 20}
                textAnchor={anclaje}
                fill={t.texto}
                fontFamily={t.fuente}
                fontSize={t.tamano.eje}
                fontWeight={esActivo ? 700 : 500}
              >
                {h.nombre}
              </text>
              {/* Zona de toque más amplia que el rombo */}
              <rect x={cx - 16} y={ejeY - 16} width={32} height={32} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {hito && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: Math.min(dur, 0.2) }}
          style={{
            position: "absolute",
            pointerEvents: "none",
            top: 4,
            left: Math.min(Math.max(0, x(hito.dia) - 90), ancho - 180),
            width: 180,
            background: t.tooltip.fondo,
            color: t.tooltip.texto,
            border: `1px solid ${t.tooltip.borde}`,
            boxShadow: t.tooltip.sombra,
            borderRadius: Math.min(t.radio, 12),
            padding: "6px 10px",
            fontFamily: t.fuente,
            fontSize: 12,
            backdropFilter: t.tema.tooltip === "tarjeta" ? "blur(10px)" : undefined,
          }}
        >
          <div style={{ fontWeight: 600 }}>{hito.nombre}</div>
          <div style={{ opacity: 0.75 }}>
            Día {hito.dia} · {fechaDeDia(hito.dia)}
          </div>
          <div style={{ opacity: 0.75 }}>{hito.dia <= HOY ? "Cumplido" : `Faltan ${hito.dia - HOY} días`}</div>
        </motion.div>
      )}
    </div>
  );
}
