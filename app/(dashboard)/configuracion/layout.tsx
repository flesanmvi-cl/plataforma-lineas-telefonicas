import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/roles";

/**
 * Gate por rol: vive fuera del middleware porque necesita el rol ya resuelto en la
 * sesión (no solo "¿hay sesión?"). Ejemplo de cómo proteger una sección marcada
 * `adminOnly` en lib/nav.ts.
 */
export default async function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!esAdmin(session?.user?.role)) {
    redirect("/");
  }
  return <>{children}</>;
}
