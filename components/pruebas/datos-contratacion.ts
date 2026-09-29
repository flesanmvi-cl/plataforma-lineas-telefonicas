/**
 * Datos de ejemplo del Reporte Tipo 1 («Resumen de contratación»). Subcontratistas, montos y
 * fechas son ficticios. Se generan con semilla fija: iguales en servidor y cliente, y en cada
 * recarga. Montos en millones de pesos.
 *
 * En una plataforma real esto es una consulta (una fila por contrato) y el resto del reporte
 * no cambia: todos los bloques se calculan desde las filas.
 */

export type Tipo = "subcontrato" | "directo" | "servicios";

export interface Contrato {
  id: number;
  subcontratista: string;
  giro: string;
  unidad: string;
  tipo: Tipo;
  /** Nivel de quien aprobó: 1 = directorio … 8 = capataz. */
  nivel: number;
  anio: number;
  monto: number;
  facturado: number;
  vigente: boolean;
}

export const TIPOS: { clave: Tipo; nombre: string; color: string }[] = [
  { clave: "directo", nombre: "Obra directa", color: "var(--color-serie-3)" },
  { clave: "subcontrato", nombre: "Subcontrato", color: "var(--color-serie-1)" },
  { clave: "servicios", nombre: "Servicios", color: "var(--color-serie-2)" },
];

export const NIVELES = [
  "Directorio",
  "Gerencia general",
  "Gerencia de unidad",
  "Gerencia de obra",
  "Administrador de obra",
  "Jefe de terreno",
  "Supervisor",
  "Capataz",
];

/** Unidades de negocio en orden de peso; las que pasan de 5 se agrupan en «Otras». */
export const UNIDADES = ["MIN", "AYS", "DEM", "VIAL", "FAIS", "DVC", "FIT", "INM", "EDI"];

const SUBCONTRATISTAS: [string, string][] = [
  ["Constructora Los Andes SpA", "Obra gruesa"],
  ["Montajes Pacífico Ltda.", "Estructuras metálicas"],
  ["Reciclajes del Sur SpA", "Retiro de escombros"],
  ["Excavaciones del Norte SpA", "Movimiento de tierra"],
  ["Transportes Cordillera SpA", "Transporte y grúas"],
  ["Ingeniería Austral Ltda.", "Instalaciones sanitarias"],
  ["Eléctrica Valle Central SpA", "Instalaciones eléctricas"],
  ["Hormigones Biobío SpA", "Hormigón premezclado"],
  ["Terminaciones Costa SpA", "Terminaciones"],
  ["Andamios Maule Ltda.", "Andamios y moldajes"],
  ["Climatización Atacama SpA", "Climatización"],
  ["Pinturas Limarí SpA", "Pinturas"],
  ["Vidrios Aconcagua Ltda.", "Ventanas y cristales"],
  ["Servicios Mineros Loa SpA", "Servicios mineros"],
  ["Topografía Elqui Ltda.", "Topografía"],
  ["Pavimentos Ñuble SpA", "Pavimentos"],
  ["Aislantes Magallanes SpA", "Aislación"],
  ["Seguridad Industrial Maipo Ltda.", "Prevención de riesgos"],
];

// PRNG con semilla (mulberry32): mismos datos siempre.
function azar(semilla: number) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegir<T>(r: () => number, items: T[], pesos: number[]) {
  const total = pesos.reduce((s, p) => s + p, 0);
  let x = r() * total;
  for (let i = 0; i < items.length; i++) {
    x -= pesos[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generar(): Contrato[] {
  const r = azar(20260929);
  const filas: Contrato[] = [];
  for (let id = 1; id <= 140; id++) {
    // Los primeros subcontratistas concentran más contratos y más monto.
    const i = Math.min(Math.floor(Math.pow(r(), 1.7) * SUBCONTRATISTAS.length), SUBCONTRATISTAS.length - 1);
    const [subcontratista, giro] = SUBCONTRATISTAS[i];
    const anio = elegir(r, [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026], [1, 3, 1, 2, 1, 3, 2, 8, 11, 14, 9]);
    const monto = Math.round((5 + Math.pow(r(), 2.4) * 350) * (1 + (SUBCONTRATISTAS.length - i) / 10));
    const vigente = anio >= 2024 ? r() < 0.8 : r() < 0.15;
    filas.push({
      id,
      subcontratista,
      giro,
      unidad: elegir(r, UNIDADES, [34, 30, 9, 6, 4, 3, 2, 2, 1]),
      tipo: elegir(r, ["subcontrato", "directo", "servicios"] as Tipo[], [5, 2.5, 2.5]),
      nivel: elegir(r, [1, 2, 3, 4, 5, 6, 7, 8], [0.8, 3, 1, 0, 0.8, 7, 1.5, 6]),
      anio,
      monto,
      facturado: Math.round(monto * (vigente ? 0.25 + r() * 0.5 : 0.85 + r() * 0.15)),
      vigente,
    });
  }
  return filas;
}

export const CONTRATOS = generar();

/** Contexto fijo del panel «Universo en revisión» (no responde a filtros). */
export const UNIVERSO = [
  { valor: "174", texto: "subcontratistas con contrato en ejecución hoy", detalle: "de 190 con contratos adjudicados a septiembre de 2026" },
  { valor: "1.435", texto: "trabajadores acreditados en obra", detalle: "según la última carga de acreditación" },
  { valor: "8.938", texto: "documentos revisados", detalle: "de 9.402 exigidos · corte 08/2026" },
];
