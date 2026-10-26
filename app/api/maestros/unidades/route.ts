import { NextResponse } from "next/server";
import { requerirAcceso, respuestaError, respuestaErrorInterno } from "@/lib/auth-guard";
import { listarUnidades } from "@/lib/lineas/maestros";

/** Unidades de negocio de una empresa: `?empresa=<rut>`. */
export async function GET(req: Request) {
  const acceso = await requerirAcceso(req);
  if (!acceso.ok) return acceso.respuesta;
  const empresa = new URL(req.url).searchParams.get("empresa")?.trim();
  if (!empresa) return respuestaError(400, "Falta la empresa.");
  try {
    return NextResponse.json({ unidades: await listarUnidades(empresa) });
  } catch (error) {
    return respuestaErrorInterno(error, "maestros/unidades");
  }
}
