"use client";

import { useId, useState, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { colorSobre, transicionMotion } from "../botones/comun";
import { estiloEtiquetaCampo, estiloMensaje, transicionCampo } from "./comun";
import { Asterisco } from "./marco";

/*
 * Casilla, interruptor y grupo de radios para formularios, sobre inputs nativos (envían con el
 * formulario y el navegador resuelve teclado y lectores). Siguen el mismo dibujo que los
 * controles de la sección Botones (controles/interruptores.tsx), que no se exportan sueltos.
 */

const NATIVO_OCULTO: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: 0,
  opacity: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
};

function marcado(t: TokensLab) {
  if (t.superficie === "contorno" || t.boton.relleno === "suave") return { fondo: conAlfa(t.acento, 0.14), borde: t.acento, marca: t.acento };
  return { fondo: t.acento, borde: t.acento, marca: colorSobre(t.acento) };
}

function useFocoVisible() {
  const [foco, setFoco] = useState(false);
  return {
    foco,
    onFocus: (e: FocusEvent<HTMLInputElement>) => setFoco(e.currentTarget.matches(":focus-visible")),
    onBlur: () => setFoco(false),
  };
}

const anillo = (t: TokensLab, foco: boolean) => (foco ? `0 0 0 3px ${t.campo.anilloFoco}` : "none");

interface PropsCasilla {
  etiqueta: ReactNode;
  marcada: boolean;
  onCambio: (v: boolean) => void;
  descripcion?: ReactNode;
  deshabilitado?: boolean;
  nombre?: string;
}

export function CampoCasilla({ etiqueta, marcada, onCambio, descripcion, deshabilitado, nombre }: PropsCasilla) {
  const t = useTokens();
  const id = useId();
  const f = useFocoVisible();
  const m = marcado(t);
  return (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontFamily: t.fuente,
        fontSize: t.tamano.etiqueta + 1,
        color: t.texto,
        cursor: deshabilitado ? "not-allowed" : "pointer",
        opacity: deshabilitado ? 0.5 : 1,
      }}
    >
      <input
        id={id}
        name={nombre}
        type="checkbox"
        checked={marcada}
        disabled={deshabilitado}
        onChange={(e) => onCambio(e.target.checked)}
        onFocus={f.onFocus}
        onBlur={f.onBlur}
        aria-describedby={descripcion ? `${id}-d` : undefined}
        style={NATIVO_OCULTO}
      />
      <span
        aria-hidden
        style={{
          width: 17,
          height: 17,
          marginTop: 1,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: t.boton.radio === 0 ? 0 : 4,
          border: `1.5px solid ${marcada ? m.borde : conAlfa(t.texto, 0.35)}`,
          background: marcada ? m.fondo : t.campo.estilo === "relleno" ? t.campo.fondo : "transparent",
          color: m.marca,
          boxShadow: anillo(t, f.foco),
          transition: transicionCampo(t),
        }}
      >
        {marcada && <Check size={12} strokeWidth={3} />}
      </span>
      <span style={{ lineHeight: 1.35 }}>
        {etiqueta}
        {descripcion && (
          <span id={`${id}-d`} style={{ ...estiloMensaje(t), display: "block", marginTop: 2 }}>
            {descripcion}
          </span>
        )}
      </span>
    </label>
  );
}

interface PropsInterruptor {
  etiqueta: ReactNode;
  encendido: boolean;
  onCambio: (v: boolean) => void;
  descripcion?: ReactNode;
  deshabilitado?: boolean;
}

