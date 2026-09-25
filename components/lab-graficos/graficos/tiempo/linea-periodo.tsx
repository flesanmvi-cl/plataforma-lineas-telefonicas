"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AnimatePresence, motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, MESES } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

type Periodo = "mes" | "trimestre" | "anio";
const PERIODOS: { id: Periodo; nombre: string; detalle: string }[] = [
  { id: "mes", nombre: "Mes", detalle: "últimos 12 meses" },
  { id: "trimestre", nombre: "Trimestre", detalle: "últimos 8 trimestres" },
  { id: "anio", nombre: "Año", detalle: "últimos 5 años" },
];
const ANIO_INICIAL = 2022;
// Muestras fijas del trazo: con la misma cantidad de comandos, motion puede interpolar el path.
const MUESTRAS = 48;

// Facturación mensual (MM$) de 5 años: tendencia, estacionalidad y ruido.
function facturacion() {
  const r = azar(81);
  return Array.from({ length: 60 }, (_, i) => Math.round(80 + i * 1.6 + 18 * Math.sin(((i % 12) / 12) * Math.PI * 2 - 1) + (r() - 0.5) * 24));
}

function agrupar(mensual: number[], periodo: Periodo) {
  if (periodo === "mes") return mensual.slice(-12).map((valor, i) => ({ etiqueta: MESES[i], valor }));
  if (periodo === "trimestre") {
    return Array.from({ length: 8 }, (_, k) => {
      const desde = 60 - 24 + k * 3;
      const valor = mensual.slice(desde, desde + 3).reduce((a, b) => a + b, 0);
      const anio = ANIO_INICIAL + Math.floor(desde / 12);
      return { etiqueta: `T${Math.floor((desde % 12) / 3) + 1} ${String(anio).slice(2)}`, valor };
    });
  }
  return Array.from({ length: 5 }, (_, k) => ({
    etiqueta: String(ANIO_INICIAL + k),
    valor: mensual.slice(k * 12, k * 12 + 12).reduce((a, b) => a + b, 0),
  }));
}

/** Valor interpolado en la posición u (0..n-1) según la curva del tema. */
function interpolar(v: number[], u: number, curva: TokensLab["curva"]) {
  const i = Math.min(v.length - 2, Math.floor(u));
  const f = u - i;
  if (curva === "escalonada") return v[Math.round(u)];
  if (curva === "recta") return v[i] + (v[i + 1] - v[i]) * f;
  // Catmull-Rom
  const p0 = v[Math.max(0, i - 1)];
  const p1 = v[i];
  const p2 = v[i + 1];
  const p3 = v[Math.min(v.length - 1, i + 2)];
  const f2 = f * f;
  const f3 = f2 * f;
  return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
}

