"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { KpiPrincipal, PanelCifras } from "@/components/reporte/kpi-principal";
import { KpiTarjeta } from "@/components/reporte/kpi-tarjeta";
import { Pildoras, TarjetaReporte } from "@/components/reporte/tarjeta";
import { DonaLeyenda } from "@/components/reporte/dona-leyenda";
import { BarrasComparadas } from "@/components/reporte/barras-comparadas";
import { MapaChile, MapaLatitud } from "@/components/reporte/mapa-chile";
import { RankingMeta } from "@/components/reporte/ranking-meta";
import { LineaAcumulada } from "@/components/reporte/linea-acumulada";
import { BarraParticipacion } from "@/components/reporte/participacion";
import { MatrizCalor } from "@/components/reporte/matriz-calor";
import { BarrasVariacion } from "@/components/reporte/variacion";
import { CeldaMonto, CeldaNombre, InsigniaSerie } from "@/components/reporte/celdas";
import { cifra, colorCumplimiento, conSigno, porcentaje } from "@/components/reporte/formato";
import { CATEGORIAS, MESES, MESES_LARGOS, ULTIMO_MES, VENTAS } from "./datos";
import {
  enPeriodo,
  filas,
  mensual,
  metaDe,
  pasa,
  porCategoria,
  porCiudad,
  porProyecto,
  porVendedor,
  suma,
  textoPeriodo,
  variacion,
  type Filtros,
} from "./calculos";
import type { PropsVista } from "./reporte";

const MIL = (uf: number) => uf / 1000;
const pctTexto = (p: number | null) => (p === null ? "sin meta" : `${Math.round(p)} %`);

/** Cifras comunes a las tres vistas. */
function resumen(f: Filtros) {
  const actual = filas(f);
  const anterior = filas(f, 2025);
  const venta = suma(actual);
  const meta = metaDe(f);
  return {
    actual,
    venta,
    meta,
    cumplimiento: meta ? (venta / meta) * 100 : null,
    unidades: actual.length,
    ticket: actual.length ? venta / actual.length : 0,
    vsAnterior: variacion(venta, suma(anterior)),
    ciudades: new Set(actual.map((v) => v.ciudad)).size,
    vendedores: new Set(actual.map((v) => v.vendedor)).size,
  };
}

function rotuloVenta(f: Filtros) {
  return f.periodo === "mes" ? `Venta de ${MESES_LARGOS[f.mes]}` : `Venta acumulada a ${MESES_LARGOS[f.mes]}`;
}

// ---------------------------------------------------------------- Tablero (vista principal)

