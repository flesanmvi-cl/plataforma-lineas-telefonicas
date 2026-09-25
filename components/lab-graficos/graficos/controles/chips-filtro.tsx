"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { BotonLab } from "../botones/boton-lab";
import { anilloFoco, estiloEtiqueta, transicionCss, transicionMotion } from "../botones/comun";
import { useInteraccion } from "../botones/use-interaccion";

const FILTROS = [
  { id: "ejecucion", texto: "En ejecución", n: 12 },
  { id: "atrasadas", texto: "Atrasadas", n: 3 },
  { id: "por-iniciar", texto: "Por iniciar", n: 5 },
  { id: "cerradas", texto: "Cerradas", n: 24 },
  { id: "alertas", texto: "Con alertas", n: 2 },
];
const TOTAL = FILTROS.reduce((s, f) => s + f.n, 0);

function Chip({ texto, n, activo, onClick }: { texto: string; n: number; activo: boolean; onClick: () => void }) {
  const t = useTokens();
  const { hover, foco, manejadores } = useInteraccion();
  const solido = t.boton.relleno === "solido" && t.superficie !== "contorno";
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      {...manejadores}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: t.boton.alto.sm,
        padding: "0 10px",
        borderRadius: t.boton.radio >= 999 ? 999 : Math.min(t.boton.radio, 8),
        border: `1px solid ${activo ? t.acento : conAlfa(t.texto, hover ? 0.4 : 0.2)}`,
        backgroundColor: activo ? conAlfa(t.acento, solido ? 0.12 : 0.08) : hover ? conAlfa(t.texto, 0.04) : "transparent",
        color: activo ? t.texto : t.textoSuave,
        fontFamily: t.fuente,
        fontSize: t.tamano.etiqueta,
        fontWeight: activo ? 600 : 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: transicionCss(t),
        ...anilloFoco(t, foco),
      }}
    >
      <AnimatePresence initial={false}>
        {activo && (
          <motion.span
            aria-hidden
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 14, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={transicionMotion(t)}
            style={{ display: "inline-flex", color: t.acento, overflow: "hidden" }}
          >
            <Check size={14} strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
      {texto}
      <span
        style={{
          fontSize: t.tamano.eje - 1,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          padding: "1px 6px",
          borderRadius: 999,
          background: activo ? conAlfa(t.acento, 0.16) : conAlfa(t.texto, 0.07),
          color: activo ? t.acento : t.textoSuave,
        }}
      >
        {n}
      </span>
    </button>
  );
}

// Chips de filtro de selección múltiple con contador; «Limpiar» aparece cuando hay algo marcado.
export function ChipsFiltro({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [activos, setActivos] = useState<string[]>(["ejecucion", "atrasadas"]);
  const visibles = activos.length ? FILTROS.filter((f) => activos.includes(f.id)).reduce((s, f) => s + f.n, 0) : TOTAL;

  function alternar(id: string) {
    setActivos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, fontFamily: t.fuente }}>
      <div role="group" aria-label="Filtrar obras por estado" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FILTROS.map((f) => (
          <Chip key={f.id} texto={f.texto} n={f.n} activo={activos.includes(f.id)} onClick={() => alternar(f.id)} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: t.boton.alto.sm }}>
        <span style={{ ...estiloEtiqueta(t), fontVariantNumeric: "tabular-nums" }} aria-live="polite">
          Mostrando {visibles} de {TOTAL} obras
        </span>
        {activos.length > 0 && (
          <BotonLab variante="texto" tamano="sm" icono={X} onClick={() => setActivos([])}>
            Limpiar ({activos.length})
          </BotonLab>
        )}
      </div>
    </div>
  );
}
