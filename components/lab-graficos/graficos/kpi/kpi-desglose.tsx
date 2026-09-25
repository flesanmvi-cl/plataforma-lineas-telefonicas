"use client";

import { useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab } from "../comparacion/superficie-svg";
import { ChipVariacion, CifraKpi, estiloBarra, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

interface Kpi {
  nombre: string;
  formatear: (v: number) => string;
  delta: string;
  sube: boolean;
  bueno: boolean;
  titulo: string;
  partes: { nombre: string; valor: number }[];
}

const KPIS: Kpi[] = [
  {
    nombre: "Ventas del mes",
    formatear: (v) => `$ ${formato.entero(v)} M`,
    delta: "+7,9%",
    sube: true,
    bueno: true,
    titulo: "Por línea de negocio",
    partes: [
      { nombre: "Edificación", valor: 486 },
      { nombre: "Obras civiles", valor: 342 },
      { nombre: "Minería", valor: 268 },
      { nombre: "Vialidad", valor: 188 },
    ],
  },
  {
    nombre: "Dotación en obra",
    formatear: (v) => formato.entero(v),
    delta: "−2,3%",
    sube: false,
    bueno: false,
    titulo: "Por zona",
    partes: [
      { nombre: "Norte", valor: 1204 },
      { nombre: "Centro", valor: 1382 },
      { nombre: "Sur", valor: 826 },
    ],
  },
  {
    nombre: "Reclamos abiertos",
    formatear: (v) => formato.entero(v),
    delta: "−12,5%",
    sube: false,
    bueno: true,
    titulo: "Por antigüedad",
    partes: [
      { nombre: "Menos de 7 días", valor: 18 },
      { nombre: "7 a 30 días", valor: 11 },
      { nombre: "Más de 30 días", valor: 6 },
    ],
  },
];

// KPI con desglose (HTML + motion): la tarjeta se da vuelta al hacer clic y muestra el detalle
// del total en barras. Sin animación, el cambio de cara es inmediato.
export function KpiDesglose({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={200}>
      {KPIS.map((k, i) => (
        <Tarjeta key={k.nombre} k={k} i={i} t={t} />
      ))}
    </FilaKpi>
  );
}

function Tarjeta({ k, i, t }: { k: Kpi; i: number; t: TokensLab }) {
  const [volteada, setVolteada] = useState(false);
  const total = k.partes.reduce((s, p) => s + p.valor, 0);
  const max = Math.max(...k.partes.map((p) => p.valor));
  const color = t.colores[i % t.colores.length];
  const tr = { ...transicionLab(t), duration: (t.animacion.duracion / 1000) * 0.9 };
  const cara = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

  return (
    <button
      type="button"
      onClick={() => setVolteada((v) => !v)}
      aria-pressed={volteada}
      aria-label={`${k.nombre}: ${volteada ? "volver a la cifra" : "ver desglose"}`}
      style={{
        display: "block",
        padding: 0,
        border: 0,
        background: "transparent",
        font: "inherit",
        color: "inherit",
        textAlign: "left",
        position: "relative",
        minWidth: 0,
        minHeight: 0,
        cursor: "pointer",
        perspective: 900,
        borderRadius: Math.min(t.radio, 16),
      }}
    >
      <motion.div
        style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: volteada ? 180 : 0 }}
        transition={tr}
      >
        {/* Cara frontal: la cifra */}
        <div style={cara}>
          <TarjetaKpi
            t={t}
            titulo={k.nombre}
            color={color}
            estilo={{ height: "100%", boxSizing: "border-box" }}
            extra={<RotateCw size={14} color={t.textoSuave} aria-hidden />}
          >
            <div style={{ flex: 1, minHeight: 4 }} />
            <CifraKpi t={t} valor={total} formatear={k.formatear} retraso={i * 0.08} />
            <div style={{ marginTop: 8 }}>
              <ChipVariacion t={t} texto={k.delta} direccion={k.sube ? "sube" : "baja"} bueno={k.bueno} sufijo="vs mes anterior" />
            </div>
            <div style={{ flex: 1, minHeight: 4 }} />
            <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>Clic para ver {k.titulo.toLowerCase()}</div>
          </TarjetaKpi>
        </div>
        {/* Cara trasera: el desglose */}
        <div style={{ ...cara, transform: "rotateY(180deg)" }}>
          <TarjetaKpi
            t={t}
            titulo={`${k.nombre} · ${k.titulo.toLowerCase()}`}
            color={color}
            estilo={{ height: "100%", boxSizing: "border-box" }}
            extra={<RotateCcw size={14} color={t.textoSuave} aria-hidden />}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, marginTop: 6 }}>
              {k.partes.map((p, j) => (
                <div key={p.nombre} style={{ fontSize: t.tamano.eje }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <span style={{ color: t.textoSuave, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.nombre}
                    </span>
                    <span style={{ color: t.texto, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {k.formatear(p.valor)}
                      <span style={{ color: t.textoSuave, fontWeight: 400 }}> · {formato.porcentaje((p.valor / total) * 100)}</span>
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: conAlfa(t.texto, t.oscuro ? 0.08 : 0.05) }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 999, ...estiloBarra(t, j === 0 ? color : t.textoSuave) }}
                      initial={{ width: "0%" }}
                      animate={{ width: volteada ? `${(p.valor / max) * 100}%` : "0%" }}
                      transition={transicionLab(t, volteada ? 0.2 + j * 0.06 : 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TarjetaKpi>
        </div>
      </motion.div>
    </button>
  );
}