export function VistaTablero({ f, alternar, elegirMes }: PropsVista) {
  const r = resumen(f);
  const meses = mensual(f);
  let acumulado = 0;
  const tendencia = meses.slice(0, ULTIMO_MES + 1).map((m) => (acumulado += m.actual ?? 0));
  const ultimoMes = VENTAS.filter((v) => v.anio === 2026 && v.mes === ULTIMO_MES && pasa(v, f));
  const metaUltimo = metaDe({ ...f, periodo: "mes", mes: ULTIMO_MES });
  const ciudades = porCiudad(f);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] gap-4">
        <KpiPrincipal
          rotulo={rotuloVenta(f)}
          prefijo="UF"
          unidad="mil"
          valor={MIL(r.venta)}
          contraste={
            r.meta
              ? { valor: MIL(r.meta), etiqueta: "mil de meta", avance: Math.round(r.cumplimiento! * 10) / 10, etiquetaAvance: "de la meta" }
              : undefined
          }
          chips={[
            { valor: r.unidades, etiqueta: "unidades" },
            { valor: r.ciudades, etiqueta: "ciudades" },
            { valor: r.vendedores, etiqueta: "vendedores" },
          ]}
          tendencia={tendencia}
        />
        <PanelCifras
          rotulo={`${MESES_LARGOS[ULTIMO_MES][0].toUpperCase()}${MESES_LARGOS[ULTIMO_MES].slice(1)} 2026`}
          insignia="Mes en curso"
          cifras={[
            {
              valor: cifra(MIL(suma(ultimoMes))),
              texto: "mil UF vendidas en el mes",
              detalle: metaUltimo ? `${porcentaje(suma(ultimoMes), metaUltimo)} % de la meta del mes` : "sin meta por categoría",
            },
            { valor: cifra(ultimoMes.length), texto: "unidades promesadas", detalle: `${ultimoMes.filter((v) => v.categoria === "dep").length} departamentos` },
            { valor: conSigno(r.vsAnterior), texto: "contra 2025", detalle: `mismo período (${textoPeriodo(f)})` },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4">
        <TarjetaReporte numero={1} titulo="Venta mensual" detalle="miles de UF · 2026 contra 2025 y la meta">
          <BarrasComparadas puntos={meses} seleccion={f.periodo === "mes" ? f.mes : null} onSeleccion={elegirMes} />
        </TarjetaReporte>
        <TarjetaReporte numero={2} titulo="Por categoría" detalle="venta y unidades">
          <DonaLeyenda
            items={porCategoria(f).filter((c) => c.valor > 0).map((c) => ({ clave: c.clave, nombre: c.nombre, valor: MIL(c.valor), detalle: `${c.unidades} un.`, color: c.color }))}
            seleccion={f.categoria || null}
            onSeleccion={(c) => alternar("categoria", c)}
            centro="mil UF"
            prefijo="UF "
            unidad=" mil"
            compacta
          />
        </TarjetaReporte>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4">
        <TarjetaReporte numero={3} titulo="Por ciudad" detalle="burbuja = venta · clic para filtrar">
          <div className="grid grid-cols-1 @container sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start">
            <MapaChile
              puntos={ciudades.map((c) => ({ clave: c.nombre, nombre: c.nombre, lat: c.lat, lon: c.lon, valor: c.valor }))}
              seleccion={f.ciudad || null}
              onSeleccion={(c) => alternar("ciudad", c)}
              anchoEtiquetas={96}
            />
            <ListaCiudades ciudades={ciudades} f={f} alternar={alternar} />
          </div>
        </TarjetaReporte>
        <TarjetaReporte numero={4} titulo="Por vendedor" detalle={f.categoria ? "sin meta por categoría" : "venta contra su meta"}>
          <RankingMeta
            items={porVendedor(f).map((v) => ({ clave: v.nombre, nombre: v.nombre, detalle: v.ciudad, valor: v.valor, meta: v.meta }))}
            seleccion={f.vendedor || null}
            onSeleccion={(v) => alternar("vendedor", v)}
            unidad=" mil"
          />
        </TarjetaReporte>
      </div>

      <TablaDetalle f={f} />
    </>
  );
}

