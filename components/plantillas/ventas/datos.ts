/**
 * Datos de ejemplo del Reporte Tipo 2 («Ventas»): venta inmobiliaria en UF. Vendedores,
 * proyectos y cifras son ficticios. Se generan con semilla fija: iguales en servidor y cliente,
 * y en cada recarga.
 *
 * En una plataforma real esto es una consulta, con una fila por unidad vendida (promesa), más la
 * meta mensual por vendedor. Las tres vistas se calculan desde esas filas.
 */

export type Categoria = "dep" | "cas" | "ofi" | "loc" | "bod";

export interface Venta {
  anio: 2025 | 2026;
  /** 0 = enero … 11 = diciembre. */
  mes: number;
  vendedor: string;
  proyecto: string;
  ciudad: string;
  categoria: Categoria;
  /** Monto de la promesa, en UF. */
  uf: number;
}

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/** Último mes con datos de 2026 (septiembre). */
export const ULTIMO_MES = 8;

export const CATEGORIAS: { clave: Categoria; nombre: string; corto: string; color: string }[] = [
  { clave: "dep", nombre: "Departamentos", corto: "Deptos.", color: "var(--color-serie-1)" },
  { clave: "cas", nombre: "Casas", corto: "Casas", color: "var(--color-serie-2)" },
  { clave: "ofi", nombre: "Oficinas", corto: "Oficinas", color: "var(--color-serie-4)" },
  { clave: "loc", nombre: "Locales comerciales", corto: "Locales", color: "var(--color-serie-5)" },
  { clave: "bod", nombre: "Bodegas y estacionamientos", corto: "Bod. y est.", color: "var(--color-serie-8)" },
];

/** Ciudades con su ubicación (para el mapa), de norte a sur. */
export const CIUDADES: { nombre: string; lat: number; lon: number }[] = [
  { nombre: "Antofagasta", lat: -23.65, lon: -70.4 },
  { nombre: "La Serena", lat: -29.9, lon: -71.25 },
  { nombre: "Viña del Mar", lat: -33.02, lon: -71.55 },
  { nombre: "Santiago", lat: -33.45, lon: -70.65 },
  { nombre: "Rancagua", lat: -34.17, lon: -70.74 },
  { nombre: "Talca", lat: -35.43, lon: -71.66 },
  { nombre: "Concepción", lat: -36.83, lon: -73.05 },
  { nombre: "Temuco", lat: -38.74, lon: -72.6 },
  { nombre: "Puerto Montt", lat: -41.47, lon: -72.94 },
];

export const PROYECTOS: { nombre: string; ciudad: string; categoria: Categoria; stock: number }[] = [
  { nombre: "Edificio Parque Norte", ciudad: "Santiago", categoria: "dep", stock: 220 },
  { nombre: "Edificio Andes", ciudad: "Santiago", categoria: "dep", stock: 160 },
  { nombre: "Plaza Empresarial Sur", ciudad: "Santiago", categoria: "ofi", stock: 160 },
  { nombre: "Condominio Los Robles", ciudad: "Concepción", categoria: "cas", stock: 150 },
  { nombre: "Centro Biobío", ciudad: "Concepción", categoria: "loc", stock: 80 },
  { nombre: "Torre Mirador Costa", ciudad: "Viña del Mar", categoria: "dep", stock: 140 },
  { nombre: "Mirador del Mar", ciudad: "Antofagasta", categoria: "dep", stock: 110 },
  { nombre: "Portal La Serena", ciudad: "La Serena", categoria: "dep", stock: 88 },
  { nombre: "Barrio Jardín", ciudad: "Temuco", categoria: "cas", stock: 120 },
  { nombre: "Alto Reloncaví", ciudad: "Puerto Montt", categoria: "cas", stock: 90 },
  { nombre: "Paseo Comercial Centro", ciudad: "Rancagua", categoria: "loc", stock: 60 },
  { nombre: "Villa Las Acacias", ciudad: "Talca", categoria: "cas", stock: 70 },
];

/**
 * Vendedores: proyectos que venden, ritmo (unidades al mes) y cuánto se exige su meta respecto
 * de lo que venden (1 = la meta calza con su ritmo).
 */
