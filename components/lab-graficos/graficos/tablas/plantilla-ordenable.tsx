"use client";

import { useState, type CSSProperties } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { estiloCelda, estiloContenedor, estiloTabla, fondoFila, ocultoVisual } from "./comun";
import { EncabezadoOrdenable } from "./encabezado-ordenable";
import { DATOS_PLANTILLA, rellenoPlantilla, tarjetaPlantilla } from "./plantilla-zebra";

type Col = "nombre" | "region" | "avance";

const COLUMNAS: { id: Col; etiqueta: string; alinear: "left" | "right" }[] = [
  { id: "nombre", etiqueta: "Obra", alinear: "left" },
  { id: "region", etiqueta: "Región", alinear: "left" },
  { id: "avance", etiqueta: "Avance", alinear: "right" },
];

// Plantilla actual (ex TB-102): columnas ordenables con clic en el encabezado (asc/desc),
// portada a los tokens del laboratorio.
export function PlantillaOrdenable({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [col, setCol] = useState<Col>("avance");
  const [asc, setAsc] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);

  const ordenar = (c: Col) => {
    if (col === c) setAsc((v) => !v);
    else {
      setCol(c);
      setAsc(true);
    }
  };

  const filas = [...DATOS_PLANTILLA].sort((a, b) => {
    const dir = asc ? 1 : -1;
    const va = a[col];
    const vb = b[col];
    return (typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "es")) * dir;
  });

  const enc: CSSProperties = { ...rellenoPlantilla(t), height: "auto" };
  const celda = (c: number, ultima: boolean): CSSProperties => ({
    ...estiloCelda(t, { col: c }),
    ...rellenoPlantilla(t),
    height: "auto",
    ...(ultima ? { borderBottom: "none" } : null),
  });

  return (
    <div style={estiloContenedor(t, alto)}>
      <div style={tarjetaPlantilla(t)}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Avance por obra, ordenable</caption>
          <thead>
            <tr>
              {COLUMNAS.map((c, j) => (
                <EncabezadoOrdenable
                  key={c.id}
                  t={t}
                  col={j}
                  etiqueta={c.etiqueta}
                  alinear={c.alinear}
                  activo={col === c.id}
                  direccion={asc ? "asc" : "desc"}
                  onOrdenar={() => ordenar(c.id)}
                  estilo={enc}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((d, i) => {
              const ultima = i === filas.length - 1;
              return (
                <tr
                  key={d.nombre}
                  onMouseEnter={() => setActiva(d.nombre)}
                  onMouseLeave={() => setActiva(null)}
                  style={{ background: fondoFila(t, i, activa === d.nombre) }}
                >
                  <td style={celda(0, ultima)}>{d.nombre}</td>
                  <td style={{ ...celda(1, ultima), color: t.textoSuave }}>{d.region}</td>
                  <td style={{ ...celda(2, ultima), textAlign: "right" }}>{formato.porcentaje(d.avance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
