"use client";

import { useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import {
  estiloBotonTabla,
  estiloCampo,
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoFila,
  ocultoVisual,
} from "./comun";
import { fechaCorta, registrosObras } from "./datos-tablas";
import { InsigniaEstado } from "./insignia-estado";

const TAMANOS = [5, 10, 20];

/** Páginas a mostrar: primera, última, la actual con sus vecinas y «…» en los saltos. */
function paginasVisibles(actual: number, total: number): (number | "…")[] {
  const set = new Set([0, total - 1, actual - 1, actual, actual + 1].filter((p) => p >= 0 && p < total));
  const orden = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  orden.forEach((p, i) => {
    if (i > 0 && p - orden[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

// Paginación completa: tamaño de página, rango «1–10 de 48», anterior/siguiente, números
// de página con elipsis y salto directo a una página.
export function TablaPaginacion({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => registrosObras(48, 523), []);
  const [porPagina, setPorPagina] = useState(10);
  const [pagina, setPagina] = useState(0);
  const [salto, setSalto] = useState("");
  const [activa, setActiva] = useState<string | null>(null);
  const idSalto = useId();

  const total = datos.length;
  const paginas = Math.ceil(total / porPagina);
  const desde = pagina * porPagina;
  const hasta = Math.min(total, desde + porPagina);
  const filas = datos.slice(desde, hasta);

  const ir = (p: number) => setPagina(Math.max(0, Math.min(paginas - 1, p)));
  const saltar = () => {
    const n = parseInt(salto, 10);
    if (!Number.isNaN(n)) ir(n - 1);
    setSalto("");
  };

  const boton = (activo = false) => ({ ...estiloBotonTabla(t, activo), padding: "0 8px" });

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>
            Obras, página {pagina + 1} de {paginas}
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ ...estiloEncabezado(t), width: 70 }}>
                N.º
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Región
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 3 })}>
                Estado
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), textAlign: "right" }}>
                Término
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 5 }), textAlign: "right" }}>
                Presupuesto
              </th>
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
                <td style={{ ...estiloCelda(t), color: t.textoSuave }}>{desde + i + 1}</td>
                <td style={{ ...estiloCelda(t, { col: 1 }), fontWeight: 600 }}>{d.obra}</td>
                <td style={{ ...estiloCelda(t, { col: 2 }), color: t.textoSuave }}>{d.region}</td>
                <td style={estiloCelda(t, { col: 3 })}>
                  <InsigniaEstado t={t} estado={d.estado} />
                </td>
                <td style={estiloCeldaNum(t, { col: 4 })}>{fechaCorta(d.termino)}</td>
                <td style={estiloCeldaNum(t, { col: 5 })}>{formato.millones(d.presupuesto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie de paginación */}
      <nav
        aria-label="Paginación"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          paddingTop: 8,
          borderTop: `1px solid ${t.tabla.borde}`,
          fontSize: t.tamano.eje,
          color: t.textoSuave,
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Filas por página
          <select
            value={porPagina}
            onChange={(e) => {
              // Mantiene visible la primera fila que se estaba mirando.
              const n = Number(e.target.value);
              setPorPagina(n);
              setPagina(Math.floor(desde / n));
            }}
            style={estiloCampo(t)}
          >
            {TAMANOS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span aria-live="polite" style={{ color: t.texto, fontWeight: 600 }}>
          {desde + 1}–{hasta} de {total}
        </span>
        <span style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" aria-label="Página anterior" disabled={pagina === 0} onClick={() => ir(pagina - 1)} style={{ ...boton(), opacity: pagina === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={14} aria-hidden />
          </button>
          {paginasVisibles(pagina, paginas).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} aria-hidden style={{ padding: "0 2px" }}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-label={`Página ${p + 1}`}
                aria-current={p === pagina ? "page" : undefined}
                onClick={() => ir(p)}
                style={boton(p === pagina)}
              >
                {p + 1}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={pagina >= paginas - 1}
            onClick={() => ir(pagina + 1)}
            style={{ ...boton(), opacity: pagina >= paginas - 1 ? 0.4 : 1 }}
          >
            <ChevronRight size={14} aria-hidden />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saltar();
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <label htmlFor={idSalto}>Ir a</label>
          <input
            id={idSalto}
            inputMode="numeric"
            value={salto}
            placeholder={String(pagina + 1)}
            onChange={(e) => setSalto(e.target.value.replace(/\D/g, ""))}
            style={{ ...estiloCampo(t), width: 44, textAlign: "center" }}
          />
          <button type="submit" style={boton()}>
            Ir
          </button>
        </form>
      </nav>
    </div>
  );
}