/** Interruptor para opciones que aplican al instante o de sí/no (role="switch" sobre checkbox). */
export function CampoInterruptor({ etiqueta, encendido, onCambio, descripcion, deshabilitado }: PropsInterruptor) {
  const t = useTokens();
  const id = useId();
  const f = useFocoVisible();
  const m = marcado(t);
  const ancho = 36;
  const alto = 20;
  const forma = t.boton.radio === 0 ? 2 : 999;
  return (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontFamily: t.fuente,
        fontSize: t.tamano.etiqueta + 1,
        color: t.texto,
        cursor: deshabilitado ? "not-allowed" : "pointer",
        opacity: deshabilitado ? 0.5 : 1,
      }}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={encendido}
        disabled={deshabilitado}
        onChange={(e) => onCambio(e.target.checked)}
        onFocus={f.onFocus}
        onBlur={f.onBlur}
        aria-describedby={descripcion ? `${id}-d` : undefined}
        style={NATIVO_OCULTO}
      />
      <span
        aria-hidden
        style={{
          position: "relative",
          width: ancho,
          height: alto,
          flexShrink: 0,
          borderRadius: forma,
          border: `1px solid ${encendido ? m.borde : conAlfa(t.texto, 0.28)}`,
          background: encendido ? m.fondo : t.superficie === "contorno" ? "transparent" : conAlfa(t.texto, 0.12),
          boxShadow: anillo(t, f.foco),
          transition: transicionCampo(t),
        }}
      >
        <motion.span
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
      </span>
      <span style={{ lineHeight: 1.35, paddingTop: 1 }}>
        {etiqueta}
        {descripcion && (
          <span id={`${id}-d`} style={{ ...estiloMensaje(t), display: "block", marginTop: 2 }}>
            {descripcion}
          </span>
        )}
      </span>
    </label>
  );
}

interface PropsRadio {
  etiqueta: string;
  opciones: { valor: string; etiqueta: string; descripcion?: string }[];
  valor: string;
  onCambio: (v: string) => void;
  /** En fila (pocas opciones cortas) o en columna. */
  enFila?: boolean;
  requerido?: boolean;
  error?: string | null;
  className?: string;
}

/** Grupo de radios nativos: flechas del teclado mueven la selección (lo hace el navegador). */
export function GrupoRadio({ etiqueta, opciones, valor, onCambio, enFila, requerido, error, className }: PropsRadio) {
  const t = useTokens();
  const nombre = useId();
  const [foco, setFoco] = useState<string | null>(null);
  const m = marcado(t);
  return (
    <fieldset
      className={className}
      aria-describedby={error ? `${nombre}-e` : undefined}
      style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}
    >
      <legend style={{ ...estiloEtiquetaCampo(t), padding: 0, marginBottom: 8 }}>
        {etiqueta}
        {requerido && <Asterisco />}
      </legend>
      <div style={{ display: "flex", flexDirection: enFila ? "row" : "column", flexWrap: "wrap", gap: enFila ? "8px 18px" : 8 }}>
        {opciones.map((o) => {
          const activo = o.valor === valor;
          const id = `${nombre}-${o.valor}`;
          return (
            <label
              key={o.valor}
              htmlFor={id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontFamily: t.fuente,
                fontSize: t.tamano.etiqueta + 1,
                color: t.texto,
                cursor: "pointer",
              }}
            >
              <input
                id={id}
                type="radio"
                name={nombre}
                value={o.valor}
                checked={activo}
                required={requerido}
                onChange={() => onCambio(o.valor)}
                onFocus={(e) => setFoco(e.currentTarget.matches(":focus-visible") ? o.valor : null)}
                onBlur={() => setFoco(null)}
                style={NATIVO_OCULTO}
              />
              <span
                aria-hidden
                style={{
                  width: 17,
                  height: 17,
                  marginTop: 1,
                  flexShrink: 0,
                  borderRadius: 999,
                  border: `1.5px solid ${activo ? m.borde : error ? t.campo.error : conAlfa(t.texto, 0.35)}`,
                  background: activo ? m.fondo : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: anillo(t, foco === o.valor),
                  transition: transicionCampo(t),
                }}
              >
                <motion.span
                  initial={false}
                  animate={{ scale: activo ? 1 : 0 }}
                  transition={transicionMotion(t)}
                  style={{ width: 7, height: 7, borderRadius: 999, background: m.marca }}
                />
              </span>
              <span style={{ lineHeight: 1.35 }}>
                {o.etiqueta}
                {o.descripcion && <span style={{ ...estiloMensaje(t), display: "block", marginTop: 1 }}>{o.descripcion}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <span id={`${nombre}-e`} style={{ ...estiloMensaje(t, true), display: "block", marginTop: 6 }}>
          {error}
        </span>
      )}
    </fieldset>
  );
}
