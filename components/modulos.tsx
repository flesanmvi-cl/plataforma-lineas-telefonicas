"use client";

import type { ReactNode } from "react";

// PLATAFORMA · módulos opcionales enchufados al shell (versión mínima de docs/SHELL.md). Líneas
// Telefónicas no usa ninguno: Presentaciones está en revisión y no se instala en las plataformas.
export function ModulosProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
// El shell le pasa la vista (app-shell.tsx); sin módulos, no la usa.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useVistaEspecialModulos(_children: ReactNode): ReactNode | null {
  return null;
}
export function BotonesBarraModulos() {
  return null;
}
export function OpcionesUsuarioModulos() {
  return null;
}
export function SuperposicionesModulos() {
  return null;
}
export function PersonalizacionModulos() {
  return null;
}
