"use client";

import type { ReactNode } from "react";
import { ArrowRight, Download } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { anilloFoco, estiloEtiqueta, transicionCss } from "./comun";
import { useInteraccion } from "./use-interaccion";

interface PropsEnlace {
  children: ReactNode;
  icono?: "flecha" | "descarga";
  /** Subrayado siempre visible (en medio de un párrafo), que se engruesa al pasar el mouse. */
  enTexto?: boolean;
  /** Color neutro en vez del acento. */
  neutro?: boolean;
}

/** Botón con apariencia de enlace: subrayado que crece desde la izquierda y flecha que avanza. */
function EnlaceAccion({ children, icono, enTexto, neutro }: PropsEnlace) {
  const t = useTokens();
  const { hover, foco, manejadores } = useInteraccion();
  const color = neutro ? t.texto : t.acento;
  const ms = t.animacion.duracion > 0 ? Math.min(320, t.animacion.duracion / 2) : 0;
  const tamano = t.tamano.etiqueta + 1;

  return (
    <button
      type="button"
      {...manejadores}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 0",
        border: 0,
        background: "transparent",
        color,
        fontFamily: t.fuente,
        fontSize: tamano,
        fontWeight: enTexto ? 600 : t.boton.fontWeight,
        cursor: "pointer",
        borderRadius: 2,
        ...anilloFoco(t, foco),
      }}
    >
      <span style={{ position: "relative" }}>
        {children}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -2,
            height: enTexto && hover ? 2 : 1.5,
            background: color,
            opacity: enTexto && !hover ? 0.45 : 1,
            transform: enTexto || hover ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: `transform ${ms}ms ${t.animacion.easingCss}, opacity ${ms}ms, height ${ms}ms`,
          }}
        />
      </span>
      {icono === "flecha" && (
        <ArrowRight size={15} aria-hidden style={{ transform: hover ? "translateX(3px)" : "none", transition: transicionCss(t, ["transform"]) }} />
      )}
      {icono === "descarga" && (
        <Download size={15} aria-hidden style={{ transform: hover ? "translateY(2px)" : "none", transition: transicionCss(t, ["transform"]) }} />
      )}
    </button>
  );
}

// Acciones con forma de enlace: para ir a otra vista o descargar sin competir con los botones.
export function EnlaceAccionMuestra({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, fontFamily: t.fuente }}>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
        <EnlaceAccion icono="flecha">Ver todas las obras</EnlaceAccion>
        <EnlaceAccion icono="descarga" neutro>
          Descargar informe
        </EnlaceAccion>
      </div>
      <p style={{ margin: 0, fontSize: t.tamano.etiqueta + 1, color: t.texto, lineHeight: 1.6, maxWidth: 440 }}>
        La obra Costa tiene 3 observaciones pendientes de la última visita. <EnlaceAccion enTexto>Revisar observaciones</EnlaceAccion>
      </p>
      <span style={estiloEtiqueta(t)}>Pasa el mouse: el subrayado crece y la flecha avanza.</span>
    </div>
  );
}
