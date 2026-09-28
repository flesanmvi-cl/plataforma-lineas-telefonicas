"use client";

import { Fragment, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonExcel } from "@/components/boton-excel";
import { azar, formato, LINEAS } from "@/lib/lab-graficos/datos";
import { descargarExcel } from "@/lib/exportar/excel";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import {
  estiloBotonTabla,
  estiloCelda,
  estiloContenedor,
  estiloEncabezado,
  estiloPie,
  estiloTabla,
  fondoFila,
  ocultoVisual,
  rellenoBarra,
} from "./comun";

/** Nombres genéricos de obra por línea (sintéticos). */
const NOMBRES: Record<string, string[]> = {
  Edificación: ["Torre Oriente", "Edificio Parque", "Centro Cívico"],
  "Obras civiles": ["Puente Río Sur", "Embalse Norte"],
  Minería: ["Planta Concentradora", "Depósito de Relaves", "Campamento Alto"],
  Vialidad: ["Doble Vía Costera", "Enlace Ruta 5"],
  Inmobiliaria: ["Condominio Valle", "Lofts Puerto"],
};

interface Fila {
  nombre: string;
  presupuesto: number;
  costo: number;
  avance: number;
}

function sumar(filas: Fila[]): Fila & { desvio: number } {
  const presupuesto = filas.reduce((a, f) => a + f.presupuesto, 0);
  const costo = filas.reduce((a, f) => a + f.costo, 0);
  // Avance ponderado por presupuesto.
  const avance = filas.reduce((a, f) => a + f.avance * f.presupuesto, 0) / (presupuesto || 1);
  return { nombre: "", presupuesto, costo, avance, desvio: ((costo - presupuesto) / presupuesto) * 100 };
}

function Desvio({ t, valor }: { t: TokensLab; valor: number }) {
  const sobre = valor > 0;
  return (
    <span style={{ color: sobre ? t.acento : t.textoSuave, fontWeight: sobre ? 700 : 500 }}>
      {valor > 0 ? "+" : ""}
      {formato.decimal(valor)}%
    </span>
  );
}

function Avance({ t, valor, color }: { t: TokensLab; valor: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
      <div style={{ position: "relative", width: 56, height: 6, borderRadius: 999, background: t.grilla }}>
        <div style={{ position: "absolute", inset: 0, width: `${valor}%`, ...rellenoBarra(t, color), borderRadius: 999 }} />
      </div>
      <span style={{ width: 34, textAlign: "right" }}>{formato.porcentaje(valor)}</span>
    </div>
  );
}

