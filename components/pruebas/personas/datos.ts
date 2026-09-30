/**
 * Datos de ejemplo del Reporte Tipo 3 («Dotación»). Personas, gerencias y cifras son ficticias
 * y no llevan nombre ni RUT: el reporte es agregado. Se generan con semilla fija, así que salen
 * iguales en servidor y cliente, y en cada recarga.
 *
 * En una plataforma real esto es una consulta al maestro de colaboradores (solo lectura), con
 * una fila por contrato: gerencia, cargo, contrato, sexo, año de nacimiento, mes de ingreso y,
 * si salió, mes y motivo de egreso. Más los cupos autorizados por gerencia.
 */

export type Genero = "H" | "M";
export type Contrato = "ind" | "pf" | "obra";
export type Motivo = "renuncia" | "termino" | "necesidades" | "otros";
export type Nivel = "operario" | "tecnico" | "profesional" | "jefatura" | "gerencia";

export interface Persona {
  gerencia: string;
  nivel: Nivel;
  contrato: Contrato;
  genero: Genero;
  nacimiento: number;
  /** Mes de ingreso como índice absoluto (año × 12 + mes, enero = 0). */
  ingreso: number;
  /** Mes de egreso (índice absoluto); null = vigente. Cuenta en la dotación hasta el mes anterior. */
  egreso: number | null;
  motivo: Motivo | null;
}

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const mesAbs = (anio: number, mes: number) => anio * 12 + mes;
export const anioDe = (abs: number) => Math.floor(abs / 12);
export const mesDe = (abs: number) => abs % 12;
/** «Sep 26». */
export const rotuloMes = (abs: number) => `${MESES[mesDe(abs)]} ${String(anioDe(abs)).slice(2)}`;
/** «septiembre 2026». */
export const rotuloMesLargo = (abs: number) => `${MESES_LARGOS[mesDe(abs)]} ${anioDe(abs)}`;

/** Primer mes con movimientos simulados y último mes cerrado. */
const DESDE = mesAbs(2024, 9);
export const ULTIMO = mesAbs(2026, 8);
/** Meses de cierre elegibles: enero a septiembre 2026. */
export const CIERRES = Array.from({ length: 9 }, (_, i) => mesAbs(2026, i));

export const GERENCIAS: { nombre: string; corto: string; mujeres: number; dotacion: number; crecimiento: number; tope: number; contratos: [number, number, number] }[] = [
  // contratos: participación de indefinido, plazo fijo y por obra al partir.
  { nombre: "Obras", corto: "Obras", mujeres: 0.08, dotacion: 1450, crecimiento: 1.03, tope: 30, contratos: [0.35, 0.15, 0.5] },
  { nombre: "Operaciones", corto: "Operac.", mujeres: 0.16, dotacion: 880, crecimiento: 1.0, tope: 20, contratos: [0.6, 0.2, 0.2] },
  { nombre: "Ingeniería", corto: "Ingen.", mujeres: 0.32, dotacion: 240, crecimiento: 1.01, tope: 12, contratos: [0.85, 0.15, 0] },
  { nombre: "Comercial", corto: "Comerc.", mujeres: 0.52, dotacion: 150, crecimiento: 0.99, tope: 15, contratos: [0.8, 0.2, 0] },
  { nombre: "Finanzas", corto: "Finanzas", mujeres: 0.55, dotacion: 120, crecimiento: 1.0, tope: 10, contratos: [0.92, 0.08, 0] },
  { nombre: "Personas", corto: "Personas", mujeres: 0.7, dotacion: 70, crecimiento: 1.0, tope: 10, contratos: [0.9, 0.1, 0] },
  { nombre: "Tecnología", corto: "TI", mujeres: 0.24, dotacion: 60, crecimiento: 1.02, tope: 12, contratos: [0.88, 0.12, 0] },
];

export const CONTRATOS: { clave: Contrato; nombre: string; color: string }[] = [
  { clave: "ind", nombre: "Indefinido", color: "var(--color-serie-1)" },
  { clave: "pf", nombre: "Plazo fijo", color: "var(--color-serie-4)" },
  { clave: "obra", nombre: "Por obra o faena", color: "var(--color-serie-6)" },
];

export const MOTIVOS: { clave: Motivo; nombre: string; color: string }[] = [
  { clave: "renuncia", nombre: "Renuncia", color: "var(--color-serie-2)" },
  { clave: "termino", nombre: "Término de obra o plazo", color: "var(--color-serie-6)" },
  { clave: "necesidades", nombre: "Necesidades de la empresa", color: "var(--color-serie-3)" },
  { clave: "otros", nombre: "Otros", color: "var(--color-serie-8)" },
];

export const NIVELES: { clave: Nivel; nombre: string }[] = [
  { clave: "operario", nombre: "Operario" },
  { clave: "tecnico", nombre: "Técnico" },
  { clave: "profesional", nombre: "Profesional" },
  { clave: "jefatura", nombre: "Jefatura" },
  { clave: "gerencia", nombre: "Gerencia" },
];

export const GENEROS: { clave: Genero; nombre: string; color: string }[] = [
  { clave: "H", nombre: "Hombres", color: "var(--color-serie-1)" },
  { clave: "M", nombre: "Mujeres", color: "var(--color-serie-2)" },
];

/** Tramos de edad de la pirámide (el último, abierto). */
export const TRAMOS_EDAD: { desde: number; hasta: number; nombre: string }[] = [
  { desde: 18, hasta: 24, nombre: "18-24" },
  { desde: 25, hasta: 29, nombre: "25-29" },
  { desde: 30, hasta: 34, nombre: "30-34" },
  { desde: 35, hasta: 39, nombre: "35-39" },
  { desde: 40, hasta: 44, nombre: "40-44" },
  { desde: 45, hasta: 49, nombre: "45-49" },
  { desde: 50, hasta: 54, nombre: "50-54" },
  { desde: 55, hasta: 59, nombre: "55-59" },
  { desde: 60, hasta: 99, nombre: "60 y más" },
];

