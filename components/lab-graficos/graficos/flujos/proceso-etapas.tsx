"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, RotateCcw } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

const PASOS = [
  { nombre: "Terreno", area: "Oficina técnica", plan: 10, real: 9 },
  { nombre: "Diseño", area: "Arquitectura", plan: 25, real: 31 },
  { nombre: "Presupuesto", area: "Estudios", plan: 12, real: 12 },
  { nombre: "Licitación", area: "Abastecimiento", plan: 20, real: 14 },
  { nombre: "Adjudicación", area: "Gerencia de proyecto", plan: 8, real: 0 },
  { nombre: "Contrato", area: "Legal", plan: 10, real: 0 },
];

type Estado = "hecho" | "curso" | "pendiente";
const NOMBRE_ESTADO: Record<Estado, string> = { hecho: "Hecho", curso: "En curso", pendiente: "Pendiente" };

function estiloNodo(t: TokensLab, estado: Estado): CSSProperties {
  const a = t.acento;
  if (estado === "pendiente") return { background: t.fondoTarjeta, border: `1.5px solid ${t.eje}`, color: t.textoSuave };
  if (estado === "curso") {
    return {
      background: t.fondoTarjeta,
      border: `2px solid ${a}`,
      color: a,
      boxShadow: t.superficie === "sombras" || t.superficie === "glass" ? `0 4px 12px ${conAlfa(a, 0.35)}` : undefined,
    };
  }
  switch (t.superficie) {
    case "degradado":
      return { background: `linear-gradient(135deg, ${a}, ${conAlfa(a, 0.55)})`, border: "none", color: "#FFFFFF" };
    case "contorno":
      return { background: conAlfa(a, 0.12), border: `1.5px solid ${a}`, color: a };
    case "sombras":
      return { background: a, border: "none", color: "#FFFFFF", boxShadow: `0 6px 14px ${conAlfa(a, 0.45)}` };
    case "glass":
      return {
        background: conAlfa(a, 0.75),
        border: "1px solid rgba(255,255,255,0.35)",
        color: "#FFFFFF",
        backdropFilter: "blur(6px)",
        boxShadow: `0 0 16px ${conAlfa(a, 0.55)}`,
      };
    default:
      return { background: a, border: "none", color: "#FFFFFF" };
  }
}

