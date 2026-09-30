"use client";

import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useFiltrosUrl } from "@/components/presentaciones/use-filtros-url";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import { PageHeader } from "@/components/page-header";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { KpiPrincipal } from "@/components/reporte/kpi-principal";
import { KpiTarjeta } from "@/components/reporte/kpi-tarjeta";
import { Pildoras, TarjetaReporte } from "@/components/reporte/tarjeta";
import { BarraFiltros, type FiltroActivo } from "@/components/reporte/filtros";
import { DonaLeyenda } from "@/components/reporte/dona-leyenda";
import { FlujoMensual } from "@/components/reporte/flujo-mensual";
import { Cascada } from "@/components/reporte/cascada";
import { PiramideEdad } from "@/components/reporte/piramide-edad";
import { RankingTope } from "@/components/reporte/ranking-tope";
import { Columnas } from "@/components/reporte/columnas";
import { CeldaMonto } from "@/components/reporte/celdas";
import { cifra, colorTope, decimal } from "@/components/reporte/formato";
import { AvisoEjemplo } from "../piezas";
import {
  CIERRES,
  CONTRATOS,
  GENEROS,
  GERENCIAS,
  NIVELES,
  rotuloMes,
  rotuloMesLargo,
  TRAMOS_ANTIGUEDAD,
  TRAMOS_EDAD,
  ULTIMO,
  type Persona,
} from "./datos";
import { antiguedad, cuposDe, estadisticas, mensual, piramide, porContrato, porGerencia, puente, topeDe, type Dim, type Estadisticas, type Filtros } from "./calculos";

// Reporte Tipo 3 · dotación (RR.HH.). Mismo look & feel y receta que el Tipo 1: todo se calcula
// desde una fila por persona y los filtros son cruzados (cada gráfico sin su propio filtro).
// El corte es un mes de cierre; los movimientos y la rotación son de los 12 meses hasta ese mes.
// Datos agregados: el reporte no muestra personas. Cierre y filtros viven en la URL.

type Agrupar = "gerencia" | "nivel";
const AGRUPAR: { id: Agrupar; texto: string }[] = [
  { id: "gerencia", texto: "Por gerencia" },
  { id: "nivel", texto: "Por nivel de cargo" },
];

const mayus = (s: string) => s[0].toUpperCase() + s.slice(1);

