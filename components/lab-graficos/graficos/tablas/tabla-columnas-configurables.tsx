"use client";

import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Columns3, GripVertical } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato } from "@/lib/lab-graficos/datos";
import { descargarExcel, type ColumnaExcel } from "@/lib/exportar/excel";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import {
  duracionCorta,
  estiloBotonTabla,
  estiloCelda,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
} from "./comun";
import { Casilla } from "./casilla";
import { fechaCorta, fechaExcel, registrosObras, type Registro } from "./datos-tablas";
import { InsigniaEstado } from "./insignia-estado";
import { MenuFlotante } from "./menu-flotante";

type ColId = "obra" | "codigo" | "linea" | "region" | "responsable" | "estado" | "avance" | "presupuesto" | "termino";

interface DefColumna {
  id: ColId;
  etiqueta: string;
  derecha?: boolean;
  fija?: boolean;
  celda: (d: Registro, t: TokensLab) => ReactNode;
}

const COLUMNAS: DefColumna[] = [
  { id: "obra", etiqueta: "Obra", fija: true, celda: (d) => <span style={{ fontWeight: 600 }}>{d.obra}</span> },
  { id: "codigo", etiqueta: "Código", celda: (d, t) => <span style={{ color: t.textoSuave }}>{d.codigo}</span> },
  { id: "linea", etiqueta: "Línea", celda: (d) => d.linea },
  { id: "region", etiqueta: "Región", celda: (d) => d.region },
  { id: "responsable", etiqueta: "Responsable", celda: (d) => d.responsable },
  { id: "estado", etiqueta: "Estado", celda: (d, t) => <InsigniaEstado t={t} estado={d.estado} /> },
  { id: "avance", etiqueta: "Avance", derecha: true, celda: (d) => formato.porcentaje(d.avance) },
  { id: "presupuesto", etiqueta: "Presupuesto", derecha: true, celda: (d) => formato.millones(d.presupuesto) },
  { id: "termino", etiqueta: "Término", derecha: true, celda: (d) => fechaCorta(d.termino) },
];

/** Valor crudo de cada columna para el Excel (montos y porcentajes como número). */
const EXCEL: Record<ColId, Omit<ColumnaExcel<Registro>, "titulo">> = {
  obra: { valor: (d) => d.obra, ancho: 24 },
  codigo: { valor: (d) => d.codigo, ancho: 11 },
  linea: { valor: (d) => d.linea, ancho: 16 },
  region: { valor: (d) => d.region, ancho: 14 },
  responsable: { valor: (d) => d.responsable },
  estado: { valor: (d) => d.estado, ancho: 12 },
  avance: { valor: (d) => d.avance / 100, tipo: "porcentaje" },
  presupuesto: { valor: (d) => d.presupuesto, tipo: "numero" },
  termino: { valor: (d) => fechaExcel(d.termino), tipo: "fecha" },
};

const ORDEN_INICIAL: ColId[] = COLUMNAS.map((c) => c.id);
const VISIBLES_INICIAL: ColId[] = ["obra", "linea", "estado", "avance", "presupuesto"];

