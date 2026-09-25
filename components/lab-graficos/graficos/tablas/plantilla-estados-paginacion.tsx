"use client";

import { useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import {
  colorEstado,
  estiloCelda,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
  type Estado,
} from "./comun";
import { rellenoPlantilla, tarjetaPlantilla } from "./plantilla-zebra";

// Plantilla actual (ex TB-103): insignias de estado con borde y paginación simple al pie,
// portada a los tokens del laboratorio (colores de estado de t.estado).
const DATOS: { nombre: string; estado: Estado; responsable: string }[] = [
  { nombre: "Obra Vespucio", estado: "En plazo", responsable: "M. Herrera" },
  { nombre: "Obra Aysén", estado: "En riesgo", responsable: "J. Soto" },
  { nombre: "Obra Toro", estado: "En plazo", responsable: "P. Rojas" },
  { nombre: "Obra Dolores", estado: "Atrasado", responsable: "C. Muñoz" },
  { nombre: "Obra Colina", estado: "En plazo", responsable: "F. Díaz" },
  { nombre: "Obra Mapocho", estado: "En riesgo", responsable: "M. Herrera" },
  { nombre: "Obra Cachapoal", estado: "En plazo", responsable: "J. Soto" },
];

const POR_PAGINA = 4;

export function PlantillaEstadosPaginacion({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [pagina, setPagina] = useState(0);
  const [activa, setActiva] = useState<string | null>(null);
  const totalPaginas = Math.ceil(DATOS.length / POR_PAGINA);
  const filas = DATOS.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  const enc = (col: number): CSSProperties => ({ ...estiloEncabezado(t, { col }), ...rellenoPlantilla(t), height: "auto" });
  const celda = (col: number): CSSProperties => ({ ...estiloCelda(t, { col }), ...rellenoPlantilla(t), height: "auto" });
  const botonPagina = (deshabilitado: boolean): CSSProperties => ({
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: t.textoSuave,
    border: `1px solid ${t.eje}`,
    borderRadius: Math.min(t.radio, 6),
    cursor: deshabilitado ? "default" : "pointer",
    opacity: deshabilitado ? 0.4 : 1,
  });

  return (
    <div style={estiloContenedor(t, alto)}>
      <div style={tarjetaPlantilla(t)}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Estado por obra, página {pagina + 1}</caption>
          <thead>
            <tr>
              <th scope="col" style={enc(0)}>
                Obra
              </th>
              <th scope="col" style={enc(1)}>
                Responsable
              </th>
              <th scope="col" style={enc(2)}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((d, i) => {
              const color = colorEstado(t, d.estado);
              return (
                <tr
                  key={d.nombre}
                  onMouseEnter={() => setActiva(d.nombre)}
                  onMouseLeave={() => setActiva(null)}
                  style={{ background: fondoFila(t, i, activa === d.nombre) }}
                >
                  <td style={celda(0)}>{d.nombre}</td>
                  <td style={{ ...celda(1), color: t.textoSuave }}>{d.responsable}</td>
                  <td style={celda(2)}>
                    {/* Insignia como la .badge de la plantilla: mayúsculas chicas con borde del color del estado */}
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "2px 8px",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color,
                        border: `1px solid ${color}`,
                        borderRadius: 4,
                      }}
                    >
                      {d.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...rellenoPlantilla(t),
            borderTop: `1px solid ${t.tabla.borde}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 10, color: t.textoSuave }}>
            Página {pagina + 1} de {totalPaginas}
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              aria-label="Página anterior"
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              style={botonPagina(pagina === 0)}
            >
              <ChevronLeft size={14} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Página siguiente"
              onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
              style={botonPagina(pagina >= totalPaginas - 1)}
            >
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
