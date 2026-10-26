import type { ReactNode } from "react";
import type { MotivoSinAcceso } from "@/lib/lineas/usuarios";

export const MOTIVOS_SIN_ACCESO: MotivoSinAcceso[] = ["no-registrado", "sin-perfil", "sin-verificar"];

/** Por qué una cuenta no entra (auth.ts), con el correo que usó y a quién pedir acceso. Lo usan el
 * login (sin sesión) y /sin-acceso (con sesión). */
export function AvisoSinAcceso({ motivo, correo }: { motivo: MotivoSinAcceso; correo: string | null }) {
  const cuenta = correo ? (
    <>
      La cuenta <span className="font-semibold text-white break-all">{correo}</span>
    </>
  ) : (
    "Tu cuenta"
  );
  const textos: Record<MotivoSinAcceso, [ReactNode, string]> = {
    "no-registrado": [<>{cuenta} no tiene acceso a Líneas Telefónicas.</>, "Pide acceso a un administrador de la plataforma."],
    "sin-perfil": [
      <>{cuenta} está registrada, pero sin un perfil o un área válidos.</>,
      "Pide a un administrador de la plataforma que revise tu usuario.",
    ],
    "sin-verificar": ["No pudimos verificar tu acceso.", "La base de datos no respondió. Intenta nuevamente en unos minutos."],
  };
  const [frase, detalle] = textos[motivo];
  return (
    <div
      role="alert"
      className="mt-6 w-full rounded-lg border border-flesan-red/40 bg-flesan-red/10 px-4 py-3 text-left font-body text-sm text-flesan-light"
    >
      <p>{frase}</p>
      <p className="mt-1 text-flesan-warm">{detalle}</p>
    </div>
  );
}
