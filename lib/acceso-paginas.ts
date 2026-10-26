import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/roles";

/**
 * Control de acceso de una página de administración: se llama al inicio de la página, antes de leer
 * datos. El layout de configuracion/(admin) también redirige, pero Next renderiza layout y página
 * en paralelo: sin esta llamada, lo que dibuja la página igual viaja en la respuesta (payload RSC)
 * a quien no es administrador. Comprobado el 2026-10-26 (docs/PLAN.md §3.2).
 */
export async function exigirAdministrador(): Promise<void> {
  const session = await auth();
  if (!esAdmin(session?.user?.role)) redirect("/configuracion");
}
