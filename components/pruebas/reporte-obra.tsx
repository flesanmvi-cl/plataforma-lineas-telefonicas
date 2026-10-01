"use client";

import { useState, type ReactNode } from "react";
import { ClipboardPlus, Download, Share2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { BotonLab } from "@/components/lab-graficos/graficos/botones/boton-lab";
import { GanttObra } from "@/components/lab-graficos/graficos/tiempo/gantt-obra";
import { CurvaS } from "@/components/lab-graficos/graficos/tiempo/curva-s";
import { LineaHitos } from "@/components/lab-graficos/graficos/tiempo/linea-hitos";
import { BurbujasObras } from "@/components/lab-graficos/graficos/mapas/burbujas-obras";
import {
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloPie,
  estiloTabla,
  fondoFila,
  rellenoBarra,
  type Estado,
} from "@/components/lab-graficos/graficos/tablas/comun";
import { InsigniaEstado } from "@/components/lab-graficos/graficos/tablas/insignia-estado";
import { formato, TAREAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { AvisoEjemplo, Bloque } from "./piezas";
import { useTutorial } from "@/components/tutorial/tutorial";
import { PASOS_TIPO_5 } from "./tutoriales";

// Mismo corte que el Gantt y la línea de hitos del laboratorio (día 100 desde el inicio).
const HOY = 100;
const INICIO_OBRA = Date.UTC(2026, 2, 2);
const PLAZO = Math.max(...TAREAS.map((x) => x.inicio + x.duracion));

/** Presupuesto por partida en millones de pesos (ejemplo) y factor de costo contra lo avanzado. */
const PRESUPUESTO = [120, 380, 610, 2450, 1340, 980, 90];
const FACTOR_COSTO = [1.02, 0.97, 1.08, 1.04, 1.1, 1, 1];

/** Día de obra a dd-mm-aaaa, sin depender de la zona horaria (igual en servidor y cliente). */
function fecha(dia: number) {
  const d = new Date(INICIO_OBRA + dia * 86400000);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
}

/** Día de obra como fecha (medianoche UTC, para que Excel muestre el mismo día). */
function fechaDia(dia: number) {
  return new Date(INICIO_OBRA + dia * 86400000);
}

/** Avance esperado a la fecha de corte según el programa lineal de la tarea. */
function esperado(inicio: number, duracion: number) {
  return Math.round(Math.min(1, Math.max(0, (HOY - inicio) / duracion)) * 100);
}

type EstadoPartida = Estado | "Terminada" | "Por iniciar";

const PARTIDAS = TAREAS.map((x, i) => {
  const esp = esperado(x.inicio, x.duracion);
  const brecha = x.avance - esp;
  const estado: EstadoPartida =
    x.avance >= 100 ? "Terminada" : esp === 0 && x.avance === 0 ? "Por iniciar" : brecha >= -3 ? "En plazo" : brecha >= -10 ? "En riesgo" : "Atrasado";
  return {
    ...x,
    esperado: esp,
    estado,
    presupuesto: PRESUPUESTO[i],
    costo: Math.round(((PRESUPUESTO[i] * x.avance) / 100) * FACTOR_COSTO[i]),
  };
});

const DURACION_TOTAL = TAREAS.reduce((s, x) => s + x.duracion, 0);
const AVANCE_REAL = PARTIDAS.reduce((s, x) => s + x.avance * x.duracion, 0) / DURACION_TOTAL;
const AVANCE_PROGRAMADO = PARTIDAS.reduce((s, x) => s + x.esperado * x.duracion, 0) / DURACION_TOTAL;
const PRESUPUESTO_TOTAL = PARTIDAS.reduce((s, x) => s + x.presupuesto, 0);
const COSTO_TOTAL = PARTIDAS.reduce((s, x) => s + x.costo, 0);
const DESVIACION = AVANCE_REAL - AVANCE_PROGRAMADO;
const ESTADO_OBRA: Estado = DESVIACION >= -3 ? "En plazo" : DESVIACION >= -10 ? "En riesgo" : "Atrasado";

const pesos = (n: number) => `$ ${formato.millones(n)}`;

// Reporte Tipo 5 · seguimiento de una obra: ficha con estado, mandante, plazo y avance; Gantt,
// curva S, hitos, ubicación y tabla de partidas. Obra, mandante y administrador son ficticios.
export function ReporteObra() {
  useTutorial(PASOS_TIPO_5);
  usePublicarVista("Obra Centro · seguimiento", [`Corte ${fecha(HOY)}`]);
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Obra Centro · seguimiento"
        description="Seguimiento de una obra: programa, avance físico contra programado, hitos y estado de cada partida al corte. Obra, mandante y cifras son de ejemplo."
        actions={
          <>
            <BotonLab variante="fantasma" icono={Share2}>
              Compartir
            </BotonLab>
            <BotonLab variante="contorno" icono={Download}>
              Exportar
            </BotonLab>
            <BotonLab variante="solido" icono={ClipboardPlus}>
              Registrar avance
            </BotonLab>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Ficha className="xl:col-span-12" />

        <Bloque titulo="Programa de obra" detalle={`Avance real por tarea · corte ${fecha(HOY)}`} className="xl:col-span-12">
          <GanttObra alto={320} />
        </Bloque>

        <Bloque titulo="Curva S de avance físico" detalle="Programado contra real acumulado" className="xl:col-span-7">
          <CurvaS alto={300} />
        </Bloque>
        <Bloque titulo="Fases e hitos" detalle="Cumplidos y pendientes" className="xl:col-span-5">
          <LineaHitos alto={300} />
        </Bloque>

        <Bloque
          titulo="Partidas"
          detalle={`${PARTIDAS.length} partidas · corte ${fecha(HOY)}`}
          acciones={<BotonExcel onDescargar={descargarPartidas} />}
          className="xl:col-span-7"
        >
          <TablaPartidas />
        </Bloque>
        <Bloque titulo="Ubicación" detalle="Obras del grupo en el país" className="xl:col-span-5">
          <BurbujasObras alto={360} />
        </Bloque>
      </div>
    </div>
  );
}

/** Encabezado de la obra: datos de contrato a la izquierda y cifras de avance a la derecha. */
function Ficha({ className }: { className?: string }) {
  const t = useTokens();
  const datos: { rotulo: string; valor: ReactNode }[] = [
    { rotulo: "Código", valor: "OB-2031" },
    { rotulo: "Estado", valor: <InsigniaEstado t={t} estado={ESTADO_OBRA} /> },
    { rotulo: "Mandante", valor: "Mandante Ejemplo S.A." },
    { rotulo: "Línea de negocio", valor: "Edificación" },
    { rotulo: "Ubicación", valor: "Santiago, Región Metropolitana" },
    { rotulo: "Administrador de obra", valor: "Camila Rojas" },
    { rotulo: "Inicio", valor: fecha(0) },
    { rotulo: "Término contractual", valor: fecha(PLAZO) },
  ];
  const cifras = [
    { nombre: "Avance real", valor: formato.porcentaje(AVANCE_REAL, 1), nota: `Programado ${formato.porcentaje(AVANCE_PROGRAMADO, 1)}` },
    {
      nombre: "Desviación",
      valor: `${DESVIACION < 0 ? "−" : "+"}${formato.decimal(Math.abs(DESVIACION))} pp`,
      nota: "Contra el programa",
      color: DESVIACION >= -3 ? t.estado.bueno : DESVIACION >= -10 ? t.estado.alerta : t.estado.malo,
    },
    { nombre: "Plazo transcurrido", valor: `${HOY} de ${PLAZO} días`, nota: `${formato.porcentaje((HOY / PLAZO) * 100)} del plazo` },
    { nombre: "Costo a la fecha", valor: pesos(COSTO_TOTAL), nota: `de ${pesos(PRESUPUESTO_TOTAL)} de presupuesto` },
  ];

  return (
    <section data-tutorial="ficha" className={`card p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0 ${className ?? ""}`} style={{ borderRadius: t.radio, fontFamily: t.fuente }}>
      <div className="lg:col-span-5 flex flex-col gap-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: t.texto }}>Ficha de la obra</h2>
          <span className="ml-auto">
            <AvisoEjemplo />
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {datos.map((d) => (
            <div key={d.rotulo} className="min-w-0">
              <dt style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>{d.rotulo}</dt>
              <dd style={{ fontSize: t.tamano.etiqueta, color: t.texto, fontWeight: 500, marginTop: 1 }}>{d.valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-4 min-w-0 lg:pl-5 lg:border-l border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cifras.map((c) => (
            <div key={c.nombre} className="min-w-0">
              <div style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>{c.nombre}</div>
              <div
                style={{
                  fontSize: Math.round(t.kpi.cifra * 0.72),
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  color: c.color ?? t.texto,
                  fontVariantNumeric: "tabular-nums",
                  marginTop: 2,
                }}
              >
                {c.valor}
              </div>
              <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave, marginTop: 2 }}>{c.nota}</div>
            </div>
          ))}
        </div>
        <BarraAvance t={t} real={AVANCE_REAL} programado={AVANCE_PROGRAMADO} plazo={(HOY / PLAZO) * 100} />
      </div>
    </section>
  );
}

/** Barra de avance real con marcas del programado y del plazo transcurrido. */
function BarraAvance({ t, real, programado, plazo }: { t: TokensLab; real: number; programado: number; plazo: number }) {
  const marcas = [
    { valor: programado, texto: "Programado", color: t.texto },
    { valor: plazo, texto: "Plazo", color: t.textoSuave },
  ];
  return (
    <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>
      <div style={{ position: "relative", height: 10, borderRadius: 999, background: t.grilla }}>
        <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${real}%`, ...rellenoBarra(t, t.acento), borderRadius: 999 }} />
        {marcas.map((m) => (
          <span
            key={m.texto}
            aria-hidden
            style={{ position: "absolute", left: `${m.valor}%`, top: -4, bottom: -4, width: 2, marginLeft: -1, borderRadius: 1, background: m.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ marginTop: 8 }}>
        <Leyenda color={t.acento} texto={`Avance real ${formato.porcentaje(real, 1)}`} />
        <Leyenda color={t.texto} texto={`Programado ${formato.porcentaje(programado, 1)}`} raya />
        <Leyenda color={t.textoSuave} texto={`Plazo transcurrido ${formato.porcentaje(plazo)}`} raya />
      </div>
    </div>
  );
}

function Leyenda({ color, texto, raya }: { color: string; texto: string; raya?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden style={{ width: raya ? 2 : 10, height: 10, borderRadius: raya ? 1 : 2, background: color }} />
      {texto}
    </span>
  );
}

/** Insignia de la partida: estados de plazo con los colores semánticos; terminada y por iniciar, neutras. */
function InsigniaPartida({ t, estado }: { t: TokensLab; estado: EstadoPartida }) {
  if (estado !== "Terminada" && estado !== "Por iniciar") return <InsigniaEstado t={t} estado={estado} />;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "1px 8px",
        borderRadius: 999,
        fontSize: t.tamano.eje,
        fontWeight: 600,
        lineHeight: 1.6,
        color: t.textoSuave,
        background: t.superficie === "contorno" ? "transparent" : conAlfa(t.textoSuave, 0.12),
        border: `1px solid ${t.superficie === "contorno" ? t.eje : "transparent"}`,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: estado === "Terminada" ? t.texto : "transparent", boxShadow: `inset 0 0 0 1.5px ${t.textoSuave}` }} />
      {estado}
    </span>
  );
}

/** Excel de la tabla de partidas: todas las filas (no tiene filtros ni orden) y el total de la obra. */
function descargarPartidas() {
  return descargarExcel(
    [
      {
        nombre: "Partidas",
        filas: PARTIDAS,
        columnas: [
          { titulo: "Partida", valor: (p) => p.tarea, ancho: 30 },
          { titulo: "Fase", valor: (p) => p.fase, ancho: 20 },
          { titulo: "Inicio", valor: (p) => fechaDia(p.inicio), tipo: "fecha" },
          { titulo: "Término", valor: (p) => fechaDia(p.inicio + p.duracion), tipo: "fecha" },
          { titulo: "Presupuesto (M$)", valor: (p) => p.presupuesto, tipo: "numero" },
          { titulo: "Costo a la fecha (M$)", valor: (p) => p.costo, tipo: "numero" },
          { titulo: "Avance", valor: (p) => p.avance / 100, tipo: "porcentaje" },
          { titulo: "Esperado", valor: (p) => p.esperado / 100, tipo: "porcentaje" },
          { titulo: "Estado", valor: (p) => p.estado, ancho: 14 },
        ],
        totales: ["Total obra", null, null, null, PRESUPUESTO_TOTAL, COSTO_TOTAL, AVANCE_REAL / 100, AVANCE_PROGRAMADO / 100, ESTADO_OBRA],
      },
    ],
    {
      archivo: "Partidas - Obra Centro",
      filtros: { Obra: "OB-2031 · Obra Centro", Corte: fecha(HOY) },
    },
  );
}

function TablaPartidas() {
  const t = useTokens();
  const [activa, setActiva] = useState<string | null>(null);
  const columnas = ["Partida", "Inicio", "Término", "Presupuesto", "Avance", "Esperado", "Estado"];
  const numericas = [3, 4, 5];

  return (
    <div style={estiloContenedor(t, 360)}>
      <table style={estiloTabla()}>
        <caption className="sr-only">Partidas de la obra con avance y estado al corte</caption>
        <thead>
          <tr>
            {columnas.map((c, i) => (
              <th key={c} scope="col" style={{ ...estiloEncabezado(t, { col: i }), textAlign: numericas.includes(i) ? "right" : "left" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PARTIDAS.map((p, fila) => {
            const color = p.estado === "Atrasado" ? t.estado.malo : p.estado === "En riesgo" ? t.estado.alerta : t.colores[1];
            return (
              <tr
                key={p.tarea}
                onMouseEnter={() => setActiva(p.tarea)}
                onMouseLeave={() => setActiva(null)}
                style={{ background: fondoFila(t, fila, activa === p.tarea) }}
              >
                <td style={{ ...estiloCelda(t), height: "auto", paddingBlock: 6 }}>
                  <div style={{ fontWeight: 600 }}>{p.tarea}</div>
                  <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>{p.fase}</div>
                </td>
                <td style={estiloCelda(t, { col: 1 })}>{fecha(p.inicio)}</td>
                <td style={estiloCelda(t, { col: 2 })}>{fecha(p.inicio + p.duracion)}</td>
                <td style={estiloCeldaNum(t, { col: 3 })}>{pesos(p.presupuesto)}</td>
                <td style={estiloCeldaNum(t, { col: 4 })}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ position: "relative", width: 64, height: 6, borderRadius: 999, background: t.grilla }}>
                      <span style={{ position: "absolute", inset: "0 auto 0 0", width: `${p.avance}%`, ...rellenoBarra(t, color) }} />
                      {/* Marca de lo esperado a la fecha */}
                      <span
                        aria-hidden
                        style={{ position: "absolute", left: `${p.esperado}%`, top: -3, bottom: -3, width: 2, marginLeft: -1, background: t.texto }}
                      />
                    </span>
                    <span style={{ minWidth: 36 }}>{formato.porcentaje(p.avance)}</span>
                  </div>
                </td>
                <td style={{ ...estiloCeldaNum(t, { col: 5 }), color: t.textoSuave }}>{formato.porcentaje(p.esperado)}</td>
                <td style={estiloCelda(t, { col: 6 })}>
                  <InsigniaPartida t={t} estado={p.estado} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...estiloPie(t), textAlign: "left" }} colSpan={3}>
              Total obra
            </td>
            <td style={estiloPie(t, { col: 3 })}>{pesos(PRESUPUESTO_TOTAL)}</td>
            <td style={estiloPie(t, { col: 4 })}>{formato.porcentaje(AVANCE_REAL, 1)}</td>
            <td style={estiloPie(t, { col: 5 })}>{formato.porcentaje(AVANCE_PROGRAMADO, 1)}</td>
            <td style={estiloPie(t, { col: 6 })} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
