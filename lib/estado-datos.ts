// Estado de los datos de la plataforma: cuándo se actualizaron por última vez y cada cuánto se
// espera que se actualicen. Lo consume `components/estado-datos.tsx` (barra superior).
//
// En el mockup la fecha es de ejemplo. Cada plataforma reemplaza `obtenerEstadoDatos` por su
// fuente real (la fecha de carga del ETL, la de la vista materializada, etc.) y ajusta
// `CADA_HORAS` a su frecuencia.

/** Cada cuántas horas se espera que lleguen datos nuevos; pasado ese plazo se marcan atrasados. */
export const CADA_HORAS = 24;

export interface EstadoDatos {
  actualizadoEn: Date;
}

/**
 * Fecha de ejemplo: hoy a las 06:00 (o ayer, si aún no son las 06:00). Con `?datos=atrasado` en
 * la URL devuelve una fecha de hace 32 horas, para revisar el estado atrasado.
 */
export async function obtenerEstadoDatos(): Promise<EstadoDatos> {
  const atrasado = new URLSearchParams(window.location.search).get("datos") === "atrasado";
  const ahora = new Date();
  if (atrasado) return { actualizadoEn: new Date(ahora.getTime() - 32 * 3_600_000) };
  const hoy6 = new Date(ahora);
  hoy6.setHours(6, 0, 0, 0);
  if (hoy6 > ahora) hoy6.setDate(hoy6.getDate() - 1);
  return { actualizadoEn: hoy6 };
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatearHora(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** «27 sep» */
export function formatearDia(d: Date) {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

/** «27 sep 2026, 06:00» */
export function formatearCompleta(d: Date) {
  return `${formatearDia(d)} ${d.getFullYear()}, ${formatearHora(d)}`;
}
