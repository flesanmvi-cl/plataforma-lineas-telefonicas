import type { Notificacion, TipoNotificacion } from "@/lib/notificaciones-tipos";

// PLATAFORMA · tipos de notificación (este archivo sí se edita en cada una). Líneas Telefónicas no
// tiene notificaciones, igual que el aplicativo antiguo: TIPOS_NOTIFICACION queda vacío y la
// campanita no aparece.

export const TIPOS_NOTIFICACION: Record<string, TipoNotificacion> = {};

/** Sin datos de ejemplo: la plataforma no usa notificaciones. El shell le pasa la hora actual
 * (app/api/notificaciones/ejemplo.ts). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ejemplosNotificaciones(_ahora: number): Notificacion[] {
  return [];
}
