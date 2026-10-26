import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { AvisoSinAcceso } from "@/components/acceso/aviso-sin-acceso";
import { MarcoAcceso } from "@/components/acceso/marco-acceso";
import { cerrarSesion } from "@/lib/auth-actions";

// Fuera del dashboard. Llega aquí quien tiene sesión pero ya no tiene acceso a la plataforma: lo
// desactivaron, le falta perfil o área, o la base no respondió (auth.ts). Quien no llegó a tener
// sesión ve el motivo en /login. Cerrar sesión permite entrar con otra cuenta.
export default async function SinAccesoPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const { acceso } = session;
  if (acceso.habilitado) redirect("/");

  return (
    <MarcoAcceso>
      <AvisoSinAcceso motivo={acceso.motivo} correo={acceso.correo || null} />
      <form action={cerrarSesion} className="mt-6">
        <button
          type="submit"
          className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-label text-xs uppercase tracking-[0.1em] text-white hover:bg-white/[0.08] hover:border-white/25 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden />
          Cerrar sesión
        </button>
      </form>
    </MarcoAcceso>
  );
}
