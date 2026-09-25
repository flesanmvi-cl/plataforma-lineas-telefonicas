"use client";

import { useState } from "react";
import { ParentSize } from "@visx/responsive";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab, useUidSvg } from "../comparacion/superficie-svg";

const ANILLOS = [
  { nombre: "Avance físico", corto: "Avance", valor: 72, detalle: "72 de 100% programado" },
  { nombre: "Presupuesto ejecutado", corto: "Presupuesto", valor: 64, detalle: "$ 8.320 M de $ 13.000 M" },
  { nombre: "Días sin accidentes", corto: "Seguridad", valor: 88, detalle: "158 de 180 días de meta" },
];

// Anillos de progreso concéntricos (SVG + motion), estilo «actividad». Pasar el mouse por un
// anillo o por su fila de la leyenda resalta ambos y muestra el detalle.
export function AnillosActividad({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <Anillos ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function Anillos({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const [activo, setActivo] = useState<number | null>(null);
  const uid = useUidSvg();
  const leyenda = t.etiquetas === "leyenda";
  // Con rótulos directos el SVG se corre a la derecha para dejar espacio a los nombres.
  const lado = Math.min(alto - 8, ancho * (leyenda ? 0.55 : 0.6));
  const c = lado / 2;
  const grosor = Math.max(10, lado / 11);
  const separacion = grosor * 0.28;
  const sombra = t.superficie === "sombras" || t.superficie === "glass";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: leyenda ? "center" : "flex-end",
        gap: 20,
        paddingRight: leyenda ? 0 : 12,
        height: alto,
        fontFamily: t.fuente,
      }}
    >
      <svg width={lado} height={lado} role="img" aria-label="Anillos de avance, presupuesto y seguridad" style={{ overflow: "visible" }}>
        <defs>
          {ANILLOS.map((_, i) => {
            const color = t.colores[i % t.colores.length];
            return (
              <g key={i}>
                <linearGradient id={`${uid}-g${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={conAlfa(color, 0.55)} />
                  <stop offset="1" stopColor={color} />
                </linearGradient>
                <filter id={`${uid}-s${i}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 3} stdDeviation={t.superficie === "glass" ? 4 : 3} floodColor={color} floodOpacity={0.5} />
                </filter>
              </g>
            );
          })}
        </defs>
        {ANILLOS.map((a, i) => {
          const color = t.colores[i % t.colores.length];
          const r = c - grosor / 2 - i * (grosor + separacion);
          if (r <= grosor / 2) return null;
          const tenue = activo !== null && activo !== i;
          const trazo = t.superficie === "degradado" ? `url(#${uid}-g${i})` : t.superficie === "glass" ? conAlfa(color, 0.8) : color;
          const tr = transicionLab(t, i * 0.12);
          return (
            <g
              key={a.nombre}
              transform={`rotate(-90 ${c} ${c})`}
              opacity={tenue ? 0.3 : 1}
              onMouseEnter={() => setActivo(i)}
              onMouseLeave={() => setActivo(null)}
              style={{ transition: "opacity 150ms", cursor: "default" }}
            >
              {/* Pista */}
              <circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={t.superficie === "contorno" ? "transparent" : conAlfa(color, t.oscuro ? 0.18 : 0.12)}
                strokeWidth={grosor}
              />
              {t.superficie === "contorno" && (
                <>
                  <circle cx={c} cy={c} r={r - grosor / 2} fill="none" stroke={conAlfa(color, 0.3)} strokeWidth={1} />
                  <circle cx={c} cy={c} r={r + grosor / 2} fill="none" stroke={conAlfa(color, 0.3)} strokeWidth={1} />
                </>
              )}
              {/* Progreso */}
              <motion.circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={t.superficie === "contorno" ? conAlfa(color, 0.25) : trazo}
                strokeWidth={grosor}
                strokeLinecap="round"
                filter={sombra ? `url(#${uid}-s${i})` : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: a.valor / 100 }}
                transition={tr}
              />
              {t.superficie === "contorno" && (
                <motion.circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: a.valor / 100 }}
                  transition={tr}
                />
              )}
            </g>
          );
        })}
        {/* Centro: detalle del anillo activo o el primero */}
        <text x={c} y={c - 4} textAnchor="middle" fill={t.texto} fontFamily={t.fuente} fontSize={Math.min(t.kpi.cifra, lado * 0.2)} fontWeight={600}>
          {formato.porcentaje(ANILLOS[activo ?? 0].valor)}
        </text>
        <text x={c} y={c + 14} textAnchor="middle" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje - 1}>
          {ANILLOS[activo ?? 0].corto}
        </text>
        {/* Rótulos directos a la izquierda, a la altura donde parte cada anillo */}
        {!leyenda &&
          ANILLOS.map((a, i) => {
            const r = c - grosor / 2 - i * (grosor + separacion);
            if (r <= grosor / 2) return null;
            return (
              <text
                key={a.nombre}
                x={-12}
                y={c - r}
                dy="0.35em"
                textAnchor="end"
                fill={t.colores[i % t.colores.length]}
                fontFamily={t.fuente}
                fontSize={t.tamano.eje}
                fontWeight={600}
                opacity={activo !== null && activo !== i ? 0.35 : 1}
              >
                {a.corto} {a.valor}%
              </text>
            );
          })}
      </svg>
      {leyenda && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          {ANILLOS.map((a, i) => {
            const color = t.colores[i % t.colores.length];
            return (
              <li
                key={a.nombre}
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
                style={{ opacity: activo !== null && activo !== i ? 0.4 : 1, transition: "opacity 150ms", cursor: "default" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.textoSuave, fontSize: t.tamano.eje }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                  {a.nombre}
                </div>
                <div style={{ color: t.texto, fontSize: Math.round(t.kpi.cifra * 0.6), fontWeight: 600, lineHeight: 1.2 }}>{formato.porcentaje(a.valor)}</div>
                {activo === i && <div style={{ color: t.textoSuave, fontSize: t.tamano.eje - 1 }}>{a.detalle}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
