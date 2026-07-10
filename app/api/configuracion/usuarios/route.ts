import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { esAdmin, type Rol } from "@/lib/roles";
import { respuestaNoAutorizado, sesionConRol } from "@/lib/auth-guard";

/** Reemplaza "<slug>" por el nombre de esta plataforma — misma tabla que lib/usuarios-db.ts. */
const TABLA_USUARIOS = "flesan_procesos.cia_<slug>_usuarios";

const ROLES_ASIGNABLES = new Set<Rol>(["admin", "member"]);

export async function GET() {
  const sesion = await sesionConRol();
  if (!sesion || !esAdmin(sesion.role)) return respuestaNoAutorizado();

  try {
    const { rows } = await pool.query<{ correo: string; nombre: string | null; rol: string }>(
      `SELECT correo, nombre, rol FROM ${TABLA_USUARIOS} ORDER BY nombre NULLS LAST, correo`,
    );
    return NextResponse.json({ usuarios: rows });
  } catch (error) {
    console.error("Error al leer usuarios:", error);
    return NextResponse.json({ error: "Error al leer la base de datos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sesion = await sesionConRol();
  if (!sesion || !esAdmin(sesion.role)) return respuestaNoAutorizado();

  let body: { correo?: string; nombre?: string; rol?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const correo = (body.correo ?? "").trim().toLowerCase();
  const nombre = (body.nombre ?? "").trim();
  const rol = body.rol as Rol;

  if (!correo || !ROLES_ASIGNABLES.has(rol)) {
    return NextResponse.json({ error: "Correo o rol inválidos." }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO ${TABLA_USUARIOS} (correo, nombre, rol, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (correo) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol, updated_at = now()`,
      [correo, nombre || null, rol],
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    return NextResponse.json({ error: "Error al guardar en la base de datos." }, { status: 500 });
  }
}
