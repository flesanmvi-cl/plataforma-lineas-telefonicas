"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Search } from "lucide-react";
import { useFiltrosUrl } from "@/components/presentaciones/use-filtros-url";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import { PageHeader } from "@/components/page-header";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { KpiPrincipal, PanelCifras } from "@/components/reporte/kpi-principal";
import { Pildoras, TarjetaReporte } from "@/components/reporte/tarjeta";
import { BarraFiltros, type FiltroActivo } from "@/components/reporte/filtros";
import { DonaLeyenda, type ItemDona } from "@/components/reporte/dona-leyenda";
import { Piramide } from "@/components/reporte/piramide";
import { BarrasApiladas } from "@/components/reporte/barras-apiladas";
import { CeldaMonto, CeldaNombre, InsigniaSerie, NumeroCaja, ValorConMas } from "@/components/reporte/celdas";
import { cifra, SERIES } from "@/components/reporte/formato";
import { CONTRATOS, NIVELES, TIPOS, UNIDADES, UNIVERSO, type Contrato, type Tipo } from "./datos-contratacion";
import { AvisoEjemplo } from "./piezas";
import { useTutorial } from "@/components/tutorial/tutorial";
import { PASOS_TIPO_1 } from "./tutoriales";
import { Espacio, type DefEspacio } from "./espacios";

/** Espacios del Reporte Tipo 1, en orden: el laboratorio de diseño los usa para probar piezas. */
export const ESPACIOS_TIPO_1 = [
  { id: "kpi", nombre: "KPI principal", seccion: "kpis", actual: "KpiPrincipal", alto: 220 },
  { id: "cifras", nombre: "Cifras de contexto", seccion: "kpis", actual: "PanelCifras", alto: 220 },
  { id: "bloque-1", nombre: "Tipo de contrato", seccion: "graficos", actual: "DonaLeyenda", alto: 260 },
  { id: "bloque-2", nombre: "Nivel de aprobación", seccion: "graficos", actual: "Piramide", alto: 260 },
  { id: "bloque-3", nombre: "Unidad de negocio", seccion: "graficos", actual: "DonaLeyenda (compacta)", alto: 260 },
  { id: "bloque-4", nombre: "Monto por año", seccion: "graficos", actual: "BarrasApiladas", alto: 260 },
  { id: "tabla", nombre: "Detalle", seccion: "tablas", actual: "tabla rep-tabla", alto: 380 },
] as const satisfies readonly DefEspacio[];

export type EspacioTipo1 = (typeof ESPACIOS_TIPO_1)[number]["id"];

interface PropsReporte {
  /** Lo que reemplaza a la pieza de cada espacio (sin esto, la plantilla se ve igual). */
  espacios?: Partial<Record<EspacioTipo1, ReactNode>>;
  /** Numera los espacios sobre la pantalla. */
  marcas?: boolean;
}

// Reporte Tipo 1 · tablero ejecutivo con filtros cruzados (look & feel del panel de Conflicto
// de Interés, opción A aprobada). Todos los bloques se calculan desde una lista de filas: en una
// plataforma basta con cambiar CONTRATOS por la consulta real.
//
// Filtros cruzados: un clic en la dona, la pirámide o las unidades filtra todo lo demás. Cada
// gráfico se calcula sin su propio filtro, para que lo elegido quede resaltado y lo demás
// atenuado en vez de desaparecer. Los filtros viven en la URL (presentaciones).

type Vista = "ejecucion" | "historico";
type VistaTabla = "subcontratista" | "unidad";

const VISTAS: { id: Vista; texto: string }[] = [
  { id: "ejecucion", texto: "En ejecución" },
  { id: "historico", texto: "Histórico" },
];
const VISTAS_TABLA: { id: VistaTabla; texto: string }[] = [
  { id: "subcontratista", texto: "Por subcontratista" },
  { id: "unidad", texto: "Por unidad" },
];

const PRINCIPALES = UNIDADES.slice(0, 5);
const OTRAS = "otras";
const COLOR_UNIDAD = [SERIES[5], SERIES[4], SERIES[1], SERIES[6], SERIES[3]];
const colorTipo = (t: Tipo) => TIPOS.find((x) => x.clave === t)!.color;
const grupoUnidad = (u: string) => (PRINCIPALES.includes(u) ? u : OTRAS);
const colorUnidad = (u: string) => (u === OTRAS ? SERIES[7] : COLOR_UNIDAD[PRINCIPALES.indexOf(u)]);
const suma = (filas: Contrato[], campo: "monto" | "facturado" = "monto") => filas.reduce((s, f) => s + f[campo], 0);
const distintos = (filas: Contrato[], campo: keyof Contrato) => new Set(filas.map((f) => f[campo])).size;

