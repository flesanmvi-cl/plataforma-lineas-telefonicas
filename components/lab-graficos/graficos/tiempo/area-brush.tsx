"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import { curveLinear, curveMonotoneX, curveStepAfter } from "@visx/curve";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Brush, type Bounds } from "@visx/brush";
import { localPoint } from "@visx/event";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, MESES } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

interface Punto {
  i: number;
  fecha: string;
  valor: number;
}

const DIAS = 240;

// Producción diaria (m³ de hormigón) con caminata aleatoria y estacionalidad semanal.
function produccionDiaria(): Punto[] {
  const r = azar(51);
  let nivel = 120;
  return Array.from({ length: DIAS }, (_, i) => {
    const d = new Date(Date.UTC(2026, 0, 1 + i));
    const dow = d.getUTCDay();
    nivel = Math.max(40, nivel + (r() - 0.45) * 14);
    const valor = dow === 0 ? nivel * 0.2 : dow === 6 ? nivel * 0.55 : nivel + (r() - 0.5) * 30;
    return { i, fecha: `${String(d.getUTCDate()).padStart(2, "0")} ${MESES[d.getUTCMonth()]}`, valor: Math.round(valor) };
  });
}

function curvaVisx(t: TokensLab) {
  return t.curva === "suave" ? curveMonotoneX : t.curva === "escalonada" ? curveStepAfter : curveLinear;
}

