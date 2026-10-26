import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UsuarioAcceso } from "@/lib/lineas/usuarios";
import { esAdmin, type Rol } from "@/lib/roles";

export type { UsuarioAcceso };

/** Para los route handlers del shell (runtime Node) — nunca importar desde un client component. Sin
 * acceso a la plataforma (auth.ts), null. */
export async function sesionConRol(): Promise<{ email: string; role: Rol } | null> {
  const acceso = (await auth())?.acceso;
  if (!acceso?.habilitado) return null;
  return { email: acceso.correo, role: acceso.rol };
}

export function respuestaNoAutorizado(mensaje = "No autorizado.") {
  return NextResponse.json({ error: mensaje }, { status: 403 });
}

// ---------------------------------------------------------------- acceso a las APIs de negocio

export type ResultadoAcceso = { ok: true; usuario: UsuarioAcceso } | { ok: false; respuesta: NextResponse };

const METODOS_SIN_EFECTO = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Puerta de entrada de todo route handler de negocio (docs/PLAN.md §3.2):
 *
 * 1. Las escrituras deben venir de la propia plataforma (encabezado Origin): protección CSRF que se
 *    suma a la cookie SameSite=Lax de Auth.js.
 * 2. Sesión válida (401 si no).
 * 3. Usuario habilitado en la plataforma, resuelto en esta misma petición (403 si no).
 * 4. Con `admin: true`, rol administrador (403 si no).
 *
 * Devuelve quién pide: correo, id, rol y área. Si no es administrador, solo ve su área.
 *
 * ```ts
 * const acceso = await requerirAcceso(req, { admin: true });
 * if (!acceso.ok) return acceso.respuesta;
 * ```
 */
export async function requerirAcceso(req: Request, opciones: { admin?: boolean } = {}): Promise<ResultadoAcceso> {
  if (!METODOS_SIN_EFECTO.has(req.method) && !origenPermitido(req)) {
    return { ok: false, respuesta: respuestaError(403, "Origen de la petición no permitido.") };
  }
  const session = await auth();
  if (!session) return { ok: false, respuesta: respuestaError(401, "Debes iniciar sesión.") };
  const { acceso } = session;
  if (!acceso?.habilitado) {
    return { ok: false, respuesta: respuestaError(403, "Tu usuario no tiene acceso a esta plataforma.") };
  }
  if (opciones.admin && !esAdmin(acceso.rol)) {
    return { ok: false, respuesta: respuestaError(403, "No tienes permiso para esta acción.") };
  }
  const { correo, id, rol, area } = acceso;
  return { ok: true, usuario: { correo, id, rol, area } };
}

/** El Origin debe ser la propia plataforma: su host (directo o detrás del proxy) o el de AUTH_URL.
 * Sin Origin se rechaza: los navegadores lo envían en toda petición que escribe. */
export function origenPermitido(req: Request): boolean {
  const origen = req.headers.get("origin");
  if (!origen) return false;
  let host: string;
  try {
    host = new URL(origen).host;
  } catch {
    return false;
  }
  const permitidos = new Set<string>();
  for (const encabezado of ["x-forwarded-host", "host"]) {
    const valor = req.headers.get(encabezado)?.split(",")[0]?.trim();
    if (valor) permitidos.add(valor);
  }
  if (process.env.AUTH_URL) {
    try {
      permitidos.add(new URL(process.env.AUTH_URL).host);
    } catch {
      // AUTH_URL mal formada: se ignora y valen solo los encabezados.
    }
  }
  return permitidos.has(host);
}

/** Respuesta de error con un mensaje para la persona; nunca lleva detalles técnicos. */
export function respuestaError(estado: number, mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

/** Error inesperado: el detalle va al log del servidor y la persona recibe un mensaje genérico. */
export function respuestaErrorInterno(error: unknown, contexto: string) {
  console.error(`[${contexto}]`, error);
  return respuestaError(500, "No se pudo completar la operación. Inténtalo nuevamente.");
}
