import { consultar, tablaSeguridad } from "@/lib/lineas-db";
import { esArea, type Area, type Rol } from "@/lib/roles";

/**
 * Usuarios de la plataforma: los de la aplicación 23 de seguridadapp, los mismos del aplicativo
 * antiguo (docs/MIGRACION.md §3 y §7). Runtime Node únicamente. El alta y la edición llegan con M8.
 */

/** Líneas Telefónicas en seguridadapp.aplicacion. */
export const ID_APLICACION = 23;

/** Roles de la aplicación 23 en seguridadapp.rol_aplicacion. */
export const ID_ROL = { administrador: 74, procesos: 75, soporte: 76 } as const;

const ROLES_APLICACION: number[] = Object.values(ID_ROL);
const AREAS: Area[] = ["1", "2"];

/** Por qué un correo no tiene acceso. */
export type MotivoSinAcceso =
  /** Sin usuario activo en la aplicación 23. */
  | "no-registrado"
  /** Registrado, pero sin rol 74, 75 o 76, o sin área Procesos o Soporte. */
  | "sin-perfil"
  /** La base no respondió: se niega el acceso. */
  | "sin-verificar";

export interface PerfilUsuario {
  /** id_aplicacion_usuario. null solo para la llave maestra (CIA_ADMIN_EMAILS) sin usuario registrado. */
  id: number | null;
  rol: Rol;
  /** Área con que registra y, si no es administrador, la única que ve. null solo para la llave
   * maestra sin usuario registrado. */
  area: Area | null;
}

export type Acceso = ({ habilitado: true } & PerfilUsuario) | { habilitado: false; motivo: MotivoSinAcceso };

/** Quien hace una petición o abre una página, según la sesión. Nunca sale del cuerpo de la petición. */
export type UsuarioAcceso = { correo: string } & PerfilUsuario;

/**
 * Acceso de un correo con la regla del login del antiguo: usuario de la aplicación 23 con
 * `estado_sesion = 1` y `estado_validacion = 1`, y un rol en `usuario_rol`. Además, el rol debe ser
 * 74, 75 o 76 y el área (columna `dni`) '1' o '2'.
 *
 * - Rol 74 → "admin". Roles 75 y 76 → "procesos" o "soporte" según el área.
 * - El correo se compara sin distinguir mayúsculas ni espacios en los extremos.
 * - Si el correo tiene más de un registro (el antiguo permite repetidos), vale el primero con rol y
 *   área válidos, y entre ellos el de id más bajo.
 * - No lanza: si la base falla, niega el acceso (`sin-verificar`) y deja el detalle en el log.
 */
export async function buscarAcceso(correo: string): Promise<Acceso> {
  const normalizado = correo.trim().toLowerCase();
  if (!normalizado) return { habilitado: false, motivo: "no-registrado" };

  let filas: { id: string; id_rol: number; area: string | null }[];
  try {
    filas = await consultar(
      `SELECT au.id_aplicacion_usuario AS id, ur.id_rol, btrim(au.dni) AS area
         FROM ${tablaSeguridad("aplicacion_usuario")} au
         JOIN ${tablaSeguridad("usuario_rol")} ur ON ur.id_aplicacion_usuario = au.id_aplicacion_usuario
        WHERE au.id_aplicacion = $1
          AND lower(btrim(au.username)) = $2
          AND au.estado_sesion = 1
          AND au.estado_validacion = 1
        ORDER BY coalesce(ur.id_rol = ANY($3::int[]) AND btrim(au.dni) = ANY($4::text[]), false) DESC,
                 au.id_aplicacion_usuario, ur.id_usuario_rol
        LIMIT 1`,
      [ID_APLICACION, normalizado, ROLES_APLICACION, AREAS],
    );
  } catch (error) {
    console.error("[acceso] No se pudo consultar seguridadapp:", error);
    return { habilitado: false, motivo: "sin-verificar" };
  }

  const fila = filas[0];
  if (!fila) return { habilitado: false, motivo: "no-registrado" };
  const { area } = fila;
  if (!ROLES_APLICACION.includes(fila.id_rol) || !esArea(area)) return { habilitado: false, motivo: "sin-perfil" };
  const rol: Rol = fila.id_rol === ID_ROL.administrador ? "admin" : area === "1" ? "procesos" : "soporte";
  return { habilitado: true, id: Number(fila.id), rol, area };
}