interface FilaSubcontratista {
  nombre: string;
  giro: string;
  unidad: string;
  masUnidades: number;
  tipo: Tipo;
  nivel: number;
  desde: number;
  hasta: string;
  contratos: number;
  monto: number;
  facturado: number;
}

function porSubcontratista(filas: Contrato[]): FilaSubcontratista[] {
  const grupos = new Map<string, Contrato[]>();
  for (const f of filas) grupos.set(f.subcontratista, [...(grupos.get(f.subcontratista) ?? []), f]);
  return [...grupos.entries()].map(([nombre, cs]) => {
    const porUnidad = new Map<string, number>();
    const porTipo = new Map<Tipo, number>();
    for (const c of cs) {
      porUnidad.set(c.unidad, (porUnidad.get(c.unidad) ?? 0) + c.monto);
      porTipo.set(c.tipo, (porTipo.get(c.tipo) ?? 0) + c.monto);
    }
    const mayor = <K,>(m: Map<K, number>) => [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const vigente = cs.some((c) => c.vigente);
    return {
      nombre,
      giro: cs[0].giro,
      unidad: mayor(porUnidad),
      masUnidades: porUnidad.size - 1,
      tipo: mayor(porTipo),
      nivel: Math.min(...cs.map((c) => c.nivel)),
      desde: Math.min(...cs.map((c) => c.anio)),
      hasta: vigente ? "vigente" : String(Math.max(...cs.map((c) => c.anio)) + 1),
      contratos: cs.length,
      monto: suma(cs),
      facturado: suma(cs, "facturado"),
    };
  });
}

export function ReporteEjecutivo({ espacios = {}, marcas }: PropsReporte = {}) {
  const espacio = (id: EspacioTipo1, contenido: ReactNode, className?: string) => {
    const i = ESPACIOS_TIPO_1.findIndex((e) => e.id === id);
    return (
      <Espacio n={i + 1} nombre={ESPACIOS_TIPO_1[i].nombre} marcas={marcas} reemplazado={id in espacios} className={className}>
        {espacios[id] ?? contenido}
      </Espacio>
    );
  };
  useTutorial(PASOS_TIPO_1);
  const [filtros, setFiltros] = useFiltrosUrl({ vista: "historico", tipo: "", unidad: "", nivel: "", tabla: "subcontratista" });
  const vista = filtros.vista as Vista;
  const vistaTabla = filtros.tabla as VistaTabla;
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<"monto" | "facturado">("monto");
  const [todas, setTodas] = useState(false);

  const alternar = (campo: "tipo" | "unidad" | "nivel", valor: string) =>
    setFiltros((f) => ({ [campo]: f[campo] === valor ? "" : valor }));

  // Filas de la vista (en ejecución / histórico) y el filtro de cada dimensión.
  const base = useMemo(() => (vista === "ejecucion" ? CONTRATOS.filter((c) => c.vigente) : CONTRATOS), [vista]);
  const pasa = (c: Contrato, sin?: "tipo" | "unidad" | "nivel") =>
    (sin === "tipo" || !filtros.tipo || c.tipo === filtros.tipo) &&
    (sin === "unidad" || !filtros.unidad || grupoUnidad(c.unidad) === filtros.unidad) &&
    (sin === "nivel" || !filtros.nivel || String(c.nivel) === filtros.nivel);
  const filtradas = base.filter((c) => pasa(c));

  const total = suma(filtradas);
  const facturado = suma(filtradas, "facturado");

  const itemsTipo: ItemDona[] = TIPOS.map((t) => {
    const cs = base.filter((c) => pasa(c, "tipo") && c.tipo === t.clave);
    return { clave: t.clave, nombre: t.nombre, valor: suma(cs), detalle: `${cs.length} contratos`, color: t.color };
  });

  const filasUnidad = base.filter((c) => pasa(c, "unidad"));
  const otras = UNIDADES.slice(5);
  const itemsUnidad: ItemDona[] = [...PRINCIPALES, OTRAS].map((u) => {
    const cs = filasUnidad.filter((c) => grupoUnidad(c.unidad) === u);
    return {
      clave: u,
      nombre: u === OTRAS ? `Otras ${otras.length}` : u,
      valor: suma(cs),
      detalle: `${distintos(cs, "subcontratista")} subcontratistas · ${cs.length} contratos`,
      color: colorUnidad(u),
    };
  });

  const filasNivel = base.filter((c) => pasa(c, "nivel"));
  const niveles = NIVELES.map((nombre, i) => {
    const cs = filasNivel.filter((c) => c.nivel === i + 1);
    return { numero: i + 1, nombre, cantidad: cs.length, valor: suma(cs) };
  });

  const anios = Array.from({ length: 11 }, (_, i) => 2016 + i);
  const series = TIPOS.map((t) => ({
    clave: t.clave,
    nombre: t.nombre,
    color: t.color,
    valores: anios.map((a) => suma(filtradas.filter((c) => c.anio === a && c.tipo === t.clave))),
  }));
  let acumulado = 0;
  const tendencia = anios.map((a) => (acumulado += suma(filtradas.filter((c) => c.anio === a))));

  const activos: FiltroActivo[] = [];
  if (filtros.tipo) {
    const t = TIPOS.find((x) => x.clave === filtros.tipo)!;
    activos.push({ clave: "tipo", texto: t.nombre, color: t.color, quitar: () => setFiltros({ tipo: "" }) });
  }
  if (filtros.unidad) {
    activos.push({
      clave: "unidad",
      texto: filtros.unidad === OTRAS ? `Otras unidades (${otras.join(", ")})` : `Unidad ${filtros.unidad}`,
      color: colorUnidad(filtros.unidad),
      quitar: () => setFiltros({ unidad: "" }),
    });
  }
  if (filtros.nivel) {
    activos.push({
      clave: "nivel",
      texto: `Nivel ${filtros.nivel} · ${NIVELES[Number(filtros.nivel) - 1]}`,
      color: SERIES[3],
      quitar: () => setFiltros({ nivel: "" }),
    });
  }

  usePublicarVista("Resumen de contratación", [VISTAS.find((v) => v.id === vista)!.texto, ...activos.map((a) => a.texto)]);

  // Tabla
  const q = busqueda.trim().toLowerCase();
  const subcontratistas = porSubcontratista(filtradas)
    .filter((f) => !q || `${f.nombre} ${f.giro} ${f.unidad}`.toLowerCase().includes(q))
    .sort((a, b) => b[orden] - a[orden]);
  const unidadesTabla = UNIDADES.map((u) => {
    const cs = filtradas.filter((c) => c.unidad === u);
    return { unidad: u, subcontratistas: distintos(cs, "subcontratista"), contratos: cs.length, monto: suma(cs), facturado: suma(cs, "facturado") };
  })
    .filter((f) => f.contratos > 0 && (!q || f.unidad.toLowerCase().includes(q)))
    .sort((a, b) => b[orden] - a[orden]);
  const maxTabla = Math.max(...(vistaTabla === "unidad" ? unidadesTabla : subcontratistas).map((f) => f.monto), 1);
  const LIMITE = 10;
  const visibles = todas ? subcontratistas : subcontratistas.slice(0, LIMITE);

  const exportar = () =>
    vistaTabla === "unidad"
      ? descargarExcel(
          [
            {
              nombre: "Por unidad",
              filas: unidadesTabla,
              columnas: [
                { titulo: "Unidad", valor: (f) => f.unidad },
                { titulo: "Subcontratistas", valor: (f) => f.subcontratistas, tipo: "numero" },
                { titulo: "Contratos", valor: (f) => f.contratos, tipo: "numero" },
                { titulo: "Contratado (MM)", valor: (f) => f.monto, tipo: "numero" },
                { titulo: "Facturado (MM)", valor: (f) => f.facturado, tipo: "numero" },
              ],
            },
          ],
          { archivo: "resumen-contratacion-unidades", filtros: Object.fromEntries(activos.map((a) => [a.clave, a.texto])) },
        )
      : descargarExcel(
          [
            {
              nombre: "Por subcontratista",
              filas: subcontratistas,
              columnas: [
                { titulo: "Subcontratista", valor: (f) => f.nombre, ancho: 34 },
                { titulo: "Giro", valor: (f) => f.giro },
                { titulo: "Unidad principal", valor: (f) => f.unidad },
                { titulo: "Nivel de aprobación", valor: (f) => f.nivel, tipo: "numero" },
                { titulo: "Tipo", valor: (f) => TIPOS.find((t) => t.clave === f.tipo)!.nombre },
                { titulo: "Desde", valor: (f) => f.desde, tipo: "numero" },
                { titulo: "Hasta", valor: (f) => f.hasta },
                { titulo: "Contratos", valor: (f) => f.contratos, tipo: "numero" },
                { titulo: "Contratado (MM)", valor: (f) => f.monto, tipo: "numero" },
                { titulo: "Facturado (MM)", valor: (f) => f.facturado, tipo: "numero" },
              ],
            },
          ],
          { archivo: "resumen-contratacion", filtros: Object.fromEntries(activos.map((a) => [a.clave, a.texto])) },
        );

  const encabezadoOrden = (campo: "monto" | "facturado", texto: string) => (
    <th aria-sort={orden === campo ? "descending" : "none"} className="text-right!">
      <button type="button" onClick={() => setOrden(campo)}>
        {texto}
        {orden === campo && <ArrowDown className="w-3 h-3" aria-hidden />}
      </button>
    </th>
  );

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8" data-estilo="reporte">
      <PageHeader
        title="Resumen de contratación"
        description="Tablero ejecutivo: cuánto se ha contratado y facturado, con qué tipo de contrato, quién lo aprobó y en qué unidad. Clic en un gráfico para filtrar el resto. Las cifras son de ejemplo."
        actions={
          <>
            <AvisoEjemplo />
            <Link href="/plantillas/reportes/tipo-4" className="inline-flex items-center gap-1 text-[0.8125rem] text-muted hover:text-text">
              Análisis por obra
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </>
        }
        subvistas={VISTAS}
        subvista={vista}
        onSubvista={(v) => setFiltros({ vista: v })}
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] gap-4">
          {espacio(
            "kpi",
            <KpiPrincipal
              rotulo="Monto contratado"
              valor={total}
              contraste={{
                valor: facturado,
                etiqueta: "MM facturado",
                avance: total ? Math.round((facturado / total) * 1000) / 10 : 0,
                etiquetaAvance: "facturado",
              }}
              chips={[
                { valor: distintos(filtradas, "unidad"), etiqueta: "unidades" },
                { valor: distintos(filtradas, "subcontratista"), etiqueta: "subcontratistas" },
                { valor: filtradas.length, etiqueta: "contratos" },
              ]}
              tendencia={tendencia}
            />,
          )}
          {espacio("cifras", <PanelCifras rotulo="Universo en revisión" insignia="Fijo" cifras={UNIVERSO} />)}
        </div>

        <BarraFiltros filtros={activos} onLimpiar={() => setFiltros({ tipo: "", unidad: "", nivel: "" })} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Espacio n={3} nombre={ESPACIOS_TIPO_1[2].nombre} marcas={marcas} reemplazado={"bloque-1" in espacios}>
            <TarjetaReporte numero={1} titulo="Tipo de contrato" detalle="monto contratado">
              {espacios["bloque-1"] ?? <DonaLeyenda items={itemsTipo} seleccion={filtros.tipo || null} onSeleccion={(c) => alternar("tipo", c)} />}
            </TarjetaReporte>
          </Espacio>
          <Espacio n={4} nombre={ESPACIOS_TIPO_1[3].nombre} marcas={marcas} reemplazado={"bloque-2" in espacios}>
            <TarjetaReporte numero={2} titulo="Nivel de aprobación" detalle="quién firmó · contratos · monto">
              {espacios["bloque-2"] ?? <Piramide niveles={niveles} seleccion={filtros.nivel ? Number(filtros.nivel) : null} onSeleccion={(n) => alternar("nivel", String(n))} />}
            </TarjetaReporte>
          </Espacio>
          <Espacio n={5} nombre={ESPACIOS_TIPO_1[4].nombre} marcas={marcas} reemplazado={"bloque-3" in espacios}>
            <TarjetaReporte numero={3} titulo="Unidad de negocio" detalle="donde se contrató">
              {espacios["bloque-3"] ?? <DonaLeyenda items={itemsUnidad} seleccion={filtros.unidad || null} onSeleccion={(c) => alternar("unidad", c)} compacta />}
            </TarjetaReporte>
          </Espacio>
          <Espacio n={6} nombre={ESPACIOS_TIPO_1[5].nombre} marcas={marcas} reemplazado={"bloque-4" in espacios}>
            <TarjetaReporte numero={4} titulo="Monto por año" detalle="año de adjudicación">
              {espacios["bloque-4"] ?? <BarrasApiladas categorias={anios.map((a) => `'${String(a).slice(2)}`)} series={series} seleccion={filtros.tipo || null} alto={220} />}
            </TarjetaReporte>
          </Espacio>
        </div>

        <Espacio n={7} nombre={ESPACIOS_TIPO_1[6].nombre} marcas={marcas} reemplazado={"tabla" in espacios}>
          {espacios.tabla ? (
            <section data-bloque="detalle" data-bloque-titulo="Detalle" className="card p-5 min-w-0">
              {espacios.tabla}
            </section>
          ) : (
            <section data-bloque="detalle" data-bloque-titulo="Detalle" className="card overflow-hidden min-w-0">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <Pildoras etiqueta="Agrupar tabla" opciones={VISTAS_TABLA} valor={vistaTabla} onCambio={(v) => setFiltros({ tabla: v })} />
                <span className="inline-flex items-baseline gap-1.5">
                  <b className="rep-cifra text-xl font-extrabold">{vistaTabla === "unidad" ? unidadesTabla.length : subcontratistas.length}</b>
                  <span className="text-[0.8125rem] text-muted">{vistaTabla === "unidad" ? "unidades" : "subcontratistas"} ·</span>
                  <b className="rep-cifra text-xl font-extrabold">$ {cifra(total)} MM</b>
                </span>
                <BotonExcel onDescargar={exportar} />
                <label className="relative ml-auto w-full sm:w-80">
                  <span className="sr-only">Buscar en la tabla</span>
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder={vistaTabla === "unidad" ? "Buscar unidad…" : "Buscar subcontratista, giro, unidad…"}
                    className="field-input rounded-full! pl-10! w-full!"
                  />
                </label>
              </div>
              <div className="overflow-x-auto">
                {vistaTabla === "unidad" ? (
                  <table className="rep-tabla">
                    <thead>
                      <tr>
                        <th>Unidad</th>
                        <th className="text-right!">Subcontratistas</th>
                        <th className="text-right!">Contratos</th>
                        {encabezadoOrden("monto", "Contratado")}
                        {encabezadoOrden("facturado", "Facturado")}
                      </tr>
                    </thead>
                    <tbody>
                      {unidadesTabla.map((f) => (
                        <tr key={f.unidad}>
                          <td>
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: colorUnidad(grupoUnidad(f.unidad)) }} />
                              {f.unidad}
                            </span>
                          </td>
                          <td className="text-right rep-cifra">{cifra(f.subcontratistas)}</td>
                          <td className="text-right rep-cifra">{cifra(f.contratos)}</td>
                          <td>
                            <CeldaMonto valor={f.monto} max={maxTabla} total={total} />
                          </td>
                          <td className="text-right rep-cifra text-muted">$ {cifra(f.facturado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="rep-tabla">
                    <thead>
                      <tr>
                        <th>Subcontratista</th>
                        <th>Unidad</th>
                        <th>Nivel</th>
                        <th>Tipo</th>
                        <th className="max-xl:hidden">Vigencia</th>
                        {encabezadoOrden("monto", "Contratado")}
                        {encabezadoOrden("facturado", "Facturado")}
                      </tr>
                    </thead>
                    <tbody>
                      {visibles.map((f) => (
                        <tr key={f.nombre}>
                          <td className="min-w-64">
                            <CeldaNombre nombre={f.nombre} detalle={`${f.giro} · ${f.contratos} contratos`} color={colorTipo(f.tipo)} />
                          </td>
                          <td>
                            <ValorConMas valor={f.unidad} mas={f.masUnidades} />
                          </td>
                          <td>
                            <NumeroCaja n={f.nivel} />
                          </td>
                          <td>
                            <InsigniaSerie texto={TIPOS.find((t) => t.clave === f.tipo)!.nombre} color={colorTipo(f.tipo)} />
                          </td>
                          <td className="rep-cifra text-muted whitespace-nowrap max-xl:hidden">
                            {f.desde} → {f.hasta}
                          </td>
                          <td>
                            <CeldaMonto valor={f.monto} max={maxTabla} total={total} />
                          </td>
                          <td className="text-right rep-cifra text-muted whitespace-nowrap">$ {cifra(f.facturado)}</td>
                        </tr>
                      ))}
                      {!visibles.length && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-8!">
                            No hay subcontratistas con esos filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              {vistaTabla === "subcontratista" && subcontratistas.length > LIMITE && (
                <div className="border-t border-border px-5 py-3">
                  <button type="button" onClick={() => setTodas((t) => !t)} className="text-[0.8125rem] font-semibold text-muted hover:text-text cursor-pointer">
                    {todas ? "Ver menos" : `Ver los ${subcontratistas.length} subcontratistas`}
                  </button>
                </div>
              )}
            </section>
          )}
        </Espacio>
      </div>
    </div>
  );
}
