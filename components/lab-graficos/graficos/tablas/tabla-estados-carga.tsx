"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileSearch } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato } from "@/lib/lab-graficos/datos";
import { descargarExcel } from "@/lib/exportar/excel";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
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
import { registrosObras } from "./datos-tablas";
import { InsigniaEstado } from "./insignia-estado";

type Modo = "datos" | "cargando" | "vacio";
const MODOS: { id: Modo; nombre: string }[] = [
  { id: "datos", nombre: "Con datos" },
  { id: "cargando", nombre: "Cargando" },
  { id: "vacio", nombre: "Vacío" },
];

/** Barra de carga con brillo que avanza (sin animación si el tema es «sin»). */
function Hueso({ t, ancho, alinear = "left" }: { t: TokensLab; ancho: string; alinear?: "left" | "right" }) {
  const base = conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", t.oscuro ? 0.08 : 0.07);
  const brillo = conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", t.oscuro ? 0.16 : 0.13);
  const anima = t.animacion.duracion > 0;
  return (
    <motion.span
      aria-hidden
      animate={anima ? { backgroundPosition: ["100% 0", "-100% 0"] } : undefined}
      transition={anima ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{
        display: "block",
        width: ancho,
        height: 10,
        marginLeft: alinear === "right" ? "auto" : 0,
        borderRadius: Math.min(t.radio, 4),
        backgroundImage: `linear-gradient(90deg, ${base} 25%, ${brillo} 37%, ${base} 63%)`,
        backgroundSize: "400% 100%",
      }}
    />
  );
}

// Estados de la tabla: con datos, cargando (esqueleto con la misma estructura) y vacío
// (mensaje con acción). El selector de arriba cambia entre los tres para comparar.
export function TablaEstadosCarga({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(8, 1163), []);
  const [modo, setModo] = useState<Modo>("datos");
  const [activa, setActiva] = useState<string | null>(null);
  const segundos = duracionCorta(t);

  const anchos = ["70%", "55%", "80%", "62%", "74%", "50%", "66%", "58%"];

  // Excel solo cuando hay datos: cargando o vacío no hay nada que bajar.
  const descargar = () =>
    descargarExcel(
      [
        {
          nombre: "Obras",
          filas: datos,
          columnas: [
            { titulo: "Obra", valor: (d) => d.obra, ancho: 24 },
            { titulo: "Región", valor: (d) => d.region, ancho: 14 },
            { titulo: "Estado", valor: (d) => d.estado, ancho: 12 },
            { titulo: "Presupuesto (M$)", valor: (d) => d.presupuesto, tipo: "numero" },
          ],
        },
      ],
      { archivo: "Obras" },
    );

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6 }}>
        <div role="radiogroup" aria-label="Estado de la tabla" style={{ display: "flex", gap: 4 }}>
          {MODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={modo === m.id}
              onClick={() => setModo(m.id)}
              style={estiloBotonTabla(t, modo === m.id)}
            >
              {m.nombre}
            </button>
          ))}
        </div>
        {/* Oculto (sin mover el alto de la barra) mientras carga o está vacía */}
        <span style={{ marginLeft: "auto", visibility: modo === "datos" ? "visible" : "hidden" }}>
          <BotonExcel onDescargar={descargar} />
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }} aria-busy={modo === "cargando"}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Obras{modo === "cargando" ? " (cargando)" : modo === "vacio" ? " (sin resultados)" : ""}</caption>
          <thead>
            <tr>
              <th scope="col" style={estiloEncabezado(t)}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Región
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Estado
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 3 }), textAlign: "right" }}>
                Presupuesto
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait" initial={false}>
            <motion.tbody
              key={modo}
              initial={segundos > 0 ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={segundos > 0 ? { opacity: 0 } : undefined}
              transition={{ duration: segundos }}
            >
              {modo === "datos" &&
                datos.map((d, i) => (
                  <tr
                    key={d.id}
                    onMouseEnter={() => setActiva(d.id)}
                    onMouseLeave={() => setActiva(null)}
                    style={{ background: fondoFila(t, i, activa === d.id) }}
                  >
                    <td style={{ ...estiloCelda(t), fontWeight: 600 }}>{d.obra}</td>
                    <td style={{ ...estiloCelda(t, { col: 1 }), color: t.textoSuave }}>{d.region}</td>
                    <td style={estiloCelda(t, { col: 2 })}>
                      <InsigniaEstado t={t} estado={d.estado} />
                    </td>
                    <td style={estiloCeldaNum(t, { col: 3 })}>{formato.millones(d.presupuesto)}</td>
                  </tr>
                ))}
              {modo === "cargando" &&
                anchos.map((a, i) => (
                  <tr key={i} style={{ background: fondoFila(t, i) }}>
                    <td style={estiloCelda(t)}>
                      <Hueso t={t} ancho={a} />
                    </td>
                    <td style={estiloCelda(t, { col: 1 })}>
                      <Hueso t={t} ancho={anchos[(i + 3) % anchos.length]} />
                    </td>
                    <td style={estiloCelda(t, { col: 2 })}>
                      <Hueso t={t} ancho="64px" />
                    </td>
                    <td style={estiloCelda(t, { col: 3 })}>
                      <Hueso t={t} ancho="56px" alinear="right" />
                    </td>
                  </tr>
                ))}
              {modo === "vacio" && (
                <tr>
                  <td colSpan={4} style={{ padding: "28px 16px", textAlign: "center", whiteSpace: "normal" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span
                        aria-hidden
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          background: t.tabla.hover,
                          color: t.textoSuave,
                        }}
                      >
                        <FileSearch size={22} strokeWidth={1.75} />
                      </span>
                      <strong style={{ fontSize: t.tamano.etiqueta + 1 }}>No hay obras para mostrar</strong>
                      <span style={{ color: t.textoSuave, maxWidth: 320 }}>
                        Ninguna obra coincide con los filtros aplicados. Prueba con otro período o quita filtros.
                      </span>
                      <button type="button" onClick={() => setModo("datos")} style={{ ...estiloBotonTabla(t), marginTop: 4 }}>
                        Quitar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
        {modo === "cargando" && <span role="status" style={ocultoVisual}>Cargando obras…</span>}
      </div>
    </div>
  );
}
