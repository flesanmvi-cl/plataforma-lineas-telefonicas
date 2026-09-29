// PLATAFORMA · estado de los datos (este archivo sí se edita en cada una): cuándo se actualizaron
// por última vez y cada cuánto se espera que se actualicen. Lo consume el indicador de la barra
// superior (components/estado-datos.tsx, shell).
//
// En el mockup la fecha es de ejemplo. Cada plataforma reemplaza `obtenerEstadoDatos` por su
// fuente real (la fecha de carga del ETL, la de la vista materializada, etc.) y ajusta
// `CADA_HORAS` a su frecuencia. Si la plataforma no tiene datos que refrescar, que devuelva null
// y el indicador no se muestra.

/** Cada cuántas horas se espera que lleguen datos nuevos; pasado ese plazo se marcan atrasados. */
export const CADA_HORAS = 24;

export interface EstadoDatos {
  actualizadoEn: Date;
}

/**
 * Fecha de ejemplo: hoy a las 06:00 (o ayer, si aún no son las 06:00). Con `?datos=atrasado` en
 * la URL devuelve una fecha de hace 32 horas, para revisar el estado atrasado.
 */
/** «Actualizar» del indicador: trae datos nuevos de la fuente antes de refrescar la vista (ej.
 * descartar una caché o disparar la carga). En el mockup no hay fuente: no hace nada. */
export async function actualizarDatos(): Promise<void> {}

export async function obtenerEstadoDatos(): Promise<EstadoDatos | null> {
  const atrasado = new URLSearchParams(window.location.search).get("datos") === "atrasado";
  const ahora = new Date();
  if (atrasado) return { actualizadoEn: new Date(ahora.getTime() - 32 * 3_600_000) };
  const hoy6 = new Date(ahora);
  hoy6.setHours(6, 0, 0, 0);
  if (hoy6 > ahora) hoy6.setDate(hoy6.getDate() - 1);
  return { actualizadoEn: hoy6 };
}
