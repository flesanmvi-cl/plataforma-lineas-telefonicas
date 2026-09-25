"use client";

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import {
  ESTADOS,
  estiloBotonTabla,
  estiloCampo,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
  type Estado,
} from "./comun";
import { registrosObras } from "./datos-tablas";
import { InsigniaEstado } from "./insignia-estado";

type Campo = "proyectado" | "estado";
interface Valores {
  proyectado: number;
  estado: Estado;
}
type Edicion = { id: string; campo: Campo; borrador: string } | null;

// Edición en celda: doble clic o Enter sobre un monto proyectado o un estado abre el editor;
// Enter guarda, Esc cancela. Las celdas cambiadas quedan marcadas hasta deshacer.
export function TablaEdicionCelda({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(12, 631), []);
  const originales = useMemo(
    () => Object.fromEntries(datos.map((d) => [d.id, { proyectado: d.costo, estado: d.estado }])) as Record<string, Valores>,
    [datos],
  );
  const [valores, setValores] = useState<Record<string, Valores>>(originales);
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [activa, setActiva] = useState<string | null>(null);
  // Marca que la edición se canceló con Esc, para que el blur posterior no la guarde.
  const cancelada = useRef(false);

  const cambiada = (id: string, campo: Campo) => valores[id][campo] !== originales[id][campo];
  const nCambios = datos.reduce((a, d) => a + (cambiada(d.id, "proyectado") ? 1 : 0) + (cambiada(d.id, "estado") ? 1 : 0), 0);

  const abrir = (id: string, campo: Campo) => {
    cancelada.current = false;
    setEdicion({ id, campo, borrador: String(valores[id][campo]) });
  };
  const guardar = () => {
    if (!edicion || cancelada.current) return;
    const { id, campo, borrador } = edicion;
    setValores((v) => {
      if (campo === "estado") return { ...v, [id]: { ...v[id], estado: borrador as Estado } };
      const n = parseInt(borrador.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? v : { ...v, [id]: { ...v[id], proyectado: n } };
    });
    setEdicion(null);
  };

  // Devuelve el foco a la celda al cerrar el editor, para seguir navegando con teclado.
  const enfocarCelda = (id: string, campo: Campo) =>
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-celda="${id}-${campo}"]`)?.focus());

  const teclaEditor = (e: KeyboardEvent) => {
    if (!edicion) return;
    if (e.key === "Enter") {
      e.preventDefault();
      guardar();
      enfocarCelda(edicion.id, edicion.campo);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelada.current = true;
      setEdicion(null);
      enfocarCelda(edicion.id, edicion.campo);
    }
  };

  const celdaEditable = (id: string, campo: Campo, base: CSSProperties): CSSProperties => {
    const marcada = cambiada(id, campo);
    return {
      ...base,
      position: "relative",
      cursor: "text",
      outlineColor: t.acento,
      outlineOffset: -2,
      backgroundColor: marcada ? conAlfa(t.acento, t.oscuro ? 0.14 : 0.06) : undefined,
      // Marca de celda editada: triángulo en la esquina superior derecha.
      backgroundImage: marcada ? `linear-gradient(225deg, ${t.acento} 6px, transparent 6px)` : undefined,
    };
  };

  const editando = (id: string, campo: Campo) => edicion?.id === id && edicion.campo === campo;

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, fontSize: t.tamano.eje, color: t.textoSuave }}>
        <Pencil size={13} aria-hidden />
        <span>Doble clic o Enter para editar · Esc cancela</span>
        <span style={{ flex: 1 }} />
        <span aria-live="polite" style={{ color: nCambios ? t.texto : t.textoSuave, fontWeight: nCambios ? 600 : 400 }}>
          {nCambios === 0 ? "Sin cambios" : `${nCambios} ${nCambios === 1 ? "celda editada" : "celdas editadas"}`}
        </span>
        <button
          type="button"
          disabled={nCambios === 0}
          onClick={() => setValores(originales)}
          style={{ ...estiloBotonTabla(t), opacity: nCambios === 0 ? 0.4 : 1 }}
        >
          <RotateCcw size={13} aria-hidden />
          Deshacer
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Costo proyectado y estado por obra, editables</caption>
          <thead>
            <tr>
              <th scope="col" style={estiloEncabezado(t)}>
                Obra
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 1 }), textAlign: "right" }}>
                Presupuesto
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 2 }), textAlign: "right" }}>
                Costo proyectado
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 3 }), textAlign: "right" }}>
                Desvío
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), width: 150 }}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => {
              const v = valores[d.id];
              const desvio = ((v.proyectado - d.presupuesto) / d.presupuesto) * 100;
              return (
                <tr
                  key={d.id}
                  onMouseEnter={() => setActiva(d.id)}
                  onMouseLeave={() => setActiva(null)}
                  style={{ background: fondoFila(t, i, activa === d.id) }}
                >
                  <th scope="row" style={{ ...estiloCelda(t), textAlign: "left", fontWeight: 600 }}>
                    {d.obra}
                  </th>
                  <td style={{ ...estiloCeldaNum(t, { col: 1 }), color: t.textoSuave }}>{formato.millones(d.presupuesto)}</td>
                  <td
                    data-celda={`${d.id}-proyectado`}
                    tabIndex={editando(d.id, "proyectado") ? -1 : 0}
                    aria-label={`Costo proyectado de ${d.obra}: ${formato.millones(v.proyectado)}. Enter para editar`}
                    onDoubleClick={() => abrir(d.id, "proyectado")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !editando(d.id, "proyectado")) {
                        e.preventDefault();
                        abrir(d.id, "proyectado");
                      }
                    }}
                    style={celdaEditable(d.id, "proyectado", { ...estiloCeldaNum(t, { col: 2 }), fontWeight: 600, width: 150 })}
                  >
                    {editando(d.id, "proyectado") ? (
                      <input
                        autoFocus
                        inputMode="numeric"
                        aria-label={`Nuevo costo proyectado de ${d.obra}, en millones`}
                        value={edicion?.borrador ?? ""}
                        onChange={(e) => setEdicion((ed) => ed && { ...ed, borrador: e.target.value })}
                        onKeyDown={teclaEditor}
                        onBlur={guardar}
                        onFocus={(e) => e.target.select()}
                        style={{ ...estiloCampo(t), width: "100%", boxSizing: "border-box", textAlign: "right", borderColor: t.acento }}
                      />
                    ) : (
                      formato.millones(v.proyectado)
                    )}
                  </td>
                  <td style={{ ...estiloCeldaNum(t, { col: 3 }), color: desvio > 0 ? t.estado.malo : t.textoSuave, fontWeight: desvio > 0 ? 600 : 400 }}>
                    {desvio > 0 ? "+" : ""}
                    {formato.decimal(desvio)}%
                  </td>
                  <td
                    data-celda={`${d.id}-estado`}
                    tabIndex={editando(d.id, "estado") ? -1 : 0}
                    aria-label={`Estado de ${d.obra}: ${v.estado}. Enter para editar`}
                    onDoubleClick={() => abrir(d.id, "estado")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !editando(d.id, "estado")) {
                        e.preventDefault();
                        abrir(d.id, "estado");
                      }
                    }}
                    style={celdaEditable(d.id, "estado", estiloCelda(t, { col: 4 }))}
                  >
                    {editando(d.id, "estado") ? (
                      <select
                        autoFocus
                        aria-label={`Nuevo estado de ${d.obra}`}
                        value={edicion?.borrador}
                        onChange={(e) => setEdicion((ed) => ed && { ...ed, borrador: e.target.value })}
                        onKeyDown={teclaEditor}
                        onBlur={guardar}
                        style={{ ...estiloCampo(t), width: "100%", borderColor: t.acento }}
                      >
                        {ESTADOS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <InsigniaEstado t={t} estado={v.estado} />
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
