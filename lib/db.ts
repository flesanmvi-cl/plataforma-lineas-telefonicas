import { Pool } from "pg";

/**
 * Base transaccional `flesan` (DATABASE_URL), **solo lectura**: maestros de Chile (empresas,
 * unidades de negocio, centros de costo) y maestro de colaboradores (docs/MIGRACION.md §9). La
 * sesión abre con `default_transaction_read_only`, así que un INSERT o UPDATE accidental lo
 * rechaza la propia base.
 *
 * Runtime Node únicamente (route handlers, Server Components, auth.ts) — nunca importar desde un
 * client component ni desde auth.config.ts (edge, ver middleware.ts). Inerte si no hay
 * DATABASE_URL: el Pool no conecta hasta la primera query.
 */
declare global {
  var _pgPool: Pool | undefined;
}

// Cacheado en globalThis para no abrir un pool nuevo en cada hot-reload de Next en dev.
export const pool =
  globalThis._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    options: "-c default_transaction_read_only=on -c statement_timeout=15000",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool;
}
