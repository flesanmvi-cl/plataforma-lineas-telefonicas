"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCheck, Download, X } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import {
  duracionCorta,
  estiloBotonTabla,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
} from "./comun";
import { Casilla } from "./casilla";
import { fechaCorta, registrosObras } from "./datos-tablas";

// Estados de pago con selección por fila (checkbox real), «seleccionar todo» con estado
// indeterminado y una barra de acciones masivas que aparece al marcar al menos una fila.
export function TablaSeleccionMasiva({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const filas = useMemo(
    () =>
      registrosObras(14, 207).map((o, i) => ({
        ...o,
        ep: `EP-${String(318 + i).padStart(4, "0")}`,
        monto: Math.round(o.presupuesto * 0.08),
      })),
    [],
  );
  const [seleccion, setSeleccion] = useState<Set<string>>(() => new Set());
  const [aprobados, setAprobados] = useState<Set<string>>(() => new Set());
  const [activa, setActiva] = useState<string | null>(null);

  const todas = seleccion.size === filas.length;
  const algunas = seleccion.size > 0 && !todas;
  const montoSel = filas.filter((f) => seleccion.has(f.id)).reduce((a, f) => a + f.monto, 0);

  const alternar = (id: string, marcar: boolean) =>
    setSeleccion((prev) => {
      const s = new Set(prev);
      if (marcar) s.add(id);
      else s.delete(id);
      return s;
    });

  const aprobar = () => {
    setAprobados((prev) => new Set([...prev, ...seleccion]));
    setSeleccion(new Set());
  };

  const segundos = duracionCorta(t);
  const celdaCasilla = { width: 36, paddingRight: 0, textAlign: "center" as const };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Estados de pago por obra, con selección múltiple</caption>
          <thead>
            <tr>
              <th scope="col" style={{ ...estiloEncabezado(t), ...celdaCasilla }}>
                <Casilla
                  t={t}
                  etiqueta={todas ? "Quitar selección de todas las filas" : "Seleccionar todas las filas"}
                  marcada={todas}
                  indeterminada={algunas}
                  onCambiar={() => setSeleccion(todas ? new Set() : new Set(filas.map((f) => f.id)))}
                />
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Estado de pago
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 3 })}>
                Vence
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), textAlign: "right" }}>
                Monto
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 5 })}>
                Situación
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const marcada = seleccion.has(f.id);
              const aprobado = aprobados.has(f.id);
              return (
                <tr
                  key={f.id}
                  onMouseEnter={() => setActiva(f.id)}
                  onMouseLeave={() => setActiva(null)}
                  onClick={(e) => {
                    // Clic en cualquier parte de la fila alterna la selección (salvo en el checkbox mismo).
                    if ((e.target as HTMLElement).tagName !== "INPUT") alternar(f.id, !marcada);
                  }}
                  style={{
                    cursor: "pointer",
                    background: marcada ? conAlfa(t.acento, t.oscuro ? 0.16 : 0.07) : fondoFila(t, i, activa === f.id),
                  }}
                >
                  <td style={{ ...estiloCelda(t), ...celdaCasilla, boxShadow: marcada ? `inset 3px 0 0 ${t.acento}` : "none" }}>
                    <Casilla t={t} etiqueta={`Seleccionar ${f.ep}`} marcada={marcada} onCambiar={(m) => alternar(f.id, m)} />
                  </td>
                  <td style={{ ...estiloCelda(t, { col: 1 }), fontWeight: 600 }}>{f.ep}</td>
                  <td style={estiloCelda(t, { col: 2 })}>{f.obra}</td>
                  <td style={{ ...estiloCelda(t, { col: 3 }), color: t.textoSuave }}>{fechaCorta(f.termino)}</td>
                  <td style={{ ...estiloCeldaNum(t, { col: 4 }), fontWeight: 600 }}>{formato.millones(f.monto)}</td>
                  <td style={{ ...estiloCelda(t, { col: 5 }), color: aprobado ? t.estado.bueno : t.textoSuave, fontWeight: aprobado ? 600 : 400 }}>
                    {aprobado ? "Aprobado" : "Por revisar"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Barra de acciones masivas: aparece desde abajo al haber selección */}
      <AnimatePresence>
        {seleccion.size > 0 && (
          <motion.div
            role="region"
            aria-label="Acciones sobre la selección"
            initial={segundos > 0 ? { y: 16, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={segundos > 0 ? { y: 16, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: segundos, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 8,
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              padding: "6px 8px 6px 14px",
              borderRadius: Math.min(t.radio, 12),
              background: t.oscuro ? "#F4F4F4" : "#231F20",
              color: t.oscuro ? "#231F20" : "#FFFFFF",
              boxShadow: "0 12px 28px -8px rgba(0,0,0,0.45)",
            }}
          >
            <span aria-live="polite" style={{ fontWeight: 600 }}>
              {seleccion.size} {seleccion.size === 1 ? "seleccionado" : "seleccionados"} · {formato.millones(montoSel)}
            </span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={aprobar}
              style={{ ...estiloBotonTabla(t), background: t.acento, borderColor: t.acento, color: "#FFFFFF" }}
            >
              <CheckCheck size={14} aria-hidden />
              Aprobar
            </button>
            <button type="button" onClick={() => setSeleccion(new Set())} style={{ ...estiloBotonTabla(t), color: "inherit", borderColor: "currentColor" }}>
              <Download size={14} aria-hidden />
              Exportar
            </button>
            <button
              type="button"
              aria-label="Quitar selección"
              onClick={() => setSeleccion(new Set())}
              style={{ ...estiloBotonTabla(t), color: "inherit", border: "none", padding: 0 }}
            >
              <X size={16} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
