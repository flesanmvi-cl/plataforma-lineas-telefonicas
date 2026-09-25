"use client";

import { useMemo, useState } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, OBRAS, serieMensual } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { altoFila, colorEnEscala, estiloContenedor, ocultoVisual, textoSobre } from "./comun";
import { EncabezadoOrdenable, type Direccion } from "./encabezado-ordenable";

/** Columna de orden: índice de mes (0-11) o «prom» para el promedio anual. */
type Columna = number | "prom" | "obra";

// Tabla heatmap obras × meses: cada celda se colorea con la escala secuencial del tema.
// Al pasar el mouse se marca la fila y la columna (cruz); los encabezados ordenan las obras.
export function TablaHeatmap({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [foco, setFoco] = useState<{ fila: number; col: number } | null>(null);
  const [orden, setOrden] = useState<{ col: Columna; dir: Direccion }>({ col: "obra", dir: "asc" });

  const { filas, min, max } = useMemo(() => {
    const filas = OBRAS.map((obra, i) => {
      const valores = serieMensual(60 + i * 7, 55 + i * 6, 2 + (i % 3), 22);
      return { obra, valores, prom: valores.reduce((a, b) => a + b, 0) / valores.length };
    });
    const todos = filas.flatMap((f) => f.valores);
    return { filas, min: Math.min(...todos), max: Math.max(...todos) };
  }, []);

  const ordenadas = useMemo(() => {
    const signo = orden.dir === "asc" ? 1 : -1;
    const valor = (f: (typeof filas)[number]) => (orden.col === "prom" ? f.prom : orden.col === "obra" ? 0 : f.valores[orden.col]);
    return [...filas].sort((a, b) => (orden.col === "obra" ? a.obra.localeCompare(b.obra, "es") : valor(a) - valor(b)) * signo);
  }, [filas, orden]);

  const ordenar = (col: Columna) =>
    setOrden((o) => (o.col === col ? { col, dir: o.dir === "asc" ? "desc" : "asc" } : { col, dir: col === "obra" ? "asc" : "desc" }));

  const fila = altoFila(t);
  const radio = Math.min(t.radio, 6);
  const sombra = t.superficie === "sombras" || t.superficie === "glass";
  const colorDe = (v: number) => colorEnEscala(t.secuencial, (v - min) / (max - min || 1));

  const estiloCeldaCalor = (v: number, enFoco: boolean, enCruz: boolean) => {
    const c = colorDe(v);
    const contorno = t.superficie === "contorno";
    const fondo =
      t.superficie === "degradado"
        ? `linear-gradient(135deg, ${c}, ${conAlfa(c, 0.7)})`
        : contorno
          ? conAlfa(c, 0.28)
          : t.superficie === "glass"
            ? conAlfa(c, 0.82)
            : c;
    return {
      height: fila - 4,
      padding: "0 4px",
      textAlign: "center" as const,
      borderRadius: radio,
      background: fondo,
      color: contorno ? t.texto : textoSobre(c),
      boxShadow: [
        contorno ? `inset 0 0 0 1px ${c}` : "",
        enFoco ? `0 0 0 2px ${t.texto}` : "",
        enFoco && sombra ? `0 6px 14px ${conAlfa(c, 0.55)}` : "",
      ]
        .filter(Boolean)
        .join(", ") || "none",
      opacity: foco && !enCruz ? 0.55 : 1,
      transition: t.animacion.duracion > 0 ? "opacity 150ms, box-shadow 150ms" : "none",
      fontWeight: enFoco ? 700 : 500,
      fontSize: t.tamano.eje,
      cursor: "default",
    };
  };

  const encabezadoMes = { padding: "0 2px", height: fila, minWidth: 38 };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }} onMouseLeave={() => setFoco(null)}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3 }}>
          <caption style={ocultoVisual}>
            Índice mensual por obra
          </caption>
          <thead>
            <tr>
              <EncabezadoOrdenable
                t={t}
                etiqueta="Obra"
                activo={orden.col === "obra"}
                direccion={orden.dir}
                onOrdenar={() => ordenar("obra")}
                estilo={{ borderBottom: "none", borderLeft: "none", padding: "0 6px" }}
              />
              {MESES.map((m, j) => (
                <EncabezadoOrdenable
                  key={m}
                  t={t}
                  etiqueta={m}
                  activo={orden.col === j}
                  direccion={orden.dir}
                  alinear="center"
                  onOrdenar={() => ordenar(j)}
                  estilo={{ ...encabezadoMes, borderBottom: "none", borderLeft: "none", opacity: foco && foco.col !== j ? 0.6 : 1 }}
                />
              ))}
              <EncabezadoOrdenable
                t={t}
                etiqueta="Prom."
                activo={orden.col === "prom"}
                direccion={orden.dir}
                alinear="right"
                onOrdenar={() => ordenar("prom")}
                estilo={{ borderBottom: "none", borderLeft: "none", padding: "0 6px" }}
              />
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((f, i) => (
              <tr key={f.obra}>
                <th
                  scope="row"
                  style={{
                    textAlign: "left",
                    fontWeight: 600,
                    padding: "0 6px",
                    whiteSpace: "nowrap",
                    color: foco?.fila === i ? t.texto : foco ? t.textoSuave : t.texto,
                  }}
                >
                  {f.obra}
                </th>
                {f.valores.map((v, j) => {
                  const enFoco = foco?.fila === i && foco?.col === j;
                  const enCruz = foco?.fila === i || foco?.col === j;
                  return (
                    <td
                      key={j}
                      tabIndex={0}
                      aria-label={`${f.obra}, ${MESES[j]}: ${formato.entero(v)}`}
                      onMouseEnter={() => setFoco({ fila: i, col: j })}
                      onFocus={() => setFoco({ fila: i, col: j })}
                      style={estiloCeldaCalor(v, enFoco, enCruz)}
                    >
                      {v}
                    </td>
                  );
                })}
                <td style={{ textAlign: "right", padding: "0 6px", fontWeight: 700 }}>{formato.decimal(f.prom)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Leyenda de la escala */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 0", fontSize: t.tamano.eje, color: t.textoSuave }}>
        <span>{formato.entero(min)}</span>
        <span
          aria-hidden
          style={{
            width: 140,
            height: 8,
            borderRadius: radio,
            background: `linear-gradient(90deg, ${t.secuencial.join(", ")})`,
          }}
        />
        <span>{formato.entero(max)}</span>
        <span style={{ marginLeft: "auto" }}>
          {foco
            ? `${ordenadas[foco.fila].obra} · ${MESES[foco.col]}: ${formato.entero(ordenadas[foco.fila].valores[foco.col])}`
            : "Índice mensual (sintético) · clic en un mes para ordenar"}
        </span>
      </div>
    </div>
  );
}