/** Tramos de antigüedad, en meses cumplidos. */
export const TRAMOS_ANTIGUEDAD: { desde: number; hasta: number; nombre: string; corto: string }[] = [
  { desde: 0, hasta: 11, nombre: "Menos de 1 año", corto: "< 1" },
  { desde: 12, hasta: 35, nombre: "1 a 3 años", corto: "1-3" },
  { desde: 36, hasta: 59, nombre: "3 a 5 años", corto: "3-5" },
  { desde: 60, hasta: 119, nombre: "5 a 10 años", corto: "5-10" },
  { desde: 120, hasta: 239, nombre: "10 a 20 años", corto: "10-20" },
  { desde: 240, hasta: 9999, nombre: "20 años o más", corto: "20+" },
];

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

/** Probabilidad mensual de egreso según el contrato. */
const SALIDA: Record<Contrato, number> = { ind: 0.007, pf: 0.03, obra: 0.042 };
/** Estacionalidad de las contrataciones en Obras (inicio y cierre de faenas). */
const FAENAS = [1.15, 1.1, 1.3, 1.2, 0.95, 0.8, 0.8, 0.85, 1.05, 1.1, 1.05, 0.9];

function generar(): Persona[] {
  const r = azar(20261001);
  const elegir = <T,>(pares: [T, number][]) => {
    let x = r();
    for (const [v, p] of pares) if ((x -= p) < 0) return v;
    return pares[pares.length - 1][0];
  };
  const nivelPara = (g: string, contrato: Contrato): Nivel =>
    contrato === "obra" || (g === "Obras" && r() < 0.6)
      ? elegir<Nivel>([["operario", 0.78], ["tecnico", 0.2], ["jefatura", 0.02]])
      : g === "Operaciones"
        ? elegir<Nivel>([["operario", 0.45], ["tecnico", 0.3], ["profesional", 0.17], ["jefatura", 0.07], ["gerencia", 0.01]])
        : elegir<Nivel>([["tecnico", 0.2], ["profesional", 0.6], ["jefatura", 0.16], ["gerencia", 0.04]]);
  const nueva = (g: (typeof GERENCIAS)[number], ingreso: number, inicial: boolean): Persona => {
    const contrato = elegir<Contrato>(CONTRATOS.map((c, i) => [c.clave, g.contratos[i]]));
    const nivel = nivelPara(g.nombre, contrato);
    // En jefaturas y gerencias hay menos mujeres que en la gerencia en general.
    const pMujer = nivel === "jefatura" || nivel === "gerencia" ? g.mujeres * 0.6 : g.mujeres;
    const genero: Genero = r() < pMujer ? "M" : "H";
    // Antigüedad del stock inicial: corta en contratos por obra, larga en indefinidos.
    const meses = inicial ? Math.floor(contrato === "ind" ? -Math.log(1 - r() * 0.97) * 80 : r() * (contrato === "obra" ? 18 : 12)) : 0;
    const base = { operario: 19, tecnico: 21, profesional: 24, jefatura: 31, gerencia: 38 }[nivel];
    const edadAlIngreso = Math.min(base + Math.floor(-Math.log(1 - r() * 0.98) * 11), 64);
    const inicio = ingreso - meses;
    return { gerencia: g.nombre, nivel, contrato, genero, nacimiento: anioDe(inicio) - edadAlIngreso, ingreso: inicio, egreso: null, motivo: null };
  };

  const personas: Persona[] = [];
  for (const g of GERENCIAS) for (let i = 0; i < g.dotacion; i++) personas.push(nueva(g, DESDE, true));

  for (let t = DESDE; t <= ULTIMO; t++) {
    const salidas = new Map<string, number>();
    for (const p of personas) {
      if (p.egreso !== null || p.ingreso >= t) continue;
      // Quien cumple 65 se jubila; el resto sale según su contrato.
      const jubila = anioDe(t) - p.nacimiento >= 65;
      if (!jubila && r() >= SALIDA[p.contrato]) continue;
      p.egreso = t;
      p.motivo = jubila
        ? "otros"
        : p.contrato === "ind"
          ? elegir<Motivo>([["renuncia", 0.58], ["necesidades", 0.3], ["otros", 0.12]])
          : elegir<Motivo>([["termino", 0.72], ["renuncia", 0.2], ["necesidades", 0.05], ["otros", 0.03]]);
      salidas.set(p.gerencia, (salidas.get(p.gerencia) ?? 0) + 1);
    }
    for (const g of GERENCIAS) {
      const reemplazo = (salidas.get(g.nombre) ?? 0) * (g.nombre === "Obras" ? FAENAS[mesDe(t)] : 1) * g.crecimiento;
      const n = Math.round(reemplazo * (0.85 + 0.3 * r()));
      for (let i = 0; i < n; i++) personas.push(nueva(g, t, false));
    }
  }
  return personas;
}

export const PERSONAS = generar();

/** Cupos autorizados por gerencia para 2026 (ejemplo: la dotación de septiembre más un margen). */
export const CUPOS: Record<string, number> = Object.fromEntries(
  GERENCIAS.map((g, i) => {
    const vigentes = PERSONAS.filter((p) => p.gerencia === g.nombre && p.ingreso <= ULTIMO && (p.egreso === null || p.egreso > ULTIMO)).length;
    return [g.nombre, Math.round((vigentes * (1.02 + 0.015 * (i % 3))) / 5) * 5];
  }),
);
