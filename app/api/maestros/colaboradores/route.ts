import { NextResponse } from "next/server";
import { requerirAcceso, respuestaErrorInterno } from "@/lib/auth-guard";
import { buscarColaboradores } from "@/lib/lineas/maestros";

/** Colaboradores activos por RUT o nombre: `?q=<texto>` (desde 3 caracteres, hasta 20 resultados). */
export async function GET(req: Request) {
  const acceso = await requerirAcceso(req);
  if (!acceso.ok) return acceso.respuesta;
  const texto = new URL(req.url).searchParams.get("q") ?? "";
  try {
    return NextResponse.json({ colaboradores: await buscarColaboradores(texto) });
  } catch (error) {
    return respuestaErrorInterno(error, "maestros/colaboradores");
  }
}
