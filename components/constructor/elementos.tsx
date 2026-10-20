"use client";

import type { ReactNode } from "react";
import { CurvaS } from "@/components/estandar/graficos/tiempo/curva-s";
import { GanttObra } from "@/components/estandar/graficos/tiempo/gantt-obra";
import { LineaHitos } from "@/components/estandar/graficos/tiempo/linea-hitos";
import { BurbujasObras } from "@/components/estandar/graficos/mapas/burbujas-obras";
import { PageHeader } from "@/components/page-header";
import { KpiPrincipal } from "@/components/reporte/kpi-principal";
import { KpiTarjeta } from "@/components/reporte/kpi-tarjeta";
import { BarraFiltros } from "@/components/reporte/filtros";
import { DonaLeyenda } from "@/components/reporte/dona-leyenda";
import { BarrasComparadas } from "@/components/reporte/barras-comparadas";
import { LineaAcumulada } from "@/components/reporte/linea-acumulada";
import { BarrasApiladas } from "@/components/reporte/barras-apiladas";
import { BarraParticipacion } from "@/components/reporte/participacion";
import { RankingMeta } from "@/components/reporte/ranking-meta";
import { RankingTope } from "@/components/reporte/ranking-tope";
import { Piramide } from "@/components/reporte/piramide";
import { PiramideEdad } from "@/components/reporte/piramide-edad";
import { FlujoMensual } from "@/components/reporte/flujo-mensual";
import { Cascada } from "@/components/reporte/cascada";
import { Columnas } from "@/components/reporte/columnas";
import { BarrasVariacion } from "@/components/reporte/variacion";
import { MapaChile } from "@/components/reporte/mapa-chile";
import { CeldaMonto, CeldaNombre, InsigniaSerie } from "@/components/reporte/celdas";
import { SERIES } from "@/components/reporte/formato";
import type { Ancho, Bloque } from "@/lib/constructor/tipos";

// Catálogo del constructor de maquetas: textos, las piezas estándar de reportería
// (components/reporte, con datos de ejemplo) y las piezas del estándar (components/estandar). Cada elemento sabe
// dibujarse con un alto dado; el constructor pone el marco, el ancho y el título.

export interface ElementoConstructor {
  id: string;
  nombre: string;
  grupo: string;
  /** «tarjeta»: el constructor lo envuelve en una tarjeta con título. «propio»: trae su marco. */
  marco: "tarjeta" | "propio";
  ancho: Ancho;
  alto: number;
  /** Crece con su contenido (el alto es un mínimo): botones, campos, rankings. */
  crece?: boolean;
  titulo: string;
  detalle?: string;
  /** Rótulos de los campos de texto en Propiedades; null oculta el campo. */
  campos?: { titulo?: string | null; detalle?: string | null };
  /** Fuera de la guía de marca (paletas o efectos en exploración). */
  exploracion?: boolean;
  render: (p: { alto: number; bloque: Bloque }) => ReactNode;
}

// ---- Datos de ejemplo de las piezas de reportería ----

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const SERIE_ANUAL = [42, 38, 51, 47, 55, 53, 60, 64, 58, 61, 66, 72];
const ANTERIOR = [39, 36, 44, 45, 49, 50, 52, 57, 55, 56, 60, 68];
const CATEGORIAS = [
  { clave: "a", nombre: "Edificación", valor: 14100, detalle: "72 contratos", color: SERIES[0] },
  { clave: "b", nombre: "Obras civiles", valor: 9070, detalle: "33 contratos", color: SERIES[1] },
  { clave: "c", nombre: "Minería", valor: 8660, detalle: "35 contratos", color: SERIES[3] },
  { clave: "d", nombre: "Otras", valor: 2400, detalle: "12 contratos", color: SERIES[7] },
];
const PERSONAS = [
  { clave: "1", nombre: "Unidad Norte", detalle: "Antofagasta", valor: 118000, meta: 110000 },
  { clave: "2", nombre: "Unidad Centro", detalle: "Santiago", valor: 96000, meta: 104000 },
  { clave: "3", nombre: "Unidad Sur", detalle: "Concepción", valor: 71000, meta: 80000 },
  { clave: "4", nombre: "Unidad Austral", detalle: "Puerto Montt", valor: 42000, meta: 40000 },
];

