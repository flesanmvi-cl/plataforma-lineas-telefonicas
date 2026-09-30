import {
  anioDe,
  CUPOS,
  GERENCIAS,
  MOTIVOS,
  PERSONAS,
  rotuloMes,
  TRAMOS_ANTIGUEDAD,
  TRAMOS_EDAD,
  type Contrato,
  type Motivo,
  type Persona,
} from "./datos";

// Cálculos del Reporte Tipo 3 (dotación). Todo sale de PERSONAS y de los filtros. La dotación de
// un mes es quien está vigente al cierre de ese mes. La ventana es de 12 meses hasta el cierre
// elegido. La rotación es la de esos 12 meses: egresos sobre la dotación promedio.

export type Dim = "gerencia" | "genero" | "edad" | "antig" | "contrato";

export interface Filtros {
  /** Mes de cierre (índice absoluto). */
  cierre: number;
  gerencia: string;
  genero: string;
  /** Índice del tramo de edad, como texto («» = todos). */
  edad: string;
  antig: string;
  contrato: string;
}

export const vigente = (p: Persona, t: number) => p.ingreso <= t && (p.egreso === null || p.egreso > t);
export const edadEn = (p: Persona, t: number) => anioDe(t) - p.nacimiento;
export const tramoEdad = (edad: number) => Math.max(0, TRAMOS_EDAD.findIndex((x) => edad >= x.desde && edad <= x.hasta));
export const tramoAntig = (meses: number) => Math.max(0, TRAMOS_ANTIGUEDAD.findIndex((x) => meses >= x.desde && meses <= x.hasta));

/** ¿La persona pasa los filtros, mirada en el mes t? `sin` omite el filtro de esa dimensión. */
export function pasa(p: Persona, f: Filtros, t: number, sin?: Dim | Dim[]) {
  const omite = (d: Dim) => (Array.isArray(sin) ? sin.includes(d) : sin === d);
  return (
    (omite("gerencia") || !f.gerencia || p.gerencia === f.gerencia) &&
    (omite("genero") || !f.genero || p.genero === f.genero) &&
    (omite("contrato") || !f.contrato || p.contrato === f.contrato) &&
    (omite("edad") || !f.edad || tramoEdad(edadEn(p, t)) === Number(f.edad)) &&
    (omite("antig") || !f.antig || tramoAntig(t - p.ingreso) === Number(f.antig))
  );
}

/** Meses de la ventana de 12 hasta el cierre, en orden. */
export const ventana = (cierre: number) => Array.from({ length: 12 }, (_, i) => cierre - 11 + i);

export interface Estadisticas {
  dotacion: number;
  ingresos: number;
  egresos: number;
  porMotivo: Record<Motivo, number>;
  /** Dotación promedio de los 12 meses. */
  promedio: number;
  rotacion: number;
  voluntaria: number;
  mujeres: number;
  /** % de mujeres en jefaturas y gerencias. */
  mujeresJefatura: number | null;
  edad: number;
  /** Antigüedad promedio, en años. */
  antiguedad: number;
}

/**
 * Cifras de un grupo: vigentes al cierre, movimientos de la ventana y rotación. Quien egresa se
 * mira en su último mes vigente; quien ingresa, en su mes de ingreso.
 */
export function estadisticas(f: Filtros, sin?: Dim, extra: (p: Persona) => boolean = () => true): Estadisticas {
  const meses = ventana(f.cierre);
  const desde = meses[0];
  let dotacion = 0,
    ingresos = 0,
    egresos = 0,
    sumaMeses = 0,
    mujeres = 0,
    jefes = 0,
    jefas = 0,
    edad = 0,
    antig = 0;
  const porMotivo: Record<Motivo, number> = { renuncia: 0, termino: 0, necesidades: 0, otros: 0 };
  for (const p of PERSONAS) {
    if (!extra(p)) continue;
    if (p.ingreso > f.cierre || (p.egreso !== null && p.egreso <= desde - 1)) continue;
    for (const t of meses) if (vigente(p, t) && pasa(p, f, t, sin)) sumaMeses++;
    if (p.ingreso >= desde && pasa(p, f, p.ingreso, sin)) ingresos++;
    if (p.egreso !== null && p.egreso >= desde && p.egreso <= f.cierre && pasa(p, f, p.egreso - 1, sin)) {
      egresos++;
      porMotivo[p.motivo!]++;
    }
    if (vigente(p, f.cierre) && pasa(p, f, f.cierre, sin)) {
      dotacion++;
      if (p.genero === "M") mujeres++;
      if (p.nivel === "jefatura" || p.nivel === "gerencia") {
        jefes++;
        if (p.genero === "M") jefas++;
      }
      edad += edadEn(p, f.cierre);
      antig += f.cierre - p.ingreso;
    }
  }
  const promedio = sumaMeses / 12;
  return {
    dotacion,
    ingresos,
    egresos,
    porMotivo,
    promedio,
    rotacion: promedio ? (egresos / promedio) * 100 : 0,
    voluntaria: promedio ? (porMotivo.renuncia / promedio) * 100 : 0,
    mujeres: dotacion ? (mujeres / dotacion) * 100 : 0,
    mujeresJefatura: jefes ? (jefas / jefes) * 100 : null,
    edad: dotacion ? edad / dotacion : 0,
    antiguedad: dotacion ? antig / dotacion / 12 : 0,
  };
}

