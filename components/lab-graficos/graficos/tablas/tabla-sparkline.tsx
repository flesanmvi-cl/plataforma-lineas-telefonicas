"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { formato, LINEAS, MESES, OBRAS, serieMensual } from "@/lib/lab-graficos/datos";
import { descargarExcel, type ColumnaExcel } from "@/lib/exportar/excel";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { altoFila, estiloCelda, estiloContenedor, estiloEncabezado, estiloTabla, fondoFila, ocultoVisual } from "./comun";
import { textoOrden } from "./datos-tablas";
import { EncabezadoOrdenable, type Direccion } from "./encabezado-ordenable";
import { Sparkline } from "./sparkline";

type Columna = "obra" | "ultimo" | "mensual" | "anual";

/** Chip de variación: la caída se marca con el acento; el alza va en neutro. */
function ChipDelta({ t, valor }: { t: TokensLab; valor: number }) {
  const baja = valor < -0.05;
  const plano = Math.abs(valor) <= 0.05;
  const Icono = plano ? Minus : baja ? ArrowDownRight : ArrowUpRight;
  const color = baja ? t.acento : t.texto;
  const contorno = t.superficie === "contorno";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "1px 7px 1px 5px",
        borderRadius: 999,
        fontSize: t.tamano.eje,
        fontWeight: 600,
        color,
        background: contorno ? "transparent" : conAlfa(color, baja ? 0.12 : 0.07),
        border: contorno ? `1px solid ${conAlfa(color, 0.6)}` : "1px solid transparent",
      }}
    >
      <Icono size={12} strokeWidth={2.25} aria-hidden />
      {valor > 0 ? "+" : ""}
      {formato.decimal(valor)}%
    </span>
  );
}

// Tabla con una sparkline por fila (tendencia de 12 meses) y chips de variación mensual y
// anual. La sparkline muestra el valor del mes al pasar el mouse.
export function TablaSparkline({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [orden, setOrden] = useState<{ col: Columna; dir: Direccion }>({ col: "ultimo", dir: "desc" });
  const [activa, setActiva] = useState<string | null>(null);

  const filas = useMemo(
    () =>
      OBRAS.map((obra, i) => {
        // Pendientes distintas para que haya obras al alza y a la baja.
        const valores = serieMensual(80 + i * 11, 90 + i * 15, [5, -3, 2, 7, -1, 0.5][i % 6], 16);
        const n = valores.length;
        return {
          obra,
          linea: LINEAS[i % LINEAS.length],
          valores,
          ultimo: valores[n - 1],
          mensual: ((valores[n - 1] - valores[n - 2]) / valores[n - 2]) * 100,
          anual: ((valores[n - 1] - valores[0]) / valores[0]) * 100,
        };
      }),
    [],
  );

  const ordenadas = useMemo(() => {
    const signo = orden.dir === "asc" ? 1 : -1;
    return [...filas].sort((a, b) => (orden.col === "obra" ? a.obra.localeCompare(b.obra, "es") : a[orden.col] - b[orden.col]) * signo);
  }, [filas, orden]);

  const ordenar = (col: Columna) =>
    setOrden((o) => (o.col === col ? { col, dir: o.dir === "asc" ? "desc" : "asc" } : { col, dir: col === "obra" ? "asc" : "desc" }));

  const celda = (col: number) => estiloCelda(t, { col });
  const color = t.colores.find((c) => c !== t.acento) ?? t.textoSuave;

  // Excel en el orden vigente: la sparkline sale como una columna por mes con sus valores.
  const descargar = () => {
    type Fila = (typeof ordenadas)[number];
    const columnas: ColumnaExcel<Fila>[] = [
      { titulo: "Obra", valor: (f) => f.obra, ancho: 24 },
      { titulo: "Línea", valor: (f) => f.linea },
      ...MESES.map((m, j): ColumnaExcel<Fila> => ({ titulo: m, valor: (f) => Math.round(f.valores[j]), tipo: "numero", ancho: 9 })),
      { titulo: "Último", valor: (f) => Math.round(f.ultimo), tipo: "numero" },
      { titulo: "vs mes ant.", valor: (f) => f.mensual / 100, tipo: "porcentaje" },
      { titulo: "vs enero", valor: (f) => f.anual / 100, tipo: "porcentaje" },
    ];
    const nombres: Record<Columna, string> = { obra: "Obra", ultimo: "Último", mensual: "vs mes ant.", anual: "vs enero" };
    return descargarExcel([{ nombre: "Producción mensual", filas: ordenadas, columnas }], {
      archivo: "Producción mensual por obra",
      filtros: { Orden: textoOrden(nombres[orden.col], orden.dir), Unidad: "Millones de pesos" },
    });
  };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 6 }}>
        <BotonExcel onDescargar={descargar} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>
            Producción mensual por obra con tendencia y variación
          </caption>
          <thead>
            <tr>
              <EncabezadoOrdenable t={t} etiqueta="Obra" activo={orden.col === "obra"} direccion={orden.dir} onOrdenar={() => ordenar("obra")} />
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 1 }), width: "34%" }}>
                Tendencia {MESES[0]}–{MESES[MESES.length - 1]}
              </th>
              <EncabezadoOrdenable
                t={t}
                etiqueta="Último"
                col={2}
                alinear="right"
                activo={orden.col === "ultimo"}
                direccion={orden.dir}
                onOrdenar={() => ordenar("ultimo")}
              />
              <EncabezadoOrdenable
                t={t}
                etiqueta="vs mes ant."
                col={3}
                alinear="right"
                activo={orden.col === "mensual"}
                direccion={orden.dir}
                onOrdenar={() => ordenar("mensual")}
              />
              <EncabezadoOrdenable
                t={t}
                etiqueta="vs enero"
                col={4}
                alinear="right"
                activo={orden.col === "anual"}
                direccion={orden.dir}
                onOrdenar={() => ordenar("anual")}
              />
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((f, i) => (
              <tr
                key={f.obra}
                onMouseEnter={() => setActiva(f.obra)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: fondoFila(t, i, activa === f.obra) }}
              >
                <td style={celda(0)}>
                  <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{f.obra}</div>
                  {t.tema.densidad === "comoda" && <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, lineHeight: 1.2 }}>{f.linea}</div>}
                </td>
                <td style={{ ...celda(1), paddingTop: 4, paddingBottom: 4 }}>
                  <Sparkline
                    t={t}
                    valores={f.valores}
                    etiquetas={MESES}
                    alto={altoFila(t) - 12}
                    color={f.anual < 0 ? t.acento : color}
                    formatear={(n) => formato.millones(n)}
                  />
                </td>
                <td style={{ ...celda(2), textAlign: "right", fontWeight: 700 }}>{formato.millones(f.ultimo)}</td>
                <td style={{ ...celda(3), textAlign: "right" }}>
                  <ChipDelta t={t} valor={f.mensual} />
                </td>
                <td style={{ ...celda(4), textAlign: "right" }}>
                  <ChipDelta t={t} valor={f.anual} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "8px 10px 0", fontSize: t.tamano.eje, color: t.textoSuave }}>
        Producción mensual en millones (sintético) · en acento las obras que caen en el año
      </p>
    </div>
  );
}
