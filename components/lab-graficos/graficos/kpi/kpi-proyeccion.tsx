"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area, AreaClosed, LinePath } from "@visx/shape";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, serieMensual } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { propsTexto, transicionLab } from "../comparacion/superficie-svg";
import { curvaVisx } from "./sparkline";
import { ChipVariacion, CifraKpi, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

/** Último mes con cierre real (septiembre). */
const HOY = 8;

interface Punto {
  i: number;
  v: number;
  bajo: number;
  alto: number;
}

interface Kpi {
  nombre: string;
  meta: number;
  nombreMeta: string;
  /** Si pasarse de la meta es favorable (ventas sí, costo no). */
  sobreEsBueno: boolean;
  real: Punto[];
  proyeccion: Punto[];
}

/** Acumulado real hasta HOY y proyección lineal con intervalo que se abre hacia fin de año. */
function armar(nombre: string, meta: number, nombreMeta: string, sobreEsBueno: boolean, mensual: number[]): Kpi {
  const acumulado = mensual.reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], []);
  const real = acumulado.slice(0, HOY + 1).map((v, i) => ({ i, v, bajo: v, alto: v }));
  const ritmo = acumulado[HOY] / (HOY + 1);
  const proyeccion = MESES.slice(HOY).map((_, k) => {
    const v = acumulado[HOY] + ritmo * 1.02 * k;
    const abre = ritmo * 0.28 * k;
    return { i: HOY + k, v, bajo: v - abre, alto: v + abre };
  });
  return { nombre, meta, nombreMeta, sobreEsBueno, real, proyeccion };
}

const millones = (v: number) => `$ ${formato.entero(v)} M`;

// KPI con proyección (HTML + visx): real acumulado a la fecha, cierre proyectado con su intervalo
// y la meta. El tramo proyectado va punteado sobre una banda. Pasar el mouse muestra cada mes.
export function KpiProyeccion({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const kpis = useMemo(
    () => [
      armar("Ventas acumuladas", 12000, "Meta", true, serieMensual(5, 960, 22, 90)),
      armar("Costo directo acumulado", 9800, "Presupuesto", false, serieMensual(14, 700, 18, 60)),
    ],
    [],
  );
  return (
    <FilaKpi alto={alto} minimo={280}>
      {kpis.map((k, i) => (
        <Tarjeta key={k.nombre} k={k} i={i} t={t} />
      ))}
    </FilaKpi>
  );
}

function Tarjeta({ k, i, t }: { k: Kpi; i: number; t: TokensLab }) {
  const [mes, setMes] = useState<number | null>(null);
  const cierre = k.proyeccion[k.proyeccion.length - 1];
  const brecha = ((cierre.v - k.meta) / k.meta) * 100;
  const sobre = brecha >= 0;
  const punto = mes === null ? null : mes <= HOY ? k.real[mes] : k.proyeccion[mes - HOY];
  const color = t.colores[i % t.colores.length];

  return (
    <TarjetaKpi t={t} titulo={k.nombre} color={color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        <div>
          <CifraKpi t={t} valor={k.real[HOY].v} formatear={millones} retraso={i * 0.08} escala={0.9} />
          <div style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>real a {MESES[HOY].toLowerCase()}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: t.tamano.eje, color: t.textoSuave, lineHeight: 1.35 }}>
          <div>
            Cierre proyectado <strong style={{ color: t.texto, fontWeight: 600 }}>{millones(cierre.v)}</strong>
          </div>
          <div>
            entre {millones(cierre.bajo)} y {millones(cierre.alto)}
          </div>
          <ChipVariacion
            t={t}
            texto={`${sobre ? "+" : "−"}${formato.decimal(Math.abs(brecha))}%`}
            direccion={sobre ? "sube" : "baja"}
            bueno={sobre === k.sobreEsBueno}
            sufijo={`vs ${k.nombreMeta.toLowerCase()}`}
          />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 40, marginTop: 8 }}>
        <ParentSize>
          {({ width, height }) =>
            width > 0 && height > 0 ? <Grafico k={k} t={t} ancho={width} alto={height} color={color} mes={mes} onMes={setMes} /> : null
          }
        </ParentSize>
      </div>
      <div style={{ minHeight: 16, fontSize: t.tamano.eje - 1, color: punto ? t.texto : t.textoSuave, marginTop: 2 }}>
        {punto && mes !== null
          ? mes <= HOY
            ? `${MESES[mes]} · real ${millones(punto.v)}`
            : `${MESES[mes]} · proyectado ${millones(punto.v)} (${millones(punto.bajo)} a ${millones(punto.alto)})`
          : "Línea continua: real · punteada: proyección con intervalo"}
      </div>
    </TarjetaKpi>
  );
}

