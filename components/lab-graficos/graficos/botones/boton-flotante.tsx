"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta } from "./comun";

/** Radio del FAB: circular con forma pastilla o redondeada, cuadrado con forma recta. */
function radioFab(t: TokensLab, lado: number) {
  if (t.boton.radio >= 999) return 999;
  if (t.boton.radio === 0) return 0;
  return Math.min(lado / 2, t.boton.radio + 6);
}

/** El FAB flota por definición: lleva elevación salvo en superficie contorno. */
function sombraFab(t: TokensLab) {
  if (t.superficie === "contorno") return "none";
  return t.oscuro ? "0 10px 24px -8px rgba(0,0,0,0.85)" : `0 10px 24px -8px ${conAlfa(t.acento, 0.6)}`;
}

// Botón flotante (FAB) y su versión extendida con texto, sobre una lista de ejemplo.
export function BotonFlotante({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [extendido, setExtendido] = useState(true);
  const lado = 52;

  return (
    <div style={{ minHeight: alto, display: "flex", gap: 14, fontFamily: t.fuente }}>
      {[false, true].map((conTexto) => (
        <div
          key={String(conTexto)}
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            borderRadius: Math.min(t.radio, 12),
            border: `1px solid ${t.grilla}`,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
          }}
        >
          <span style={estiloEtiqueta(t)}>{conTexto ? "FAB extendido (clic lo contrae)" : "FAB"}</span>
          {/* Filas de relleno que simulan una lista bajo el botón */}
          {[0.9, 0.7, 0.8, 0.55].map((w, i) => (
            <div key={i} style={{ height: 10, width: `${w * 100}%`, borderRadius: 3, background: t.grilla }} />
          ))}
          <div style={{ position: "absolute", right: 12, bottom: 12 }}>
            {conTexto ? (
              <BotonLab
                tamano="lg"
                icono={Plus}
                aria-label={extendido ? undefined : "Nuevo registro"}
                title="Nuevo registro"
                onClick={() => setExtendido((e) => !e)}
                style={{
                  height: lado,
                  padding: extendido ? "0 20px" : 0,
                  width: extendido ? undefined : lado,
                  borderRadius: radioFab(t, lado),
                  boxShadow: sombraFab(t),
                }}
              >
                {extendido ? "Nuevo registro" : null}
              </BotonLab>
            ) : (
              <BotonLab
                tamano="lg"
                soloIcono
                icono={Plus}
                aria-label="Agregar"
                title="Agregar"
                style={{ height: lado, width: lado, borderRadius: radioFab(t, lado), boxShadow: sombraFab(t) }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
