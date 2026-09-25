"use client";

import { useCallback, useMemo, useState } from "react";
import { Archive, Copy, Eye, MoreVertical, Pencil } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import {
  colorEstado,
  ESTADOS,
  estiloBotonTabla,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
  rellenoBarra,
} from "./comun";
import { fechaCorta, registrosObras, type Registro } from "./datos-tablas";
import { Avatar, InsigniaEstado } from "./insignia-estado";
import { MenuFlotante, OpcionMenu } from "./menu-flotante";

// Estados con insignia semántica, responsable con iniciales y un menú de acciones por fila
// (kebab). Archivar quita la fila y ofrece deshacer.
export function TablaEstadosAcciones({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(12, 947), []);
  const [archivadas, setArchivadas] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ id: string; ancla: HTMLElement } | null>(null);
  const [aviso, setAviso] = useState("");
  const [activa, setActiva] = useState<string | null>(null);
  const cerrar = useCallback(() => setMenu(null), []);

  const filas = datos.filter((d) => !archivadas.includes(d.id));
  const conteo = ESTADOS.map((e) => ({ estado: e, n: filas.filter((f) => f.estado === e).length }));

  const accion = (d: Registro, que: "ver" | "editar" | "duplicar" | "archivar") => {
    const ancla = menu?.ancla;
    setMenu(null);
    if (que === "archivar") {
      setArchivadas((a) => [...a, d.id]);
      setAviso(`${d.obra} archivada.`);
    } else {
      setAviso(
        que === "ver" ? `Abriría la ficha de ${d.obra}.` : que === "editar" ? `Abriría la edición de ${d.obra}.` : `Se duplicaría ${d.obra}.`,
      );
      ancla?.focus();
    }
  };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Resumen por estado */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, paddingBottom: 6, fontSize: t.tamano.eje }}>
        {conteo.map((c) => (
          <span key={c.estado} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.textoSuave }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: colorEstado(t, c.estado) }} />
            {c.estado}
            <strong style={{ color: t.texto }}>{c.n}</strong>
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span role="status" style={{ color: t.textoSuave }}>
          {aviso}
          {archivadas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setArchivadas((a) => a.slice(0, -1));
                setAviso("");
              }}
              style={{ ...estiloBotonTabla(t), border: "none", color: t.acento, height: "auto", minWidth: 0, padding: "0 0 0 8px" }}
            >
              Deshacer archivo
            </button>
          )}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Obras con estado, responsable y acciones</caption>
          <thead>
            <tr>
              <th scope="col" style={estiloEncabezado(t)}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Responsable
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Estado
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 3 }), width: 150 }}>
                Avance vs meta
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), textAlign: "right" }}>
                Término
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 5 }), width: 44 }}>
                <span style={ocultoVisual}>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((d, i) => {
              const abierto = menu?.id === d.id;
              const color = colorEstado(t, d.estado);
              return (
                <tr
                  key={d.id}
                  onMouseEnter={() => setActiva(d.id)}
                  onMouseLeave={() => setActiva(null)}
                  style={{ background: fondoFila(t, i, activa === d.id || abierto) }}
                >
                  <td style={estiloCelda(t)}>
                    <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{d.obra}</div>
                    {t.tema.densidad === "comoda" && (
                      <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, lineHeight: 1.2 }}>{d.codigo}</div>
                    )}
                  </td>
                  <td style={estiloCelda(t, { col: 1 })}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar t={t} nombre={d.responsable} indice={d.resp} />
                      {d.responsable}
                    </span>
                  </td>
                  <td style={estiloCelda(t, { col: 2 })}>
                    <InsigniaEstado t={t} estado={d.estado} />
                  </td>
                  <td style={estiloCelda(t, { col: 3 })}>
                    <div
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={d.avance}
                      aria-label={`Avance ${formato.porcentaje(d.avance)}, meta ${formato.porcentaje(d.meta)}`}
                      style={{ position: "relative", height: 6, borderRadius: 999, background: conAlfa(color, 0.15) }}
                    >
                      <div style={{ position: "absolute", inset: 0, width: `${d.avance}%`, ...rellenoBarra(t, color), borderRadius: 999 }} />
                      <div
                        style={{ position: "absolute", left: `calc(${d.meta}% - 1px)`, top: -3, bottom: -3, width: 2, borderRadius: 1, background: t.texto }}
                      />
                    </div>
                  </td>
                  <td style={{ ...estiloCeldaNum(t, { col: 4 }), color: t.textoSuave }}>{fechaCorta(d.termino)}</td>
                  <td style={{ ...estiloCelda(t, { col: 5 }), padding: "0 4px", textAlign: "center" }}>
                    <button
                      type="button"
                      aria-label={`Acciones de ${d.obra}`}
                      aria-haspopup="menu"
                      aria-expanded={abierto}
                      onClick={(e) => setMenu(abierto ? null : { id: d.id, ancla: e.currentTarget })}
                      style={{
                        ...estiloBotonTabla(t, false),
                        minWidth: 0,
                        width: 28,
                        height: 28,
                        padding: 0,
                        border: "none",
                        background: abierto ? t.tabla.hover : "transparent",
                        color: abierto || activa === d.id ? t.texto : t.textoSuave,
                      }}
                    >
                      <MoreVertical size={16} aria-hidden />
                    </button>
                    {abierto && menu && (
                      <MenuFlotante t={t} ancla={menu.ancla} etiqueta={`Acciones de ${d.obra}`} onCerrar={cerrar}>
                        <OpcionMenu t={t} onElegir={() => accion(d, "ver")}>
                          <Eye size={14} aria-hidden /> Ver detalle
                        </OpcionMenu>
                        <OpcionMenu t={t} onElegir={() => accion(d, "editar")}>
                          <Pencil size={14} aria-hidden /> Editar
                        </OpcionMenu>
                        <OpcionMenu t={t} onElegir={() => accion(d, "duplicar")}>
                          <Copy size={14} aria-hidden /> Duplicar
                        </OpcionMenu>
                        <div role="separator" style={{ height: 1, margin: "4px 2px", background: t.tabla.borde }} />
                        <OpcionMenu t={t} peligro onElegir={() => accion(d, "archivar")}>
                          <Archive size={14} aria-hidden /> Archivar
                        </OpcionMenu>
                      </MenuFlotante>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
