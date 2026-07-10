import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { esAdmin } from "@/lib/roles";
import { respuestaNoAutorizado, sesionConRol } from "@/lib/auth-guard";

/** Reemplaza "<slug>" por el nombre de esta plataforma — misma tabla que lib/usuarios-db.ts. */
const TABLA_USUARIOS = "flesan_procesos.cia_<slug>_usuarios";

/** Revierte al usuario al default (member) — no queda "sin rol". */
export async function DELETE(_request: Request, { params }: { params: Promise<{ correo: string }> }) {
  const sesion = await sesionConRol();
  if (!sesion || !esAdmin(sesion.role)) return respuestaNoAutorizado();

  const { correo } = await params;
  const correoNormalizado = decodeURIComponent(correo).toLowerCase();

  try {
    await pool.query(`DELETE FROM ${TABLA_USUARIOS} WHERE correo = $1`, [correoNormalizado]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error al eliminar en la base de datos." }, { status: 500 });
  }
}
