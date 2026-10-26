// PLATAFORMA · estado de los datos (este archivo sí se edita en cada una). Líneas Telefónicas
// trabaja sobre registros que se editan en línea, sin cargas periódicas: no hay indicador de
// frescura en la barra superior (obtenerEstadoDatos devuelve null).

/** Cada cuántas horas se espera que lleguen datos nuevos (sin uso mientras no haya indicador). */
export const CADA_HORAS = 24;

export interface EstadoDatos {
  actualizadoEn: Date;
}

/** «Actualizar» del indicador: sin fuente que recargar, no hace nada. */
export async function actualizarDatos(): Promise<void> {}

export async function obtenerEstadoDatos(): Promise<EstadoDatos | null> {
  return null;
}
