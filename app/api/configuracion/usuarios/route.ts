import { NextResponse } from "next/server";
import { asignarUsuario, listarUsuariosAsignados } from "@/lib/usuarios-db";
import { esAdmin, type Rol } from "@/lib/roles";
import { respuestaNoAutorizado, sesionConRol } from "@/lib/auth-guard";

const ROLES_ASIGNABLES = new Set<Rol>(["admin", "member"]);

export async function GET() {
  const sesion = await sesionConRol();
  if (!sesion || !esAdmin(sesion.role)) return respuestaNoAutorizado();

  try {
    return NextResponse.json({ usuarios: await listarUsuariosAsignados() });
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
    await asignarUsuario({ correo, nombre: nombre || null, rol });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    return NextResponse.json({ error: "Error al guardar en la base de datos." }, { status: 500 });
  }
}
