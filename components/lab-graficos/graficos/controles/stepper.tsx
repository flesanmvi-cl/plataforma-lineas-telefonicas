"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { BotonLab } from "../botones/boton-lab";
import { anilloFoco, estiloEtiqueta, estiloPista, transicionMotion } from "../botones/comun";

interface PropsStepper {
  etiqueta: string;
  inicial: number;
  min: number;
  max: number;
  paso: number;
  sufijo?: string;
  /** «unido»: botones y valor en una sola pieza; «separado»: botones sueltos a los lados. */
  forma: "unido" | "separado";
}

/** Stepper numérico: − valor +, con flechas arriba/abajo sobre el valor (role="spinbutton"). */
function Stepper({ etiqueta, inicial, min, max, paso, sufijo = "", forma }: PropsStepper) {
  const t = useTokens();
  const idEtiqueta = useId();
  const [valor, setValor] = useState(inicial);
  const [direccion, setDireccion] = useState(1);
  const [foco, setFoco] = useState(false);
  const alto = t.boton.alto.md;
  const unido = forma === "unido";

  function cambiar(delta: number) {
    setDireccion(Math.sign(delta));
    setValor((v) => Math.min(max, Math.max(min, v + delta)));
  }

  function teclas(e: KeyboardEvent<HTMLDivElement>) {
    const mapa: Record<string, number> = { ArrowUp: paso, ArrowRight: paso, ArrowDown: -paso, ArrowLeft: -paso, PageUp: paso * 5, PageDown: -paso * 5 };
    if (e.key in mapa) {
      e.preventDefault();
      cambiar(mapa[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setValor(min);
    } else if (e.key === "End") {
      e.preventDefault();
      setValor(max);
    }
  }

  const estiloBoton = unido ? { borderRadius: 0, border: "0 solid transparent" } : {};
  const pieza = unido ? { ...estiloPista(t), borderRadius: t.boton.radio, overflow: "hidden" as const } : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <span id={idEtiqueta} style={estiloEtiqueta(t)}>
        {etiqueta}
      </span>
      <div style={{ display: "inline-flex", alignItems: "center", gap: unido ? 0 : 8, ...pieza }}>
        <BotonLab
          variante={unido ? "fantasma" : "contorno"}
          soloIcono
          icono={Minus}
          aria-label={`Restar ${paso}`}
          title={`Restar ${paso}`}
          disabled={valor <= min}
          onClick={() => cambiar(-paso)}
          tabIndex={-1}
          style={estiloBoton}
        />
        <div
          role="spinbutton"
          tabIndex={0}
          aria-labelledby={idEtiqueta}
          aria-valuenow={valor}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={`${valor}${sufijo}`}
          onKeyDown={teclas}
          onFocus={(e) => setFoco(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFoco(false)}
          style={{
            position: "relative",
            height: alto,
            minWidth: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontSize: t.tamano.etiqueta + 3,
            fontWeight: 600,
            color: t.texto,
            fontVariantNumeric: "tabular-nums",
            borderLeft: unido ? `1px solid ${conAlfa(t.texto, 0.12)}` : undefined,
            borderRight: unido ? `1px solid ${conAlfa(t.texto, 0.12)}` : undefined,
            cursor: "default",
            ...anilloFoco(t, foco),
            outlineOffset: unido ? -2 : 2,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direccion}>
            <motion.span
              key={valor}
              custom={direccion}
              initial={{ y: 12 * direccion, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12 * direccion, opacity: 0 }}
              transition={transicionMotion(t)}
            >
              {valor}
              {sufijo}
            </motion.span>
          </AnimatePresence>
        </div>
        <BotonLab
          variante={unido ? "fantasma" : "contorno"}
          soloIcono
          icono={Plus}
          aria-label={`Sumar ${paso}`}
          title={`Sumar ${paso}`}
          disabled={valor >= max}
          onClick={() => cambiar(paso)}
          tabIndex={-1}
          style={estiloBoton}
        />
      </div>
    </div>
  );
}

// Dos steppers: dotación por turno (unido) y avance en tramos de 5 % (separado). Topes deshabilitan el botón.
export function StepperNumerico({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, fontFamily: t.fuente }}>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Stepper etiqueta="Dotación por turno" inicial={8} min={0} max={12} paso={1} forma="unido" />
        <Stepper etiqueta="Avance declarado" inicial={95} min={0} max={100} paso={5} sufijo="%" forma="separado" />
      </div>
      <span style={estiloEtiqueta(t)}>Con el valor enfocado: flechas suben o bajan, Inicio y Fin van a los topes.</span>
    </div>
  );
}
