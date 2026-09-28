"use client";

import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato, MESES } from "@/lib/lab-graficos/datos";
import { descargarExcel } from "@/lib/exportar/excel";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import {
  duracionCorta,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
  rellenoBarra,
} from "./comun";
import { fechaCorta, fechaExcel, registrosObras, type Registro } from "./datos-tablas";
import { Avatar, InsigniaEstado } from "./insignia-estado";

/** Mini gráfico de barras del avance acumulado mes a mes, con la meta como línea. */
function BarrasAvance({ t, obra }: { t: TokensLab; obra: Registro }) {
  const neutro = t.colores.find((c) => c !== t.acento) ?? t.textoSuave;
  const alto = 64;
  return (
    <div>
      <div
        role="img"
        aria-label={`Avance acumulado de ${obra.obra}: ${formato.porcentaje(obra.avance)} contra meta de ${formato.porcentaje(obra.meta)}`}
        style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 3, height: alto }}
      >
        {obra.mensual.map((v, i) => (
          <div
            key={i}
            title={`${MESES[i]}: ${formato.porcentaje(v)}`}
            style={{ flex: 1, height: `${Math.max(2, v)}%`, ...rellenoBarra(t, i === 11 && obra.avance < obra.meta ? t.acento : neutro) }}
          />
        ))}
        <div
          aria-hidden
          style={{ position: "absolute", left: 0, right: 0, bottom: `${obra.meta}%`, borderTop: `1.5px dashed ${t.texto}` }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: t.textoSuave }}>
        <span>{MESES[0]}</span>
        <span>Meta {formato.porcentaje(obra.meta)}</span>
        <span>{MESES[11]}</span>
      </div>
    </div>
  );
}

/** Dato de la mini ficha. */
function Dato({ t, etiqueta, valor }: { t: TokensLab; etiqueta: string; valor: ReactNode }) {
  return (
    <div>
      <dt style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave, textTransform: "uppercase", letterSpacing: "0.06em" }}>{etiqueta}</dt>
      <dd style={{ margin: "2px 0 0", fontWeight: 600 }}>{valor}</dd>
    </div>
  );
}

// Filas expandibles: cada obra abre bajo su fila un panel con mini ficha (responsable, término,
// montos) y un mini gráfico del avance mensual contra meta.
export function TablaFilasExpandibles({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const uid = useId();
  const datos = useMemo(() => registrosObras(10, 733), []);
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set([datos[0].id]));
  const [activa, setActiva] = useState<string | null>(null);

  const alternar = (id: string) =>
    setAbiertas((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

  const segundos = duracionCorta(t);
  const columnas = 5;

  // Excel plano: las columnas de la tabla más los datos de la ficha de cada obra (abierta o no),
  // para no tener que expandir fila por fila antes de descargar.
  const descargar = () =>
    descargarExcel(
      [
        {
          nombre: "Obras",
          filas: datos,
          columnas: [
            { titulo: "Obra", valor: (d) => d.obra, ancho: 24 },
            { titulo: "Línea", valor: (d) => d.linea, ancho: 16 },
            { titulo: "Estado", valor: (d) => d.estado, ancho: 12 },
            { titulo: "Avance", valor: (d) => d.avance / 100, tipo: "porcentaje" },
            { titulo: "Meta", valor: (d) => d.meta / 100, tipo: "porcentaje" },
            { titulo: "Presupuesto (M$)", valor: (d) => d.presupuesto, tipo: "numero" },
            { titulo: "Costo real (M$)", valor: (d) => d.costo, tipo: "numero" },
            { titulo: "Responsable", valor: (d) => d.responsable },
            { titulo: "Código", valor: (d) => d.codigo, ancho: 11 },
            { titulo: "Región", valor: (d) => d.region, ancho: 14 },
            { titulo: "Término comprometido", valor: (d) => fechaExcel(d.termino), tipo: "fecha" },
          ],
        },
      ],
      { archivo: "Obras con detalle", filtros: { Detalle: "Incluido para todas las obras (abiertas y cerradas)" } },
    );

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 6 }}>
        <BotonExcel onDescargar={descargar} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Obras con detalle expandible</caption>
          <thead>
            <tr>
              <th scope="col" style={{ ...estiloEncabezado(t), width: "40%" }}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Línea
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Estado
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 3 }), textAlign: "right" }}>
                Avance
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), textAlign: "right" }}>
                Presupuesto
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => {
              const abierta = abiertas.has(d.id);
              const idPanel = `${uid}-${d.id}`;
              return (
                <Fragment key={d.id}>
                  <tr
                    onMouseEnter={() => setActiva(d.id)}
                    onMouseLeave={() => setActiva(null)}
                    style={{ background: abierta ? t.tabla.hover : fondoFila(t, i, activa === d.id) }}
                  >
                    <th scope="row" style={{ ...estiloCelda(t), textAlign: "left", fontWeight: 600, borderBottom: abierta ? "none" : estiloCelda(t).borderBottom }}>
                      <button
                        type="button"
                        aria-expanded={abierta}
                        aria-controls={idPanel}
                        onClick={() => alternar(d.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          font: "inherit",
                          color: t.texto,
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <ChevronRight
                          size={14}
                          strokeWidth={2.25}
                          aria-hidden
                          style={{ transform: abierta ? "rotate(90deg)" : "none", transition: segundos > 0 ? `transform ${segundos}s` : "none" }}
                        />
                        {d.obra}
                      </button>
                    </th>
                    <td style={{ ...estiloCelda(t, { col: 1 }), color: t.textoSuave }}>{d.linea}</td>
                    <td style={estiloCelda(t, { col: 2 })}>
                      <InsigniaEstado t={t} estado={d.estado} />
                    </td>
                    <td style={estiloCeldaNum(t, { col: 3 })}>{formato.porcentaje(d.avance)}</td>
                    <td style={estiloCeldaNum(t, { col: 4 })}>{formato.millones(d.presupuesto)}</td>
                  </tr>
                  <AnimatePresence initial={false}>
                    {abierta && (
                      <tr key={idPanel} id={idPanel}>
                        <td colSpan={columnas} style={{ padding: 0, borderBottom: estiloCelda(t).borderBottom, background: t.tabla.hover }}>
                          <motion.div
                            initial={segundos > 0 ? { height: 0, opacity: 0 } : false}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={segundos > 0 ? { height: 0, opacity: 0 } : { opacity: 0 }}
                            transition={{ duration: segundos, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
                                gap: 20,
                                padding: "10px 16px 14px 30px",
                                borderLeft: `3px solid ${conAlfa(t.acento, 0.8)}`,
                              }}
                            >
                              <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px 16px" }}>
                                <Dato
                                  t={t}
                                  etiqueta="Responsable"
                                  valor={
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                      <Avatar t={t} nombre={d.responsable} indice={d.resp} />
                                      {d.responsable}
                                    </span>
                                  }
                                />
                                <Dato t={t} etiqueta="Código · región" valor={`${d.codigo} · ${d.region}`} />
                                <Dato t={t} etiqueta="Término comprometido" valor={fechaCorta(d.termino)} />
                                <Dato
                                  t={t}
                                  etiqueta="Costo real"
                                  valor={
                                    <span style={{ color: d.costo > d.presupuesto ? t.estado.malo : t.texto }}>
                                      {formato.millones(d.costo)}
                                    </span>
                                  }
                                />
                              </dl>
                              <BarrasAvance t={t} obra={d} />
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
