"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab } from "../comparacion/superficie-svg";
import { CifraKpi, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

type Estado = "plazo" | "riesgo" | "atrasado";

interface Kpi {
  nombre: string;
  valor: number;
  /** Desde «plazo» está en plazo; desde «riesgo» está en riesgo; bajo eso, atrasado. */
  umbral: { plazo: number; riesgo: number };
  /** Rango de la escala dibujada. */
  escala: [number, number];
  formatear: (v: number) => string;
  /** Distancia al umbral (puntos porcentuales o unidades del índice). */
  brecha: (v: number) => string;
}

/** Formatos para KPIs en % (brecha en puntos porcentuales) y para índices. */
const PCT = { formatear: (v: number) => formato.porcentaje(v), brecha: (v: number) => `${formato.entero(v)} pp` };
const INDICE = { formatear: (v: number) => formato.decimal(v, 2), brecha: (v: number) => formato.decimal(v, 2) };

const KPIS: Kpi[] = [
  { nombre: "Avance vs programa", valor: 97, umbral: { plazo: 95, riesgo: 85 }, escala: [60, 110], ...PCT },
  { nombre: "Índice de plazo (SPI)", valor: 0.91, umbral: { plazo: 0.95, riesgo: 0.85 }, escala: [0.6, 1.1], ...INDICE },
  { nombre: "Entrega de planos", valor: 72, umbral: { plazo: 90, riesgo: 80 }, escala: [50, 100], ...PCT },
  { nombre: "Hitos cumplidos", valor: 88, umbral: { plazo: 90, riesgo: 75 }, escala: [50, 100], ...PCT },
];

const NOMBRE_ESTADO: Record<Estado, string> = { plazo: "En plazo", riesgo: "En riesgo", atrasado: "Atrasado" };

function estadoDe(k: Kpi): Estado {
  return k.valor >= k.umbral.plazo ? "plazo" : k.valor >= k.umbral.riesgo ? "riesgo" : "atrasado";
}

function colorEstado(t: TokensLab, e: Estado) {
  return e === "plazo" ? t.estado.bueno : e === "riesgo" ? t.estado.alerta : t.estado.malo;
}

// Semáforo (HTML + motion): cada KPI con su estado (en plazo, en riesgo, atrasado), las tres luces
// y una escala con las zonas de umbral y el valor marcado. Pasar el mouse muestra la regla completa.
export function KpiSemaforo({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={170}>
      {KPIS.map((k, i) => (
        <Tarjeta key={k.nombre} k={k} i={i} t={t} />
      ))}
    </FilaKpi>
  );
}

function Tarjeta({ k, i, t }: { k: Kpi; i: number; t: TokensLab }) {
  const [hover, setHover] = useState(false);
  const estado = estadoDe(k);
  const color = colorEstado(t, estado);
  const [min, max] = k.escala;
  const pos = (v: number) => ((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100;
  const zonas: { desde: number; hasta: number; e: Estado }[] = [
    { desde: min, hasta: k.umbral.riesgo, e: "atrasado" },
    { desde: k.umbral.riesgo, hasta: k.umbral.plazo, e: "riesgo" },
    { desde: k.umbral.plazo, hasta: max, e: "plazo" },
  ];

  return (
    <TarjetaKpi
      t={t}
      titulo={k.nombre}
      color={color}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      extra={
        <span style={{ display: "inline-flex", gap: 3 }} aria-hidden>
          {(["atrasado", "riesgo", "plazo"] as Estado[]).map((e) => (
            <span
              key={e}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: e === estado ? colorEstado(t, e) : conAlfa(t.texto, t.oscuro ? 0.14 : 0.1),
                boxShadow: e === estado && t.superficie !== "plana" && t.superficie !== "contorno" ? `0 0 6px ${colorEstado(t, e)}` : undefined,
              }}
            />
          ))}
        </span>
      }
    >
      <div style={{ flex: 1, minHeight: 4 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <CifraKpi t={t} valor={k.valor} formatear={k.formatear} retraso={i * 0.08} />
        <span
          style={{
            fontSize: t.tamano.eje,
            fontWeight: 600,
            color,
            padding: "1px 8px",
            borderRadius: 999,
            background: conAlfa(color, t.oscuro ? 0.2 : 0.1),
            border: t.superficie === "contorno" ? `1px solid ${conAlfa(color, 0.5)}` : "1px solid transparent",
            whiteSpace: "nowrap",
          }}
        >
          {NOMBRE_ESTADO[estado]}
        </span>
      </div>
      {/* Escala con zonas de umbral */}
      <div style={{ position: "relative", height: 6, marginTop: 14, display: "flex", gap: 2 }}>
        {zonas.map((z) => (
          <span
            key={z.e}
            style={{
              flex: z.hasta - z.desde,
              borderRadius: 2,
              background: conAlfa(colorEstado(t, z.e), z.e === estado ? 0.55 : t.oscuro ? 0.22 : 0.18),
            }}
          />
        ))}
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            top: -4,
            width: 3,
            height: 14,
            marginLeft: -1.5,
            borderRadius: 2,
            background: t.texto,
            boxShadow: `0 0 0 2px ${t.fondoTarjeta}`,
          }}
          initial={{ left: "0%" }}
          animate={{ left: `${pos(k.valor)}%` }}
          transition={transicionLab(t, i * 0.08)}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: t.tamano.eje - 1, color: t.textoSuave, minHeight: 15, lineHeight: 1.3 }}>
        {hover
          ? `En plazo desde ${k.formatear(k.umbral.plazo)} · en riesgo desde ${k.formatear(k.umbral.riesgo)}`
          : estado === "plazo"
            ? `Umbral ${k.formatear(k.umbral.plazo)}`
            : `Umbral ${k.formatear(k.umbral.plazo)} · faltan ${k.brecha(Math.abs(k.umbral.plazo - k.valor))}`}
      </div>
    </TarjetaKpi>
  );
}
