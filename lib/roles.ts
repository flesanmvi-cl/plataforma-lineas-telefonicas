/**
 * Perfil de quien usa la plataforma, compartido entre server (auth.ts, route handlers) y client
 * components (sidebar/topbar). Sale de seguridadapp, aplicación 23 (lib/lineas/usuarios.ts):
 *
 * - rol 74 → "admin";
 * - roles 75 y 76 → "procesos" o "soporte" según el área del usuario (columna dni), que es lo que
 *   filtra lo que ven: el aplicativo antiguo filtra por el área, no por el rol (docs/MIGRACION.md §3);
 * - "member": sin perfil de la plataforma. Es el rol de una sesión sin acceso y el de las maquetas
 *   del shell.
 *
 * El shell solo usa `esAdmin()` y `etiquetaRol()`.
 */
export type Rol = "admin" | "procesos" | "soporte" | "member";

export function esAdmin(role?: Rol | null): boolean {
  return role === "admin";
}

// Los nombres de los perfiles en seguridadapp.rol_aplicacion, que los usuarios ya conocen.
const ETIQUETAS: Record<Rol, string> = {
  admin: "Administrador",
  procesos: "Administrador Procesos",
  soporte: "Administrador Soporte",
  member: "Miembro",
};

export function etiquetaRol(role?: Rol | null): string {
  return ETIQUETAS[role ?? "member"];
}

/** Área de un usuario (columna dni) y de cada registro que crea (sl_area): '1' Procesos, '2' Soporte
 * (catálogo s_lineas.tipo_user). */
export type Area = "1" | "2";

export function esArea(valor: unknown): valor is Area {
  return valor === "1" || valor === "2";
}
