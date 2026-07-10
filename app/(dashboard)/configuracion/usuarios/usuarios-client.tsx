"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { etiquetaRol, type Rol } from "@/lib/roles";
import type { Colaborador } from "@/lib/colaboradores-db";
import type { UsuarioAsignado } from "@/lib/usuarios-db";

/**
 * Ejemplo de página `adminOnly` con datos reales: asigna/revoca el rol admin/member de
 * cualquier colaborador de Flesan (buscado en el maestro corporativo) y lo persiste en
 * BBDD — ver docs/ARQUITECTURA.md. Requiere DATABASE_URL configurado; si esta plataforma
 * no necesita roles persistidos, borra esta carpeta y usa /configuracion/page.tsx tal cual.
 */

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`request_failed_${r.status}`);
    return r.json();
  });

export function UsuariosClient() {
  const { data: dataColaboradores, isLoading: cargandoColaboradores } = useSWR<{ colaboradores: Colaborador[] }>(
    "/api/configuracion/colaboradores",
    fetcher,
  );
  const {
    data: dataUsuarios,
    isLoading: cargandoUsuarios,
    mutate: mutateUsuarios,
  } = useSWR<{ usuarios: UsuarioAsignado[] }>("/api/configuracion/usuarios", fetcher);

  const colaboradores = useMemo(() => dataColaboradores?.colaboradores ?? [], [dataColaboradores]);
  const usuarios = useMemo(() => dataUsuarios?.usuarios ?? [], [dataUsuarios]);
  const usuariosPorCorreo = useMemo(() => new Map(usuarios.map((u) => [u.correo, u])), [usuarios]);

  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Colaborador | null>(null);
  const [rolForm, setRolForm] = useState<Rol>("member");
  const [guardando, setGuardando] = useState(false);
  const [revocando, setRevocando] = useState<string | null>(null);

  const colaboradoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return colaboradores;
    return colaboradores.filter((c) => c.nombre.toLowerCase().includes(q) || c.correo.toLowerCase().includes(q));
  }, [colaboradores, busqueda]);

  function seleccionarColaborador(c: Colaborador) {
    setSeleccionado(c);
    setRolForm(usuariosPorCorreo.get(c.correo)?.rol ?? "member");
  }

  async function guardar() {
    if (!seleccionado || guardando) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/configuracion/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: seleccionado.correo, nombre: seleccionado.nombre, rol: rolForm }),
      });
      if (!res.ok) throw new Error("request_failed");
      await mutateUsuarios();
      toast.success(`Rol guardado para ${seleccionado.nombre}.`);
    } catch {
      toast.error("No se pudo guardar el rol. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function quitarAcceso(correo: string) {
    if (revocando) return;
    setRevocando(correo);
    try {
      const res = await fetch(`/api/configuracion/usuarios/${encodeURIComponent(correo)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("request_failed");
      await mutateUsuarios();
      if (seleccionado?.correo === correo) setRolForm("member");
      toast.success("Rol revocado — vuelve al default (member).");
    } catch {
      toast.error("No se pudo revocar el rol. Intenta de nuevo.");
    } finally {
      setRevocando(null);
    }
  }

  return (
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <p className="label-eyebrow brand-bullet mb-3">Configuración</p>
        <h1 className="display-title text-3xl sm:text-4xl text-text mb-4">Usuarios y roles</h1>
        <p className="body-lede max-w-2xl">
          Asigna el rol administrador o miembro a cualquier colaborador de Flesan. Sin rol asignado
          acá, un colaborador entra como miembro por defecto.
        </p>
      </div>

      {/* Buscar colaborador + asignar rol */}
      <div className="card flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-96 md:border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                className="field-input !pl-8 !py-2 text-sm"
                placeholder="Buscar por nombre o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 max-h-96 overflow-y-auto">
            {cargandoColaboradores ? (
              <p className="p-4 text-sm text-muted">Cargando colaboradores…</p>
            ) : colaboradoresFiltrados.length === 0 ? (
              <p className="p-4 text-sm text-muted">Sin resultados.</p>
            ) : (
              colaboradoresFiltrados.map((c) => {
                const activo = seleccionado?.correo === c.correo;
                const asignado = usuariosPorCorreo.get(c.correo);
                return (
                  <button
                    key={c.correo}
                    type="button"
                    onClick={() => seleccionarColaborador(c)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 border-b border-border/60 transition-colors cursor-pointer",
                      activo ? "bg-flesan-red/10" : "hover:bg-bg",
                    )}
                  >
                    <p className="text-sm font-medium text-text truncate">{c.nombre}</p>
                    <p className="text-xs text-muted truncate">{c.correo}</p>
                    {asignado && <span className="badge mt-1">{etiquetaRol(asignado.rol)}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 p-5">
          {!seleccionado ? (
            <div className="h-full flex items-center justify-center text-muted text-sm">
              Elige un colaborador de la lista para asignarle rol.
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <p className="text-base font-semibold text-text">{seleccionado.nombre}</p>
                <p className="text-sm text-muted">{seleccionado.correo}</p>
                {seleccionado.cargo && <p className="text-xs text-faint mt-0.5">{seleccionado.cargo}</p>}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="label-meta text-muted">Rol</span>
                <select className="field-input" value={rolForm} onChange={(e) => setRolForm(e.target.value as Rol)}>
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" className="btn-flesan btn-flesan-primary" onClick={guardar} disabled={guardando}>
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usuarios con rol asignado */}
      <div>
        <h2 className="label-meta text-muted mb-3">Usuarios con rol asignado</h2>
        {cargandoUsuarios ? (
          <p className="text-sm text-muted">Cargando…</p>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-muted">Nadie tiene un rol administrado todavía.</p>
        ) : (
          <div className="card divide-y divide-border">
            {usuarios.map((u) => (
              <div key={u.correo} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{u.nombre ?? u.correo}</p>
                  <p className="text-xs text-muted truncate">{u.correo}</p>
                </div>
                <span className="badge">{etiquetaRol(u.rol)}</span>
                <button
                  type="button"
                  onClick={() => quitarAcceso(u.correo)}
                  disabled={revocando === u.correo}
                  className="btn-flesan btn-flesan-ghost btn-flesan-sm !h-7 !px-2 !text-[10px] flex items-center gap-1 disabled:opacity-50"
                  title="Quitar rol administrado"
                >
                  <Trash2 size={12} />
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