// Tabla agrupada por línea de negocio: cada grupo muestra su subtotal y se expande a sus
// obras. Total general al pie. El sobrecosto se marca con el acento.
export function TablaAgrupada({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set([LINEAS[0]]));
  const [activa, setActiva] = useState<string | null>(null);

  const grupos = useMemo(() => {
    const r = azar(71);
    return LINEAS.map((linea) => {
      const obras: Fila[] = (NOMBRES[linea] ?? []).map((nombre) => {
        const presupuesto = Math.round(60 + r() * 400);
        return { nombre, presupuesto, costo: Math.round(presupuesto * (0.88 + r() * 0.2)), avance: Math.round(15 + r() * 85) };
      });
      return { linea, obras, total: sumar(obras) };
    });
  }, []);
  const general = useMemo(() => sumar(grupos.flatMap((g) => g.obras)), [grupos]);

  const alternar = (linea: string) =>
    setAbiertos((prev) => {
      const s = new Set(prev);
      if (s.has(linea)) s.delete(linea);
      else s.add(linea);
      return s;
    });
  const todosAbiertos = abiertos.size === grupos.length;

  // Excel como se ve: una fila de subtotal por línea y, bajo ella, sus obras si el grupo está abierto.
  const descargar = () => {
    type FilaExcel = { tipo: "Subtotal" | "Obra"; linea: string; obra: string; presupuesto: number; costo: number; avance: number };
    const filas: FilaExcel[] = grupos.flatMap((g) => [
      { tipo: "Subtotal" as const, linea: g.linea, obra: "", ...g.total },
      ...(abiertos.has(g.linea) ? g.obras.map((o) => ({ tipo: "Obra" as const, linea: g.linea, ...o, obra: o.nombre })) : []),
    ]);
    const desvio = (f: { presupuesto: number; costo: number }) => (f.costo - f.presupuesto) / f.presupuesto;
    return descargarExcel(
      [
        {
          nombre: "Por línea y obra",
          filas,
          columnas: [
            { titulo: "Línea", valor: (f) => f.linea },
            { titulo: "Obra", valor: (f) => (f.tipo === "Subtotal" ? "Subtotal" : f.obra), ancho: 24 },
            { titulo: "Presupuesto (M$)", valor: (f) => f.presupuesto, tipo: "numero" },
            { titulo: "Costo real (M$)", valor: (f) => f.costo, tipo: "numero" },
            { titulo: "Desvío", valor: desvio, tipo: "porcentaje" },
            { titulo: "Avance", valor: (f) => f.avance / 100, tipo: "porcentaje" },
          ],
          totales: ["Total general", null, general.presupuesto, general.costo, desvio(general), general.avance / 100],
        },
      ],
      {
        archivo: "Presupuesto y costo por línea de negocio",
        filtros: {
          "Grupos abiertos": todosAbiertos ? "Todos" : abiertos.size ? grupos.filter((g) => abiertos.has(g.linea)).map((g) => g.linea).join(", ") : "Ninguno (solo subtotales)",
        },
      },
    );
  };

  const celda = (col: number) => estiloCelda(t, { col });
  const num = (col: number) => ({ ...celda(col), textAlign: "right" as const });
  const segundos = t.animacion.duracion / 1000;
  const neutro = t.colores.find((c) => c !== t.acento) ?? t.textoSuave;
  // Pie fijo abajo con el fondo de la tarjeta.
  const pie = (col: number): CSSProperties => estiloPie(t, { col });
  const fondoGrupo = conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", t.superficie === "plana" ? 0.03 : 0.045);

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, paddingBottom: 6 }}>
        <BotonExcel onDescargar={descargar} />
        <button
          type="button"
          onClick={() => setAbiertos(todosAbiertos ? new Set() : new Set(grupos.map((g) => g.linea)))}
          style={estiloBotonTabla(t)}
        >
          {todosAbiertos ? "Contraer todo" : "Expandir todo"}
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={estiloTabla()}>
          <caption style={ocultoVisual}>
            Presupuesto, costo y avance por línea de negocio y obra
          </caption>
          <thead>
            <tr>
              <th scope="col" style={estiloEncabezado(t)}>
                Línea / obra
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 1 }), textAlign: "right" }}>
                Presupuesto
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 2 }), textAlign: "right" }}>
                Costo real
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 3 }), textAlign: "right" }}>
                Desvío
              </th>
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 4 }), textAlign: "right" }}>
                Avance
              </th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => {
              const abierto = abiertos.has(g.linea);
              return (
                <Fragment key={g.linea}>
                  <tr style={{ background: fondoGrupo }}>
                    <th scope="row" style={{ ...celda(0), textAlign: "left", fontWeight: 700 }}>
                      <button
                        type="button"
                        aria-expanded={abierto}
                        onClick={() => alternar(g.linea)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          font: "inherit",
                          color: t.texto,
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <ChevronRight
                          size={14}
                          strokeWidth={2.25}
                          aria-hidden
                          style={{
                            transform: abierto ? "rotate(90deg)" : "none",
                            transition: segundos > 0 ? `transform ${Math.min(t.animacion.duracion, 250)}ms` : "none",
                          }}
                        />
                        {g.linea}
                        <span style={{ fontWeight: 500, color: t.textoSuave, fontSize: t.tamano.eje }}>({g.obras.length})</span>
                      </button>
                    </th>
                    <td style={{ ...num(1), fontWeight: 700 }}>{formato.millones(g.total.presupuesto)}</td>
                    <td style={{ ...num(2), fontWeight: 700 }}>{formato.millones(g.total.costo)}</td>
                    <td style={num(3)}>
                      <Desvio t={t} valor={g.total.desvio} />
                    </td>
                    <td style={{ ...num(4), fontWeight: 700 }}>
                      <Avance t={t} valor={g.total.avance} color={neutro} />
                    </td>
                  </tr>
                  <AnimatePresence initial={false}>
                    {abierto &&
                      g.obras.map((o, k) => {
                        const desvio = ((o.costo - o.presupuesto) / o.presupuesto) * 100;
                        const id = `${g.linea}-${o.nombre}`;
                        return (
                          <motion.tr
                            key={id}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: Math.min(segundos, 0.3), delay: Math.min(segundos, 0.3) * k * 0.15 }}
                            onMouseEnter={() => setActiva(id)}
                            onMouseLeave={() => setActiva(null)}
                            style={{ background: fondoFila(t, k, activa === id) }}
                          >
                            <td style={{ ...celda(0), paddingLeft: 32 }}>{o.nombre}</td>
                            <td style={num(1)}>{formato.millones(o.presupuesto)}</td>
                            <td style={num(2)}>{formato.millones(o.costo)}</td>
                            <td style={num(3)}>
                              <Desvio t={t} valor={desvio} />
                            </td>
                            <td style={num(4)}>
                              <Avance t={t} valor={o.avance} color={desvio > 0 ? t.acento : neutro} />
                            </td>
                          </motion.tr>
                        );
                      })}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" style={{ ...pie(0), textAlign: "left" }}>
                Total general
              </th>
              <td style={pie(1)}>{formato.millones(general.presupuesto)}</td>
              <td style={pie(2)}>{formato.millones(general.costo)}</td>
              <td style={pie(3)}>
                <Desvio t={t} valor={general.desvio} />
              </td>
              <td style={pie(4)}>
                <Avance t={t} valor={general.avance} color={neutro} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
