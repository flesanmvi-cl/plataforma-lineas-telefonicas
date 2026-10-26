import { NextResponse } from "next/server";
import { requerirAcceso, respuestaError, respuestaErrorInterno } from "@/lib/auth-guard";
import { listarCentros } from "@/lib/lineas/maestros";

/** Centros de costo activos de una empresa y unidad: `?empresa=<rut>&unidad=<nombre>`. Con
 * `&actual=<código>`, incluye además el centro que el registro ya tiene, aunque esté cerrado. */
export async function GET(req: Request) {
  const acceso = await requerirAcceso(req);
  if (!acceso.ok) return acceso.respuesta;
  const parametros = new URL(req.url).searchParams;
  const empresa = parametros.get("empresa")?.trim();
  const unidad = parametros.get("unidad")?.trim();
  if (!empresa || !unidad) return respuestaError(400, "Faltan la empresa o la unidad de negocio.");
  try {
    const centros = await listarCentros(empresa, unidad, parametros.get("actual") ?? undefined);
    return NextResponse.json({ centros });
  } catch (error) {
    return respuestaErrorInterno(error, "maestros/centros");
  }
}
