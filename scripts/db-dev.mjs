// Base de DESARROLLO local: Postgres 16 embebido (paquete embedded-postgres), sin Docker ni
// permisos de administrador. La primera vez crea en .db-dev/ una base con la estructura de
// s_lineas y seguridadapp y datos de prueba (db/desarrollo/*.sql, en orden); después solo la
// levanta. Queda corriendo hasta Ctrl+C.
//
// Nunca se prueba escribiendo en srvpd_bd: es productiva en la práctica (docs/PLAN.md §2.4).
//
//   npm run db:dev               levanta la base (y la crea la primera vez)
//   npm run db:dev -- --reset    la borra y la crea de nuevo con los datos de prueba
//
// En .env.local: DATABASE_URL_PLATAFORMA=postgresql://postgres:postgres@localhost:54329/lineas_dev
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const RAIZ = path.resolve(import.meta.dirname, "..");
const DIRECTORIO = path.join(RAIZ, ".db-dev");
const CARPETA_SQL = path.join(RAIZ, "db", "desarrollo");
const PUERTO = Number(process.env.DB_DEV_PUERTO ?? 54329);
const BASE = "lineas_dev";
const URL = `postgresql://postgres:postgres@localhost:${PUERTO}/${BASE}`;

if (process.argv.includes("--reset")) rmSync(DIRECTORIO, { recursive: true, force: true });
const nueva = !existsSync(DIRECTORIO);

const servidor = new EmbeddedPostgres({
  databaseDir: DIRECTORIO,
  user: "postgres",
  password: "postgres",
  port: PUERTO,
  persistent: true,
  // UTF-8 como producción (hay columnas con tilde, como "sl_fecha_actualización"). Sin esto,
  // en Windows initdb toma la codificación del sistema (WIN1252).
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
});

async function crear() {
  await servidor.createDatabase(BASE);
  const cliente = new pg.Client({ connectionString: URL });
  await cliente.connect();
  try {
    for (const archivo of readdirSync(CARPETA_SQL).filter((a) => a.endsWith(".sql")).sort()) {
      await cliente.query(readFileSync(path.join(CARPETA_SQL, archivo), "utf8"));
      console.log(`  aplicado db/desarrollo/${archivo}`);
    }
  } finally {
    await cliente.end();
  }
}

try {
  if (nueva) {
    console.log("Creando la base de desarrollo en .db-dev/ …");
    await servidor.initialise();
  }
  await servidor.start();
  if (nueva) await crear();
} catch (error) {
  console.error("No se pudo levantar la base de desarrollo:", error?.message ?? error);
  await servidor.stop().catch(() => {});
  // Una creación a medias no se reutiliza: la próxima vez parte de cero.
  if (nueva) rmSync(DIRECTORIO, { recursive: true, force: true });
  process.exit(1);
}

console.log(`Base de desarrollo lista: ${URL}`);
console.log("Ctrl+C para detenerla.");

let deteniendo = false;
async function detener() {
  if (deteniendo) return;
  deteniendo = true;
  await servidor.stop().catch(() => {});
  process.exit(0);
}
process.on("SIGINT", detener);
process.on("SIGTERM", detener);
