"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab, useUidSvg } from "../comparacion/superficie-svg";
import { FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

interface Kpi {
  nombre: string;
  formatear: (v: number) => string;
  partes: { nombre: string; valor: number }[];
}

const KPIS: Kpi[] = [
  {
    nombre: "Dotación en obra",
    formatear: (v) => formato.entero(v),
    partes: [
      { nombre: "Propios", valor: 1940 },
      { nombre: "Subcontrato", valor: 1188 },
      { nombre: "Staff", valor: 284 },
    ],
  },
  {
    nombre: "Costo del mes",
    formatear: (v) => `$ ${formato.entero(v)} M`,
    partes: [
      { nombre: "Mano de obra", valor: 1120 },
      { nombre: "Materiales", valor: 980 },
      { nombre: "Subcontratos", valor: 520 },
      { nombre: "Equipos", valor: 220 },
    ],
  },
  {
    nombre: "Obras por estado",
    formatear: (v) => formato.entero(v),
    partes: [
      { nombre: "En ejecución", valor: 16 },
      { nombre: "En cierre", valor: 5 },
      { nombre: "Por iniciar", valor: 3 },
    ],
  },
];

// Mini dona dentro de la tarjeta (SVG + motion): total en el centro y composición en una lista.
// Pasar el mouse por un segmento o por su fila muestra su valor y participación en el centro.
export function KpiMiniDona({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={230}>
      {KPIS.map((k, i) => (
        <Tarjeta key={k.nombre} k={k} i={i} t={t} alto={alto} />
      ))}
    </FilaKpi>
  );
}

function Tarjeta({ k, i, t, alto }: { k: Kpi; i: number; t: TokensLab; alto: number }) {
  const [foco, setFoco] = useState<number | null>(null);
  const uid = useUidSvg();
  const total = k.partes.reduce((s, p) => s + p.valor, 0);
  const lado = Math.max(72, Math.min(112, alto - 70));
  const grosor = Math.max(8, lado * 0.13);
  const r = lado / 2 - grosor / 2 - 2;
  const hueco = k.partes.length > 1 ? 0.012 : 0;
  const sombra = t.superficie === "sombras" || t.superficie === "glass";
  const parteFoco = foco !== null ? k.partes[foco] : null;
  // Fracción acumulada antes de cada parte (ángulo de inicio del segmento).
  const inicios = k.partes.map((_, j) => k.partes.slice(0, j).reduce((s, p) => s + p.valor, 0) / total);

  return (
    <TarjetaKpi t={t} titulo={k.nombre} color={t.colores[i % t.colores.length]}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, minHeight: 0, marginTop: 6 }}>
        <svg width={lado} height={lado} style={{ flexShrink: 0, overflow: "visible" }} role="img" aria-label={`${k.nombre}: composición`}>
          <defs>
            <filter id={`${uid}-s`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy={t.superficie === "glass" ? 0 : 2} stdDeviation={2.5} floodColor="#000000" floodOpacity={0.18} />
            </filter>
          </defs>
          <circle cx={lado / 2} cy={lado / 2} r={r} fill="none" stroke={t.grilla} strokeWidth={grosor} />
          <g filter={sombra ? `url(#${uid}-s)` : undefined}>
            {k.partes.map((p, j) => {
              const frac = p.valor / total;
              const inicio = inicios[j];
              const color = t.colores[j % t.colores.length];
              const tenue = foco !== null && foco !== j;
              const trazo =
                t.superficie === "contorno"
                  ? conAlfa(color, 0.35)
                  : t.superficie === "glass"
                    ? conAlfa(color, 0.8)
                    : t.superficie === "degradado"
                      ? conAlfa(color, 0.55 + 0.45 * (1 - j / k.partes.length))
                      : color;
              return (
                <g
                  key={p.nombre}
                  transform={`rotate(${inicio * 360 - 90} ${lado / 2} ${lado / 2})`}
                  opacity={tenue ? 0.3 : 1}
                  onMouseEnter={() => setFoco(j)}
                  onMouseLeave={() => setFoco(null)}
                  style={{ cursor: "default", transition: "opacity 150ms" }}
                >
                  <motion.circle
                    cx={lado / 2}
                    cy={lado / 2}
                    r={r}
                    fill="none"
                    stroke={trazo}
                    strokeWidth={foco === j ? grosor + 3 : grosor}
                    style={{ transition: "stroke-width 150ms" }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.max(frac - hueco, 0.001) }}
                    transition={transicionLab(t, i * 0.08 + j * 0.06)}
                  />
                </g>
              );
            })}
          </g>
          <text
            x={lado / 2}
            y={lado / 2}
            dy={parteFoco ? "-0.1em" : "0.35em"}
            textAnchor="middle"
            fill={t.texto}
            fontFamily={t.fuente}
            fontSize={Math.min(t.kpi.cifra * 0.62, lado * 0.2)}
            fontWeight={600}
          >
            {parteFoco ? formato.porcentaje((parteFoco.valor / total) * 100) : k.formatear(total)}
          </text>
          {parteFoco && (
            <text x={lado / 2} y={lado / 2} dy="1.3em" textAnchor="middle" fill={t.textoSuave} fontFamily={t.fuente} fontSize={t.tamano.eje - 2}>
              del total
            </text>
          )}
        </svg>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5, minWidth: 0, flex: 1 }}>
          {k.partes.map((p, j) => (
            <li
              key={p.nombre}
              onMouseEnter={() => setFoco(j)}
              onMouseLeave={() => setFoco(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: t.tamano.eje,
                opacity: foco !== null && foco !== j ? 0.45 : 1,
                transition: "opacity 150ms",
                cursor: "default",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: t.colores[j % t.colores.length], flexShrink: 0 }} />
              <span style={{ color: t.textoSuave, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.nombre}
              </span>
              <span style={{ marginLeft: "auto", color: t.texto, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {foco === j ? k.formatear(p.valor) : formato.porcentaje((p.valor / total) * 100)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </TarjetaKpi>
  );
}
