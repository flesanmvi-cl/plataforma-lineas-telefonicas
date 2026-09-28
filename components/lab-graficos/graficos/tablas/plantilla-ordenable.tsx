"use client";

import { useState, type CSSProperties } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato } from "@/lib/lab-graficos/datos";
import { descargarExcel } from "@/lib/exportar/excel";
import { estiloCelda, estiloContenedor, estiloTabla, fondoFila, ocultoVisual } from "./comun";
import { textoOrden } from "./datos-tablas";
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

  // Excel en el orden vigente.
  const descargar = () =>
    descargarExcel(
      [
        {
          nombre: "Avance por obra",
          filas,
          columnas: [
            { titulo: "Obra", valor: (d) => d.nombre },
            { titulo: "Región", valor: (d) => d.region, ancho: 16 },
            { titulo: "Avance", valor: (d) => d.avance / 100, tipo: "porcentaje" },
          ],
        },
      ],
      {
        archivo: "Avance por obra",
        filtros: { Orden: textoOrden(COLUMNAS.find((c) => c.id === col)?.etiqueta ?? col, asc ? "asc" : "desc") },
      },
    );

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 6 }}>
        <BotonExcel onDescargar={descargar} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
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
    </div>
  );
}
