"use client";

import { useId, useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { realVsMeta } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

// Gráfico de referencia (visx + motion): SVG propio, escalas de visx y animación de motion.
// La superficie se traduce a mano: degradado con <linearGradient>, sombra con un filtro.
export function Bullet({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <BulletSvg ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function BulletSvg({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => realVsMeta(), []);
  const [activo, setActivo] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");
  const margen = { izq: 92, der: 44 };
  const x = scaleLinear({ domain: [0, 120], range: [margen.izq, ancho - margen.der] });
  const y = scaleBand({ domain: datos.map((d) => d.obra), range: [4, alto - 4], padding: 0.35 });
  const banda = y.bandwidth();
  const acento = t.acento;
  const relleno = t.superficie === "degradado" ? `url(#${uid}-grad)` : t.superficie === "contorno" ? conAlfa(acento, 0.15) : acento;

  return (
    <svg width={ancho} height={alto} role="img" aria-label="Real contra meta por obra">
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={conAlfa(acento, 0.45)} />
          <stop offset="1" stopColor={acento} />
        </linearGradient>
        <filter id={`${uid}-sombra`} x="-10%" y="-60%" width="120%" height="220%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={acento} floodOpacity="0.4" />
        </filter>
      </defs>
      {datos.map((d, i) => {
        const y0 = y(d.obra) ?? 0;
        const tenue = activo !== null && activo !== d.obra;
        return (
          <g
            key={d.obra}
            opacity={tenue ? 0.35 : 1}
            onMouseEnter={() => setActivo(d.obra)}
            onMouseLeave={() => setActivo(null)}
            style={{ transition: "opacity 150ms" }}
          >
            <text x={margen.izq - 10} y={y0 + banda / 2} dy="0.35em" textAnchor="end" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje}>
              {d.obra}
            </text>
            {/* Rangos cualitativos de fondo */}
            {[120, 90, 60].map((limite, k) => (
              <rect key={limite} x={margen.izq} y={y0} width={x(limite) - margen.izq} height={banda} fill={t.grilla} opacity={0.5 + k * 0.25} rx={Math.min(t.radio / 3, 3)} />
            ))}
            {/* Valor real */}
            <motion.rect
              x={margen.izq}
              y={y0 + banda * 0.3}
              height={banda * 0.4}
              rx={Math.min(t.radio / 3, 3)}
              fill={relleno}
              stroke={t.superficie === "contorno" ? acento : undefined}
              filter={t.superficie === "sombras" || t.superficie === "glass" ? `url(#${uid}-sombra)` : undefined}
              initial={{ width: 0 }}
              animate={{ width: x(d.real) - margen.izq }}
              transition={{ duration: t.animacion.duracion / 1000, delay: (i * t.animacion.duracion) / 8000, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Meta */}
            <rect x={x(d.meta) - 1.5} y={y0 - 2} width={3} height={banda + 4} fill={t.texto} />
            <text x={x(Math.max(d.real, d.meta)) + 8} y={y0 + banda / 2} dy="0.35em" fill={t.texto} fontFamily={t.fuente} fontSize={t.tamano.eje} fontWeight={600}>
              {d.real}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