function Grafico({
  k,
  t,
  ancho,
  alto,
  color,
  mes,
  onMes,
}: {
  k: Kpi;
  t: TokensLab;
  ancho: number;
  alto: number;
  color: string;
  mes: number | null;
  onMes: (m: number | null) => void;
}) {
  const pad = { izq: 4, der: 4, arr: 6, aba: 14 };
  const x = scaleLinear({ domain: [0, 11], range: [pad.izq, ancho - pad.der] });
  const tope = Math.max(k.meta, k.proyeccion[k.proyeccion.length - 1].alto) * 1.06;
  const y = scaleLinear({ domain: [0, tope], range: [alto - pad.aba, pad.arr] });
  const curva = curvaVisx(t);
  const relleno = t.superficie === "contorno" ? "transparent" : conAlfa(color, t.superficie === "degradado" ? 0.18 : 0.1);

  function mover(e: MouseEvent<SVGRectElement>) {
    const caja = e.currentTarget.getBoundingClientRect();
    onMes(Math.max(0, Math.min(11, Math.round(x.invert(e.clientX - caja.left)))));
  }

  const puntoFoco = mes === null ? null : mes <= HOY ? k.real[mes] : k.proyeccion[mes - HOY];

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }} aria-hidden>
      {/* Meta */}
      <line x1={pad.izq} x2={ancho - pad.der} y1={y(k.meta)} y2={y(k.meta)} stroke={t.textoSuave} strokeDasharray="4 3" />
      <text x={pad.izq} y={y(k.meta) - 4} {...propsTexto(t, true, t.tamano.eje - 2)}>
        {k.nombreMeta} {millones(k.meta)}
      </text>
      <motion.g
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={transicionLab(t)}
      >
        <AreaClosed data={k.real} x={(d) => x(d.i)} y={(d) => y(d.v)} yScale={y} curve={curva} fill={relleno} />
        <Area
          data={k.proyeccion}
          x={(d) => x(d.i)}
          y0={(d) => y(d.bajo)}
          y1={(d) => y(d.alto)}
          curve={curva}
          fill={conAlfa(color, t.oscuro ? 0.22 : 0.14)}
        />
        <LinePath
          data={k.real}
          x={(d) => x(d.i)}
          y={(d) => y(d.v)}
          curve={curva}
          stroke={color}
          strokeWidth={Math.max(t.grosorLinea, 1.5)}
          strokeLinecap="round"
        />
        <LinePath
          data={k.proyeccion}
          x={(d) => x(d.i)}
          y={(d) => y(d.v)}
          curve={curva}
          stroke={color}
          strokeWidth={Math.max(t.grosorLinea, 1.5)}
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </motion.g>
      <circle cx={x(HOY)} cy={y(k.real[HOY].v)} r={3.5} fill={t.fondoTarjeta} stroke={color} strokeWidth={2} />
      {[0, HOY, 11].map((m) => (
        <text key={m} x={x(m)} y={alto - 2} textAnchor={m === 0 ? "start" : m === 11 ? "end" : "middle"} {...propsTexto(t, true, t.tamano.eje - 2)}>
          {m === HOY ? `${MESES[m]} (hoy)` : MESES[m]}
        </text>
      ))}
      {puntoFoco && mes !== null && (
        <g pointerEvents="none">
          <line x1={x(mes)} x2={x(mes)} y1={pad.arr} y2={alto - pad.aba} stroke={t.textoSuave} strokeDasharray="2 2" />
          <circle cx={x(mes)} cy={y(puntoFoco.v)} r={3.5} fill={t.fondoTarjeta} stroke={color} strokeWidth={2} />
        </g>
      )}
      <rect x={0} y={0} width={ancho} height={alto} fill="transparent" onMouseMove={mover} onMouseLeave={() => onMes(null)} />
    </svg>
  );
}
