import { pool } from "@/lib/db";
import type { Rol } from "@/lib/roles";

/**
 * Runtime Node únicamente — nunca importar desde un client component ni desde
 * auth.config.ts (edge, ver middleware.ts). Esquema en db/001_usuarios_roles.sql.
 *
 * Reemplaza "<slug>" por el nombre de esta plataforma antes de usar este patrón en
 * serio (mismo slug que `data-plataforma` en app/layout.tsx). Solo tiene efecto si
 * DATABASE_URL está configurado — ver auth.ts y docs/ARQUITECTURA.md.
 */
const TABLA_USUARIOS = "flesan_procesos.cia_<slug>_usuarios";

export interface UsuarioAsignado {
  correo: string;
  nombre: string | null;
  rol: Rol;
}

/**
 * Rol de un correo, para el callback `session` de auth.ts cuando la plataforma
 * necesita roles persistidos en BBDD (no solo por email vía env CIA_ADMIN_EMAILS).
 * Sin fila (nunca administrado desde /configuracion/usuarios, o error de conexión):
 * "member" por defecto — mínimo privilegio, nunca le corta el acceso a nadie que ya
 * usa la plataforma.
 */
export async function resolverRol(correo: string): Promise<{ rol: Rol; nombre: string | null }> {
  try {
    const { rows } = await pool.query<{ rol: string; nombre: string | null }>(
      `SELECT rol, nombre FROM ${TABLA_USUARIOS} WHERE correo = $1`,
      [correo],
    );
    const fila = rows[0];
    return { rol: fila?.rol === "admin" ? "admin" : "member", nombre: fila?.nombre ?? null };
  } catch (error) {
    console.error("Error al resolver rol de usuario:", error);
    return { rol: "member", nombre: null };
  }
}

export async function listarUsuariosAsignados(): Promise<UsuarioAsignado[]> {
  const { rows } = await pool.query<{ correo: string; nombre: string | null; rol: string }>(
    `SELECT correo, nombre, rol FROM ${TABLA_USUARIOS} ORDER BY nombre NULLS LAST, correo`,
  );
  return rows.map((r) => ({
    correo: r.correo,
    nombre: r.nombre,
    rol: r.rol === "admin" ? "admin" : "member",
  }));
}

export async function asignarUsuario(params: { correo: string; nombre: string | null; rol: Rol }): Promise<void> {
  const correo = params.correo.trim().toLowerCase();
  await pool.query(
    `INSERT INTO ${TABLA_USUARIOS} (correo, nombre, rol, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (correo) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol, updated_at = now()`,
    [correo, params.nombre, params.rol],
  );
}

/** Quita al usuario de la tabla administrada: vuelve a caer en el default (member)
 * en vez de quedar "sin rol". */
export async function revocarUsuario(correo: string): Promise<void> {
  await pool.query(`DELETE FROM ${TABLA_USUARIOS} WHERE correo = $1`, [correo.trim().toLowerCase()]);
}
