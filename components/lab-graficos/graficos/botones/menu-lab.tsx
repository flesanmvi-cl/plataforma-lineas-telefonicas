"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { transicionMotion } from "./comun";

export interface OpcionMenu {
  id: string;
  etiqueta: string;
  icono?: LucideIcon;
  /** Acción destructiva: va al final, separada y en el color de peligro. */
  peligro?: boolean;
  /** Texto de apoyo a la derecha (atajo, detalle). */
  detalle?: string;
}

interface PropsMenuLab {
  abierto: boolean;
  onCerrar: () => void;
  onElegir: (op: OpcionMenu) => void;
  opciones: OpcionMenu[];
  /** Contenedor del disparador y el menú: un clic fuera de él cierra. */
  contenedorRef: RefObject<HTMLElement | null>;
  /** Disparador, para devolverle el foco al cerrar con Esc. */
  disparadorRef: RefObject<HTMLElement | null>;
  id: string;
  etiqueta: string;
  alinear?: "izquierda" | "derecha";
  anchoMinimo?: number;
}

/**
 * Menú desplegable accesible (role="menu"): flechas para moverse, Esc cierra y devuelve el foco,
 * clic fuera cierra. El disparador lleva aria-haspopup, aria-expanded y aria-controls.
 */
export function MenuLab({
  abierto,
  onCerrar,
  onElegir,
  opciones,
  contenedorRef,
  disparadorRef,
  id,
  etiqueta,
  alinear = "izquierda",
  anchoMinimo = 200,
}: PropsMenuLab) {
  const t = useTokens();
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [enfocado, setEnfocado] = useState(0);
  const radio = Math.min(t.radio, 12);
  const vidrio = t.superficie === "glass";

  // Al abrir, el foco va a la primera opción.
  useEffect(() => {
    if (!abierto) return;
    setEnfocado(0);
    const cuadro = requestAnimationFrame(() => itemsRef.current[0]?.focus());
    return () => cancelAnimationFrame(cuadro);
  }, [abierto]);

  // Clic fuera y Esc cierran.
  useEffect(() => {
    if (!abierto) return;
    function fuera(e: PointerEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) onCerrar();
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCerrar();
        disparadorRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, onCerrar, contenedorRef, disparadorRef]);

  function mover(delta: number) {
    const n = opciones.length;
    const siguiente = (enfocado + delta + n) % n;
    setEnfocado(siguiente);
    itemsRef.current[siguiente]?.focus();
  }

  const normales = opciones.filter((o) => !o.peligro);
  const peligrosas = opciones.filter((o) => o.peligro);
  const ordenadas = [...normales, ...peligrosas];

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          id={id}
          role="menu"
          aria-label={etiqueta}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={transicionMotion(t)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              mover(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              mover(-1);
            } else if (e.key === "Tab") {
              onCerrar();
            }
          }}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [alinear === "derecha" ? "right" : "left"]: 0,
            zIndex: 30,
            minWidth: anchoMinimo,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: vidrio ? (t.oscuro ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.85)") : t.fondoTarjeta,
            backdropFilter: vidrio ? "blur(14px)" : undefined,
            border: `1px solid ${t.superficie === "contorno" ? t.eje : t.grilla}`,
            borderRadius: radio,
            boxShadow: t.superficie === "contorno" ? "none" : t.oscuro ? "0 14px 32px -12px rgba(0,0,0,0.8)" : "0 14px 32px -12px rgba(20,20,40,0.28)",
            transformOrigin: alinear === "derecha" ? "top right" : "top left",
            fontFamily: t.fuente,
          }}
        >
          {ordenadas.map((op, i) => {
            const Icono = op.icono;
            const color = op.peligro ? t.estado.malo : t.texto;
            const separar = op.peligro && i === normales.length && normales.length > 0;
            return (
              <div key={op.id}>
                {separar && <div role="separator" style={{ height: 1, background: t.grilla, margin: "4px 2px" }} />}
                <button
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={i === enfocado ? 0 : -1}
                  onClick={() => {
                    onElegir(op);
                    onCerrar();
                    disparadorRef.current?.focus();
                  }}
                  onPointerEnter={(e) => {
                    setEnfocado(i);
                    e.currentTarget.focus();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    height: 32,
                    padding: "0 10px",
                    border: 0,
                    borderRadius: Math.max(0, radio - 4),
                    background: i === enfocado ? conAlfa(op.peligro ? t.estado.malo : t.texto, op.peligro ? 0.1 : 0.07) : "transparent",
                    color,
                    fontFamily: t.fuente,
                    fontSize: t.tamano.etiqueta,
                    textAlign: "left",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {Icono && <Icono size={15} aria-hidden style={{ opacity: op.peligro ? 1 : 0.75 }} />}
                  <span style={{ flex: 1 }}>{op.etiqueta}</span>
                  {op.detalle && <span style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>{op.detalle}</span>}
                </button>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
