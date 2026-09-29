import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/roles";

/**
 * Gate por rol de «Avisos» (solo administradores). Vive fuera del middleware
 * porque necesita el rol ya resuelto en la sesión (no solo "¿hay sesión?"). Es el patrón para
 * cualquier sección marcada `adminOnly` en lib/nav.ts; las APIs de /api/configuracion/avisos
 * validan el rol por su cuenta.
 */
export default async function AvisosLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!esAdmin(session?.user?.role)) {
    redirect("/configuracion");
  }
  return <>{children}</>;
}