function TablaEjemplo() {
  const filas = [
    { nombre: "Constructora Los Andes SpA", detalle: "Obra gruesa · 12 contratos", tipo: "Subcontrato", color: SERIES[0], monto: 4120 },
    { nombre: "Montajes del Pacífico Ltda.", detalle: "Montaje · 7 contratos", tipo: "Servicios", color: SERIES[1], monto: 2890 },
    { nombre: "Ingeniería Cordillera S.A.", detalle: "Ingeniería · 5 contratos", tipo: "Obra directa", color: SERIES[3], monto: 1760 },
    { nombre: "Transportes Biobío SpA", detalle: "Transporte · 9 contratos", tipo: "Servicios", color: SERIES[1], monto: 980 },
  ];
  const total = filas.reduce((s, f) => s + f.monto, 0);
  return (
    <div className="overflow-x-auto -mx-5">
      <table className="rep-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th className="text-right!">Monto</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nombre}>
              <td className="min-w-56">
                <CeldaNombre nombre={f.nombre} detalle={f.detalle} color={f.color} />
              </td>
              <td>
                <InsigniaSerie texto={f.tipo} color={f.color} />
              </td>
              <td>
                <CeldaMonto valor={f.monto} max={filas[0].monto} total={total} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TEXTO: ElementoConstructor[] = [
  {
    id: "texto-titulo",
    nombre: "Título de página",
    grupo: "Texto y estructura",
    marco: "propio",
    ancho: 12,
    alto: 0,
    crece: true,
    titulo: "Título de la vista",
    detalle: "Qué muestra esta vista y cómo leerla. Va detrás del ícono (i).",
    campos: { titulo: "Título", detalle: "Descripción (i)" },
    render: ({ bloque }) => <PageHeader title={bloque.titulo} description={bloque.detalle || undefined} className="mb-0!" />,
  },
  {
    id: "texto-seccion",
    nombre: "Subtítulo de sección",
    grupo: "Texto y estructura",
    marco: "propio",
    ancho: 12,
    alto: 0,
    crece: true,
    titulo: "Nombre de la sección",
    detalle: "",
    campos: { titulo: "Subtítulo", detalle: "Detalle" },
    render: ({ bloque }) => (
      <div className="flex items-baseline gap-3 pt-2">
        <h2 className="brand-bullet text-lg font-bold text-text">{bloque.titulo}</h2>
        {bloque.detalle && <span className="text-xs text-faint">{bloque.detalle}</span>}
      </div>
    ),
  },
  {
    id: "texto-parrafo",
    nombre: "Párrafo",
    grupo: "Texto y estructura",
    marco: "propio",
    ancho: 12,
    alto: 0,
    crece: true,
    titulo: "",
    detalle: "Texto de apoyo para explicar un bloque, una regla de negocio o cómo se calcula una cifra.",
    campos: { titulo: null, detalle: "Texto" },
    render: ({ bloque }) => <p className="text-sm text-muted leading-relaxed max-w-[70ch]">{bloque.detalle}</p>,
  },
  {
    id: "texto-filtros",
    nombre: "Barra de filtros",
    grupo: "Texto y estructura",
    marco: "propio",
    ancho: 12,
    alto: 0,
    crece: true,
    titulo: "",
    campos: { titulo: null, detalle: null },
    render: () => (
      <BarraFiltros
        filtros={[
          { clave: "a", texto: "Edificación", color: SERIES[0], quitar: () => {} },
          { clave: "b", texto: "Unidad Norte", color: SERIES[3], quitar: () => {} },
        ]}
        onLimpiar={() => {}}
      />
    ),
  },
  {
    id: "texto-separador",
    nombre: "Separador",
    grupo: "Texto y estructura",
    marco: "propio",
    ancho: 12,
    alto: 0,
    crece: true,
    titulo: "",
    campos: { titulo: null, detalle: null },
    render: () => <hr className="border-border my-1" />,
  },
];

const REPORTE: ElementoConstructor[] = [
  {
    id: "rep-kpi-principal",
    nombre: "KPI principal",
    grupo: "Reportería estándar",
    marco: "propio",
    ancho: 8,
    alto: 0,
    crece: true,
    titulo: "Monto contratado",
    campos: { titulo: "Rótulo", detalle: null },
    render: ({ bloque }) => (
      <KpiPrincipal
        rotulo={bloque.titulo}
        valor={31834}
        contraste={{ valor: 22436, etiqueta: "MM facturado", avance: 70.5, etiquetaAvance: "facturado" }}
        chips={[
          { valor: 9, etiqueta: "unidades" },
          { valor: 18, etiqueta: "subcontratistas" },
          { valor: 140, etiqueta: "contratos" },
        ]}
        tendencia={SERIE_ANUAL.map((_, i) => SERIE_ANUAL.slice(0, i + 1).reduce((s, v) => s + v, 0))}
        className="h-full"
      />
    ),
  },
  {
    id: "rep-kpi",
    nombre: "KPI chico",
    grupo: "Reportería estándar",
    marco: "propio",
    ancho: 3,
    alto: 0,
    crece: true,
    titulo: "Cumplimiento",
    detalle: "meta anual UF 1.200 mil",
    campos: { titulo: "Rótulo", detalle: "Detalle" },
    render: ({ bloque }) => (
      <KpiTarjeta rotulo={bloque.titulo} valor="94" unidad="%" detalle={bloque.detalle} avance={94} color="var(--color-serie-2)" className="h-full" />
    ),
  },
  {
    id: "rep-dona",
    nombre: "Dona con leyenda",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 240,
    crece: true,
    titulo: "Tipo de contrato",
    detalle: "monto contratado",
    render: () => <DonaLeyenda items={CATEGORIAS} />,
  },
  {
    id: "rep-participacion",
    nombre: "Barra de participación",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 12,
    alto: 120,
    crece: true,
    titulo: "Participación por línea",
    detalle: "% del monto",
    render: () => <BarraParticipacion items={CATEGORIAS} prefijo="$ " unidad=" MM" divisor={1} />,
  },
  {
    id: "rep-barras-comparadas",
    nombre: "Barras contra año anterior y meta",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 8,
    alto: 220,
    titulo: "Venta mensual",
    detalle: "2026 contra 2025 y la meta",
    render: ({ alto }) => (
      <BarrasComparadas puntos={MESES.map((m, i) => ({ nombre: m, actual: i < 9 ? SERIE_ANUAL[i] : null, anterior: ANTERIOR[i], meta: 55 }))} alto={alto - 60} divisor={1} />
    ),
  },
  {
    id: "rep-linea-acumulada",
    nombre: "Línea acumulada",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 240,
    titulo: "Acumulado del año",
    detalle: "contra la meta y el año anterior",
    render: ({ alto }) => (
      <LineaAcumulada categorias={MESES} actual={SERIE_ANUAL.map((v, i) => (i < 9 ? v : null))} meta={MESES.map(() => 55)} anterior={ANTERIOR} divisor={1} alto={alto - 40} />
    ),
  },
  {
    id: "rep-barras-apiladas",
    nombre: "Barras apiladas por año",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 220,
    titulo: "Monto por año",
    detalle: "año de adjudicación",
    render: ({ alto }) => (
      <BarrasApiladas
        categorias={["'20", "'21", "'22", "'23", "'24", "'25", "'26"]}
        series={CATEGORIAS.slice(0, 3).map((c, k) => ({ clave: c.clave, nombre: c.nombre, color: c.color, valores: [3, 4, 5, 6, 7, 8, 6].map((v) => v * (900 - k * 200)) }))}
        alto={alto - 50}
      />
    ),
  },
  {
    id: "rep-ranking-meta",
    nombre: "Ranking contra meta",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 200,
    crece: true,
    titulo: "Por unidad",
    detalle: "venta contra su meta",
    render: () => <RankingMeta items={PERSONAS} unidad=" mil" />,
  },
  {
    id: "rep-ranking-tope",
    nombre: "Ranking contra tope",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 200,
    crece: true,
    titulo: "Rotación por gerencia",
    detalle: "12 meses contra el tope",
    render: () => (
      <RankingTope
        items={[
          { clave: "o", nombre: "Obras", detalle: "1.475 personas", valor: 32.4, tope: 30 },
          { clave: "p", nombre: "Operaciones", detalle: "874 personas", valor: 19.2, tope: 20 },
          { clave: "i", nombre: "Ingeniería", detalle: "242 personas", valor: 8.1, tope: 12 },
          { clave: "f", nombre: "Finanzas", detalle: "120 personas", valor: 6.3, tope: 10 },
        ]}
      />
    ),
  },
  {
    id: "rep-piramide",
    nombre: "Pirámide de niveles",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 240,
    crece: true,
    titulo: "Nivel de aprobación",
    detalle: "quién firmó · contratos · monto",
    render: () => (
      <Piramide
        niveles={["Directorio", "Gerencia general", "Gerencia de unidad", "Administrador de obra", "Jefe de terreno"].map((nombre, i) => ({
          numero: i + 1,
          nombre,
          cantidad: [4, 18, 7, 22, 54][i],
          valor: [559, 4549, 1056, 3210, 11580][i],
        }))}
      />
    ),
  },
  {
    id: "rep-piramide-edad",
    nombre: "Pirámide de edad",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 260,
    crece: true,
    titulo: "Edad y sexo",
    detalle: "vigentes al cierre",
    render: () => (
      <PiramideEdad
        tramos={["18-29", "30-39", "40-49", "50-59", "60 y más"].map((nombre, i) => ({ nombre, izquierda: [820, 1010, 640, 310, 60][i], derecha: [150, 210, 120, 40, 8][i] }))}
        lados={[
          { clave: "H", nombre: "Hombres", color: SERIES[0] },
          { clave: "M", nombre: "Mujeres", color: SERIES[1] },
        ]}
      />
    ),
  },
  {
    id: "rep-flujo",
    nombre: "Entradas y salidas por mes",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 8,
    alto: 220,
    titulo: "Ingresos y egresos",
    detalle: "por mes",
    render: ({ alto }) => (
      <FlujoMensual puntos={MESES.map((m, i) => ({ nombre: m, entradas: SERIE_ANUAL[i], salidas: ANTERIOR[(i + 3) % 12], saldo: 2900 + i * 8 }))} alto={alto - 30} />
    ),
  },
  {
    id: "rep-cascada",
    nombre: "Cascada (puente)",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 220,
    titulo: "Puente de dotación",
    detalle: "de un cierre al siguiente",
    render: ({ alto }) => (
      <Cascada
        inicio={{ nombre: "Sep 25", valor: 2976 }}
        pasos={[
          { clave: "i", nombre: "Ingresos", valor: 686, color: "var(--color-serie-5)" },
          { clave: "r", nombre: "Renuncia", valor: -193, color: "var(--color-serie-2)" },
          { clave: "t", nombre: "Término", valor: -364, color: "var(--color-serie-6)" },
          { clave: "o", nombre: "Otros", valor: -115, color: "var(--color-serie-8)" },
        ]}
        cierre={{ nombre: "Sep 26", valor: 2990 }}
        alto={alto - 40}
      />
    ),
  },
  {
    id: "rep-columnas",
    nombre: "Columnas por tramo",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 200,
    titulo: "Antigüedad",
    detalle: "años en la empresa",
    render: ({ alto }) => (
      <Columnas
        items={["< 1", "1-3", "3-5", "5-10", "10+"].map((nombre, i) => ({ clave: nombre, nombre, valor: [591, 1194, 392, 439, 374][i] }))}
        color="var(--color-serie-4)"
        alto={alto - 40}
      />
    ),
  },
  {
    id: "rep-variacion",
    nombre: "Variación contra cero",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 6,
    alto: 200,
    crece: true,
    titulo: "Variación contra 2025",
    detalle: "% por unidad",
    render: () => <BarrasVariacion items={PERSONAS.map((p, i) => ({ clave: p.clave, nombre: p.nombre, variacion: [12.4, -3.1, 6.8, -8.2][i] }))} />,
  },
  {
    id: "rep-mapa",
    nombre: "Mapa de Chile",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 4,
    alto: 460,
    titulo: "Por ciudad",
    detalle: "burbuja = monto",
    render: ({ alto }) => (
      <MapaChile
        puntos={[
          { clave: "a", nombre: "Antofagasta", lat: -23.65, lon: -70.4, valor: 42000 },
          { clave: "s", nombre: "Santiago", lat: -33.45, lon: -70.65, valor: 118000 },
          { clave: "c", nombre: "Concepción", lat: -36.83, lon: -73.05, valor: 61000 },
          { clave: "p", nombre: "Puerto Montt", lat: -41.47, lon: -72.94, valor: 23000 },
        ]}
        alto={alto - 20}
        anchoEtiquetas={96}
      />
    ),
  },
  {
    id: "rep-tabla",
    nombre: "Tabla de detalle",
    grupo: "Reportería estándar",
    marco: "tarjeta",
    ancho: 12,
    alto: 200,
    crece: true,
    titulo: "Detalle",
    detalle: "por subcontratista",
    render: () => <TablaEjemplo />,
  },
];

// ---- Piezas del estándar (components/estandar): las mismas de la Guía de estilo ----

const ESTANDAR_PIEZAS: ElementoConstructor[] = [
  { id: "est-curva-s", nombre: "Curva S", Componente: CurvaS, ancho: 6 },
  { id: "est-linea-hitos", nombre: "Línea de hitos", Componente: LineaHitos, ancho: 6 },
  { id: "est-gantt", nombre: "Gantt de obra", Componente: GanttObra, ancho: 12 },
  { id: "est-mapa-obras", nombre: "Mapa de obras", Componente: BurbujasObras, ancho: 12 },
].map(({ id, nombre, Componente, ancho }) => ({
  id,
  nombre,
  grupo: "Estándar",
  marco: "tarjeta" as const,
  ancho: ancho as Ancho,
  alto: 260,
  titulo: nombre,
  detalle: "",
  render: ({ alto }) => <Componente alto={alto} />,
}));

export const ELEMENTOS: ElementoConstructor[] = [...TEXTO, ...REPORTE, ...ESTANDAR_PIEZAS];

export const elementoPorId = (id: string) => ELEMENTOS.find((e) => e.id === id);

/** Grupos en orden de aparición, para el panel del catálogo. */
export const GRUPOS = [...new Set(ELEMENTOS.map((e) => e.grupo))];
