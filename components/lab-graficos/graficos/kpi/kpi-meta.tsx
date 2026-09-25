"use client";

import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab } from "../comparacion/superficie-svg";
import { CifraKpi, estiloBarra, FilaKpi, TarjetaKpi } from "./tarjeta-kpi";

/** Acumulado del año contra la meta anual, en millones de pesos. */
const KPIS = [
  { nombre: "Ventas del año", real: 9420, meta: 12000 },
  { nombre: "Adjudicación", real: 7780, meta: 8000 },
  { nombre: "Contratación", real: 10600, meta: 10000 },
];

const millones = (v: number) => `$ ${formato.entero(v)} M`;

/** Color de estado según el % de cumplimiento: desde 100 bueno, desde 85 alerta, bajo 85 malo. */
function colorCumplimiento(t: TokensLab, pct: number) {
  return pct >= 100 ? t.estado.bueno : pct >= 85 ? t.estado.alerta : t.estado.malo;
}

// Tarjeta con meta (HTML + motion): valor acumulado, meta, % de cumplimiento en chip de estado y
// barra que se llena hasta el valor con la meta marcada. Si se pasa de la meta, la barra se escala.
export function KpiMeta({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <FilaKpi alto={alto} minimo={200}>
      {KPIS.map((k, i) => {
        const pct = (k.real / k.meta) * 100;
        const color = colorCumplimiento(t, pct);
        const tope = Math.max(k.real, k.meta) * 1.04;
        const diferencia = k.real - k.meta;
        return (
          <TarjetaKpi
            key={k.nombre}
            t={t}
            titulo={k.nombre}
            color={t.colores[i % t.colores.length]}
            extra={
              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 999,
                  fontSize: t.tamano.eje,
                  fontWeight: 600,
                  color,
                  background: conAlfa(color, t.oscuro ? 0.2 : 0.1),
                  border: t.superficie === "contorno" ? `1px solid ${conAlfa(color, 0.5)}` : "1px solid transparent",
                }}
              >
                {formato.porcentaje(pct, 1)}
              </span>
            }
          >
            <div style={{ flex: 1, minHeight: 4 }} />
            <CifraKpi t={t} valor={k.real} formatear={millones} retraso={i * 0.08} />
            <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, marginTop: 2 }}>de {millones(k.meta)} de meta anual</div>
            <div style={{ position: "relative", height: 8, marginTop: 12, borderRadius: 999, background: t.grilla }}>
              <motion.div
                style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, ...estiloBarra(t, color) }}
                initial={{ width: "0%" }}
                animate={{ width: `${(k.real / tope) * 100}%` }}
                transition={transicionLab(t, 0.1 + i * 0.08)}
              />
              {/* Marca de la meta */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${(k.meta / tope) * 100}%`,
                  top: -4,
                  bottom: -4,
                  width: 2,
                  marginLeft: -1,
                  borderRadius: 1,
                  background: t.texto,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6, fontSize: t.tamano.eje - 1 }}>
              <span style={{ color: t.textoSuave }}>{diferencia >= 0 ? "Sobre la meta" : "Falta para la meta"}</span>
              <span style={{ color: diferencia >= 0 ? t.estado.bueno : t.texto, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {millones(Math.abs(diferencia))}
              </span>
            </div>
          </TarjetaKpi>
        );
      })}
    </FilaKpi>
  );
}
