import { cache } from "react";
import NextAuth, { type DefaultSession, type Session } from "next-auth";

import { authConfig } from "./auth.config";
import { buscarAcceso, type Acceso } from "@/lib/lineas/usuarios";
import type { Rol } from "@/lib/roles";

/**
 * Runtime Node (no edge). Quién entra y con qué perfil (docs/PLAN.md, M2):
 *
 * - Lista blanca, como el aplicativo antiguo: entran solo los usuarios activos de la aplicación 23
 *   de seguridadapp (lib/lineas/usuarios.ts). Al resto, el callback `signIn` no le da sesión: lo
 *   devuelve a /login con el motivo y el correo que usó.
 * - CIA_ADMIN_EMAILS es la llave maestra: esos correos entran como administradores aunque no estén
 *   registrados o la base no responda. Nunca editable desde la plataforma.
 * - El acceso se resuelve de nuevo en cada petición (callback `session`, no `jwt`): quien es
 *   desactivado o cambia de perfil lo nota en su siguiente petición. Sin acceso, la sesión queda sin
 *   correo (las piezas del shell que lo piden no ven a nadie) y el dashboard lleva a /sin-acceso.
 * - Sin suplantaciones ni excepciones por correo (docs/MIGRACION.md §13).
 */
const CIA_ADMINS = (process.env.CIA_ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

declare module "next-auth" {
  interface Session {
    user: {
      role: Rol;
    } & DefaultSession["user"];
    /** Acceso a la plataforma, resuelto en cada petición, y el correo con que se inició sesión. */
    acceso: Acceso & { correo: string };
  }
}

function normalizar(correo: unknown): string {
  return typeof correo === "string" ? correo.trim().toLowerCase() : "";
}

/** Llave maestra y seguridadapp. Con `cache`, una sola consulta por petición aunque el layout, la
 * página y los guards pidan la sesión. */
export const resolverAcceso = cache(async (correo: string): Promise<Acceso> => {
  const acceso = await buscarAcceso(correo);
  if (!CIA_ADMINS.includes(normalizar(correo))) return acceso;
  return acceso.habilitado ? { ...acceso, rol: "admin" } : { habilitado: true, id: null, rol: "admin", area: null };
});

/** La sesión que ven la plataforma y el shell: sin acceso, sin correo y con rol "member". */
function conAcceso(base: Pick<Session, "expires"> & { user?: DefaultSession["user"] }, correo: string, acceso: Acceso): Session {
  return {
    ...base,
    user: {
      ...base.user,
      email: acceso.habilitado ? correo : null,
      role: acceso.habilitado ? acceso.rol : "member",
    },
    acceso: { ...acceso, correo },
  };
}

const { handlers, signIn, signOut, auth: authOriginal } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    /** Dominio y correo verificado (auth.config.ts) y, además, la lista blanca. */
    async signIn(params) {
      if (!authConfig.callbacks.signIn(params)) return false;
      const correo = normalizar(params.profile?.email);
      const acceso = await resolverAcceso(correo);
      if (acceso.habilitado) return true;
      return `/login?${new URLSearchParams({ error: "SinAcceso", motivo: acceso.motivo, correo })}`;
    },
    async session({ session, token }) {
      const correo = normalizar(token.email ?? session.user?.email);
      return conAcceso(session, correo, await resolverAcceso(correo));
    },
  },
});

/**
 * Bypass de login SOLO para desarrollo — nunca en producción (el `&& NODE_ENV !== "production"`
 * protege aunque el .env de la VM traiga AUTH_DISABLED=true por error). Con AUTH_DISABLED=true,
 * `auth()` devuelve la sesión de DEV_CORREO (por defecto dev@flesan.cl) sin pasar por Google, y su
 * acceso sale de seguridadapp de la base de desarrollo, como en producción. Para probar otro
 * perfil, otro correo de db/desarrollo/002_datos.sql (ej. DEV_CORREO=procesos.prueba@flesan.cl).
 * middleware.ts tiene el bypass equivalente para no redirigir a /login.
 */
const AUTH_DISABLED = process.env.AUTH_DISABLED === "true" && process.env.NODE_ENV !== "production";
const CORREO_DESARROLLO = normalizar(process.env.DEV_CORREO) || "dev@flesan.cl";

async function sesionDesarrollo(): Promise<Session> {
  const base = {
    user: { name: "Usuario de prueba", email: CORREO_DESARROLLO, image: null },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  return conAcceso(base, CORREO_DESARROLLO, await resolverAcceso(CORREO_DESARROLLO));
}

export async function auth(): Promise<Session | null> {
  if (AUTH_DISABLED) return sesionDesarrollo();
  return authOriginal();
}

export { handlers, signIn, signOut };