// Columnas ocultables y reordenables desde el menú «Columnas»: checkbox para mostrar u ocultar,
// flechas o arrastre para mover. La columna Obra queda siempre visible.
export function TablaColumnasConfigurables({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(14, 839), []);
  const [orden, setOrden] = useState<ColId[]>(ORDEN_INICIAL);
  const [visibles, setVisibles] = useState<Set<ColId>>(() => new Set(VISIBLES_INICIAL));
  // Botón que abrió el menú (null = cerrado).
  const [ancla, setAncla] = useState<HTMLElement | null>(null);
  const [arrastrada, setArrastrada] = useState<ColId | null>(null);
  const [activa, setActiva] = useState<string | null>(null);
  const cerrarMenu = useCallback(() => setAncla(null), []);
  const menu = ancla !== null;

  const columnas = orden.map((id) => COLUMNAS.find((c) => c.id === id)!).filter((c) => visibles.has(c.id));

  const mover = (id: ColId, destino: number) =>
    setOrden((o) => {
      const sin = o.filter((x) => x !== id);
      sin.splice(Math.max(0, Math.min(sin.length, destino)), 0, id);
      return sin;
    });
  const alternar = (id: ColId, ver: boolean) =>
    setVisibles((v) => {
      const s = new Set(v);
      if (ver) s.add(id);
      else s.delete(id);
      return s;
    });

  const segundos = duracionCorta(t);
  const botonIcono: CSSProperties = { ...estiloBotonTabla(t), minWidth: 0, width: 22, height: 22, padding: 0, border: "none" };

  // Excel solo con las columnas visibles y en el orden en que se ven.
  const descargar = () =>
    descargarExcel(
      [
        {
          nombre: "Obras",
          filas: datos,
          columnas: columnas.map((c) => ({
            ...EXCEL[c.id],
            titulo: c.id === "presupuesto" ? "Presupuesto (M$)" : c.etiqueta,
          })),
        },
      ],
      {
        archivo: "Obras",
        filtros: {
          "Columnas visibles": columnas.map((c) => c.etiqueta).join(", "),
          "Columnas ocultas": COLUMNAS.filter((c) => !visibles.has(c.id)).map((c) => c.etiqueta).join(", ") || "Ninguna",
        },
      },
    );

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, fontSize: t.tamano.eje, color: t.textoSuave }}>
        <span>
          {columnas.length} de {COLUMNAS.length} columnas visibles
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menu}
          onClick={(e) => setAncla(menu ? null : e.currentTarget)}
          style={estiloBotonTabla(t, menu)}
        >
          <Columns3 size={14} aria-hidden />
          Columnas
        </button>
        <BotonExcel onDescargar={descargar} />
      </div>

      {ancla && (
        <MenuFlotante t={t} ancla={ancla} rol="dialog" etiqueta="Configurar columnas" onCerrar={cerrarMenu}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, minWidth: 220 }}>
            {orden.map((id, i) => {
              const c = COLUMNAS.find((x) => x.id === id)!;
              return (
                <li
                  key={id}
                  draggable
                  onDragStart={(e) => {
                    setArrastrada(id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (arrastrada && arrastrada !== id) mover(arrastrada, i);
                  }}
                  onDragEnd={() => setArrastrada(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "3px 4px 3px 2px",
                    borderRadius: Math.min(t.radio, 6),
                    background: arrastrada === id ? t.tabla.hover : "transparent",
                    opacity: arrastrada === id ? 0.6 : 1,
                  }}
                >
                  <GripVertical size={14} aria-hidden style={{ color: t.textoSuave, cursor: "grab", flex: "none" }} />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: c.fija ? "default" : "pointer" }}>
                    {c.fija ? (
                      <input type="checkbox" checked disabled aria-label={`${c.etiqueta} (siempre visible)`} style={{ margin: 0, accentColor: t.acento }} />
                    ) : (
                      <Casilla t={t} etiqueta={`Mostrar ${c.etiqueta}`} marcada={visibles.has(id)} onCambiar={(m) => alternar(id, m)} />
                    )}
                    <span style={{ color: visibles.has(id) ? t.texto : t.textoSuave }}>{c.etiqueta}</span>
                  </label>
                  <button type="button" aria-label={`Subir ${c.etiqueta}`} disabled={i === 0} onClick={() => mover(id, i - 1)} style={{ ...botonIcono, opacity: i === 0 ? 0.3 : 1 }}>
                    <ArrowUp size={13} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar ${c.etiqueta}`}
                    disabled={i === orden.length - 1}
                    onClick={() => mover(id, i + 1)}
                    style={{ ...botonIcono, opacity: i === orden.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size={13} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, padding: "6px 4px 2px", borderTop: `1px solid ${t.tabla.borde}`, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                setOrden(ORDEN_INICIAL);
                setVisibles(new Set(VISIBLES_INICIAL));
              }}
              style={{ ...estiloBotonTabla(t), border: "none", color: t.acento }}
            >
              Restablecer
            </button>
          </div>
        </MenuFlotante>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Obras con columnas configurables</caption>
          <thead>
            <tr>
              {columnas.map((c, j) => (
                <motion.th
                  key={c.id}
                  layout={segundos > 0 ? "position" : false}
                  transition={{ duration: segundos }}
                  scope="col"
                  style={{ ...estiloEncabezado(t, { col: j }), textAlign: c.derecha ? "right" : "left" }}
                >
                  {c.etiqueta}
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => (
              <tr
                key={d.id}
                onMouseEnter={() => setActiva(d.id)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: fondoFila(t, i, activa === d.id) }}
              >
                {columnas.map((c, j) => (
                  <td key={c.id} style={{ ...estiloCelda(t, { col: j }), textAlign: c.derecha ? "right" : "left" }}>
                    {c.celda(d, t)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
