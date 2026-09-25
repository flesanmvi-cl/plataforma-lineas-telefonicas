"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab } from "../comparacion/superficie-svg";
import { ChipVariacion, CifraKpi, estiloBarra, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

interface Kpi {
  nombre: string;
  /** Este mes, mes anterior y mismo mes del año anterior. */
  valores: [number, number, number];
  formatear: (v: number) => string;
  /** Si subir es favorable (ventas sí, costo no). */
  subirEsBueno: boolean;
}

const PERIODOS = ["Sep 2026", "Ago 2026", "Sep 2025"];

const KPIS: Kpi[] = [
  { nombre: "Ventas del mes", valores: [1284, 1190, 1050], formatear: (v) => `$ ${formato.entero(v)} M`, subirEsBueno: true },
  { nombre: "Costo directo", valores: [962, 918, 981], formatear: (v) => `$ ${formato.entero(v)} M`, subirEsBueno: false },
  { nombre: "HH trabajadas", valores: [41260, 43810, 38420], formatear: (v) => formato.entero(v), subirEsBueno: true },
];

function variacion(k: Kpi, j: number) {
  const pct = ((k.valores[0] - k.valores[j]) / k.valores[j]) * 100;
  const direccion: "igual" | "sube" | "baja" = Math.abs(pct) < 0.05 ? "igual" : pct > 0 ? "sube" : "baja";
  const bueno = direccion === "igual" ? null : (pct > 0) === k.subirEsBueno;
  const texto = `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${formato.decimal(Math.abs(pct))}%`;
  return { direccion, bueno, texto };
}

// Comparativo de períodos (HTML + motion): la cifra del mes con barras de este mes, el mes
// anterior y el mismo mes del año anterior, cada comparación con su variación de color de estado.
export function KpiComparativoPeriodos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={220}>
      {KPIS.map((k, i) => (
        <Tarjeta key={k.nombre} k={k} i={i} t={t} />
      ))}
    </FilaKpi>
  );
}

function Tarjeta({ k, i, t }: { k: Kpi; i: number; t: TokensLab }) {
  const [foco, setFoco] = useState<number | null>(null);
  const color = t.colores[i % t.colores.length];
  const max = Math.max(...k.valores);
  const neutro = t.oscuro ? t.textoSuave : t.colores[2 % t.colores.length];
  return (
    <TarjetaKpi t={t} titulo={`${k.nombre} · ${PERIODOS[0]}`} color={color}>
      <div style={{ marginTop: 4 }}>
        <CifraKpi t={t} valor={k.valores[0]} formatear={k.formatear} retraso={i * 0.08} />
      </div>
      <div style={{ flex: 1, minHeight: 6 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {k.valores.map((v, j) => {
          const v2 = j === 0 ? null : variacion(k, j);
          const tenue = foco !== null && foco !== j;
          return (
            <div
              key={PERIODOS[j]}
              onMouseEnter={() => setFoco(j)}
              onMouseLeave={() => setFoco(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "58px 1fr auto",
                alignItems: "center",
                gap: 8,
                fontSize: t.tamano.eje,
                opacity: tenue ? 0.45 : 1,
                transition: "opacity 150ms",
                cursor: "default",
              }}
            >
              <span style={{ color: j === 0 ? t.texto : t.textoSuave, fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>
                {PERIODOS[j]}
              </span>
              <div style={{ height: 6, borderRadius: 999, background: conAlfa(t.texto, t.oscuro ? 0.08 : 0.05), overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", borderRadius: 999, ...estiloBarra(t, j === 0 ? t.acento : neutro) }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(v / max) * 100}%` }}
                  transition={transicionLab(t, j * 0.08)}
                />
              </div>
              <span style={{ display: "inline-flex", justifyContent: "flex-end", minWidth: 64 }}>
                {v2 && foco !== j ? (
                  <ChipVariacion t={t} texto={v2.texto} direccion={v2.direccion} bueno={v2.bueno} />
                ) : (
                  <span style={{ color: t.texto, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {k.formatear(v)}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </TarjetaKpi>
  );
}