// Línea que se transforma al cambiar el período: el trazo, el área y la escala se animan
// entre Mes, Trimestre y Año en vez de redibujarse de golpe.
export function LineaPeriodo({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize debounceTime={40}>{({ width }) => (width > 0 ? <LineaPeriodoSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function LineaPeriodoSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const mensual = useMemo(facturacion, []);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [hover, setHover] = useState<number | null>(null);
  const puntos = useMemo(() => agrupar(mensual, periodo), [mensual, periodo]);

  const cabecera = 32;
  const m = { izq: 44, der: 16, sup: cabecera + 8, inf: 22 };
  const x = scaleLinear({ domain: [0, puntos.length - 1], range: [m.izq, ancho - m.der] });
  const maxNice = scaleLinear({ domain: [0, Math.max(...puntos.map((p) => p.valor)) * 1.1] }).nice(4).domain()[1];
  const y = scaleLinear({ domain: [0, maxNice], range: [alto - m.inf, m.sup] });
  const valores = puntos.map((p) => p.valor);
  const color = t.acento;
  const dur = t.animacion.duracion / 1000;
  const transicion = { duration: dur, ease: [0.22, 1, 0.36, 1] as const };

  // Trazo muestreado: dos vértices por muestra para que la versión escalonada tenga la misma forma de comandos.
  const trazo = (() => {
    const vertices: [number, number][] = [];
    let previo = interpolar(valores, 0, t.curva);
    for (let s = 0; s <= MUESTRAS; s++) {
      const u = (s / MUESTRAS) * (valores.length - 1);
      const v = interpolar(valores, u, t.curva);
      const px = x(u);
      vertices.push([px, y(t.curva === "escalonada" ? previo : v)], [px, y(v)]);
      previo = v;
    }
    const linea = vertices.map(([a, b], i) => `${i === 0 ? "M" : "L"}${a.toFixed(1)},${b.toFixed(1)}`).join("");
    const base = y(0).toFixed(1);
    const area = `${linea}L${x(valores.length - 1).toFixed(1)},${base}L${x(0).toFixed(1)},${base}Z`;
    return { linea, area };
  })();

  const relleno =
    t.superficie === "degradado" || t.superficie === "glass" ? `url(#${uid}-grad)` : t.superficie === "contorno" ? "transparent" : conAlfa(color, 0.12);
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";
  const total = valores.reduce((a, b) => a + b, 0);
  const detalle = PERIODOS.find((p) => p.id === periodo)!.detalle;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: "relative", width: ancho, height: alto }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: cabecera, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <b style={{ color: t.texto, fontSize: t.tamano.etiqueta }}>{formato.millones(total)}</b> · {detalle}
        </div>
        <div role="group" aria-label="Período" style={{ display: "inline-flex", padding: 2, gap: 2, borderRadius: 999, background: conAlfa(t.textoSuave, 0.1) }}>
          {PERIODOS.map((p) => {
            const activo = p.id === periodo;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={activo}
                onClick={() => {
                  setPeriodo(p.id);
                  setHover(null);
                }}
                style={{
                  position: "relative",
                  border: 0,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "transparent",
                  color: activo ? t.texto : t.textoSuave,
                  fontFamily: t.fuente,
                  fontSize: t.tamano.eje,
                  fontWeight: activo ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {activo && (
                  <motion.span
                    layoutId={`${uid}-pastilla`}
                    transition={{ duration: Math.min(dur, 0.35), ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "absolute", inset: 0, borderRadius: 999, background: t.fondoTarjeta, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                  />
                )}
                <span style={{ position: "relative" }}>{p.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      <svg width={ancho} height={alto} role="img" aria-label={`Facturación, ${detalle}`}>
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={t.superficie === "glass" ? 0.3 : 0.45} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={`${uid}-sombra`} x="-5%" y="-30%" width="110%" height="160%">
            <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 6} stdDeviation="5" floodColor={color} floodOpacity="0.45" />
          </filter>
        </defs>

        {ticks.map((f) => {
          const py = y(maxNice * f);
          return (
            <g key={f}>
              {t.grillaModo !== "sin" && (
                <line x1={m.izq} x2={ancho - m.der} y1={py} y2={py} stroke={t.grilla} strokeDasharray={t.grillaModo === "minima" ? "4 4" : undefined} />
              )}
              <text x={m.izq - 6} y={py} dy="0.33em" textAnchor="end" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
                {formato.entero(maxNice * f)}
              </text>
            </g>
          );
        })}

        <motion.path initial={false} animate={{ d: trazo.area }} transition={transicion} fill={relleno} />
        <motion.path
          initial={false}
          animate={{ d: trazo.linea }}
          transition={transicion}
          fill="none"
          stroke={color}
          strokeWidth={t.grosorLinea}
          strokeLinejoin="round"
          filter={conSombra ? `url(#${uid}-sombra)` : undefined}
        />

        <AnimatePresence>
          {puntos.map((p, i) => (
            <motion.g key={`${periodo}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur * 0.5, delay: dur * 0.6 }}>
              <text x={x(i)} y={alto - 6} textAnchor="middle" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
                {p.etiqueta}
              </text>
              <circle cx={x(i)} cy={y(p.valor)} r={hover === i ? 5 : 3} fill={t.fondoTarjeta} stroke={color} strokeWidth={2} />
              {t.etiquetas === "directas" && (puntos.length <= 8 || hover === i) && (
                <text x={x(i)} y={y(p.valor) - 9} textAnchor="middle" fill={t.texto} fontFamily={t.fuente} fontSize={t.tamano.eje} fontWeight={600}>
                  {formato.entero(p.valor)}
                </text>
              )}
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Zonas de hover por punto */}
        {puntos.map((p, i) => {
          const paso = (ancho - m.izq - m.der) / Math.max(1, puntos.length - 1);
          return (
            <rect
              key={`${periodo}-hit-${i}`}
              x={x(i) - paso / 2}
              y={m.sup}
              width={paso}
              height={alto - m.sup - m.inf}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hover !== null && puntos[hover] && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            left: Math.min(Math.max(0, x(hover) - 60), ancho - 120),
            top: Math.max(cabecera, y(puntos[hover].valor) - 56),
            minWidth: 110,
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
          <div style={{ opacity: 0.7 }}>{puntos[hover].etiqueta}</div>
          <div style={{ fontWeight: 600 }}>{formato.millones(puntos[hover].valor)}</div>
        </div>
      )}
    </div>
  );
}
