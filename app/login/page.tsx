import { signIn } from "@/auth";
import { DOMINIOS_PERMITIDOS } from "@/auth.config";
import { AvisoSinAcceso, MOTIVOS_SIN_ACCESO } from "@/components/acceso/aviso-sin-acceso";
import { MarcoAcceso } from "@/components/acceso/marco-acceso";
import type { MotivoSinAcceso } from "@/lib/lineas/usuarios";

// Auth.js manda errores a esta misma página (pages.error = "/login"). «SinAcceso» lo pone el
// callback signIn de auth.ts, con el motivo y el correo, cuando la cuenta no está en la lista blanca.
const ERRORES: Record<string, string> = {
  AccessDenied: "Tu cuenta no pertenece a un dominio autorizado.",
  Configuration: "El login aún no está configurado en el servidor (variables AUTH_*).",
  Verification: "El enlace de acceso expiró. Intenta de nuevo.",
  default: "No se pudo iniciar sesión. Intenta nuevamente.",
};

// El correo llega en la URL: solo se muestra si tiene forma de correo.
const FORMA_CORREO = /^[^\s@]{1,64}@[^\s@]{1,190}$/;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; motivo?: string; correo?: string }>;
}) {
  const { callbackUrl, error, motivo, correo } = await searchParams;
  const sinAcceso: MotivoSinAcceso | null =
    error === "SinAcceso" ? (MOTIVOS_SIN_ACCESO.find((m) => m === motivo) ?? "no-registrado") : null;
  const mensajeError = error && !sinAcceso ? (ERRORES[error] ?? ERRORES.default) : null;

  return (
    <MarcoAcceso>
      <p className="font-body text-sm text-flesan-light">Ingresa con tu cuenta corporativa de Google</p>
      <p className="mt-1 font-body text-xs text-flesan-steel">Dominios autorizados: {DOMINIOS_PERMITIDOS.join(", ")}</p>

      {/* Botón de Google */}
      <div className="mt-8 flex w-full flex-col items-center justify-center">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl || "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-label text-xs uppercase tracking-[0.1em] text-white hover:bg-white/[0.08] hover:border-white/25 transition-colors cursor-pointer"
          >
            <GoogleIcon />
            Iniciar sesión con Google
          </button>
        </form>
        {sinAcceso && (
          <AvisoSinAcceso motivo={sinAcceso} correo={correo && FORMA_CORREO.test(correo) ? correo : null} />
        )}
        {mensajeError && (
          <p className="mt-4 font-body text-sm text-flesan-red text-center" role="alert">
            {mensajeError}
          </p>
        )}
      </div>
    </MarcoAcceso>
  );
}