/** Tope de rotación del grupo: el de cada gerencia, ponderado por su dotación. */
export function topeDe(f: Filtros) {
  let suma = 0,
    peso = 0;
  for (const g of GERENCIAS) {
    if (f.gerencia && f.gerencia !== g.nombre) continue;
    const n = estadisticas({ ...f, gerencia: g.nombre }).promedio;
    suma += g.tope * n;
    peso += n;
  }
  return peso ? suma / peso : 0;
}

/** Cupos autorizados: solo existen por gerencia. Con otro filtro activo, no aplican (null). */
export function cuposDe(f: Filtros) {
  if (f.genero || f.edad || f.antig || f.contrato) return null;
  return f.gerencia ? CUPOS[f.gerencia] : Object.values(CUPOS).reduce((s, n) => s + n, 0);
}

/** Ingresos, egresos y dotación de cada mes de la ventana. */
export function mensual(f: Filtros) {
  return ventana(f.cierre).map((t) => {
    let ingresos = 0,
      egresos = 0,
      dotacion = 0;
    for (const p of PERSONAS) {
      if (p.ingreso === t && pasa(p, f, t)) ingresos++;
      if (p.egreso === t && pasa(p, f, t - 1)) egresos++;
      if (vigente(p, t) && pasa(p, f, t)) dotacion++;
    }
    return { mes: t, nombre: rotuloMes(t), ingresos, egresos, dotacion };
  });
}

/** Dotación vigente al cierre de un mes. */
export const dotacionEn = (f: Filtros, t: number) => PERSONAS.reduce((n, p) => n + (vigente(p, t) && pasa(p, f, t) ? 1 : 0), 0);

/**
 * Puente de dotación: la del mes anterior a la ventana, los ingresos, los egresos por motivo y la
 * del cierre. Con filtros de edad o antigüedad la gente cambia de tramo en el año: esa diferencia
 * va como «Cambio de tramo» para que el puente cuadre.
 */
export function puente(f: Filtros) {
  const inicio = dotacionEn(f, f.cierre - 12);
  const e = estadisticas(f);
  const tramo = e.dotacion - inicio - e.ingresos + e.egresos;
  return {
    inicio: { nombre: rotuloMes(f.cierre - 12), valor: inicio },
    cierre: { nombre: rotuloMes(f.cierre), valor: e.dotacion },
    pasos: [
      { clave: "ingresos", nombre: "Ingresos", valor: e.ingresos, color: "var(--color-serie-5)" },
      ...MOTIVOS.map((m) => ({ clave: m.clave, nombre: m.nombre, valor: -e.porMotivo[m.clave], color: m.color })),
      ...(tramo ? [{ clave: "tramo", nombre: "Cambio de tramo", valor: tramo, color: "var(--color-serie-8)" }] : []),
    ],
  };
}

/** Pirámide: vigentes al cierre por tramo de edad y género (sin los filtros de edad ni de género). */
export function piramide(f: Filtros) {
  const filas = TRAMOS_EDAD.map((t) => ({ nombre: t.nombre, H: 0, M: 0 }));
  for (const p of PERSONAS) {
    if (!vigente(p, f.cierre) || !pasa(p, f, f.cierre, ["edad", "genero"])) continue;
    filas[tramoEdad(edadEn(p, f.cierre))][p.genero]++;
  }
  return filas;
}

/** Vigentes al cierre por tramo de antigüedad (sin su propio filtro). */
export function antiguedad(f: Filtros) {
  const n = TRAMOS_ANTIGUEDAD.map(() => 0);
  for (const p of PERSONAS) if (vigente(p, f.cierre) && pasa(p, f, f.cierre, "antig")) n[tramoAntig(f.cierre - p.ingreso)]++;
  return n;
}

/** Vigentes al cierre por tipo de contrato (sin su propio filtro). */
export function porContrato(f: Filtros) {
  const n: Record<Contrato, number> = { ind: 0, pf: 0, obra: 0 };
  for (const p of PERSONAS) if (vigente(p, f.cierre) && pasa(p, f, f.cierre, "contrato")) n[p.contrato]++;
  return n;
}

/** Rotación y dotación por gerencia (sin el filtro de gerencia), con su tope. */
export function porGerencia(f: Filtros) {
  return GERENCIAS.map((g) => ({ ...estadisticas(f, "gerencia", (p) => p.gerencia === g.nombre), nombre: g.nombre, tope: g.tope }));
}