export function ReporteDotacion() {
  const [crudo, setFiltros] = useFiltrosUrl({ cierre: String(ULTIMO), gerencia: "", genero: "", edad: "", antig: "", contrato: "", tabla: "gerencia" });
  const cierre = CIERRES.includes(Number(crudo.cierre)) ? Number(crudo.cierre) : ULTIMO;
  const f: Filtros = { cierre, gerencia: crudo.gerencia, genero: crudo.genero, edad: crudo.edad, antig: crudo.antig, contrato: crudo.contrato };
  const agrupar = crudo.tabla as Agrupar;

  const alternar = (campo: Dim, valor: string) => setFiltros((p) => ({ [campo]: p[campo] === valor ? "" : valor }));
  const clave = JSON.stringify(f);
  // Los cálculos recorren todas las filas; se repiten solo si cambian el cierre o los filtros.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const c = useMemo(() => calcular(f), [clave]);

  const activos: FiltroActivo[] = [];
  if (f.gerencia) activos.push({ clave: "gerencia", texto: `Gerencia ${f.gerencia}`, color: "var(--color-serie-1)", quitar: () => setFiltros({ gerencia: "" }) });
  if (f.genero) {
    const g = GENEROS.find((x) => x.clave === f.genero)!;
    activos.push({ clave: "genero", texto: g.nombre, color: g.color, quitar: () => setFiltros({ genero: "" }) });
  }
  if (f.edad) activos.push({ clave: "edad", texto: `${TRAMOS_EDAD[Number(f.edad)].nombre} años`, color: "var(--color-serie-1)", quitar: () => setFiltros({ edad: "" }) });
  if (f.antig) activos.push({ clave: "antig", texto: `Antigüedad ${TRAMOS_ANTIGUEDAD[Number(f.antig)].nombre.toLowerCase()}`, color: "var(--color-serie-4)", quitar: () => setFiltros({ antig: "" }) });
  if (f.contrato) {
    const k = CONTRATOS.find((x) => x.clave === f.contrato)!;
    activos.push({ clave: "contrato", texto: k.nombre, color: k.color, quitar: () => setFiltros({ contrato: "" }) });
  }

  usePublicarVista("Dotación", [`Cierre ${rotuloMesLargo(cierre)}`, ...activos.map((a) => a.texto)]);

  const { r, tope, cupos, meses, puenteDot, tramosEdad, tramosAntig, contratos, gerencias } = c;
  // La curva de fondo parte cerca del mínimo: desde cero, una dotación estable se vería plana.
  const dots = meses.map((m) => m.dotacion);
  const piso = Math.min(...dots) - (Math.max(...dots) - Math.min(...dots) || 1) * 0.6;
  const tendencia = dots.map((d) => d - piso);
  const ventanaTexto = `${rotuloMes(cierre - 11)} a ${rotuloMes(cierre)}`;

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8" data-estilo="reporte">
      <PageHeader
        title="Dotación"
        description="Personas vigentes al cierre del mes, cómo se movieron en los últimos 12 meses (ingresos, egresos y rotación contra el tope de cada gerencia) y su composición por edad, sexo, antigüedad y contrato. Clic en un gráfico para filtrar el resto. Las cifras son de ejemplo y el reporte no muestra personas."
        actions={
          <>
            <AvisoEjemplo />
            <label className="inline-flex items-center gap-2 text-[0.8125rem] text-muted">
              Cierre
              <select value={cierre} onChange={(e) => setFiltros({ cierre: e.target.value })} className="field-input w-44! rounded-full!" aria-label="Mes de cierre">
                {CIERRES.map((m) => (
                  <option key={m} value={m}>
                    {mayus(rotuloMesLargo(m))}
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] gap-4">
          <KpiPrincipal
            rotulo={`Dotación al cierre de ${rotuloMesLargo(cierre)}`}
            prefijo=""
            unidad="personas"
            valor={r.dotacion}
            contraste={
              cupos
                ? { valor: cupos, etiqueta: "cupos autorizados", avance: Math.round((r.dotacion / cupos) * 1000) / 10, etiquetaAvance: "cubierto" }
                : undefined
            }
            chips={[
              { valor: r.ingresos, etiqueta: "ingresos en 12 meses" },
              { valor: r.egresos, etiqueta: "egresos" },
              { valor: new Set(gerencias.filter((g) => g.dotacion > 0 && (!f.gerencia || g.nombre === f.gerencia)).map((g) => g.nombre)).size, etiqueta: "gerencias" },
            ]}
            tendencia={tendencia}
          />
          <div className="grid grid-cols-2 gap-4">
            <KpiTarjeta
              rotulo="Rotación 12 meses"
              valor={decimal(r.rotacion)}
              unidad="%"
              color={colorTope(r.rotacion, tope)}
              avance={tope ? (r.rotacion / tope) * 100 : undefined}
              detalle={`tope ${decimal(tope)} % · ${cifra(r.egresos)} egresos`}
            />
            <KpiTarjeta rotulo="Rotación voluntaria" valor={decimal(r.voluntaria)} unidad="%" detalle={`${cifra(r.porMotivo.renuncia)} renuncias en 12 meses`} />
            <KpiTarjeta rotulo="Antigüedad promedio" valor={decimal(r.antiguedad)} unidad="años" detalle={`edad promedio ${decimal(r.edad)} años`} />
            <KpiTarjeta
              rotulo="Mujeres"
              valor={decimal(r.mujeres)}
              unidad="%"
              detalle={r.mujeresJefatura === null ? "sin jefaturas en la selección" : `${decimal(r.mujeresJefatura)} % de las jefaturas`}
            />
          </div>
        </div>

        <BarraFiltros filtros={activos} onLimpiar={() => setFiltros({ gerencia: "", genero: "", edad: "", antig: "", contrato: "" })} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
          <TarjetaReporte numero={1} titulo="Ingresos y egresos" detalle={`por mes · ${ventanaTexto}`}>
            <FlujoMensual puntos={meses.map((m) => ({ nombre: m.nombre, entradas: m.ingresos, salidas: m.egresos, saldo: m.dotacion }))} />
          </TarjetaReporte>
          <TarjetaReporte numero={2} titulo="Puente de dotación" detalle="de un cierre al mismo mes del año siguiente">
            <Cascada inicio={puenteDot.inicio} pasos={puenteDot.pasos} cierre={puenteDot.cierre} />
          </TarjetaReporte>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TarjetaReporte numero={3} titulo="Edad y sexo" detalle="vigentes al cierre · clic en un tramo o en un lado">
            <PiramideEdad
              tramos={tramosEdad.map((t) => ({ nombre: t.nombre, izquierda: t.H, derecha: t.M }))}
              lados={[GENEROS[0], GENEROS[1]]}
              seleccion={f.edad ? Number(f.edad) : null}
              onSeleccion={(i) => alternar("edad", String(i))}
              seleccionLado={f.genero || null}
              onLado={(g) => alternar("genero", g)}
            />
          </TarjetaReporte>
          <TarjetaReporte numero={4} titulo="Rotación por gerencia" detalle="12 meses contra el tope de cada una">
            <RankingTope
              items={gerencias.map((g) => ({ clave: g.nombre, nombre: g.nombre, detalle: `${cifra(g.dotacion)} personas · ${cifra(g.egresos)} egresos`, valor: g.rotacion, tope: g.tope }))}
              seleccion={f.gerencia || null}
              onSeleccion={(g) => alternar("gerencia", g)}
            />
          </TarjetaReporte>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
          <TarjetaReporte numero={5} titulo="Antigüedad" detalle="años en la empresa · vigentes al cierre">
            <Columnas
              items={TRAMOS_ANTIGUEDAD.map((t, i) => ({ clave: String(i), nombre: t.corto, valor: tramosAntig[i] }))}
              seleccion={f.antig || null}
              onSeleccion={(k) => alternar("antig", k)}
              color="var(--color-serie-4)"
            />
          </TarjetaReporte>
          <TarjetaReporte numero={6} titulo="Tipo de contrato" detalle="vigentes al cierre">
            <DonaLeyenda
              items={CONTRATOS.map((k) => ({ clave: k.clave, nombre: k.nombre, valor: contratos[k.clave], color: k.color }))}
              seleccion={f.contrato || null}
              onSeleccion={(k) => alternar("contrato", k)}
              centro="personas"
              prefijo=""
              unidad=""
            />
          </TarjetaReporte>
        </div>

        <TablaDetalle f={f} agrupar={agrupar} onAgrupar={(v) => setFiltros({ tabla: v })} activos={activos} />
      </div>
    </div>
  );
}

function calcular(f: Filtros) {
  return {
    r: estadisticas(f),
    tope: topeDe(f),
    cupos: cuposDe(f),
    meses: mensual(f),
    puenteDot: puente(f),
    tramosEdad: piramide(f),
    tramosAntig: antiguedad(f),
    contratos: porContrato(f),
    gerencias: porGerencia(f),
  };
}

interface FilaTabla extends Estadisticas {
  nombre: string;
  tope: number | null;
}

type Orden = "dotacion" | "rotacion";

function TablaDetalle({ f, agrupar, onAgrupar, activos }: { f: Filtros; agrupar: Agrupar; onAgrupar: (v: Agrupar) => void; activos: FiltroActivo[] }) {
  const [orden, setOrden] = useState<Orden>("dotacion");
  const clave = JSON.stringify(f) + agrupar;
  const filas = useMemo<FilaTabla[]>(
    () => {
      const grupos: { nombre: string; pertenece: (p: Persona) => boolean; tope: number | null }[] =
        agrupar === "gerencia"
          ? GERENCIAS.filter((g) => !f.gerencia || g.nombre === f.gerencia).map((g) => ({ nombre: g.nombre, pertenece: (p) => p.gerencia === g.nombre, tope: g.tope }))
          : NIVELES.map((n) => ({ nombre: n.nombre, pertenece: (p) => p.nivel === n.clave, tope: null }));
      return grupos.map((g) => ({ ...estadisticas(f, undefined, g.pertenece), nombre: g.nombre, tope: g.tope })).filter((g) => g.dotacion + g.egresos > 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clave],
  );
  const ordenadas = [...filas].sort((a, b) => b[orden] - a[orden]);
  const total = filas.reduce((s, g) => s + g.dotacion, 0);
  const max = Math.max(...filas.map((g) => g.dotacion), 1);
  const titulo = agrupar === "gerencia" ? "Gerencia" : "Nivel de cargo";

  const exportar = () =>
    descargarExcel(
      [
        {
          nombre: AGRUPAR.find((a) => a.id === agrupar)!.texto,
          filas: ordenadas,
          columnas: [
            { titulo, valor: (g) => g.nombre, ancho: 22 },
            { titulo: "Dotación", valor: (g) => g.dotacion, tipo: "numero" },
            { titulo: "Ingresos 12 meses", valor: (g) => g.ingresos, tipo: "numero" },
            { titulo: "Egresos 12 meses", valor: (g) => g.egresos, tipo: "numero" },
            { titulo: "Rotación %", valor: (g) => Math.round(g.rotacion * 10) / 10, tipo: "numero" },
            { titulo: "Tope %", valor: (g) => g.tope },
            { titulo: "Mujeres %", valor: (g) => Math.round(g.mujeres * 10) / 10, tipo: "numero" },
            { titulo: "Edad promedio", valor: (g) => Math.round(g.edad * 10) / 10, tipo: "numero" },
            { titulo: "Antigüedad promedio (años)", valor: (g) => Math.round(g.antiguedad * 10) / 10, tipo: "numero" },
          ],
        },
      ],
      { archivo: "dotacion", filtros: { cierre: rotuloMesLargo(f.cierre), ...Object.fromEntries(activos.map((a) => [a.clave, a.texto])) } },
    );

  const encabezadoOrden = (campo: Orden, texto: string) => (
    <th aria-sort={orden === campo ? "descending" : "none"} className="text-right!">
      <button type="button" onClick={() => setOrden(campo)}>
        {texto}
        {orden === campo && <ArrowDown className="w-3 h-3" aria-hidden />}
      </button>
    </th>
  );

  return (
    <section data-bloque="detalle" data-bloque-titulo="Detalle" className="card overflow-hidden min-w-0">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
        <Pildoras etiqueta="Agrupar tabla" opciones={AGRUPAR} valor={agrupar} onCambio={onAgrupar} />
        <span className="inline-flex items-baseline gap-1.5">
          <b className="rep-cifra text-xl font-extrabold">{cifra(total)}</b>
          <span className="text-[0.8125rem] text-muted">personas al cierre de {rotuloMesLargo(f.cierre)}</span>
        </span>
        <BotonExcel onDescargar={exportar} />
      </div>
      <div className="overflow-x-auto">
        <table className="rep-tabla">
          <thead>
            <tr>
              <th>{titulo}</th>
              {encabezadoOrden("dotacion", "Dotación")}
              <th className="text-right!">Ingresos</th>
              <th className="text-right!">Egresos</th>
              {encabezadoOrden("rotacion", "Rotación")}
              <th className="text-right!">Mujeres</th>
              <th className="text-right! max-lg:hidden">Edad prom.</th>
              <th className="text-right! max-lg:hidden">Antigüedad prom.</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((g) => (
              <tr key={g.nombre}>
                <td className="font-semibold whitespace-nowrap">{g.nombre}</td>
                <td className="min-w-48">
                  <CeldaMonto valor={g.dotacion} max={max} total={total} prefijo="" unidad="" />
                </td>
                <td className="text-right rep-cifra">{cifra(g.ingresos)}</td>
                <td className="text-right rep-cifra">{cifra(g.egresos)}</td>
                <td className="text-right whitespace-nowrap">
                  <b className="rep-cifra" style={{ color: g.tope !== null ? colorTope(g.rotacion, g.tope) : "var(--color-text)" }}>
                    {decimal(g.rotacion)} %
                  </b>
                  {g.tope !== null && <span className="rep-cifra text-[0.6875rem] text-faint ml-1.5">/ {g.tope} %</span>}
                </td>
                <td className="text-right rep-cifra">{decimal(g.mujeres)} %</td>
                <td className="text-right rep-cifra text-muted max-lg:hidden">{decimal(g.edad)}</td>
                <td className="text-right rep-cifra text-muted max-lg:hidden">{decimal(g.antiguedad)} años</td>
              </tr>
            ))}
            {!ordenadas.length && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-8!">
                  No hay personas con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
