"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { transicionLab } from "../comparacion/superficie-svg";

/** Etapas del ciclo de un proyecto con su peso relativo en plazo. */
const ETAPAS_PROYECTO = [
  { etapa: "Diseño", peso: 2 },
  { etapa: "Licitación", peso: 1 },
  { etapa: "Obra gruesa", peso: 4 },
  { etapa: "Terminaciones", peso: 3 },
  { etapa: "Entrega", peso: 1 },
];

/** Avance (%) de cada obra en cada etapa. */
const OBRAS_ETAPAS = [
  { obra: "Obra Norte", avance: [100, 100, 100, 62, 0] },
  { obra: "Obra Centro", avance: [100, 100, 45, 0, 0] },
  { obra: "Obra Costa", avance: [100, 100, 100, 100, 40] },
  { obra: "Obra Sur", avance: [100, 70, 0, 0, 0] },
  { obra: "Obra Valle", avance: [100, 100, 88, 12, 0] },
];

const PESO_TOTAL = ETAPAS_PROYECTO.reduce((s, e) => s + e.peso, 0);

function estado(v: number) {
  return v >= 100 ? "Completada" : v > 0 ? "En curso" : "Pendiente";
}

function estiloRelleno(t: TokensLab, color: string) {
  switch (t.superficie) {
    case "degradado":
      return { background: `linear-gradient(90deg, ${conAlfa(color, 0.55)}, ${color})` };
    case "contorno":
      return { background: conAlfa(color, 0.16), boxShadow: `inset 0 0 0 1.5px ${color}` };
    case "sombras":
      return { background: color, boxShadow: `0 4px 10px -2px ${conAlfa(color, 0.55)}` };
    case "glass":
      return {
        background: conAlfa(color, 0.72),
        boxShadow: `0 0 12px ${conAlfa(color, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
      };
    default:
      return { background: color };
  }
}

// Barra de progreso segmentada por etapas (HTML + motion): cada segmento pesa según su plazo y
// se llena con su avance. Pasar el mouse por un segmento muestra etapa, estado y avance.
export function ProgresoEtapas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [foco, setFoco] = useState<{ fila: number; etapa: number } | null>(null);
  const leyenda = t.etiquetas === "leyenda";
  const colorHecho = t.acento;
  const colorCurso = t.oscuro ? t.textoSuave : t.colores[1 % t.colores.length];
  const radio = Math.min(t.radio, 999);
  const altoBarra = 12;
  const detalle = foco
    ? `${OBRAS_ETAPAS[foco.fila].obra} · ${ETAPAS_PROYECTO[foco.etapa].etapa}: ${estado(OBRAS_ETAPAS[foco.fila].avance[foco.etapa])} (${OBRAS_ETAPAS[foco.fila].avance[foco.etapa]}%)`
    : null;

  return (
    <div style={{ height: alto, display: "flex", flexDirection: "column", gap: 8, fontFamily: t.fuente }}>
      {/* Cabecera: leyenda de estados o nombres de etapa alineados a los segmentos */}
      {leyenda ? (
        <div style={{ display: "flex", gap: 14, fontSize: t.tamano.eje, color: t.textoSuave, minHeight: 18, alignItems: "center" }}>
          {[
            { texto: "Completada", color: colorHecho },
            { texto: "En curso", color: colorCurso },
            { texto: "Pendiente", color: t.grilla },
          ].map((l) => (
            <span key={l.texto} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, border: `1px solid ${t.eje}` }} />
              {l.texto}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 3, marginLeft: 96, marginRight: 44, minHeight: 18, alignItems: "flex-end" }}>
          {ETAPAS_PROYECTO.map((e) => (
            <span
              key={e.etapa}
              style={{
                flex: e.peso,
                minWidth: 0,
                fontSize: t.tamano.eje - 1,
                color: t.textoSuave,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {e.etapa}
            </span>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
        {OBRAS_ETAPAS.map((o, fila) => {
          const total = o.avance.reduce((s, v, k) => s + (v / 100) * ETAPAS_PROYECTO[k].peso, 0) / PESO_TOTAL;
          return (
            <div
              key={o.obra}
              style={{
                display: "flex",
                alignItems: "center",
                opacity: foco && foco.fila !== fila ? 0.45 : 1,
                transition: "opacity 150ms",
              }}
            >
              <span style={{ width: 96, flexShrink: 0, fontSize: t.tamano.eje, color: t.textoSuave, whiteSpace: "nowrap" }}>{o.obra}</span>
              <div style={{ flex: 1, display: "flex", gap: 3 }}>
                {ETAPAS_PROYECTO.map((e, k) => {
                  const v = o.avance[k];
                  const color = v >= 100 ? colorHecho : colorCurso;
                  const primero = k === 0;
                  const ultimo = k === ETAPAS_PROYECTO.length - 1;
                  const esFoco = foco?.fila === fila && foco.etapa === k;
                  return (
                    <div
                      key={e.etapa}
                      role="img"
                      aria-label={`${o.obra}, ${e.etapa}: ${estado(v)} ${v}%`}
                      onMouseEnter={() => setFoco({ fila, etapa: k })}
                      onMouseLeave={() => setFoco(null)}
                      style={{
                        flex: e.peso,
                        height: esFoco ? altoBarra + 4 : altoBarra,
                        background: t.grilla,
                        borderTopLeftRadius: primero ? radio : 2,
                        borderBottomLeftRadius: primero ? radio : 2,
                        borderTopRightRadius: ultimo ? radio : 2,
                        borderBottomRightRadius: ultimo ? radio : 2,
                        overflow: t.superficie === "sombras" || t.superficie === "glass" ? "visible" : "hidden",
                        position: "relative",
                        transition: "height 150ms",
                        cursor: "default",
                      }}
                    >
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: 0,
                          right: "auto",
                          borderRadius: "inherit",
                          ...estiloRelleno(t, color),
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${v}%` }}
                        transition={transicionLab(t, (fila * 5 + k) * (t.animacion.duracion / 12000))}
                      />
                    </div>
                  );
                })}
              </div>
              <span
                style={{
                  width: 44,
                  textAlign: "right",
                  flexShrink: 0,
                  fontSize: t.tamano.eje,
                  fontWeight: 600,
                  color: t.texto,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(total * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ minHeight: 18, fontSize: t.tamano.eje, color: detalle ? t.texto : t.textoSuave }}>
        {detalle ?? "Pasa el mouse por un segmento para ver la etapa"}
      </div>
    </div>
  );
}
