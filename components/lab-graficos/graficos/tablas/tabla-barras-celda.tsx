"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, LINEAS, realVsMeta } from "@/lib/lab-graficos/datos";
import { estiloCelda, estiloContenedor, fondoResaltado, rellenoBarra } from "./comun";
import { EncabezadoOrdenable, type Direccion } from "./encabezado-ordenable";

type Columna = "obra" | "linea" | "real" | "meta" | "desvio" | "monto";

const COLUMNAS: { id: Columna; etiqueta: string; alinear: "left" | "right" }[] = [
  { id: "obra", etiqueta: "Obra", alinear: "left" },
  { id: "linea", etiqueta: "Línea", alinear: "left" },
  { id: "real", etiqueta: "Avance real", alinear: "left" },
  { id: "meta", etiqueta: "Meta", alinear: "right" },
  { id: "desvio", etiqueta: "Desvío", alinear: "right" },
  { id: "monto", etiqueta: "Monto", alinear: "right" },
];

// Tabla con la barra de avance dentro de la celda y la meta marcada sobre la misma pista.
// Las obras bajo su meta usan el acento; el resto va en neutro. Ordenable por columna.
export function TablaBarrasCelda({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [orden, setOrden] = useState<{ col: Columna; dir: Direccion }>({ col: "real", dir: "desc" });
  const [activa, setActiva] = useState<string | null>(null);

  const filas = useMemo(() => {
    const r = azar(51);
    return realVsMeta().map((d, i) => ({
      ...d,
      linea: LINEAS[i % LINEAS.length],
      desvio: d.real - d.meta,
      monto: Math.round(40 + r() * 160),
    }));
  }, []);

  const ordenadas = useMemo(() => {
    const signo = orden.dir === "asc" ? 1 : -1;
    return [...filas].sort((a, b) => {
      const va = a[orden.col];
      const vb = b[orden.col];
      return (typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "es")) * signo;
    });
  }, [filas, orden]);

  const ordenar = (col: Columna) =>
    setOrden((o) => (o.col === col ? { col, dir: o.dir === "asc" ? "desc" : "asc" } : { col, dir: col === "obra" || col === "linea" ? "asc" : "desc" }));

  const celda = estiloCelda(t);
  const segundos = t.animacion.duracion / 1000;
  const neutro = t.colores.find((c) => c !== t.acento) ?? t.textoSuave;

  return (
    <div style={estiloContenedor(t, alto)}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Avance real contra meta por obra
        </caption>
        <thead>
          <tr>
            {COLUMNAS.map((c) => (
              <EncabezadoOrdenable
                key={c.id}
                t={t}
                etiqueta={c.etiqueta}
                activo={orden.col === c.id}
                direccion={orden.dir}
                alinear={c.alinear}
                onOrdenar={() => ordenar(c.id)}
                estilo={c.id === "real" ? { width: "38%" } : undefined}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((f, i) => {
            const bajo = f.real < f.meta;
            const color = bajo ? t.acento : neutro;
            return (
              <motion.tr
                key={f.obra}
                layout={segundos > 0 ? "position" : false}
                transition={{ duration: segundos * 0.6, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setActiva(f.obra)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: activa === f.obra ? fondoResaltado(t) : "transparent" }}
              >
                <td style={{ ...celda, fontWeight: 600 }}>{f.obra}</td>
                <td style={{ ...celda, color: t.textoSuave }}>{f.linea}</td>
                <td style={celda}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={120}
                      aria-valuenow={f.real}
                      aria-label={`Avance de ${f.obra}`}
                      style={{ position: "relative", flex: 1, height: 10, borderRadius: Math.min(t.radio, 6), background: t.grilla }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (f.real / 120) * 100)}%` }}
                        transition={{ duration: segundos, delay: segundos > 0 ? i * 0.04 : 0, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: "absolute", left: 0, top: 0, bottom: 0, ...rellenoBarra(t, color) }}
                      />
                      {/* Meta como marca vertical sobre la pista */}
                      <div
                        title={`Meta ${f.meta}%`}
                        style={{
                          position: "absolute",
                          left: `calc(${(f.meta / 120) * 100}% - 1px)`,
                          top: -3,
                          bottom: -3,
                          width: 2,
                          borderRadius: 1,
                          background: t.texto,
                        }}
                      />
                    </div>
                    <span style={{ width: 36, textAlign: "right", fontWeight: 600 }}>{formato.porcentaje(f.real)}</span>
                  </div>
                </td>
                <td style={{ ...celda, textAlign: "right", color: t.textoSuave }}>{formato.porcentaje(f.meta)}</td>
                <td style={{ ...celda, textAlign: "right", color: bajo ? t.acento : t.texto, fontWeight: 600 }}>
                  {f.desvio > 0 ? "+" : ""}
                  {formato.entero(f.desvio)} pp
                </td>
                <td style={{ ...celda, textAlign: "right" }}>{formato.millones(f.monto)}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ margin: "8px 10px 0", fontSize: t.tamano.eje, color: t.textoSuave }}>
        <span style={{ display: "inline-block", width: 2, height: 10, background: t.texto, marginRight: 6, verticalAlign: "-1px" }} />
        Meta de la obra · en acento las que van bajo su meta
      </p>
    </div>
  );
}