const VENDEDORES: { nombre: string; proyectos: string[]; ritmo: number; exigencia: number }[] = [
  { nombre: "Camila Rojas", proyectos: ["Edificio Parque Norte", "Edificio Andes"], ritmo: 7, exigencia: 0.93 },
  { nombre: "Diego Muñoz", proyectos: ["Edificio Parque Norte", "Plaza Empresarial Sur"], ritmo: 6, exigencia: 1.06 },
  { nombre: "Josefa Araya", proyectos: ["Edificio Andes", "Plaza Empresarial Sur"], ritmo: 5, exigencia: 0.99 },
  { nombre: "Valentina Soto", proyectos: ["Condominio Los Robles", "Centro Biobío"], ritmo: 5.5, exigencia: 0.91 },
  { nombre: "Matías Fuentes", proyectos: ["Torre Mirador Costa"], ritmo: 4.5, exigencia: 1.12 },
  { nombre: "Benjamín Pérez", proyectos: ["Mirador del Mar"], ritmo: 4, exigencia: 1.17 },
  { nombre: "Florencia Díaz", proyectos: ["Portal La Serena"], ritmo: 3.5, exigencia: 0.94 },
  { nombre: "Tomás Silva", proyectos: ["Barrio Jardín"], ritmo: 3, exigencia: 1.25 },
  { nombre: "Antonia Reyes", proyectos: ["Alto Reloncaví"], ritmo: 2, exigencia: 1.6 },
  { nombre: "Ignacio Vera", proyectos: ["Paseo Comercial Centro", "Villa Las Acacias"], ritmo: 2.5, exigencia: 0.9 },
];

/** Precio base por categoría, en UF. */
const PRECIO: Record<Categoria, number> = { dep: 3100, cas: 4300, ofi: 5600, loc: 7400, bod: 520 };
/** Estacionalidad de la venta mensual (promedio 1). */
const ESTACION = [0.85, 0.7, 1.05, 0.95, 1.1, 1.05, 1.15, 1.2, 1.0, 1.05, 1.1, 1.35];

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

function generar(): Venta[] {
  const r = azar(20260930);
  const filas: Venta[] = [];
  for (const anio of [2025, 2026] as const) {
    const meses = anio === 2026 ? ULTIMO_MES + 1 : 12;
    for (const v of VENDEDORES) {
      for (let mes = 0; mes < meses; mes++) {
        const unidades = Math.max(0, Math.round(v.ritmo * ESTACION[mes] * (anio === 2025 ? 0.9 : 1) * (0.7 + 0.6 * r())));
        for (let u = 0; u < unidades; u++) {
          // Se sortea el nombre antes de buscar: dentro del find, r() correría una vez por proyecto.
          const elegido = v.proyectos[Math.floor(r() * v.proyectos.length)];
          const proyecto = PROYECTOS.find((p) => p.nombre === elegido)!;
          // En departamentos, una de cada cuatro ventas es una bodega o estacionamiento aparte.
          const categoria: Categoria = proyecto.categoria === "dep" && r() < 0.25 ? "bod" : proyecto.categoria;
          filas.push({
            anio,
            mes,
            vendedor: v.nombre,
            proyecto: proyecto.nombre,
            ciudad: proyecto.ciudad,
            categoria,
            uf: Math.round(PRECIO[categoria] * (0.85 + 0.3 * r())),
          });
        }
      }
    }
  }
  return filas;
}

export const VENTAS = generar();

/** Meta mensual de cada vendedor, en UF (ejemplo: su venta promedio 2026 por su exigencia). */
export const METAS: { vendedor: string; mensual: number }[] = VENDEDORES.map((v) => {
  const propias = VENTAS.filter((f) => f.anio === 2026 && f.vendedor === v.nombre);
  const promedio = propias.reduce((s, f) => s + f.uf, 0) / (ULTIMO_MES + 1);
  return { vendedor: v.nombre, mensual: Math.round((promedio * v.exigencia) / 1000) * 1000 };
});

export const NOMBRES_VENDEDORES = VENDEDORES.map((v) => v.nombre);
