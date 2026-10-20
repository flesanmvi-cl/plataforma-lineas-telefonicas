/**
 * Datos de ejemplo del Reporte Tipo 4 (costos por obra con drilldown): obras sintéticas del laboratorio y
 * sus partidas, deterministas (misma semilla, mismos números en servidor y cliente).
 */
import { azar, LINEAS } from "@/lib/estandar/datos";
import { registrosObras, type Registro } from "@/components/estandar/graficos/tablas/datos-tablas";
import type { Estado } from "@/components/estandar/graficos/tablas/comun";

export const PARTIDAS = ["Obra gruesa", "Terminaciones", "Instalaciones", "Mano de obra directa", "Equipos y maquinaria", "Gastos generales"];

/** Obras del reporte (montos anuales en millones de pesos). */
export const OBRAS_COSTOS: Registro[] = registrosObras(36, 523);

export type Periodo = "anio" | "trimestre" | "mes";

/** Fracción del monto anual que cae en cada período (ejemplo: sin estacionalidad). */
export const FACTOR_PERIODO: Record<Periodo, number> = { anio: 1, trimestre: 0.27, mes: 0.09 };

/** Una fila del reporte, sea línea, obra o partida. */
export interface FilaCosto {
  id: string;
  nombre: string;
  /** Segunda línea en la tabla (código y región de la obra, cantidad de obras de la línea). */
  sub?: string;
  presupuesto: number;
  costo: number;
  /** Avance físico ponderado (%). */
  avance: number;
  /** Estado de la obra o partida; en una línea va el conteo de atrasadas. */
  estado?: Estado;
  atrasadas?: number;
  obras?: number;
}

/** Desviación del costo contra el presupuesto, en %. */
export function desviacion(f: { presupuesto: number; costo: number }) {
  return f.presupuesto ? ((f.costo - f.presupuesto) / f.presupuesto) * 100 : 0;
}

function ponderado(filas: { presupuesto: number; avance: number }[]) {
  const total = filas.reduce((s, f) => s + f.presupuesto, 0);
  return total ? filas.reduce((s, f) => s + f.avance * f.presupuesto, 0) / total : 0;
}

/** Nivel 1: una fila por línea de negocio con obras visibles. */
export function filasLineas(obras: Registro[], factor: number): FilaCosto[] {
  return LINEAS.map((linea) => {
    const propias = obras.filter((o) => o.linea === linea);
    return {
      id: linea,
      nombre: linea,
      sub: `${propias.length} ${propias.length === 1 ? "obra" : "obras"}`,
      presupuesto: propias.reduce((s, o) => s + o.presupuesto, 0) * factor,
      costo: propias.reduce((s, o) => s + o.costo, 0) * factor,
      avance: ponderado(propias),
      atrasadas: propias.filter((o) => o.estado === "Atrasado").length,
      obras: propias.length,
    };
  }).filter((f) => f.obras > 0);
}

/** Nivel 2: las obras de una línea. */
export function filasObras(obras: Registro[], linea: string, factor: number): FilaCosto[] {
  return obras
    .filter((o) => o.linea === linea)
    .map((o) => ({
      id: o.id,
      nombre: o.obra,
      sub: `${o.codigo} · ${o.region}`,
      presupuesto: o.presupuesto * factor,
      costo: o.costo * factor,
      avance: o.avance,
      estado: o.estado,
    }))
    .sort((a, b) => b.costo - a.costo);
}

/** Nivel 3: partidas de una obra. Reparte presupuesto y costo de la obra entre las partidas. */
export function filasPartidas(obra: Registro, factor: number): FilaCosto[] {
  const r = azar(Number(obra.id.slice(1)) * 97 + 13);
  const pesos = PARTIDAS.map(() => 0.4 + r());
  const sumaPesos = pesos.reduce((s, p) => s + p, 0);
  const desvios = PARTIDAS.map(() => 0.88 + r() * 0.26);
  const brutos = pesos.map((p, i) => (p / sumaPesos) * obra.presupuesto * desvios[i]);
  const escala = obra.costo / brutos.reduce((s, c) => s + c, 0);
  return PARTIDAS.map((nombre, i) => {
    const presupuesto = (pesos[i] / sumaPesos) * obra.presupuesto * factor;
    const meta = Math.min(100, obra.meta * (0.8 + r() * 0.4));
    const avance = Math.round(Math.min(100, obra.avance * (0.75 + r() * 0.45)));
    const brecha = avance - meta;
    const estado: Estado = brecha >= -3 ? "En plazo" : brecha >= -10 ? "En riesgo" : "Atrasado";
    return { id: `${obra.id}-${i}`, nombre, presupuesto, costo: brutos[i] * escala * factor, avance, estado };
  });
}

/** Total de un conjunto de filas (para el resumen y el pie de la tabla). */
export function totalFilas(filas: FilaCosto[]) {
  const presupuesto = filas.reduce((s, f) => s + f.presupuesto, 0);
  const costo = filas.reduce((s, f) => s + f.costo, 0);
  return { presupuesto, costo, avance: ponderado(filas) };
}