// Diagrama de proceso por etapas: estado de cada paso (hecho, en curso, pendiente), conectores
// que se llenan al avanzar y la ficha del paso elegido. «Avanzar» simula el paso del tiempo.
export function ProcesoEtapas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [actual, setActual] = useState(3);
  const [elegido, setElegido] = useState(3);
  const dur = t.animacion.duracion / 1000;
  const n = PASOS.length;
  const estado = (i: number): Estado => (i < actual ? "hecho" : i === actual ? "curso" : "pendiente");
  const paso = PASOS[elegido];
  const est = estado(elegido);
  // Pasos sin dato real (se completaron en la simulación) se cierran en plazo.
  const real = est === "curso" ? paso.real || Math.round(paso.plan * 0.5) : paso.real || paso.plan;
  const desvio = real - paso.plan;
  const terminado = actual >= n;

  const boton: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 26,
    padding: "0 10px",
    borderRadius: Math.min(t.radio, 999),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: t.eje,
    background: t.fondoTarjeta,
    color: t.texto,
    fontFamily: t.fuente,
    fontSize: t.tamano.eje,
    cursor: "pointer",
  };

  return (
    <div style={{ height: alto, display: "flex", flexDirection: "column", gap: 10, fontFamily: t.fuente }}>
      {/* Pasos */}
      <ol style={{ display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, listStyle: "none", margin: 0, padding: "6px 0 0" }}>
        {PASOS.map((p, i) => {
          const e = estado(i);
          const activo = elegido === i;
          return (
            <li key={p.nombre} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
              {/* Conector hacia el paso siguiente */}
              {i < n - 1 && (
                <div style={{ position: "absolute", top: 15, left: "calc(50% + 18px)", right: "calc(-50% + 18px)", height: 3, borderRadius: 2, background: t.grilla, overflow: "hidden" }}>
                  <motion.div
                    initial={false}
                    animate={{ scaleX: i < actual ? 1 : 0 }}
                    transition={{ duration: dur * 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "100%", background: t.acento, transformOrigin: "left" }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => setElegido(i)}
                aria-pressed={activo}
                aria-label={`${p.nombre}: ${NOMBRE_ESTADO[e]}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: 0, padding: 0, cursor: "pointer", minWidth: 0, maxWidth: "100%" }}
              >
                <motion.span
                  layout
                  animate={{ scale: activo ? 1.12 : 1 }}
                  transition={{ duration: Math.min(dur, 0.25) }}
                  style={{
                    position: "relative",
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: t.tamano.eje,
                    fontWeight: 700,
                    outline: activo ? `2px solid ${conAlfa(t.texto, 0.5)}` : "none",
                    outlineOffset: 2,
                    transition: "background 200ms, color 200ms, border-color 200ms",
                    ...estiloNodo(t, e),
                  }}
                >
                  {e === "hecho" ? <Check size={16} strokeWidth={2.5} /> : i + 1}
                  {e === "curso" && dur > 0 && (
                    <motion.span
                      aria-hidden
                      style={{ position: "absolute", inset: -2, borderRadius: 999, border: `2px solid ${t.acento}` }}
                      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.span>
                <span
                  style={{
                    fontSize: t.tamano.eje,
                    color: e === "pendiente" ? t.textoSuave : t.texto,
                    fontWeight: activo ? 700 : 500,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.nombre}
                </span>
                <span style={{ fontSize: t.tamano.eje - 1, color: e === "curso" ? t.acento : t.textoSuave }}>{NOMBRE_ESTADO[e]}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Ficha del paso elegido */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${elegido}-${est}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: Math.min(dur, 0.25) }}
            style={{
              height: "100%",
              boxSizing: "border-box",
              borderRadius: Math.min(t.radio, 16),
              padding: "10px 12px",
              background: conAlfa(t.textoSuave, 0.07),
              border: `1px solid ${conAlfa(t.textoSuave, 0.15)}`,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              alignContent: "center",
              gap: 8,
            }}
          >
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: t.tamano.etiqueta, fontWeight: 700, color: t.texto }}>
                {elegido + 1}. {paso.nombre}
              </span>
              <span style={{ fontSize: t.tamano.eje, color: t.textoSuave, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{paso.area}</span>
            </div>
            {[
              { rotulo: "Plan", valor: `${paso.plan} días` },
              { rotulo: est === "curso" ? "Llevamos" : "Real", valor: est === "pendiente" ? "—" : `${real} días` },
              {
                rotulo: "Desvío",
                valor: est === "pendiente" ? "—" : desvio > 0 ? `+${desvio} días` : desvio < 0 && est === "hecho" ? `−${-desvio} días` : "En plazo",
                color: est !== "pendiente" && desvio > 0 ? t.acento : t.texto,
              },
            ].map((d) => (
              <div key={d.rotulo} style={{ minWidth: 0 }}>
                <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>{d.rotulo}</div>
                <div style={{ fontSize: t.tamano.etiqueta + 2, fontWeight: 700, color: d.color ?? t.texto }}>{d.valor}</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>
          {terminado ? "Proceso completo" : `${actual} de ${n} etapas hechas`}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            style={boton}
            aria-label="Reiniciar proceso"
            onClick={() => {
              setActual(0);
              setElegido(0);
            }}
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            style={{ ...boton, background: terminado ? t.fondoTarjeta : t.acento, color: terminado ? t.textoSuave : "#FFFFFF", borderColor: terminado ? t.eje : t.acento }}
            disabled={terminado}
            onClick={() => {
              const siguiente = Math.min(n, actual + 1);
              setActual(siguiente);
              setElegido(Math.min(n - 1, siguiente));
            }}
          >
            Avanzar <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
