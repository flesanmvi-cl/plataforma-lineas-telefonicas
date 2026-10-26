import { NextResponse } from "next/server";
import { requerirAcceso, respuestaErrorInterno } from "@/lib/auth-guard";
import { listarEmpresas } from "@/lib/lineas/maestros";

/** Empresas de Chile (docs/MIGRACION.md §9). */
export async function GET(req: Request) {
  const acceso = await requerirAcceso(req);
  if (!acceso.ok) return acceso.respuesta;
  try {
    return NextResponse.json({ empresas: await listarEmpresas() });
  } catch (error) {
    return respuestaErrorInterno(error, "maestros/empresas");
  }
}
