import { AlertTriangle, BellRing, CheckCircle2, MessageSquare, Upload, XCircle } from "lucide-react";
import type { Notificacion, TipoNotificacion } from "@/lib/notificaciones-tipos";

// PLATAFORMA · tipos de notificación (este archivo sí se edita en cada una). La campanita, el
// panel y la bandeja son del shell y leen de aquí cómo se ve cada tipo. Una plataforma sin
// notificaciones deja TIPOS_NOTIFICACION vacío: la campanita no aparece.
//
// Para emitir una: crearNotificacion() de lib/notificaciones-db.ts desde un route handler o
// server action, con uno de estos tipos.

export const TIPOS_NOTIFICACION: Record<string, TipoNotificacion> = {
  aprobacion: { etiqueta: "Aprobación", icono: CheckCircle2, color: "var(--color-status-ok)" },
  // Rojo de marca solo en lo que exige una acción de vuelta.
  rechazo: { etiqueta: "Rechazo", icono: XCircle, color: "var(--color-flesan-red)" },
  recordatorio: { etiqueta: "Recordatorio", icono: BellRing, color: "var(--color-status-warn)" },
  comentario: { etiqueta: "Comentario", icono: MessageSquare, color: "var(--color-serie-1)" },
  carga: { etiqueta: "Carga de datos", icono: Upload, color: "var(--color-serie-4)" },
  alerta: { etiqueta: "Alerta", icono: AlertTriangle, color: "var(--color-status-warn)" },
};

/**
 * Datos de ejemplo mientras la plataforma no tenga la tabla (db/003_notificaciones.sql). Las
 * fechas son relativas a `ahora`, para que siempre se vean recientes.
 */
export function ejemplosNotificaciones(ahora: number): Notificacion[] {
  const hace = (min: number) => new Date(ahora - min * 60_000).toISOString();
  const n = (id: number, tipo: string, titulo: string, cuerpo: string, min: number, leida: boolean, enlace: string | null = null, cita?: string): Notificacion => ({
    id,
    tipo,
    titulo,
    cuerpo,
    enlace,
    datos: cita ? { cita } : {},
    leidaEn: leida ? hace(Math.max(min - 5, 0)) : null,
    creadaEn: hace(min),
  });
  return [
    n(12, "rechazo", "Entrega rechazada", "Conciliación bancaria · FAI Central", 4, false, "/plantillas/reportes/tipo-1", "Falta el respaldo del ítem 4.2: la cartola no cuadra con el mayor."),
    n(11, "aprobacion", "Entrega aprobada", "Provisión de vacaciones · Inex", 65, false, "/plantillas/reportes/tipo-1"),
    n(10, "recordatorio", "Vence el día hábil 5", "Quedan 3 entregas pendientes de tu área", 190, false, "/plantillas/reportes/tipo-3"),
    n(9, "comentario", "Nuevo comentario", "Comentaron en el ítem 3.1 · Activo fijo", 60 * 22, true, "/plantillas/reportes/tipo-1", "¿Podemos usar el tipo de cambio del cierre y no el del día?"),
    n(8, "carga", "Carga de datos terminada", "Facturación: 22.310 filas cargadas sin errores", 60 * 26, true, "/configuracion/fuentes-datos"),
    n(7, "aprobacion", "Entrega aprobada", "Remuneraciones · Back-Office", 60 * 50, true),
    n(6, "alerta", "Carga con advertencias", "Costos: 14 filas sin centro de gestión", 60 * 75, true, "/configuracion/fuentes-datos"),
    n(5, "recordatorio", "El cierre de agosto quedó publicado", "Tienes 12 actividades asignadas", 60 * 24 * 6, true),
  ];
}
