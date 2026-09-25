"use client";

import type { CSSProperties } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { estiloCelda, estiloContenedor, estiloEncabezado, estiloTabla, ocultoVisual } from "./comun";

// Plantilla actual (ex TB-101): tabla simple con filas alternas y cifras a la derecha, portada a
// los tokens del laboratorio. Conserva su tarjeta con borde y el relleno de celda por densidad.
export const DATOS_PLANTILLA = [
  { nombre: "Obra Vespucio", region: "Metropolitana", avance: 92 },
  { nombre: "Obra Aysén", region: "Aysén", avance: 78 },
  { nombre: "Obra Toro", region: "Metropolitana", avance: 65 },
  { nombre: "Obra Dolores", region: "Valparaíso", avance: 54 },
  { nombre: "Obra Colina", region: "Metropolitana", avance: 41 },
];

/** Relleno de celda de la plantilla (equivale a --densidad-celda-x/y). */
export function rellenoPlantilla(t: TokensLab): CSSProperties {
  return t.tema.densidad === "compacta" ? { padding: "6px 12px" } : { padding: "12px 16px" };
}

/** Tarjeta de la plantilla (.card): borde y radio del tema. */
export function tarjetaPlantilla(t: TokensLab): CSSProperties {
  return { background: t.fondoTarjeta, border: `1px solid ${t.tabla.borde}`, borderRadius: t.radio, overflow: "hidden" };
}

export function PlantillaZebra({ alto }: PropsGraficoLab) {
  const t = useTokens();
  // La zebra es la gracia de esta tabla: si el tema no la pide, se usa un gris suave igual.
  const zebra = t.tabla.zebra ?? (t.oscuro ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)");
  const enc = (col: number): CSSProperties => ({ ...estiloEncabezado(t, { col }), ...rellenoPlantilla(t), height: "auto" });
  const celda = (col: number): CSSProperties => ({
    ...estiloCelda(t, { col }),
    ...rellenoPlantilla(t),
    height: "auto",
    borderBottom: "none",
  });

  return (
    <div style={estiloContenedor(t, alto)}>
      <div style={tarjetaPlantilla(t)}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Avance por obra</caption>
          <thead>
            <tr>
              <th scope="col" style={enc(0)}>
                Obra
              </th>
              <th scope="col" style={enc(1)}>
                Región
              </th>
              <th scope="col" style={{ ...enc(2), textAlign: "right" }}>
                Avance
              </th>
            </tr>
          </thead>
          <tbody>
            {DATOS_PLANTILLA.map((d, i) => (
              <tr key={d.nombre} style={{ background: i % 2 === 1 ? zebra : "transparent" }}>
                <td style={celda(0)}>{d.nombre}</td>
                <td style={{ ...celda(1), color: t.textoSuave }}>{d.region}</td>
                <td style={{ ...celda(2), textAlign: "right" }}>{formato.porcentaje(d.avance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
