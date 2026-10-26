import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Config EDGE-SAFE de Auth.js (la importa middleware.ts): nada de Prisma/pg ni
 * dependencias de Node aquí. Los callbacks que necesiten BBDD van en auth.ts.
 * Fuente: servicios-compartidos/login-estandar/nextjs — plantilla compartida
 * de login CIA (Google Workspace) para todas las plataformas internas.
 */
export const DOMINIOS_PERMITIDOS = (process.env.CIA_ALLOWED_DOMAINS ?? "flesan.cl")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const authConfig = {
  // Servido por IP/host interno (no Vercel): confiar en el Host.
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          // `hd` sugiere el Workspace en el selector de cuentas y esconde las demás. Solo con un
          // dominio: con varios, escondería las de los otros (y "*", las que no son de Workspace).
          // El filtro real es el callback signIn de abajo.
          ...(DOMINIOS_PERMITIDOS.length === 1 ? { hd: DOMINIOS_PERMITIDOS[0] } : {}),
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    /** Bloquea cualquier login que no sea de un dominio permitido o cuyo correo Google no verificó. */
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || profile?.email_verified !== true) return false;
      const domain = email.split("@")[1] ?? "";
      return DOMINIOS_PERMITIDOS.includes(domain);
    },
    /** Middleware: sin sesión → redirige a /login (conserva callbackUrl). */
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
