import { NextResponse } from "next/server";
import { pool as poolTransaccional } from "@/lib/db";
import { baseLineasConfigurada, consultar } from "@/lib/lineas-db";
import { requerirAcceso, respuestaErrorInterno } from "@/lib/auth-guard";
import {
  ESTRUCTURA_PLATAFORMA,
  ESTRUCTURA_TRANSACCIONAL,
  SQL_COLUMNAS,
  faltantes,
  parametrosColumnas,
  type TablaRequerida,
} from "@/lib/lineas/estructura";

/**
 * Estado de las conexiones (solo administradores): si cada base responde y si tiene las tablas y
 * columnas que la plataforma usa (lib/lineas/estructura.ts). Solo lee information_schema. Sirve
 * para verificar la base de desarrollo y cada despliegue. El detalle de un error de conexión va
 * al log del servidor, no a la respuesta.
 */
type Estado =
  | { estado: "sin configurar" }
  | { estado: "sin conexión" }
  | { estado: "ok" }
  | { estado: "incompleta"; faltantes: string[] };

type FilaColumna = { esquema: string; tabla: string; columna: string };

async function revisar(
  nombre: string,
  configurada: boolean,
  requeridas: TablaRequerida[],
  leerColumnas: (parametros: [string[], string[]]) => Promise<FilaColumna[]>,
): Promise<Estado> {
  if (!configurada) return { estado: "sin configurar" };
  let existentes: FilaColumna[];
  try {
    existentes = await leerColumnas(parametrosColumnas(requeridas));
  } catch (error) {
    console.error(`[estado-conexiones] ${nombre}:`, error);
    return { estado: "sin conexión" };
  }
  const lista = faltantes(requeridas, existentes);
  return lista.length === 0 ? { estado: "ok" } : { estado: "incompleta", faltantes: lista };
}

export async function GET(req: Request) {
  const acceso = await requerirAcceso(req, { admin: true });
  if (!acceso.ok) return acceso.respuesta;

  try {
    const [plataforma, transaccional] = await Promise.all([
      revisar("plataforma", baseLineasConfigurada, ESTRUCTURA_PLATAFORMA, (p) => consultar<FilaColumna>(SQL_COLUMNAS, p)),
      revisar("transaccional", Boolean(process.env.DATABASE_URL), ESTRUCTURA_TRANSACCIONAL, async (p) => {
        const { rows } = await poolTransaccional.query<FilaColumna>(SQL_COLUMNAS, p);
        return rows;
      }),
    ]);
    return NextResponse.json({ plataforma, transaccional });
  } catch (error) {
    return respuestaErrorInterno(error, "estado-conexiones");
  }
}