// Área con zoom por rango: el mini gráfico de abajo tiene un selector (brush) que define
// qué tramo muestra el gráfico principal; el principal trae cruz con tooltip.
export function AreaBrush({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <ParentSize debounceTime={40}>{({ width }) => (width > 0 ? <AreaBrushSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>
  );
}

function AreaBrushSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(produccionDiaria, []);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [rango, setRango] = useState<[number, number]>([DIAS - 90, DIAS - 1]);
  const [hover, setHover] = useState<Punto | null>(null);

  const m = { izq: 40, der: 12, sup: 8 };
  const altoMini = 44;
  const separacion = 42;
  const altoPrincipal = alto - altoMini - separacion - m.sup;
  const internoX = ancho - m.izq - m.der;
  const yMini = m.sup + altoPrincipal + separacion;

  const visibles = datos.slice(rango[0], rango[1] + 1);
  const maximo = Math.max(...datos.map((d) => d.valor)) * 1.1;
  const x = scaleLinear({ domain: [rango[0], rango[1]], range: [0, internoX] });
  const y = scaleLinear({ domain: [0, maximo], range: [altoPrincipal, 0], nice: true });
  const xMini = scaleLinear({ domain: [0, DIAS - 1], range: [0, internoX] });
  const yMiniEsc = scaleLinear({ domain: [0, maximo], range: [altoMini, 0] });
  const curva = curvaVisx(t);
  const color = t.acento;

  const relleno =
    t.superficie === "degradado" || t.superficie === "glass"
      ? `url(#${uid}-grad)`
      : t.superficie === "contorno"
        ? conAlfa(color, 0.04)
        : conAlfa(color, 0.12);
  const conSombra = t.superficie === "sombras" || t.superficie === "glass";
  const dur = t.animacion.duracion / 1000;

  function alMover(e: React.MouseEvent<SVGRectElement>) {
    const p = localPoint(e);
    if (!p) return;
    const idx = Math.round(x.invert(p.x - m.izq));
    const d = datos[Math.min(rango[1], Math.max(rango[0], idx))];
    setHover(d);
  }

  function alCambiarBrush(b: Bounds | null) {
    if (!b) return;
    const desde = Math.max(0, Math.floor(b.x0));
    const hasta = Math.min(DIAS - 1, Math.ceil(b.x1));
    if (hasta - desde >= 6) setRango([desde, hasta]);
  }

  const total = visibles.reduce((s, d) => s + d.valor, 0);
  const ticksX = Math.max(2, Math.floor(internoX / 90));

  return (
    <div style={{ position: "relative", width: ancho, height: alto }}>
      <svg width={ancho} height={alto} role="img" aria-label="Producción diaria con selector de rango">
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={t.superficie === "glass" ? 0.3 : 0.45} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={`${uid}-sombra`} x="-5%" y="-30%" width="110%" height="160%">
            <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 6} stdDeviation="5" floodColor={color} floodOpacity="0.45" />
          </filter>
          <clipPath id={`${uid}-clip`}>
            <motion.rect
              x={0}
              y={-4}
              height={altoPrincipal + 8}
              initial={{ width: dur > 0 ? 0 : internoX }}
              animate={{ width: internoX }}
              transition={{ duration: dur * 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </clipPath>
        </defs>

        <Group left={m.izq} top={m.sup}>
          {t.grillaModo !== "sin" && (
            <GridRows
              scale={y}
              width={internoX}
              numTicks={4}
              stroke={t.grilla}
              strokeDasharray={t.grillaModo === "minima" ? "4 4" : undefined}
            />
          )}
          <g clipPath={`url(#${uid}-clip)`}>
            <AreaClosed data={visibles} x={(d) => x(d.i)} y={(d) => y(d.valor)} yScale={y} curve={curva} fill={relleno} />
            <LinePath
              data={visibles}
              x={(d) => x(d.i)}
              y={(d) => y(d.valor)}
              curve={curva}
              stroke={color}
              strokeWidth={t.grosorLinea}
              filter={conSombra ? `url(#${uid}-sombra)` : undefined}
            />
          </g>
          <AxisLeft
            scale={y}
            numTicks={4}
            hideAxisLine
            hideTicks
            hideZero={false}
            tickFormat={(v) => formato.entero(Number(v))}
            tickLabelProps={{ fill: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, textAnchor: "end", dx: -4, dy: "0.33em" }}
          />
          <AxisBottom
            top={altoPrincipal}
            scale={x}
            numTicks={ticksX}
            stroke={t.eje}
            hideTicks
            tickFormat={(v) => datos[Math.round(Number(v))]?.fecha ?? ""}
            tickLabelProps={{ fill: t.textoSuave, fontFamily: t.fuente, fontSize: t.tamano.eje, textAnchor: "middle" }}
          />

          {hover && (
            <g pointerEvents="none">
              <line x1={x(hover.i)} x2={x(hover.i)} y1={0} y2={altoPrincipal} stroke={t.textoSuave} strokeDasharray="3 3" />
              <line x1={0} x2={internoX} y1={y(hover.valor)} y2={y(hover.valor)} stroke={conAlfa(color, 0.35)} strokeDasharray="3 3" />
              <motion.circle
                r={4.5}
                fill={t.fondoTarjeta}
                stroke={color}
                strokeWidth={2}
                initial={false}
                animate={{ cx: x(hover.i), cy: y(hover.valor) }}
                transition={{ duration: Math.min(dur, 0.18), ease: "easeOut" }}
              />
            </g>
          )}
          <rect
            width={internoX}
            height={altoPrincipal}
            fill="transparent"
            onMouseMove={alMover}
            onMouseLeave={() => setHover(null)}
          />
        </Group>

        {/* Mini gráfico con selector de rango */}
        <Group left={m.izq} top={yMini}>
          <rect width={internoX} height={altoMini} fill={conAlfa(t.textoSuave, 0.06)} rx={Math.min(t.radio / 2, 6)} />
          <AreaClosed
            data={datos}
            x={(d) => xMini(d.i)}
            y={(d) => yMiniEsc(d.valor)}
            yScale={yMiniEsc}
            curve={curva}
            fill={conAlfa(t.textoSuave, 0.25)}
            stroke={t.textoSuave}
            strokeWidth={1}
          />
          <Brush
            xScale={xMini}
            yScale={yMiniEsc}
            width={internoX}
            height={altoMini}
            margin={{ left: m.izq, top: yMini }}
            handleSize={8}
            resizeTriggerAreas={["left", "right"]}
            brushDirection="horizontal"
            initialBrushPosition={{ start: { x: xMini(DIAS - 90) }, end: { x: xMini(DIAS - 1) } }}
            onChange={alCambiarBrush}
            selectedBoxStyle={{ fill: conAlfa(color, 0.14), stroke: color, strokeWidth: 1.5 }}
            disableDraggingSelection={false}
            useWindowMoveEvents
          />
        </Group>
        <text x={ancho - m.der} y={yMini - 6} textAnchor="end" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
          {datos[rango[0]].fecha} – {datos[rango[1]].fecha} · {formato.entero(total)} m³
        </text>
        <text x={m.izq} y={yMini - 6} fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
          Arrastra para elegir el rango
        </text>
      </svg>

      {hover && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            left: Math.min(m.izq + x(hover.i) + 12, ancho - 150),
            top: Math.max(0, m.sup + y(hover.valor) - 52),
            background: t.tooltip.fondo,
            color: t.tooltip.texto,
            border: `1px solid ${t.tooltip.borde}`,
            boxShadow: t.tooltip.sombra,
            borderRadius: Math.min(t.radio, 12),
            padding: "6px 10px",
            fontFamily: t.fuente,
            fontSize: 12,
            whiteSpace: "nowrap",
            backdropFilter: t.tema.tooltip === "tarjeta" ? "blur(10px)" : undefined,
          }}
        >
          <div style={{ opacity: 0.7 }}>{hover.fecha} 2026</div>
          <div style={{ fontWeight: 600 }}>{formato.entero(hover.valor)} m³</div>
        </div>
      )}
    </div>
  );
}