function ListaCiudades({ ciudades, f, alternar }: { ciudades: ReturnType<typeof porCiudad>; f: Filtros; alternar: PropsVista["alternar"] }) {
  const orden = [...ciudades].sort((a, b) => b.valor - a.valor);
  const total = orden.reduce((s, c) => s + c.valor, 0);
  const max = Math.max(...orden.map((c) => c.valor), 1);
  return (
    <ul className="flex flex-col gap-0.5">
      {orden.map((c, i) => (
        <li key={c.nombre}>
          <button
            type="button"
            onClick={() => alternar("ciudad", c.nombre)}
            aria-pressed={f.ciudad === c.nombre}
            data-atenuado={(f.ciudad && f.ciudad !== c.nombre) || undefined}
            className="rep-filtrable w-full grid grid-cols-[1.25rem_1fr_auto] items-center gap-2 px-2 py-2 rounded-[0.625rem] text-left cursor-pointer"
          >
            <span className="rep-cifra text-[0.6875rem] text-faint">{i + 1}</span>
            <span className="flex flex-col gap-1 min-w-0">
              <span className="text-[0.8125rem] font-semibold truncate">{c.nombre}</span>
              <span className="h-1 rounded-full bg-surface-2 overflow-hidden">
                <span className="block h-full bg-serie-1" style={{ width: `${(c.valor / max) * 100}%` }} />
              </span>
            </span>
            <span className="flex flex-col items-end">
              <b className="rep-cifra text-sm font-extrabold">{cifra(MIL(c.valor))}</b>
              <span className="rep-cifra text-[0.625rem] text-faint">{porcentaje(c.valor, total)} %</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- Territorio

export function VistaTerritorio({ f, alternar }: PropsVista) {
  const r = resumen(f);
  const meses = mensual(f);
  const ciudades = porCiudad(f);
  const vendedores = porVendedor(f).filter((v) => !f.ciudad || VENTAS.some((x) => x.vendedor === v.nombre && x.ciudad === f.ciudad));

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTarjeta rotulo={rotuloVenta(f)} prefijo="UF" valor={cifra(MIL(r.venta))} unidad="mil" detalle={`${conSigno(r.vsAnterior)} contra 2025`} className="rep-destacada" />
        <KpiTarjeta
          rotulo="Cumplimiento de meta"
          valor={r.cumplimiento === null ? "—" : `${porcentaje(r.cumplimiento, 100)} %`}
          detalle={r.meta ? `meta UF ${cifra(MIL(r.meta))} mil` : "sin meta por categoría"}
          color={colorCumplimiento(r.cumplimiento)}
          avance={r.cumplimiento ?? undefined}
        />
        <KpiTarjeta rotulo="Unidades" valor={cifra(r.unidades)} detalle="promesadas en el período" />
        <KpiTarjeta rotulo="Ticket promedio" prefijo="UF" valor={cifra(r.ticket)} detalle="por unidad" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] gap-4">
        <TarjetaReporte numero={1} titulo="Mapa de ventas" detalle="burbuja = venta · color = cumplimiento">
          <MapaChile
            alto={900}
            latSur={-42.5}
            radioMax={40}
            anchoEtiquetas={150}
            puntos={ciudades.map((c) => ({
              clave: c.nombre,
              nombre: c.nombre,
              lat: c.lat,
              lon: c.lon,
              valor: c.valor,
              color: colorCumplimiento(c.cumplimiento),
              detalle: `UF ${cifra(MIL(c.valor))} mil · ${pctTexto(c.cumplimiento)}`,
            }))}
            seleccion={f.ciudad || null}
            onSeleccion={(c) => alternar("ciudad", c)}
          />
        </TarjetaReporte>

        <div className="flex flex-col gap-4 min-w-0">
          <TarjetaReporte numero={2} titulo="Acumulado contra meta" detalle="miles de UF, mes a mes">
            <LineaAcumulada categorias={MESES} actual={meses.map((m) => m.actual)} meta={meses.map((m) => m.meta)} anterior={meses.slice(0, ULTIMO_MES + 1).map((m) => m.anterior)} />
          </TarjetaReporte>
          <TarjetaReporte numero={3} titulo="Por categoría" detalle="participación · clic para filtrar">
            <BarraParticipacion
              items={porCategoria(f).filter((c) => c.valor > 0).map((c) => ({ clave: c.clave, nombre: c.nombre, valor: c.valor, detalle: `${c.unidades} un.`, color: c.color }))}
              seleccion={f.categoria || null}
              onSeleccion={(c) => alternar("categoria", c)}
            />
          </TarjetaReporte>
          <TarjetaReporte numero={4} titulo="Vendedores" detalle={f.ciudad ? `que venden en ${f.ciudad}` : "venta contra su meta"}>
            <RankingMeta
              items={vendedores.map((v) => ({ clave: v.nombre, nombre: v.nombre, detalle: v.ciudad, valor: v.valor, meta: v.meta }))}
              seleccion={f.vendedor || null}
              onSeleccion={(v) => alternar("vendedor", v)}
              unidad=" mil"
            />
          </TarjetaReporte>
        </div>
      </div>

      <TablaCiudades f={f} alternar={alternar} />
    </>
  );
}

// ---------------------------------------------------------------- Vendedor × mes

export function VistaMatriz({ f, alternar, elegirMes }: PropsVista) {
  const r = resumen(f);
  const vendedores = porVendedor(f);
  const activas = MESES.slice(0, ULTIMO_MES + 1).map((_, m) => enPeriodo(f, m));
  const ciudades = porCiudad(f);
  const baseCat = VENTAS.filter((v) => v.anio === 2026 && pasa(v, f, "categoria"));

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] gap-4">
        <KpiTarjeta rotulo={rotuloVenta(f)} prefijo="UF" valor={cifra(MIL(r.venta))} unidad="mil" className="rep-destacada col-span-2 lg:col-span-1" />
        <KpiTarjeta
          rotulo="Cumplimiento"
          valor={r.cumplimiento === null ? "—" : `${Math.round(r.cumplimiento)} %`}
          detalle={r.meta ? `meta UF ${cifra(MIL(r.meta))} mil` : "sin meta por categoría"}
          color={colorCumplimiento(r.cumplimiento)}
        />
        <KpiTarjeta rotulo="Unidades" valor={cifra(r.unidades)} detalle="promesadas" />
        <KpiTarjeta rotulo="Ticket promedio" prefijo="UF" valor={cifra(r.ticket)} detalle="por unidad" />
        <KpiTarjeta
          rotulo="Contra 2025"
          valor={conSigno(r.vsAnterior)}
          detalle="mismo período"
          color={r.vsAnterior >= 0 ? "var(--color-serie-5)" : "var(--color-serie-3)"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem] gap-4">
        <TarjetaReporte numero={1} titulo="Vendedor × mes" detalle="miles de UF · clic en un mes, un vendedor o una celda">
          <MatrizCalor
            filas={vendedores.map((v) => ({ clave: v.nombre, nombre: v.nombre, detalle: v.ciudad, valores: v.mensual, cumplimiento: v.cumplimiento }))}
            columnas={MESES.slice(0, ULTIMO_MES + 1)}
            activas={activas}
            columnaElegida={f.periodo === "mes" ? f.mes : null}
            filaElegida={f.vendedor || null}
            onColumna={elegirMes}
            onFila={(v) => alternar("vendedor", v)}
          />
        </TarjetaReporte>
        <TarjetaReporte numero={2} titulo="Por categoría" detalle="cada barra es un mes">
          <ul className="flex flex-col divide-y divide-border">
            {CATEGORIAS.map((c) => {
              const serie = MESES.slice(0, ULTIMO_MES + 1).map((_, m) => suma(baseCat.filter((v) => v.mes === m && v.categoria === c.clave)));
              const total = serie.reduce((s, v, m) => s + (activas[m] ? v : 0), 0);
              const totalPeriodo = baseCat.filter((v) => enPeriodo(f, v.mes)).reduce((s, v) => s + v.uf, 0);
              const max = Math.max(...serie, 1);
              return (
                <li key={c.clave}>
                  <button
                    type="button"
                    onClick={() => alternar("categoria", c.clave)}
                    aria-pressed={f.categoria === c.clave}
                    data-atenuado={(f.categoria && f.categoria !== c.clave) || undefined}
                    className="rep-filtrable w-full flex flex-col gap-1.5 px-2 py-2.5 rounded-[0.625rem] text-left cursor-pointer"
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: c.color }} />
                      <span className="text-[0.8125rem] font-semibold truncate">{c.nombre}</span>
                      <b className="rep-cifra ml-auto text-base font-extrabold whitespace-nowrap">UF {cifra(MIL(total))} mil</b>
                      <span className="rep-cifra text-[0.6875rem] text-faint w-10 text-right">{porcentaje(total, totalPeriodo)} %</span>
                    </span>
                    <span className="flex items-end gap-1 h-10" aria-hidden>
                      {serie.map((v, m) => (
                        <span key={m} className="flex-1 rounded-t-[3px]" style={{ height: `${8 + (v / max) * 92}%`, background: c.color, opacity: activas[m] ? 1 : 0.2 }} />
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </TarjetaReporte>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4">
        <TarjetaReporte numero={3} titulo="Por ciudad, de norte a sur" detalle="miles de UF · clic para filtrar">
          <MapaLatitud
            puntos={ciudades.map((c) => ({ clave: c.nombre, nombre: c.nombre, lat: c.lat, lon: c.lon, valor: c.valor }))}
            seleccion={f.ciudad || null}
            onSeleccion={(c) => alternar("ciudad", c)}
          />
        </TarjetaReporte>
        <TarjetaReporte numero={4} titulo="Contra 2025" detalle="variación por ciudad, mismo período">
          <BarrasVariacion items={ciudades.filter((c) => c.valor > 0).map((c) => ({ clave: c.nombre, nombre: c.nombre, variacion: c.vsAnterior }))} />
        </TarjetaReporte>
      </div>

      <TablaProyectos f={f} />
    </>
  );
}

// ---------------------------------------------------------------- Tablas

const encabezado = "flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4";

/** Tabla del tablero: por vendedor, proyecto o ciudad. */
function TablaDetalle({ f }: { f: Filtros }) {
  const [agrupar, setAgrupar] = useState<"vendedor" | "proyecto" | "ciudad">("vendedor");
  return agrupar === "proyecto" ? (
    <TablaProyectos f={f} selector={<SelectorTabla valor={agrupar} onCambio={setAgrupar} />} />
  ) : agrupar === "ciudad" ? (
    <TablaCiudades f={f} selector={<SelectorTabla valor={agrupar} onCambio={setAgrupar} />} />
  ) : (
    <TablaVendedores f={f} selector={<SelectorTabla valor={agrupar} onCambio={setAgrupar} />} />
  );
}

function SelectorTabla({ valor, onCambio }: { valor: "vendedor" | "proyecto" | "ciudad"; onCambio: (v: "vendedor" | "proyecto" | "ciudad") => void }) {
  return (
    <Pildoras
      etiqueta="Agrupar tabla"
      opciones={[
        { id: "vendedor", texto: "Por vendedor" },
        { id: "proyecto", texto: "Por proyecto" },
        { id: "ciudad", texto: "Por ciudad" },
      ]}
      valor={valor}
      onCambio={onCambio}
    />
  );
}

function Tendencia({ valores }: { valores: number[] }) {
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores);
  const d = valores.map((v, i) => `${i ? "L" : "M"}${((i / Math.max(valores.length - 1, 1)) * 116 + 2).toFixed(1)} ${(25 - ((v - min) / (max - min || 1)) * 22).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 120 28" width={120} height={28} aria-hidden>
      <path d={d} fill="none" stroke="var(--color-serie-1)" strokeWidth={1.8} />
    </svg>
  );
}

function BarraCumplimiento({ pct }: { pct: number | null }) {
  const color = colorCumplimiento(pct);
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-24 h-1.5 rounded-full bg-surface-2 overflow-hidden max-xl:hidden" aria-hidden>
        <span className="block h-full rounded-full" style={{ width: `${Math.min((pct ?? 0) / 1.2, 100)}%`, background: color }} />
      </span>
      <b className="rep-cifra text-[0.8125rem]" style={{ color }}>
        {pct === null ? "—" : `${Math.round(pct)} %`}
      </b>
    </span>
  );
}

function Variacion({ pct }: { pct: number }) {
  return (
    <b className="rep-cifra" style={{ color: pct >= 0 ? "var(--color-serie-5)" : "var(--color-serie-3)" }}>
      {conSigno(pct)}
    </b>
  );
}

function TablaVendedores({ f, selector }: { f: Filtros; selector?: React.ReactNode }) {
  const vendedores = porVendedor(f)
    .filter((v) => !f.vendedor || v.nombre === f.vendedor)
    .sort((a, b) => b.valor - a.valor);
  const total = vendedores.reduce((s, v) => s + v.valor, 0);
  const max = Math.max(...vendedores.map((v) => v.valor), 1);
  return (
    <section data-bloque="detalle-vendedores" data-bloque-titulo="Detalle por vendedor" className="card overflow-hidden min-w-0">
      <div className={encabezado}>
        {selector ?? <h2 className="text-xl font-bold tracking-tight">Detalle por vendedor</h2>}
        <span className="inline-flex items-baseline gap-1.5">
          <b className="rep-cifra text-xl font-extrabold">{vendedores.length}</b>
          <span className="text-[0.8125rem] text-muted">vendedores ·</span>
          <b className="rep-cifra text-xl font-extrabold">UF {cifra(MIL(total))} mil</b>
        </span>
        <BotonExcel
          onDescargar={() =>
            descargarExcel(
              [
                {
                  nombre: "Por vendedor",
                  filas: vendedores,
                  columnas: [
                    { titulo: "Vendedor", valor: (v) => v.nombre },
                    { titulo: "Ciudad", valor: (v) => v.ciudad },
                    { titulo: "Unidades", valor: (v) => v.unidades, tipo: "numero" },
                    { titulo: "Venta (UF)", valor: (v) => v.valor, tipo: "numero" },
                    { titulo: "Meta (UF)", valor: (v) => v.meta ?? "", tipo: "numero" },
                    { titulo: "Cumplimiento", valor: (v) => (v.cumplimiento === null ? "" : v.cumplimiento / 100), tipo: "porcentaje" },
                    { titulo: "Ticket promedio (UF)", valor: (v) => Math.round(v.ticket), tipo: "numero" },
                    { titulo: "Contra 2025", valor: (v) => v.vsAnterior / 100, tipo: "porcentaje" },
                  ],
                },
              ],
              { archivo: "ventas-por-vendedor", filtros: { Período: textoPeriodo(f) } },
            )
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="rep-tabla">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Ciudad</th>
              <th className="text-right!">Unidades</th>
              <th className="text-right! max-lg:hidden">Ticket prom.</th>
              <th className="max-xl:hidden">Tendencia 2026</th>
              <th className="text-right!">Venta</th>
              <th>Cumplimiento</th>
              <th className="text-right!">Contra 2025</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((v) => (
              <tr key={v.nombre}>
                <td className="min-w-52">
                  <CeldaNombre nombre={v.nombre} color="var(--color-serie-1)" />
                </td>
                <td className="text-muted">{v.ciudad}</td>
                <td className="text-right rep-cifra">{cifra(v.unidades)}</td>
                <td className="text-right rep-cifra text-muted max-lg:hidden">UF {cifra(v.ticket)}</td>
                <td className="max-xl:hidden">
                  <Tendencia valores={v.mensual} />
                </td>
                <td>
                  <CeldaMonto valor={MIL(v.valor)} max={MIL(max)} prefijo="UF " unidad=" mil" />
                </td>
                <td>
                  <BarraCumplimiento pct={v.cumplimiento} />
                </td>
                <td className="text-right">
                  <Variacion pct={v.vsAnterior} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TablaCiudades({ f, alternar, selector }: { f: Filtros; alternar?: PropsVista["alternar"]; selector?: React.ReactNode }) {
  const ciudades = porCiudad(f)
    .filter((c) => c.valor > 0 && (!f.ciudad || c.nombre === f.ciudad))
    .sort((a, b) => b.valor - a.valor);
  const total = porCiudad(f).reduce((s, c) => s + c.valor, 0);
  return (
    <section data-bloque="detalle-ciudades" data-bloque-titulo="Detalle por ciudad" className="card overflow-hidden min-w-0">
      <div className={encabezado}>
        {selector ?? <h2 className="text-xl font-bold tracking-tight">Detalle por ciudad</h2>}
        <span className="inline-flex items-baseline gap-1.5">
          <b className="rep-cifra text-xl font-extrabold">{ciudades.length}</b>
          <span className="text-[0.8125rem] text-muted">ciudades ·</span>
          <b className="rep-cifra text-xl font-extrabold">UF {cifra(MIL(ciudades.reduce((s, c) => s + c.valor, 0)))} mil</b>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="rep-tabla">
          <thead>
            <tr>
              <th>Ciudad</th>
              <th className="text-right!">Venta</th>
              <th className="text-right!">% del total</th>
              <th className="text-right!">Unidades</th>
              <th>Cumplimiento</th>
              <th className="max-lg:hidden">Mejor vendedor</th>
              <th className="text-right!">Contra 2025</th>
            </tr>
          </thead>
          <tbody>
            {ciudades.map((c) => (
              <tr key={c.nombre}>
                <td>
                  {alternar ? (
                    <button type="button" onClick={() => alternar("ciudad", c.nombre)} className="inline-flex items-center gap-2 font-semibold cursor-pointer hover:underline">
                      <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: colorCumplimiento(c.cumplimiento) }} />
                      {c.nombre}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: colorCumplimiento(c.cumplimiento) }} />
                      {c.nombre}
                    </span>
                  )}
                </td>
                <td className="text-right">
                  <b className="rep-cifra text-[0.9375rem] font-extrabold whitespace-nowrap">UF {cifra(MIL(c.valor))} mil</b>
                </td>
                <td className="text-right rep-cifra text-muted">{porcentaje(c.valor, total)} %</td>
                <td className="text-right rep-cifra">{cifra(c.unidades)}</td>
                <td>
                  <BarraCumplimiento pct={c.cumplimiento} />
                </td>
                <td className="text-muted max-lg:hidden">{c.mejor}</td>
                <td className="text-right">
                  <Variacion pct={c.vsAnterior} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TablaProyectos({ f, selector }: { f: Filtros; selector?: React.ReactNode }) {
  const proyectos = porProyecto(f).sort((a, b) => b.valor - a.valor);
  const max = Math.max(...proyectos.map((p) => p.valor), 1);
  return (
    <section data-bloque="detalle-proyectos" data-bloque-titulo="Detalle por proyecto" className="card overflow-hidden min-w-0">
      <div className={encabezado}>
        {selector ?? <h2 className="text-xl font-bold tracking-tight">Proyectos</h2>}
        <span className="text-[0.8125rem] text-muted">avance de venta del stock y velocidad</span>
      </div>
      <div className="overflow-x-auto">
        <table className="rep-tabla">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Ciudad</th>
              <th>Categoría</th>
              <th>Avance del stock</th>
              <th className="text-right!">Venta</th>
              <th className="text-right! max-lg:hidden">Velocidad</th>
              <th className="text-right!">Se agota en</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => {
              const cat = CATEGORIAS.find((c) => c.clave === p.categoria)!;
              const avance = (p.vendidas / p.stock) * 100;
              const meses = p.agotaEn;
              const colorAgota = meses === null ? "var(--color-faint)" : meses > 24 ? "var(--color-serie-3)" : meses > 14 ? "var(--color-serie-2)" : "var(--color-serie-5)";
              return (
                <tr key={p.nombre}>
                  <td className="min-w-52">
                    <CeldaNombre nombre={p.nombre} color={cat.color} />
                  </td>
                  <td className="text-muted">{p.ciudad}</td>
                  <td>
                    <InsigniaSerie texto={cat.nombre} color={cat.color} />
                  </td>
                  <td>
                    <span className="flex items-center gap-2.5 whitespace-nowrap">
                      <span className="w-28 h-2 rounded-full bg-surface-2 overflow-hidden max-lg:hidden" aria-hidden>
                        <span className="block h-full rounded-full bg-serie-1" style={{ width: `${avance}%` }} />
                      </span>
                      <b className="rep-cifra text-[0.8125rem]">{Math.round(avance)} %</b>
                      <span className="text-[0.6875rem] text-faint">
                        {p.vendidas} de {p.stock}
                      </span>
                    </span>
                  </td>
                  <td>
                    <CeldaMonto valor={MIL(p.valor)} max={MIL(max)} prefijo="UF " unidad=" mil" />
                  </td>
                  <td className="text-right rep-cifra text-muted whitespace-nowrap max-lg:hidden">{p.velocidad.toLocaleString("es-CL", { maximumFractionDigits: 1 })} un./mes</td>
                  <td className={cn("text-right rep-cifra font-bold whitespace-nowrap")} style={{ color: colorAgota }}>
                    {meses === null ? "—" : `${Math.round(meses)} meses`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
