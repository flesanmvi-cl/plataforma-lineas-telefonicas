"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato, LINEAS } from "@/lib/lab-graficos/datos";
import { descargarExcel } from "@/lib/exportar/excel";
import { conAlfa } from "@/lib/lab-graficos/tema";
import {
  duracionCorta,
  ESTADOS,
  estiloBotonTabla,
  estiloCampo,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoEncabezado,
  fondoFila,
  ocultoVisual,
  type Estado,
} from "./comun";
import { registrosObras } from "./datos-tablas";
import { InsigniaEstado } from "./insignia-estado";

interface Filtros {
  texto: string;
  linea: string;
  estado: Estado | "";
}

const SIN_FILTROS: Filtros = { texto: "", linea: "", estado: "" };

/** Quita tildes y pasa a minúsculas para buscar sin importar acentos. */
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Filtros por columna en una segunda fila del encabezado (búsqueda por obra, línea y estado),
// con chips de los filtros activos arriba y un botón «Limpiar».
export function TablaFiltrosColumna({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(28, 419), []);
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS);
  const [activa, setActiva] = useState<string | null>(null);

  const filas = useMemo(() => {
    const q = normalizar(filtros.texto.trim());
    return datos.filter(
      (d) =>
        (!q || normalizar(`${d.obra} ${d.codigo}`).includes(q)) &&
        (!filtros.linea || d.linea === filtros.linea) &&
        (!filtros.estado || d.estado === filtros.estado),
    );
  }, [datos, filtros]);

  const chips: { clave: keyof Filtros; etiqueta: string }[] = [
    ...(filtros.texto.trim() ? [{ clave: "texto" as const, etiqueta: `Obra contiene «${filtros.texto.trim()}»` }] : []),
    ...(filtros.linea ? [{ clave: "linea" as const, etiqueta: `Línea: ${filtros.linea}` }] : []),
    ...(filtros.estado ? [{ clave: "estado" as const, etiqueta: `Estado: ${filtros.estado}` }] : []),
  ];

  const cambiar = (c: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...c }));
  const segundos = duracionCorta(t);
  const altoEnc = t.tabla.altoFila;
  // Segunda fila del encabezado (filtros): también fija, justo bajo la primera.
  const celdaFiltro = (col: number): CSSProperties => ({
    ...estiloEncabezado(t, { col }),
    top: altoEnc,
    height: altoEnc + 4,
    textTransform: "none",
    letterSpacing: 0,
    fontWeight: 400,
    padding: "0 6px",
    background: fondoEncabezado(t),
  });
  const campo: CSSProperties = { ...estiloCampo(t), width: "100%", boxSizing: "border-box" };

  // Excel con todas las filas que pasan los filtros.
  const descargar = () =>
    descargarExcel(
      [
        {
          nombre: "Obras",
          filas,
          columnas: [
            { titulo: "Obra", valor: (d) => d.obra, ancho: 24 },
            { titulo: "Código", valor: (d) => d.codigo, ancho: 11 },
            { titulo: "Línea", valor: (d) => d.linea, ancho: 16 },
            { titulo: "Estado", valor: (d) => d.estado, ancho: 12 },
            { titulo: "Avance", valor: (d) => d.avance / 100, tipo: "porcentaje" },
            { titulo: "Presupuesto (M$)", valor: (d) => d.presupuesto, tipo: "numero" },
          ],
        },
      ],
      {
        archivo: chips.length ? "Obras - filtradas" : "Obras",
        filtros: {
          "Búsqueda (obra o código)": filtros.texto.trim() || "Sin búsqueda",
          Línea: filtros.linea || "Todas",
          Estado: filtros.estado || "Todos",
          Resultado: `${filas.length} de ${datos.length} obras`,
        },
      },
    );

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Chips de filtros activos */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, minHeight: t.boton.alto.sm, paddingBottom: 6 }}>
        <span aria-live="polite" style={{ fontSize: t.tamano.eje, color: t.textoSuave, marginRight: 4 }}>
          {filas.length} de {datos.length} obras
        </span>
        <AnimatePresence initial={false}>
          {chips.map((c) => (
            <motion.button
              key={c.clave}
              type="button"
              layout={segundos > 0}
              initial={segundos > 0 ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: segundos }}
              onClick={() => cambiar({ [c.clave]: "" })}
              aria-label={`Quitar filtro ${c.etiqueta}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px 2px 10px",
                font: "inherit",
                fontSize: t.tamano.eje,
                fontWeight: 600,
                color: t.texto,
                background: conAlfa(t.acento, t.oscuro ? 0.18 : 0.08),
                border: `1px solid ${conAlfa(t.acento, 0.35)}`,
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              {c.etiqueta}
              <X size={12} aria-hidden />
            </motion.button>
          ))}
        </AnimatePresence>
        {chips.length > 0 && (
          <button type="button" onClick={() => setFiltros(SIN_FILTROS)} style={{ ...estiloBotonTabla(t), border: "none", color: t.acento }}>
            Limpiar
          </button>
        )}
        <span style={{ marginLeft: "auto" }}>
          <BotonExcel onDescargar={descargar} />
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Obras con filtros por columna</caption>
          <thead>
            <tr>
              <th scope="col" style={{ ...estiloEncabezado(t), width: "34%" }}>
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
            <tr>
              <td style={celdaFiltro(0)}>
                <label style={{ position: "relative", display: "block" }}>
                  <span style={ocultoVisual}>Buscar obra o código</span>
                  <Search
                    size={13}
                    aria-hidden
                    style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: t.textoSuave }}
                  />
                  <input
                    type="search"
                    value={filtros.texto}
                    placeholder="Buscar obra o código"
                    onChange={(e) => cambiar({ texto: e.target.value })}
                    style={{ ...campo, paddingLeft: 26 }}
                  />
                </label>
              </td>
              <td style={celdaFiltro(1)}>
                <label>
                  <span style={ocultoVisual}>Filtrar por línea</span>
                  <select value={filtros.linea} onChange={(e) => cambiar({ linea: e.target.value })} style={campo}>
                    <option value="">Todas</option>
                    {LINEAS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
              </td>
              <td style={celdaFiltro(2)}>
                <label>
                  <span style={ocultoVisual}>Filtrar por estado</span>
                  <select value={filtros.estado} onChange={(e) => cambiar({ estado: e.target.value as Estado | "" })} style={campo}>
                    <option value="">Todos</option>
                    {ESTADOS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </td>
              <td style={celdaFiltro(3)} />
              <td style={celdaFiltro(4)} />
            </tr>
          </thead>
          <tbody>
            {filas.map((d, i) => (
              <tr
                key={d.id}
                onMouseEnter={() => setActiva(d.id)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: fondoFila(t, i, activa === d.id) }}
              >
                <td style={estiloCelda(t)}>
                  <span style={{ fontWeight: 600 }}>{d.obra}</span>
                  <span style={{ marginLeft: 8, fontSize: t.tamano.eje, color: t.textoSuave }}>{d.codigo}</span>
                </td>
                <td style={{ ...estiloCelda(t, { col: 1 }), color: t.textoSuave }}>{d.linea}</td>
                <td style={estiloCelda(t, { col: 2 })}>
                  <InsigniaEstado t={t} estado={d.estado} />
                </td>
                <td style={estiloCeldaNum(t, { col: 3 })}>{formato.porcentaje(d.avance)}</td>
                <td style={estiloCeldaNum(t, { col: 4 })}>{formato.millones(d.presupuesto)}</td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...estiloCelda(t), height: 96, textAlign: "center", color: t.textoSuave, whiteSpace: "normal" }}>
                  Ninguna obra coincide con los filtros.{" "}
                  <button
                    type="button"
                    onClick={() => setFiltros(SIN_FILTROS)}
                    style={{ font: "inherit", color: t.acento, background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 600 }}
                  >
                    Limpiar filtros
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
