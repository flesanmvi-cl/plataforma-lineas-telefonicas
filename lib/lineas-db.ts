import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

/**
 * Base de la plataforma (`srvpd_bd`, DATABASE_URL_PLATAFORMA): lectura y escritura sobre los mismos
 * esquemas que usa el aplicativo antiguo — `s_lineas` (líneas, dispositivos, historial, marcas,
 * modelos y catálogos) y `seguridadapp` (usuarios y roles de la aplicación 23). Es un desvío
 * aprobado del estándar (docs/PLAN.md, P0): mientras convivan los dos aplicativos, lo que se
 * escribe aquí queda con el mismo formato que deja el antiguo (docs/PLAN.md §2.3).
 *
 * Runtime Node únicamente. Los esquemas salen de ESQUEMA_LINEAS y ESQUEMA_SEGURIDAD (por defecto,
 * los reales); la base de desarrollo (`npm run db:dev`) usa los mismos nombres.
 */

const NOMBRE_ESQUEMA = /^[a-z_][a-z0-9_]{0,62}$/;

/** El esquema se interpola en el SQL: solo se acepta un nombre simple. */
function esquema(variable: "ESQUEMA_LINEAS" | "ESQUEMA_SEGURIDAD", porDefecto: string): string {
  const valor = process.env[variable]?.trim() || porDefecto;
  if (!NOMBRE_ESQUEMA.test(valor)) throw new Error(`${variable} no es un nombre de esquema válido.`);
  return valor;
}

export const ESQUEMA_LINEAS = esquema("ESQUEMA_LINEAS", "s_lineas");
export const ESQUEMA_SEGURIDAD = esquema("ESQUEMA_SEGURIDAD", "seguridadapp");

/** Tablas que usa la plataforma (docs/MIGRACION.md §10). Solo estos nombres se interpolan en SQL. */
export type TablaLineas =
  | "sl_registro_linea_pro"
  | "sl_dispositivo"
  | "historial_linea"
  | "historial_dispositivos"
  | "marca_disp"
  | "modelo_disp"
  | "tipo_plan"
  | "estado_linea"
  | "operador"
  | "tipo_dispositivo"
  | "estado_dispositivos"
  | "tipo_user";
export type TablaSeguridad = "aplicacion" | "aplicacion_usuario" | "usuario_rol" | "rol_aplicacion";

export const tablaLineas = (tabla: TablaLineas) => `${ESQUEMA_LINEAS}.${tabla}`;
export const tablaSeguridad = (tabla: TablaSeguridad) => `${ESQUEMA_SEGURIDAD}.${tabla}`;

/** La hora actual como la graba el aplicativo antiguo: UTC sin zona (Laravel con timezone = UTC). */
export const AHORA_UTC = "(now() AT TIME ZONE 'UTC')";

// Los `timestamp without time zone` de estos esquemas están en UTC (así los graba Laravel): se leen
// como UTC sin importar la zona horaria del servidor. Las columnas `date` quedan como texto
// AAAA-MM-DD para que no se corran un día por la zona horaria.
const OID_TIMESTAMP = 1114;
const OID_DATE = 1082;
const parsers = {
  getTypeParser: ((oid: number, formato?: "text") => {
    if (oid === OID_TIMESTAMP) return (valor: string) => new Date(`${valor.replace(" ", "T")}Z`);
    if (oid === OID_DATE) return (valor: string) => valor;
    return types.getTypeParser(oid, formato);
  }) as typeof types.getTypeParser,
};

declare global {
  var _pgPoolLineas: Pool | undefined;
}

function crearPool(): Pool | null {
  const url = process.env.DATABASE_URL_PLATAFORMA;
  if (!url) return null;
  return new Pool({ connectionString: url, max: 5, options: "-c statement_timeout=15000", types: parsers });
}

// Cacheado en globalThis para no abrir un pool nuevo en cada hot-reload de Next en dev.
const pool: Pool | null = globalThis._pgPoolLineas ?? crearPool();
if (pool && process.env.NODE_ENV !== "production") globalThis._pgPoolLineas = pool;

/** false si falta DATABASE_URL_PLATAFORMA: las funciones de abajo lanzan un error claro. */
export const baseLineasConfigurada = pool !== null;

function base(): Pool {
  if (!pool) throw new Error("Falta DATABASE_URL_PLATAFORMA: la plataforma no tiene base configurada.");
  return pool;
}

/** Consulta parametrizada ($1, $2…) sobre la base de la plataforma. */
export async function consultar<T extends QueryResultRow>(sql: string, parametros: unknown[] = []): Promise<T[]> {
  const { rows } = await base().query<T>(sql, parametros);
  return rows;
}

/** Ejecuta `trabajo` en una transacción: COMMIT si termina bien, ROLLBACK si lanza. Un cambio y su
 * historial se graban siempre juntos (docs/PLAN.md §3.2). */
export async function enTransaccion<T>(trabajo: (cliente: PoolClient) => Promise<T>): Promise<T> {
  const cliente = await base().connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
}
