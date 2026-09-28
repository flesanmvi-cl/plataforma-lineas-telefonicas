"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { azar, formato, MESES } from "@/lib/lab-graficos/datos";
import { descargarExcel, type ColumnaExcel } from "@/lib/exportar/excel";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import {
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloPie,
  estiloTabla,
  fondoFila,
  ocultoVisual,
} from "./comun";
import { registrosObras } from "./datos-tablas";

const N_MESES = 6;

/** Valor con formato condicional: bajo meta en «malo», sobre meta en «bueno», con flecha. */
function ValorMeta({ t, valor, meta, texto }: { t: TokensLab; valor: number; meta: number; texto: string }) {
  const sobre = valor >= meta;
  const color = sobre ? t.estado.bueno : t.estado.malo;
  const Icono = sobre ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "1px 6px",
        borderRadius: Math.min(t.radio, 6),
        color,
        fontWeight: 600,
        background: t.superficie === "contorno" ? "transparent" : conAlfa(color, t.oscuro ? 0.14 : 0.08),
      }}
    >
      <Icono size={11} strokeWidth={2.5} aria-hidden />
      {texto}
      <span style={ocultoVisual}>{sobre ? " (sobre meta)" : " (bajo meta)"}</span>
    </span>
  );
}

// Producción mensual por obra contra su meta: cada celda se marca en verde o rojo según
// cumpla o no, con total por fila, cumplimiento y totales al pie (fijos abajo).
export function TablaTotalesCondicional({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [activa, setActiva] = useState<string | null>(null);

  const filas = useMemo(() => {
    const r = azar(1051);
    return registrosObras(9, 1051).map((o) => {
      const meta = Math.round(o.presupuesto / 14);
      const meses = Array.from({ length: N_MESES }, () => Math.round(meta * (0.75 + r() * 0.45)));
      const total = meses.reduce((a, b) => a + b, 0);
      return { id: o.id, obra: o.obra, meta, meses, total, cumplimiento: (total / (meta * N_MESES)) * 100 };
    });
  }, []);

  const totales = useMemo(() => {
    const meta = filas.reduce((a, f) => a + f.meta, 0);
    const meses = Array.from({ length: N_MESES }, (_, j) => filas.reduce((a, f) => a + f.meses[j], 0));
    const total = meses.reduce((a, b) => a + b, 0);
    return { meta, meses, total, cumplimiento: (total / (meta * N_MESES)) * 100 };
  }, [filas]);

  const colTotal = N_MESES + 2;

  // Excel con las cifras (sin el color condicional) y la fila de totales.
  const descargar = () => {
    type Fila = (typeof filas)[number];
    const columnas: ColumnaExcel<Fila>[] = [
      { titulo: "Obra", valor: (f) => f.obra, ancho: 24 },
      { titulo: "Meta mes", valor: (f) => f.meta, tipo: "numero" },
      ...MESES.slice(0, N_MESES).map((m, j): ColumnaExcel<Fila> => ({ titulo: m, valor: (f) => f.meses[j], tipo: "numero", ancho: 10 })),
      { titulo: "Total", valor: (f) => f.total, tipo: "numero" },
      { titulo: "Cumplimiento", valor: (f) => f.cumplimiento / 100, tipo: "porcentaje" },
    ];
    return descargarExcel(
      [
        {
          nombre: "Producción contra meta",
          filas,
          columnas,
          totales: ["Total", totales.meta, ...totales.meses, totales.total, totales.cumplimiento / 100],
        },
      ],
      { archivo: "Producción contra meta por obra", filtros: { Unidad: "Millones de pesos" } },
    );
  };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 6 }}>
        <BotonExcel onDescargar={descargar} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>Producción mensual por obra contra meta, en millones de pesos, con totales</caption>
          <thead>
            <tr>
              <th scope="col" style={estiloEncabezado(t)}>
                Obra
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 1 }), textAlign: "right" }}>
                Meta mes
              </th>
              {MESES.slice(0, N_MESES).map((m, j) => (
                <th key={m} scope="col" style={{ ...estiloEncabezado(t, { col: j + 2 }), textAlign: "right" }}>
                  {m}
                </th>
              ))}
              <th scope="col" style={{ ...estiloEncabezado(t, { col: colTotal }), textAlign: "right" }}>
                Total
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: colTotal + 1 }), textAlign: "right" }}>
                Cumpl.
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr
                key={f.id}
                onMouseEnter={() => setActiva(f.id)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: fondoFila(t, i, activa === f.id) }}
              >
                <th scope="row" style={{ ...estiloCelda(t), textAlign: "left", fontWeight: 600 }}>
                  {f.obra}
                </th>
                <td style={{ ...estiloCeldaNum(t, { col: 1 }), color: t.textoSuave }}>{formato.entero(f.meta)}</td>
                {f.meses.map((v, j) => (
                  <td key={j} style={{ ...estiloCeldaNum(t, { col: j + 2 }), padding: "0 6px" }}>
                    <ValorMeta t={t} valor={v} meta={f.meta} texto={formato.entero(v)} />
                  </td>
                ))}
                <td style={{ ...estiloCeldaNum(t, { col: colTotal }), fontWeight: 700 }}>{formato.entero(f.total)}</td>
                <td
                  style={{
                    ...estiloCeldaNum(t, { col: colTotal + 1 }),
                    fontWeight: 700,
                    color: f.cumplimiento >= 100 ? t.estado.bueno : t.estado.malo,
                  }}
                >
                  {formato.porcentaje(f.cumplimiento, 1)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" style={{ ...estiloPie(t), textAlign: "left" }}>
                Total
              </th>
              <td style={estiloPie(t, { col: 1 })}>{formato.entero(totales.meta)}</td>
              {totales.meses.map((v, j) => (
                <td key={j} style={{ ...estiloPie(t, { col: j + 2 }), color: v >= totales.meta ? t.estado.bueno : t.estado.malo }}>
                  {formato.entero(v)}
                </td>
              ))}
              <td style={estiloPie(t, { col: colTotal })}>{formato.entero(totales.total)}</td>
              <td style={{ ...estiloPie(t, { col: colTotal + 1 }), color: totales.cumplimiento >= 100 ? t.estado.bueno : t.estado.malo }}>
                {formato.porcentaje(totales.cumplimiento, 1)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ display: "flex", gap: 14, margin: "8px 10px 0", fontSize: t.tamano.eje, color: t.textoSuave }}>
        <span style={{ color: t.estado.bueno, fontWeight: 600 }}>▲ Sobre meta</span>
        <span style={{ color: t.estado.malo, fontWeight: 600 }}>▼ Bajo meta</span>
        <span>Millones de pesos (sintético)</span>
      </p>
    </div>
  );
}
