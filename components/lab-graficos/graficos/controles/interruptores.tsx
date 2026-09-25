"use client";

import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { anilloFoco, colorSobre, estiloEtiqueta, transicionCss, transicionMotion } from "../botones/comun";
import { useInteraccion } from "../botones/use-interaccion";
import { moverConFlechas } from "./comun";

const ETAPAS = ["Obra gruesa", "Terminaciones", "Entrega"];
const PERIODOS = ["Mensual", "Trimestral", "Anual"];

/** Radio de las casillas: sigue la forma del botón, pero chico. */
function radioCasilla(t: TokensLab) {
  return t.boton.radio === 0 ? 0 : t.boton.radio >= 999 ? 5 : Math.min(4, t.boton.radio);
}

/** Relleno de un control marcado: acento sólido o suave según el tema. */
function rellenoMarcado(t: TokensLab) {
  if (t.superficie === "contorno" || t.boton.relleno === "suave") {
    return { fondo: conAlfa(t.acento, 0.14), borde: t.acento, marca: t.acento };
  }
  return { fondo: t.acento, borde: t.acento, marca: colorSobre(t.acento) };
}

/** Estilo común de las filas clicables (casilla y radio): control a la izquierda, texto a la derecha. */
function estiloFila(t: TokensLab, foco: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 0,
    border: "0 solid transparent",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontFamily: t.fuente,
    fontSize: t.tamano.etiqueta,
    color: t.texto,
    textAlign: "left" as const,
    borderRadius: 2,
    ...anilloFoco(t, foco),
  };
}

function Interruptor({
  encendido,
  onCambio,
  etiqueta,
  deshabilitado,
}: {
  encendido: boolean;
  onCambio: () => void;
  etiqueta: string;
  deshabilitado?: boolean;
}) {
  const t = useTokens();
  const idEtiqueta = useId();
  const { hover, foco, manejadores } = useInteraccion();
  const m = rellenoMarcado(t);
  const ancho = 36;
  const alto = 20;
  const forma = t.boton.radio === 0 ? 2 : 999;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: t.tamano.etiqueta,
        color: t.texto,
        opacity: deshabilitado ? 0.45 : 1,
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={encendido}
        aria-labelledby={idEtiqueta}
        disabled={deshabilitado}
        onClick={onCambio}
        {...manejadores}
        style={{
          position: "relative",
          width: ancho,
          height: alto,
          flexShrink: 0,
          padding: 0,
          borderRadius: forma,
          border: `1px solid ${encendido ? m.borde : conAlfa(t.texto, hover && !deshabilitado ? 0.45 : 0.28)}`,
          backgroundColor: encendido ? m.fondo : t.superficie === "contorno" ? "transparent" : conAlfa(t.texto, 0.12),
          cursor: deshabilitado ? "not-allowed" : "pointer",
          transition: transicionCss(t),
          ...anilloFoco(t, foco),
        }}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{ x: encendido ? ancho - alto : 0 }}
          transition={transicionMotion(t)}
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: alto - 6,
            height: alto - 6,
            borderRadius: forma,
            background: encendido ? m.marca : t.oscuro ? t.textoSuave : "#FFFFFF",
            boxShadow: "0 1px 2px rgba(0,0,0,0.22)",
          }}
        />
      </button>
      <span id={idEtiqueta}>{etiqueta}</span>
    </span>
  );
}

function Casilla({ estado, onCambio, etiqueta }: { estado: boolean | "mixto"; onCambio: () => void; etiqueta: string }) {
  const t = useTokens();
  const { hover, foco, manejadores } = useInteraccion();
  const m = rellenoMarcado(t);
  const marcada = estado !== false;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={estado === "mixto" ? "mixed" : estado}
      onClick={onCambio}
      {...manejadores}
      style={estiloFila(t, foco)}
    >
      <span
        aria-hidden
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radioCasilla(t),
          border: `1.5px solid ${marcada ? m.borde : conAlfa(t.texto, hover ? 0.55 : 0.35)}`,
          backgroundColor: marcada ? m.fondo : "transparent",
          color: m.marca,
          transition: transicionCss(t),
        }}
      >
        {estado === "mixto" ? <Minus size={12} strokeWidth={3} /> : estado ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      {etiqueta}
    </button>
  );
}

// Interruptor, casillas (con estado mixto en «todas») y radios, con los colores y la forma del tema.
export function Interruptores({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const idRadio = useId();
  const [correo, setCorreo] = useState(true);
  const [compacto, setCompacto] = useState(false);
  const [etapas, setEtapas] = useState([true, false, true]);
  const [periodo, setPeriodo] = useState(1);
  const [focoRadio, setFocoRadio] = useState<number | null>(null);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const m = rellenoMarcado(t);

  const todas: boolean | "mixto" = etapas.every(Boolean) ? true : etapas.some(Boolean) ? "mixto" : false;
  const columna = { display: "flex", flexDirection: "column" as const, gap: 9, minWidth: 0 };

  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        alignContent: "center",
        gap: "16px 20px",
        fontFamily: t.fuente,
      }}
    >
      <div style={columna}>
        <span style={estiloEtiqueta(t)}>Interruptor</span>
        <Interruptor etiqueta="Avisos por correo" encendido={correo} onCambio={() => setCorreo((v) => !v)} />
        <Interruptor etiqueta="Modo compacto" encendido={compacto} onCambio={() => setCompacto((v) => !v)} />
        <Interruptor etiqueta="Sincronizar con ERP" encendido={false} onCambio={() => {}} deshabilitado />
      </div>

      <div style={columna}>
        <span style={estiloEtiqueta(t)}>Casillas</span>
        <Casilla etiqueta="Todas las etapas" estado={todas} onCambio={() => setEtapas(etapas.map(() => todas !== true))} />
        <div style={{ ...columna, paddingLeft: 26 }}>
          {ETAPAS.map((e, i) => (
            <Casilla key={e} etiqueta={e} estado={etapas[i]} onCambio={() => setEtapas(etapas.map((v, k) => (k === i ? !v : v)))} />
          ))}
        </div>
      </div>

      <div style={columna}>
        <span style={estiloEtiqueta(t)} id={idRadio}>
          Radio
        </span>
        <div role="radiogroup" aria-labelledby={idRadio} style={columna}>
          {PERIODOS.map((p, i) => {
            const activo = i === periodo;
            return (
              <button
                key={p}
                ref={(el) => {
                  radios.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={activo}
                tabIndex={activo ? 0 : -1}
                onClick={() => setPeriodo(i)}
                onKeyDown={(e) => moverConFlechas(e, i, PERIODOS.length, setPeriodo, (k) => radios.current[k]?.focus())}
                onFocus={(e) => setFocoRadio(e.currentTarget.matches(":focus-visible") ? i : null)}
                onBlur={() => setFocoRadio(null)}
                style={estiloFila(t, focoRadio === i)}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    borderRadius: 999,
                    border: `1.5px solid ${activo ? m.borde : conAlfa(t.texto, 0.35)}`,
                    backgroundColor: activo ? m.fondo : "transparent",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: transicionCss(t),
                  }}
                >
                  <motion.span
                    initial={false}
                    animate={{ scale: activo ? 1 : 0 }}
                    transition={transicionMotion(t)}
                    style={{ width: 6, height: 6, borderRadius: 999, background: m.marca }}
                  />
                </span>
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
