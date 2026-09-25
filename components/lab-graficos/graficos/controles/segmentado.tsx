"use client";

import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { LayoutGrid, List, Map as IconoMapa, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { anilloFoco, estiloEtiqueta, estiloPista, estiloVariante, radioInterno, transicionCss, transicionMotion } from "../botones/comun";
import { moverConFlechas } from "./comun";

type Estilo = "pastilla" | "subrayado" | "bloques";

interface Opcion {
  id: string;
  texto: string;
  icono?: LucideIcon;
}

const GRUPOS: { estilo: Estilo; nombre: string; etiqueta: string; opciones: Opcion[] }[] = [
  {
    estilo: "pastilla",
    nombre: "Pastilla que se desliza",
    etiqueta: "Período",
    opciones: [
      { id: "dia", texto: "Día" },
      { id: "semana", texto: "Semana" },
      { id: "mes", texto: "Mes" },
      { id: "anio", texto: "Año" },
    ],
  },
  {
    estilo: "subrayado",
    nombre: "Subrayado",
    etiqueta: "Sección",
    opciones: [
      { id: "resumen", texto: "Resumen" },
      { id: "detalle", texto: "Detalle" },
      { id: "historial", texto: "Historial" },
    ],
  },
  {
    estilo: "bloques",
    nombre: "Bloques unidos",
    etiqueta: "Vista",
    opciones: [
      { id: "lista", texto: "Lista", icono: List },
      { id: "grilla", texto: "Grilla", icono: LayoutGrid },
      { id: "mapa", texto: "Mapa", icono: IconoMapa },
    ],
  },
];

// Selección exclusiva entre 2-4 opciones en tres estilos. Flechas del teclado cambian la opción.
export function Segmentado({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, fontFamily: t.fuente }}>
      {GRUPOS.map((g) => (
        <div key={g.estilo} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <span style={estiloEtiqueta(t)}>{g.nombre}</span>
          <Grupo estilo={g.estilo} etiqueta={g.etiqueta} opciones={g.opciones} />
        </div>
      ))}
    </div>
  );
}

function Grupo({ estilo, etiqueta, opciones }: { estilo: Estilo; etiqueta: string; opciones: Opcion[] }) {
  const t = useTokens();
  // layoutId único por instancia: el comparador dibuja varias copias a la vez.
  const idLayout = useId();
  const [elegida, setElegida] = useState(estilo === "pastilla" ? 2 : 0);
  const [foco, setFoco] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const alto = t.boton.alto.sm + (estilo === "subrayado" ? 4 : 0);
  const fs = t.boton.tamanoTexto.sm;

  const pista =
    estilo === "pastilla"
      ? { ...estiloPista(t), padding: 3, borderRadius: t.boton.radio, gap: 2 }
      : estilo === "subrayado"
        ? { borderBottom: `1px solid ${t.grilla}`, gap: 4 }
        : { gap: 0 };

  return (
    <div role="radiogroup" aria-label={etiqueta} style={{ display: "inline-flex", position: "relative", ...pista }}>
      {opciones.map((op, i) => {
        const activa = i === elegida;
        const Icono = op.icono;
        const primero = i === 0;
        const ultimo = i === opciones.length - 1;
        const r = t.boton.radio;
        const estiloBloque =
          estilo === "bloques"
            ? {
                ...(activa
                  ? estiloVariante(t, "solido")
                  : { ...estiloVariante(t, "contorno"), color: t.textoSuave, border: `1px solid ${conAlfa(t.texto, 0.2)}` }),
                marginLeft: primero ? 0 : -1,
                zIndex: activa ? 1 : 0,
                borderRadius: `${primero ? r : 0}px ${ultimo ? r : 0}px ${ultimo ? r : 0}px ${primero ? r : 0}px`,
              }
            : {};
        return (
          <button
            key={op.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            tabIndex={activa ? 0 : -1}
            onClick={() => setElegida(i)}
            onKeyDown={(e) => moverConFlechas(e, i, opciones.length, setElegida, (k) => refs.current[k]?.focus())}
            onFocus={(e) => setFoco(e.currentTarget.matches(":focus-visible") ? i : null)}
            onBlur={() => setFoco(null)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: alto,
              padding: "0 12px",
              border: "0 solid transparent",
              backgroundColor: "transparent",
              color: activa ? t.texto : t.textoSuave,
              fontFamily: t.fuente,
              fontSize: fs,
              fontWeight: t.boton.fontWeight,
              textTransform: t.boton.textTransform,
              letterSpacing: t.boton.letterSpacing,
              whiteSpace: "nowrap",
              cursor: "pointer",
              borderRadius: estilo === "pastilla" ? radioInterno(t) : 2,
              transition: transicionCss(t),
              ...estiloBloque,
              ...anilloFoco(t, foco === i),
            }}
          >
            {/* Fondo que se desliza (pastilla) o raya bajo la opción (subrayado) */}
            {activa && estilo === "pastilla" && (
              <motion.span
                layoutId={`${idLayout}-pastilla`}
                transition={transicionMotion(t)}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radioInterno(t),
                  background: t.oscuro ? conAlfa(t.texto, 0.14) : t.fondoTarjeta,
                  boxShadow: t.superficie === "contorno" ? `inset 0 0 0 1px ${t.eje}` : "0 1px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)",
                }}
              />
            )}
            {activa && estilo === "subrayado" && (
              <motion.span
                layoutId={`${idLayout}-raya`}
                transition={transicionMotion(t)}
                aria-hidden
                style={{ position: "absolute", left: 8, right: 8, bottom: -1, height: 2, borderRadius: 2, background: t.acento }}
              />
            )}
            {Icono && <Icono size={14} aria-hidden style={{ position: "relative" }} />}
            <span style={{ position: "relative" }}>{op.texto}</span>
          </button>
        );
      })}
    </div>
  );
}
