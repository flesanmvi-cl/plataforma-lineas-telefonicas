/**
 * Datos de ejemplo del laboratorio. Son sintéticos y deterministas (misma semilla, mismos
 * números en servidor y cliente); no representan cifras reales de Grupo Flesan.
 */

/** Generador pseudoaleatorio con semilla (mulberry32). */
export function azar(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const SEMANAS = Array.from({ length: 16 }, (_, i) => `S${i + 1}`);
export const LINEAS = ["Edificación", "Obras civiles", "Minería", "Vialidad", "Inmobiliaria"];
export const OBRAS = ["Obra Norte", "Obra Centro", "Obra Costa", "Obra Sur", "Obra Cordillera", "Obra Valle"];
export const REGIONES_CORTAS = ["Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Biobío"];

/** Serie mensual con tendencia al alza y ruido. */
export function serieMensual(semilla = 1, base = 100, pendiente = 6, ruido = 18): number[] {
  const r = azar(semilla);
  return MESES.map((_, i) => Math.round(base + i * pendiente + (r() - 0.5) * ruido * 2));
}

/** Varias series mensuales (una por línea de negocio). */
export function seriesPorLinea(n = 3, semilla = 7) {
  return LINEAS.slice(0, n).map((nombre, i) => ({ nombre, valores: serieMensual(semilla + i * 13, 60 + i * 25, 4 + i, 14) }));
}

/** Real contra meta por obra (0-100). */
export function realVsMeta(semilla = 3) {
  const r = azar(semilla);
  return OBRAS.map((obra) => {
    const meta = Math.round(70 + r() * 25);
    const real = Math.round(meta * (0.7 + r() * 0.45));
    return { obra, real, meta, anterior: Math.round(real * (0.8 + r() * 0.25)) };
  });
}

/** Etapas de un pipeline o embudo comercial. */
export const ETAPAS = [
  { etapa: "Prospecto", valor: 420 },
  { etapa: "Contacto", valor: 310 },
  { etapa: "Propuesta", valor: 190 },
  { etapa: "Negociación", valor: 96 },
  { etapa: "Cierre", valor: 54 },
];

/** Variaciones para cascada (waterfall). */
export const CASCADA = [
  { nombre: "Inicio", valor: 1200, tipo: "total" as const },
  { nombre: "Ventas nuevas", valor: 380, tipo: "delta" as const },
  { nombre: "Reajustes", valor: 120, tipo: "delta" as const },
  { nombre: "Costos directos", valor: -290, tipo: "delta" as const },
  { nombre: "Gastos generales", valor: -140, tipo: "delta" as const },
  { nombre: "Cierre", valor: 1270, tipo: "total" as const },
];

/** Flujos origen → destino para sankey y chord. */
export const FLUJOS = {
  nodos: ["Edificación", "Obras civiles", "Minería", "Mano de obra", "Materiales", "Equipos", "Subcontratos"],
  enlaces: [
    { origen: "Edificación", destino: "Mano de obra", valor: 38 },
    { origen: "Edificación", destino: "Materiales", valor: 44 },
    { origen: "Edificación", destino: "Subcontratos", valor: 18 },
    { origen: "Obras civiles", destino: "Materiales", valor: 26 },
    { origen: "Obras civiles", destino: "Equipos", valor: 30 },
    { origen: "Obras civiles", destino: "Mano de obra", valor: 16 },
    { origen: "Minería", destino: "Equipos", valor: 34 },
    { origen: "Minería", destino: "Subcontratos", valor: 22 },
    { origen: "Minería", destino: "Mano de obra", valor: 12 },
  ],
};

export interface NodoJerarquia {
  nombre: string;
  valor?: number;
  hijos?: NodoJerarquia[];
}

/** Jerarquía de 3 niveles (línea → región → obra) para sunburst, treemap y circle packing. */
export function jerarquia(semilla = 11): NodoJerarquia {
  const r = azar(semilla);
  return {
    nombre: "Grupo",
    hijos: LINEAS.slice(0, 4).map((linea, i) => ({
      nombre: linea,
      hijos: REGIONES_CORTAS.slice(i, i + 3).map((region) => ({
        nombre: region,
        hijos: Array.from({ length: 2 + Math.floor(r() * 2) }, (_, k) => ({
          nombre: `${region.slice(0, 3)}-${k + 1}`,
          valor: Math.round(10 + r() * 60),
        })),
      })),
    })),
  };
}

/** Un año de actividad diaria (para calendario / heatmap). */
export function actividadDiaria(anio = 2026, semilla = 5) {
  const r = azar(semilla);
  const dias: { fecha: string; valor: number }[] = [];
  const d = new Date(Date.UTC(anio, 0, 1));
  while (d.getUTCFullYear() === anio) {
    const dow = d.getUTCDay();
    const laboral = dow !== 0 && dow !== 6;
    const estacional = 0.6 + 0.4 * Math.sin(((d.getUTCMonth() + 1) / 12) * Math.PI);
    dias.push({ fecha: d.toISOString().slice(0, 10), valor: Math.round((laboral ? 40 : 8) * estacional + r() * 30) });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dias;
}

/** Matriz obra × semana para heatmap. */
export function matrizCalor(semilla = 9) {
  const r = azar(semilla);
  return OBRAS.flatMap((obra, y) => SEMANAS.slice(0, 12).map((semana, x) => ({ obra, semana, x, y, valor: Math.round(20 + r() * 80) })));
}

/** Muestras por grupo para histogramas, boxplot, violín y beeswarm. */
export function muestras(grupos = OBRAS.slice(0, 4), n = 60, semilla = 21) {
  const r = azar(semilla);
  const normal = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return grupos.flatMap((grupo, i) =>
    Array.from({ length: n }, (_, k) => ({ grupo, id: `${grupo}-${k}`, valor: Math.round((50 + i * 8 + normal() * (10 + i * 2)) * 10) / 10 })),
  );
}

/** Puntos para dispersión y burbujas: costo vs plazo por obra. */
export function puntosDispersion(n = 40, semilla = 17) {
  const r = azar(semilla);
  return Array.from({ length: n }, (_, i) => {
    const plazo = Math.round(6 + r() * 30);
    return {
      id: `P${i + 1}`,
      linea: LINEAS[i % 4],
      plazo,
      costo: Math.round(plazo * (8 + r() * 6) + r() * 40),
      tamano: Math.round(5 + r() * 40),
    };
  });
}

/** Ranking por mes (para bump chart). */
export function rankingMensual(semilla = 23) {
  const r = azar(semilla);
  return OBRAS.slice(0, 5).map((obra) => ({
    obra,
    puestos: MESES.slice(0, 8).map(() => 0),
    valores: MESES.slice(0, 8).map(() => Math.round(r() * 100)),
  }));
}

/** Tareas de obra para Gantt y línea de tiempo (días desde el inicio). */
export const TAREAS = [
  { tarea: "Instalación de faena", inicio: 0, duracion: 12, avance: 100, fase: "Inicio" },
  { tarea: "Excavación", inicio: 8, duracion: 24, avance: 100, fase: "Obra gruesa" },
  { tarea: "Fundaciones", inicio: 26, duracion: 30, avance: 85, fase: "Obra gruesa" },
  { tarea: "Estructura", inicio: 48, duracion: 60, avance: 45, fase: "Obra gruesa" },
  { tarea: "Instalaciones", inicio: 90, duracion: 45, avance: 10, fase: "Terminaciones" },
  { tarea: "Terminaciones", inicio: 120, duracion: 50, avance: 0, fase: "Terminaciones" },
  { tarea: "Recepción", inicio: 168, duracion: 10, avance: 0, fase: "Cierre" },
];

export const HITOS = [
  { dia: 0, nombre: "Inicio de obra" },
  { dia: 56, nombre: "Fin fundaciones" },
  { dia: 108, nombre: "Fin obra gruesa" },
  { dia: 178, nombre: "Recepción" },
];

/** Curva S: avance programado vs real acumulado (%), por semana. */
export function curvaS(semanas = 26, semilla = 31) {
  const r = azar(semilla);
  const logistica = (x: number) => 100 / (1 + Math.exp(-0.35 * (x - semanas / 2)));
  let real = 0;
  return Array.from({ length: semanas }, (_, i) => {
    const programado = Math.round(logistica(i) * 10) / 10;
    if (i < semanas * 0.62) real = Math.max(real, Math.round(logistica(i - 1.2 - r()) * 10) / 10);
    return { semana: `S${i + 1}`, programado, real: i < semanas * 0.62 ? real : null };
  });
}

/** Valores por región de Chile (código de región → valor) para coropletas. */
export function valoresPorRegion(semilla = 41): Record<number, number> {
  const r = azar(semilla);
  const out: Record<number, number> = {};
  for (const codigo of [15, 1, 2, 3, 4, 5, 13, 6, 7, 16, 8, 9, 14, 10, 11, 12]) out[codigo] = Math.round(5 + r() * 95);
  out[13] = 100;
  out[2] = 88;
  return out;
}

/** Obras de ejemplo ubicadas en ciudades (lon, lat aproximadas de la ciudad, no de obras reales). */
export const OBRAS_MAPA = [
  { nombre: "Obra Norte", ciudad: "Antofagasta", lon: -70.4, lat: -23.65, monto: 80, linea: "Minería" },
  { nombre: "Obra Desierto", ciudad: "Calama", lon: -68.93, lat: -22.46, monto: 120, linea: "Minería" },
  { nombre: "Obra Puerto", ciudad: "Valparaíso", lon: -71.62, lat: -33.05, monto: 45, linea: "Obras civiles" },
  { nombre: "Obra Centro", ciudad: "Santiago", lon: -70.65, lat: -33.45, monto: 150, linea: "Edificación" },
  { nombre: "Obra Oriente", ciudad: "Santiago", lon: -70.55, lat: -33.41, monto: 70, linea: "Inmobiliaria" },
  { nombre: "Obra Ruta", ciudad: "Rancagua", lon: -70.74, lat: -34.17, monto: 35, linea: "Vialidad" },
  { nombre: "Obra Sur", ciudad: "Concepción", lon: -73.05, lat: -36.82, monto: 60, linea: "Edificación" },
  { nombre: "Obra Lagos", ciudad: "Puerto Montt", lon: -72.94, lat: -41.47, monto: 30, linea: "Obras civiles" },
  { nombre: "Obra Elqui", ciudad: "La Serena", lon: -71.25, lat: -29.9, monto: 40, linea: "Inmobiliaria" },
];

/** Formato de cifras es-CL. */
export const formato = {
  entero: (n: number) => n.toLocaleString("es-CL", { maximumFractionDigits: 0 }),
  decimal: (n: number, d = 1) => n.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }),
  porcentaje: (n: number, d = 0) => `${n.toLocaleString("es-CL", { maximumFractionDigits: d })}%`,
  /** Montos abreviados en millones: 1.234 → «1,2 MM» si ≥ 1.000 millones. */
  millones: (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("es-CL", { maximumFractionDigits: 1 })} MM` : `${formato.entero(n)} M`),
};
