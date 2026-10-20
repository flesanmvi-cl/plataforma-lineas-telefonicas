import { CATEGORIAS, CIUDADES, MESES, MESES_LARGOS, METAS, NOMBRES_VENDEDORES, PROYECTOS, ULTIMO_MES, VENTAS, type Venta } from "./datos";

// Cálculos del reporte de ventas, todos desde las filas de VENTAS. Los filtros cruzados siguen la
// receta del Tipo 1: cada bloque se calcula con todos los filtros menos el suyo.

export type Periodo = "acum" | "mes";
export type Dimension = "categoria" | "ciudad" | "vendedor";

export interface Filtros {
  periodo: Periodo;
  /** Mes elegido: en «acum» es hasta dónde se acumula; en «mes», el único mes. */
  mes: number;
  categoria: string;
  ciudad: string;
  vendedor: string;
}

export const enPeriodo = (f: Filtros, mes: number) => (f.periodo === "mes" ? mes === f.mes : mes <= f.mes);
export const mesesDelPeriodo = (f: Filtros) => (f.periodo === "mes" ? 1 : f.mes + 1);

export function pasa(v: Venta, f: Filtros, sin?: Dimension) {
  return (
    (sin === "categoria" || !f.categoria || v.categoria === f.categoria) &&
    (sin === "ciudad" || !f.ciudad || v.ciudad === f.ciudad) &&
    (sin === "vendedor" || !f.vendedor || v.vendedor === f.vendedor)
  );
}

/** Filas del año y del período, con los filtros (menos `sin`). */
export function filas(f: Filtros, anio: 2025 | 2026 = 2026, sin?: Dimension) {
  return VENTAS.filter((v) => v.anio === anio && enPeriodo(f, v.mes) && pasa(v, f, sin));
}

export const suma = (vs: Venta[]) => vs.reduce((s, v) => s + v.uf, 0);

/** Meta mensual de un vendedor. */
const metaVendedor = (nombre: string) => METAS.find((m) => m.vendedor === nombre)?.mensual ?? 0;

/**
 * Meta del período para lo filtrado. No hay meta por categoría: con una categoría elegida
 * devuelve null. La meta de una ciudad reparte la de cada vendedor según dónde vendió en 2026.
 */
export function metaDe(f: Filtros, ciudad = f.ciudad, vendedor = f.vendedor): number | null {
  if (f.categoria) return null;
  const meses = mesesDelPeriodo(f);
  const vendedores = vendedor ? [vendedor] : NOMBRES_VENDEDORES;
  let total = 0;
  for (const nombre of vendedores) {
    let parte = 1;
    if (ciudad) {
      const propias = VENTAS.filter((v) => v.anio === 2026 && v.vendedor === nombre);
      parte = propias.length ? suma(propias.filter((v) => v.ciudad === ciudad)) / suma(propias) : 0;
    }
    total += metaVendedor(nombre) * meses * parte;
  }
  return total;
}

export const variacion = (actual: number, anterior: number) => (anterior ? ((actual - anterior) / anterior) * 100 : 0);

/** Texto del período: «Septiembre 2026» o «Ene – Sep 2026». */
export function textoPeriodo(f: Filtros) {
  return f.periodo === "mes" ? `${MESES_LARGOS[f.mes][0].toUpperCase()}${MESES_LARGOS[f.mes].slice(1)} 2026` : `Ene – ${MESES[f.mes]} 2026`;
}

export function porCategoria(f: Filtros) {
  const base = filas(f, 2026, "categoria");
  return CATEGORIAS.map((c) => {
    const vs = base.filter((v) => v.categoria === c.clave);
    return { ...c, valor: suma(vs), unidades: vs.length };
  });
}

export function porCiudad(f: Filtros) {
  const base = filas(f, 2026, "ciudad");
  const anterior = filas(f, 2025, "ciudad");
  return CIUDADES.map((c) => {
    const vs = base.filter((v) => v.ciudad === c.nombre);
    const valor = suma(vs);
    const meta = metaDe(f, c.nombre);
    const porVendedor = new Map<string, number>();
    for (const v of vs) porVendedor.set(v.vendedor, (porVendedor.get(v.vendedor) ?? 0) + v.uf);
    const mejor = [...porVendedor.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      ...c,
      valor,
      unidades: vs.length,
      meta,
      cumplimiento: meta ? (valor / meta) * 100 : null,
      mejor,
      vsAnterior: variacion(valor, suma(anterior.filter((v) => v.ciudad === c.nombre))),
    };
  }).filter((c) => c.valor > 0 || !f.ciudad);
}

export function porVendedor(f: Filtros) {
  const base = filas(f, 2026, "vendedor");
  const anterior = filas(f, 2025, "vendedor");
  return NOMBRES_VENDEDORES.map((nombre) => {
    const vs = base.filter((v) => v.vendedor === nombre);
    const valor = suma(vs);
    const meta = metaDe(f, f.ciudad, nombre);
    const ciudades = new Map<string, number>();
    for (const v of VENTAS) if (v.vendedor === nombre) ciudades.set(v.ciudad, (ciudades.get(v.ciudad) ?? 0) + v.uf);
    // Serie mensual 2026 (para la tendencia y la matriz), sin el filtro de período.
    const mensual = MESES.slice(0, ULTIMO_MES + 1).map((_, m) =>
      suma(VENTAS.filter((v) => v.anio === 2026 && v.mes === m && v.vendedor === nombre && pasa(v, f, "vendedor"))),
    );
    return {
      nombre,
      ciudad: [...ciudades.entries()].sort((a, b) => b[1] - a[1])[0][0],
      valor,
      unidades: vs.length,
      meta,
      cumplimiento: meta ? (valor / meta) * 100 : null,
      ticket: vs.length ? valor / vs.length : 0,
      vsAnterior: variacion(valor, suma(anterior.filter((v) => v.vendedor === nombre))),
      mensual,
    };
  }).filter((v) => v.valor > 0 || v.meta);
}

/** Venta por mes de 2026 y 2025 con los filtros de dimensión (sin el de período), y la meta mensual. */
export function mensual(f: Filtros) {
  const metaMes = metaDe({ ...f, periodo: "mes" });
  return MESES.map((nombre, m) => ({
    nombre,
    actual: m <= ULTIMO_MES ? suma(VENTAS.filter((v) => v.anio === 2026 && v.mes === m && pasa(v, f))) : null,
    anterior: suma(VENTAS.filter((v) => v.anio === 2025 && v.mes === m && pasa(v, f))),
    meta: metaMes,
  }));
}

export function porProyecto(f: Filtros) {
  const base = filas(f);
  const todas = VENTAS.filter((v) => v.anio === 2026 && pasa(v, f));
  return PROYECTOS.map((p) => {
    const vs = base.filter((v) => v.proyecto === p.nombre && v.categoria !== "bod");
    // Avance del stock con todo lo vendido desde 2025; velocidad con el promedio 2026.
    const vendidas = VENTAS.filter((v) => v.proyecto === p.nombre && v.categoria !== "bod").length;
    const ritmo = todas.filter((v) => v.proyecto === p.nombre && v.categoria !== "bod").length / (ULTIMO_MES + 1);
    return {
      ...p,
      valor: suma(base.filter((v) => v.proyecto === p.nombre)),
      unidades: vs.length,
      vendidas: Math.min(vendidas, p.stock),
      velocidad: ritmo,
      agotaEn: ritmo ? Math.max(p.stock - vendidas, 0) / ritmo : null,
    };
  }).filter((p) => p.valor > 0);
}
