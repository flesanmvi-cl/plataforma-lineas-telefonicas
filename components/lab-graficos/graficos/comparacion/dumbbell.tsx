"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { realVsMeta } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { DefsSuperficie, estiloBloqueSvg, filtroSvg, propsTexto, transicionLab, useUidSvg } from "./superficie-svg";

// Dumbbell (visx + motion): avance del período anterior contra el actual por obra. El punto
// «después» sale desde el «antes» y el tramo que los une se pinta con el color del cambio.
export function Dumbbell({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <DumbbellSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function DumbbellSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => realVsMeta().map((d) => ({ obra: d.obra, antes: d.anterior, despues: d.real })), []);
  const [activo, setActivo] = useState<string | null>(null);
  const uid = useUidSvg();
  const leyenda = t.etiquetas === "leyenda";
  const margen = { izq: 96, der: 58, arr: 24, aba: 4 };
  const min = Math.min(...datos.map((d) => Math.min(d.antes, d.despues)));
  const max = Math.max(...datos.map((d) => Math.max(d.antes, d.despues)));
  const x = scaleLinear({ domain: [Math.floor((min - 5) / 10) * 10, Math.ceil((max + 3) / 10) * 10], range: [margen.izq, ancho - margen.der] });
  const y = scaleBand({ domain: datos.map((d) => d.obra), range: [margen.arr, alto - margen.aba], padding: 0.2 });
  const colorAntes = t.oscuro ? t.textoSuave : t.colores[3 % t.colores.length];
  const colorDespues = t.acento;
  const r = Math.max(4.5, Math.min(y.bandwidth() / 2.8, 8));
  const ticks = x.ticks(5);
  const primera = y(datos[0].obra) ?? 0;

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Avance anterior contra actual por obra">
      <DefsSuperficie uid={uid} colores={[colorDespues, colorAntes]} t={t} horizontal />
      {/* Grilla vertical según el tema */}
      {t.grillaModo !== "sin" &&
        ticks.map((v) => (
          <g key={v}>
            <line
              x1={x(v)}
              x2={x(v)}
              y1={margen.arr - 2}
              y2={alto - margen.aba}
              stroke={t.grilla}
              strokeDasharray={t.grillaModo === "minima" ? "3 3" : undefined}
            />
            {t.grillaModo === "completa" && (
              <text x={x(v)} y={alto} textAnchor="middle" {...propsTexto(t, true, t.tamano.eje - 1)}>
                {v}%
              </text>
            )}
          </g>
        ))}
      {/* Leyenda compacta o rótulos directos sobre la primera fila */}
      {leyenda ? (
        <g transform={`translate(${margen.izq}, 8)`}>
          <circle cx={4} cy={0} r={4} fill={colorAntes} />
          <text x={12} y={0} dy="0.35em" {...propsTexto(t)}>
            Mes anterior
          </text>
          <circle cx={96} cy={0} r={4} fill={colorDespues} />
          <text x={104} y={0} dy="0.35em" {...propsTexto(t)}>
            Mes actual
          </text>
        </g>
      ) : (
        <g>
          <text x={x(datos[0].antes)} y={primera - 4} textAnchor="middle" {...propsTexto(t)} fill={colorAntes}>
            Anterior
          </text>
          <text x={x(datos[0].despues)} y={primera - 4} textAnchor="middle" {...propsTexto(t)} fill={colorDespues} fontWeight={600}>
            Actual
          </text>
        </g>
      )}
      {datos.map((d, i) => {
        const cy = (y(d.obra) ?? 0) + y.bandwidth() / 2;
        const delta = d.despues - d.antes;
        const tenue = activo !== null && activo !== d.obra;
        const tr = transicionLab(t, (i * t.animacion.duracion) / 8000);
        const x0 = x(d.antes);
        const x1 = x(d.despues);
        const estiloDespues = estiloBloqueSvg(t, uid, 0, colorDespues);
        return (
          <g
            key={d.obra}
            opacity={tenue ? 0.3 : 1}
            onMouseEnter={() => setActivo(d.obra)}
            onMouseLeave={() => setActivo(null)}
            style={{ transition: "opacity 150ms" }}
          >
            <rect x={0} y={y(d.obra)} width={ancho} height={y.bandwidth()} fill="transparent" />
            <text x={margen.izq - 12} y={cy} dy="0.35em" textAnchor="end" {...propsTexto(t, activo !== d.obra)}>
              {d.obra}
            </text>
            {/* Tramo entre ambos puntos */}
            <motion.rect
              y={cy - r * 0.45}
              height={r * 0.9}
              rx={r * 0.45}
              fill={t.superficie === "degradado" ? `url(#${uid}-g0)` : conAlfa(colorDespues, t.superficie === "contorno" ? 0.18 : 0.35)}
              filter={filtroSvg(t, uid, 0)}
              initial={{ x: Math.min(x0, x1), width: 0 }}
              animate={{ x: Math.min(x0, x1), width: Math.abs(x1 - x0) }}
              transition={tr}
            />
            <circle cx={x0} cy={cy} r={r} fill={t.superficie === "contorno" ? t.fondoTarjeta : colorAntes} stroke={colorAntes} strokeWidth={t.superficie === "contorno" ? 2 : 0} />
            <motion.circle
              cy={cy}
              r={r}
              {...estiloDespues}
              strokeWidth={t.superficie === "contorno" ? 2 : estiloDespues.strokeWidth}
              initial={{ cx: x0 }}
              animate={{ cx: x1 }}
              transition={tr}
            />
            <text x={Math.max(x0, x1) + r + 6} y={cy} dy="0.35em" {...propsTexto(t, false)} fontWeight={600}>
              {delta >= 0 ? "+" : "−"}
              {Math.abs(delta)} pp
            </text>
            {activo === d.obra && (
              <text x={Math.min(x0, x1) - r - 6} y={cy} dy="0.35em" textAnchor="end" {...propsTexto(t)}>
                {d.antes}% → {d.despues}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
