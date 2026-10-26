import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { UsuarioAcceso } from "@/lib/lineas/usuarios";
import { esAdmin } from "@/lib/roles";

/**
 * Control de acceso de una página: se llama al inicio de la página, antes de leer datos. Los layouts
 * del dashboard y de configuracion/(admin) también redirigen, pero Next renderiza layout y página en
 * paralelo: sin esta llamada, lo que dibuja la página igual viaja en la respuesta (payload RSC) a
 * quien no corresponde. Comprobado el 2026-10-26 (docs/PLAN.md §3.2).
 */

/** Quien abre la página, si está habilitado en la plataforma; si no, a /sin-acceso. Toda página que
 * lea datos lo llama y, si el usuario no es administrador, filtra por su área. */
export async function exigirAcceso(): Promise<UsuarioAcceso> {
  const session = await auth();
  if (!session) redirect("/login");
  const { acceso } = session;
  if (!acceso?.habilitado) redirect("/sin-acceso");
  const { correo, id, rol, area } = acceso;
  return { correo, id, rol, area };
}

/** Lo mismo, para las páginas de administración: quien no es administrador vuelve a /configuracion. */
export async function exigirAdministrador(): Promise<UsuarioAcceso> {
  const usuario = await exigirAcceso();
  if (!esAdmin(usuario.rol)) redirect("/configuracion");
  return usuario;
}
