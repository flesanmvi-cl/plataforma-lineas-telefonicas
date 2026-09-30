"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFiltrosUrl } from "@/components/presentaciones/use-filtros-url";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import type { EChartsOption } from "echarts";
import { ArrowLeft, ChevronRight, Download, Share2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/page-header";
import { useBreadcrumbContext } from "@/components/breadcrumb-context";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { BotonLab } from "@/components/lab-graficos/graficos/botones/boton-lab";
import {
  ESTADOS,
  estiloCampo,
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
import { formato, LINEAS, REGIONES_CORTAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { baseEcharts, ejeCategoriaEcharts, ejeValorEcharts, gridEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";
import {
  desviacion,
  FACTOR_PERIODO,
  filasLineas,
  filasObras,
  filasPartidas,
  OBRAS_COSTOS,
  totalFilas,
  type FilaCosto,
  type Periodo,
} from "./datos-costos";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { AvisoEjemplo, Bloque, ChipFiltro, estiloRotulo, Segmentado, type OpcionSegmentado } from "./piezas";
import { Desplegable } from "@/components/desplegable";

const PERIODOS: OpcionSegmentado<Periodo>[] = [
  { id: "anio", texto: "Año" },
  { id: "trimestre", texto: "Trimestre" },
  { id: "mes", texto: "Mes" },
];

const NIVELES = ["Línea de negocio", "Obra", "Partida"];
const RAIZ = "Todas las líneas";

const pesos = (n: number) => `$ ${formato.millones(Math.round(n))}`;
const signo = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${formato.decimal(Math.abs(n))}%`;

/** Color de la desviación de costo: sobre 5% malo, sobre 0 alerta, bajo o igual a 0 bueno. */
function colorDesviacion(t: TokensLab, d: number) {
  return d > 5 ? t.estado.malo : d > 0 ? t.estado.alerta : t.estado.bueno;
}

// Reporte Tipo 4 · costos por obra · analítico con drilldown: filtros a la izquierda y, a la derecha, un gráfico de
// costo contra presupuesto que baja de Línea → Obra → Partida al hacer clic. Los niveles se
// publican en la barra superior (BreadcrumbContext) y la tabla de detalle sigue al nivel.
type Cambio<V> = V | ((prev: V) => V);
const aplicar = <V,>(v: Cambio<V>, prev: V) => (typeof v === "function" ? (v as (p: V) => V)(prev) : v);

export function ReporteCostos() {
  // Filtros y nivel del drilldown en la URL: «Agregar a presentación» guarda la vista tal cual
  // y al abrir esa URL se reconstruye (ver useFiltrosUrl).
  const [f, setF] = useFiltrosUrl({
    periodo: "anio",
    lineas: [] as string[],
    region: "",
    estados: [] as string[],
    /** Ruta del drilldown: [línea, id de obra]. Vacía = todas las líneas. */
    ruta: [] as string[],
  });
  const periodo = f.periodo as Periodo;
  const { lineas, region, ruta } = f;
  const estados = f.estados as Estado[];
  const setPeriodo = (v: Periodo) => setF({ periodo: v });
  const setLineas = (v: Cambio<string[]>) => setF({ lineas: aplicar(v, lineas) });
  const setRegion = (v: string) => setF({ region: v });
  const setEstados = (v: Cambio<Estado[]>) => setF({ estados: aplicar(v, estados) });
  // Estable (se usa en efectos y callbacks): aplica el cambio sobre el valor vigente.
  const setRuta = useCallback((v: Cambio<string[]>) => setF((prev) => ({ ruta: aplicar(v, prev.ruta) })), [setF]);

  const factor = FACTOR_PERIODO[periodo];
  // Obras que pasan región y estado (la línea se filtra aparte para contar por línea).
  const obrasBase = useMemo(
    () => OBRAS_COSTOS.filter((o) => (!region || o.region === region) && (estados.length === 0 || estados.includes(o.estado))),
    [region, estados],
  );
  const obras = useMemo(() => obrasBase.filter((o) => lineas.length === 0 || lineas.includes(o.linea)), [obrasBase, lineas]);

  // Si un filtro deja fuera la línea u obra abierta, el drilldown vuelve al nivel válido más hondo.
  const lineaAbierta = ruta[0] && obras.some((o) => o.linea === ruta[0]) ? ruta[0] : null;
  const obraAbierta = lineaAbierta && ruta[1] ? (obras.find((o) => o.id === ruta[1] && o.linea === lineaAbierta) ?? null) : null;
  const nivel = obraAbierta ? 2 : lineaAbierta ? 1 : 0;

  const filas = useMemo(() => {
    if (obraAbierta) return filasPartidas(obraAbierta, factor);
    if (lineaAbierta) return filasObras(obras, lineaAbierta, factor);
    return filasLineas(obras, factor);
  }, [obras, lineaAbierta, obraAbierta, factor]);

  const etiquetas = [lineaAbierta, obraAbierta?.obra].filter((x): x is string => Boolean(x));

  // Texto legible de lo que se está mirando, para el título y pie de la diapositiva.
  usePublicarVista("Costos por obra", [
    PERIODOS.find((p) => p.id === periodo)?.texto ?? periodo,
    ...(lineas.length ? [lineas.join(", ")] : []),
    ...(region ? [region] : []),
    ...(estados.length ? [estados.join(", ")] : []),
    ...etiquetas,
  ]);
  const claveMigas = etiquetas.join("›");

  // Niveles del drilldown en la barra superior: «Todas las líneas» vuelve a la raíz.
  const { setState } = useBreadcrumbContext();
  useEffect(() => {
    if (!claveMigas) {
      setState(null);
      return;
    }
    setState({ items: [RAIZ, ...claveMigas.split("›")], onNavigate: (i) => setRuta((r) => r.slice(0, i)) });
  }, [claveMigas, setState, setRuta]);
  useEffect(() => () => setState(null), [setState]);

  const bajar = useCallback(
    (f: FilaCosto) => {
      if (nivel === 0) setRuta([f.id]);
      else if (nivel === 1 && lineaAbierta) setRuta([lineaAbierta, f.id]);
    },
    [nivel, lineaAbierta, setRuta],
  );

  const alternar = <T,>(lista: T[], valor: T) => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  const hayFiltros = lineas.length > 0 || region !== "" || estados.length > 0;

  const tituloNivel =
    nivel === 0 ? "Costo por línea de negocio" : nivel === 1 ? `Costo por obra · ${lineaAbierta}` : `Costo por partida · ${obraAbierta?.obra}`;

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Costos por obra"
        description="Costo real contra presupuesto. Haz clic en una barra o en una fila para bajar de línea de negocio a obra y de obra a partida; la ruta queda en la barra superior. Las cifras son de ejemplo."
        actions={
          <>
            <BotonLab variante="fantasma" icono={Share2}>
              Compartir
            </BotonLab>
            <BotonLab variante="contorno" icono={Download}>
              Exportar
            </BotonLab>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <PanelFiltros
          className="xl:col-span-3 xl:sticky xl:top-20"
          periodo={periodo}
          onPeriodo={setPeriodo}
          lineas={lineas}
          onLinea={(l) => setLineas((a) => alternar(a, l))}
          conteoLinea={(l) => obrasBase.filter((o) => o.linea === l).length}
          region={region}
          onRegion={setRegion}
          estados={estados}
          onEstado={(e) => setEstados((a) => alternar(a, e))}
          conteoEstado={(e) =>
            OBRAS_COSTOS.filter((o) => o.estado === e && (!region || o.region === region) && (lineas.length === 0 || lineas.includes(o.linea))).length
          }
          hayFiltros={hayFiltros}
          onLimpiar={() => {
            setLineas([]);
            setRegion("");
            setEstados([]);
          }}
        />

        <div className="xl:col-span-9 flex flex-col gap-4 min-w-0">
          <Resumen filas={filas} obras={nivel === 2 ? 1 : nivel === 1 ? filas.length : obras.length} />

          <Bloque
            titulo={tituloNivel}
            detalle={nivel < 2 ? "Clic en una barra para ver el detalle" : "Último nivel"}
            acciones={
              nivel > 0 && (
                <BotonLab variante="texto" tamano="sm" icono={ArrowLeft} onClick={() => setRuta((r) => r.slice(0, nivel - 1))}>
                  Volver a {nivel === 1 ? "líneas" : lineaAbierta}
                </BotonLab>
              )
            }
          >
            {filas.length ? (
              <GraficoCostos filas={filas} clic={nivel < 2 ? bajar : undefined} />
            ) : (
              <SinResultados />
            )}
          </Bloque>

          <Bloque
            titulo={`Detalle por ${NIVELES[nivel].toLowerCase()}`}
            detalle={`${filas.length} filas`}
            acciones={
              filas.length > 0 && (
                <BotonExcel
                  onDescargar={() =>
                    descargarExcel(
                      [
                        {
                          nombre: `Detalle por ${NIVELES[nivel].toLowerCase()}`,
                          filas,
                          columnas: [
                            { titulo: NIVELES[nivel], valor: (f) => f.nombre, ancho: 30 },
                            { titulo: "Presupuesto (M$)", valor: (f) => Math.round(f.presupuesto), tipo: "numero" },
                            { titulo: "Costo real (M$)", valor: (f) => Math.round(f.costo), tipo: "numero" },
                            { titulo: "Desviación", valor: (f) => desviacion(f) / 100, tipo: "porcentaje" },
                            { titulo: "Avance", valor: (f) => f.avance / 100, tipo: "porcentaje" },
                          ],
                        },
                      ],
                      {
                        archivo: `Costos por obra - ${[NIVELES[nivel], ...etiquetas].join(" - ")}`,
                        filtros: {
                          Período: PERIODOS.find((p) => p.id === periodo)?.texto ?? periodo,
                          "Líneas de negocio": lineas.length ? lineas.join(", ") : "Todas",
                          Región: region || "Todas",
                          Estados: estados.length ? estados.join(", ") : "Todos",
                          Nivel: [NIVELES[nivel], ...etiquetas].join(" › "),
                        },
                      },
                    )
                  }
                />
              )
            }
          >
            {filas.length ? <TablaCostos filas={filas} nivel={nivel} onBajar={bajar} /> : <SinResultados />}
          </Bloque>
        </div>
      </div>
    </div>
  );
}

function PanelFiltros({
  className,
  periodo,
  onPeriodo,
  lineas,
  onLinea,
  conteoLinea,
  region,
  onRegion,
  estados,
  onEstado,
  conteoEstado,
  hayFiltros,
  onLimpiar,
}: {
  className?: string;
  periodo: Periodo;
  onPeriodo: (p: Periodo) => void;
  lineas: string[];
  onLinea: (l: string) => void;
  conteoLinea: (l: string) => number;
  region: string;
  onRegion: (r: string) => void;
  estados: Estado[];
  onEstado: (e: Estado) => void;
  conteoEstado: (e: Estado) => number;
  hayFiltros: boolean;
  onLimpiar: () => void;
}) {
  const t = useTokens();
  return (
    <aside aria-label="Filtros" className={className}>
      <Bloque titulo="Filtros" acciones={hayFiltros && <BotonLab variante="texto" tamano="sm" icono={X} onClick={onLimpiar}>Limpiar</BotonLab>}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span style={estiloRotulo(t)}>Período</span>
            <Segmentado etiqueta="Período" opciones={PERIODOS} valor={periodo} onCambio={onPeriodo} />
          </div>

          <div role="group" aria-label="Línea de negocio" className="flex flex-col gap-2">
            <span style={estiloRotulo(t)}>Línea de negocio</span>
            <div className="flex flex-wrap gap-2">
              {LINEAS.map((l) => (
                <ChipFiltro key={l} texto={l} n={conteoLinea(l)} activo={lineas.includes(l)} onClick={() => onLinea(l)} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span style={estiloRotulo(t)}>Región</span>
            <Desplegable
              variante="libre"
              etiqueta="Región"
              valor={region}
              onCambio={onRegion}
              className="w-full"
              claseBoton="w-full justify-between"
              estiloBoton={{ ...estiloCampo(t), fontFamily: t.fuente, width: "100%" }}
              opciones={[{ valor: "", texto: "Todas las regiones" }, ...REGIONES_CORTAS.map((r) => ({ valor: r, texto: r }))]}
            >
              <span className="truncate">{region || "Todas las regiones"}</span>
            </Desplegable>
          </div>

          <div role="group" aria-label="Estado de la obra" className="flex flex-col gap-2">
            <span style={estiloRotulo(t)}>Estado de la obra</span>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <ChipFiltro key={e} texto={e} n={conteoEstado(e)} activo={estados.includes(e)} onClick={() => onEstado(e)} />
              ))}
            </div>
          </div>

          <AvisoEjemplo />
        </div>
      </Bloque>
    </aside>
  );
}

/** Cuatro cifras del nivel abierto: responden a filtros, período y drilldown. */
function Resumen({ filas, obras }: { filas: FilaCosto[]; obras: number }) {
  const t = useTokens();
  const total = totalFilas(filas);
  const d = desviacion(total);
  const cifras = [
    { nombre: "Presupuesto", valor: pesos(total.presupuesto), nota: `${obras} ${obras === 1 ? "obra" : "obras"}` },
    { nombre: "Costo real", valor: pesos(total.costo), nota: "Devengado del período" },
    {
      nombre: "Desviación",
      valor: signo(d),
      nota: d > 0 ? `${pesos(total.costo - total.presupuesto)} sobre presupuesto` : `${pesos(total.presupuesto - total.costo)} bajo presupuesto`,
      color: colorDesviacion(t, d),
    },
    { nombre: "Avance físico", valor: formato.porcentaje(total.avance), nota: "Ponderado por presupuesto" },
  ];
  return (
    <div className="card grid grid-cols-2 md:grid-cols-4" style={{ borderRadius: t.radio, fontFamily: t.fuente }}>
      {cifras.map((c, i) => (
        <div
          key={c.nombre}
          // Separadores finos: vertical entre columnas y, en móvil (2 × 2), horizontal entre filas.
          className={cn("p-4 min-w-0 border-border", i % 2 === 1 && "border-l", i === 2 && "md:border-l", i >= 2 && "border-t md:border-t-0")}
        >
          <div style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>{c.nombre}</div>
          <div
            style={{
              fontSize: Math.round(t.kpi.cifra * 0.72),
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: c.color ?? t.texto,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {c.valor}
          </div>
          <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave, marginTop: 2 }}>{c.nota}</div>
        </div>
      ))}
    </div>
  );
}

/** Barras horizontales presupuesto contra costo real; la desviación va rotulada en la punta. */
function GraficoCostos({ filas, clic }: { filas: FilaCosto[]; clic?: (f: FilaCosto) => void }) {
  const t = useTokens();
  const alto = Math.max(240, filas.length * 38 + 56);

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const colorPresupuesto = t.textoSuave;
    const ejeValor = ejeValorEcharts(t);
    const ejeCat = ejeCategoriaEcharts(t, filas.map((f) => f.nombre));
    const cursor = clic ? "pointer" : "default";
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: conAlfa(t.textoSuave, 0.08) } },
        formatter: (p: unknown) => {
          const i = (p as { dataIndex: number }[])[0]?.dataIndex ?? 0;
          const f = filas[i];
          const d = desviacion(f);
          return `<b>${f.nombre}</b><br/>Presupuesto: ${pesos(f.presupuesto)}<br/>Costo real: ${pesos(f.costo)}<br/>Desviación: <b style="color:${colorDesviacion(t, d)}">${signo(d)}</b>${
            clic ? `<br/><span style="opacity:.7">Clic para ver el detalle</span>` : ""
          }`;
        },
      },
      legend: leyendaEcharts(t, { data: ["Presupuesto", "Costo real"] }),
      grid: gridEcharts(t, { right: 64, top: 36 }),
      xAxis: { ...ejeValor, axisLabel: { ...ejeValor.axisLabel, formatter: (v: number) => formato.millones(v) } },
      yAxis: {
        ...ejeCat,
        inverse: true,
        axisLabel: { ...ejeCat.axisLabel, width: 150, overflow: "truncate" as const },
      },
      series: [
        {
          name: "Presupuesto",
          type: "bar",
          cursor,
          barGap: "20%",
          barCategoryGap: "38%",
          data: filas.map((f) => Math.round(f.presupuesto)),
          itemStyle: { ...rellenoBloqueEcharts(t, colorPresupuesto, true), color: conAlfa(colorPresupuesto, 0.35) },
        },
        {
          name: "Costo real",
          type: "bar",
          cursor,
          data: filas.map((f) => {
            const d = desviacion(f);
            return { value: Math.round(f.costo), label: { color: colorDesviacion(t, d) } };
          }),
          itemStyle: rellenoBloqueEcharts(t, t.acento, true),
          label: {
            show: true,
            position: "right",
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
            fontWeight: 600,
            formatter: (p: unknown) => signo(desviacion(filas[(p as { dataIndex: number }).dataIndex])),
          },
        },
      ],
    };
  }, [t, filas, clic]);

  const eventos = useMemo(
    () => (clic ? { click: (p: unknown) => clic(filas[(p as { dataIndex: number }).dataIndex]) } : undefined),
    [clic, filas],
  );

  return <EChart option={option} alto={alto} eventos={eventos} />;
}

/** Tabla del nivel abierto; en línea y obra, la fila baja un nivel al hacer clic. */
function TablaCostos({ filas, nivel, onBajar }: { filas: FilaCosto[]; nivel: number; onBajar: (f: FilaCosto) => void }) {
  const t = useTokens();
  const [activa, setActiva] = useState<string | null>(null);
  const total = totalFilas(filas);
  const dTotal = desviacion(total);
  const baja = nivel < 2;
  const columnas = [NIVELES[nivel], "Presupuesto", "Costo real", "Desviación", "Avance", nivel === 0 ? "Atrasadas" : "Estado"];
  const alto = Math.min(460, (filas.length + 2) * t.tabla.altoFila + 8);

  return (
    <div style={estiloContenedor(t, alto)}>
      <table style={estiloTabla()}>
        <caption className="sr-only">Detalle por {NIVELES[nivel].toLowerCase()}</caption>
        <thead>
          <tr>
            {columnas.map((c, i) => (
              <th key={c} scope="col" style={{ ...estiloEncabezado(t, { col: i }), textAlign: i > 0 && i < 5 ? "right" : "left" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, fila) => {
            const d = desviacion(f);
            return (
              <tr
                key={f.id}
                onMouseEnter={() => setActiva(f.id)}
                onMouseLeave={() => setActiva(null)}
                onClick={baja ? () => onBajar(f) : undefined}
                style={{ background: fondoFila(t, fila, activa === f.id), cursor: baja ? "pointer" : "default" }}
              >
                <td style={{ ...estiloCelda(t), height: "auto", paddingBlock: 6 }}>
                  {baja ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBajar(f);
                      }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "inherit", fontWeight: 600, color: t.texto, cursor: "pointer" }}
                    >
                      {f.nombre}
                      <ChevronRight size={14} aria-hidden style={{ color: t.textoSuave }} />
                    </button>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{f.nombre}</span>
                  )}
                  {f.sub && <div style={{ fontSize: t.tamano.eje - 1, color: t.textoSuave }}>{f.sub}</div>}
                </td>
                <td style={estiloCeldaNum(t, { col: 1 })}>{pesos(f.presupuesto)}</td>
                <td style={estiloCeldaNum(t, { col: 2 })}>{pesos(f.costo)}</td>
                <td style={{ ...estiloCeldaNum(t, { col: 3 }), color: colorDesviacion(t, d), fontWeight: 600 }}>{signo(d)}</td>
                <td style={estiloCeldaNum(t, { col: 4 })}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 64, height: 6, borderRadius: 999, background: t.grilla, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${f.avance}%`, ...rellenoBarra(t, t.colores[1]) }} />
                    </span>
                    <span style={{ minWidth: 36 }}>{formato.porcentaje(f.avance)}</span>
                  </div>
                </td>
                <td style={estiloCelda(t, { col: 5 })}>
                  {f.estado ? (
                    <InsigniaEstado t={t} estado={f.estado} />
                  ) : (
                    <span style={{ color: f.atrasadas ? t.estado.malo : t.textoSuave, fontWeight: f.atrasadas ? 600 : 400 }}>
                      {f.atrasadas ? `${f.atrasadas} de ${f.obras}` : "Sin atrasos"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...estiloPie(t), textAlign: "left" }}>Total</td>
            <td style={estiloPie(t, { col: 1 })}>{pesos(total.presupuesto)}</td>
            <td style={estiloPie(t, { col: 2 })}>{pesos(total.costo)}</td>
            <td style={{ ...estiloPie(t, { col: 3 }), color: colorDesviacion(t, dTotal) }}>{signo(dTotal)}</td>
            <td style={estiloPie(t, { col: 4 })}>{formato.porcentaje(total.avance)}</td>
            <td style={estiloPie(t, { col: 5 })} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SinResultados() {
  const t = useTokens();
  return (
    <p style={{ padding: "32px 0", textAlign: "center", fontFamily: t.fuente, fontSize: t.tamano.etiqueta, color: t.textoSuave }}>
      Ninguna obra cumple los filtros. Prueba quitando alguno.
    </p>
  );
}
