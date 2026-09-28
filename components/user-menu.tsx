"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronsUpDown, LogOut, SlidersHorizontal } from "lucide-react";
import { cerrarSesion } from "@/lib/auth-actions";
import { etiquetaRol, type Rol } from "@/lib/roles";
import { ThemeToggle } from "@/components/theme-toggle";
import { OpcionesUsuarioModulos } from "@/components/modulos";
import { PanelPersonalizar } from "@/components/personalizar";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Rol;
}

function iniciales(name?: string | null, email?: string | null): string {
  const base = name?.trim() || email?.split("@")[0] || "?";
  const partes = base.split(/[\s.]+/).filter(Boolean);
  const dos = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return (dos || base[0] || "?").toUpperCase();
}

export function UserMenu({ name, email, image, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={email ?? undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border border-border-strong text-muted hover:text-text hover:border-text cursor-pointer overflow-hidden"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-label text-[10px] font-bold tracking-tight text-text">
            {iniciales(name, email)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-40 w-60 rounded-flesan overflow-hidden border border-border bg-surface shadow-lg"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text truncate">{name || email}</p>
            {email && <p className="text-xs text-muted truncate">{email}</p>}
            {role && (
              <span className="mt-2 inline-block font-label text-[9px] tracking-[0.12em] uppercase text-faint border border-border px-1.5 py-0.5">
                {etiquetaRol(role)}
              </span>
            )}
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-2.5 font-label text-xs tracking-[0.08em] uppercase text-muted hover:text-flesan-red hover:bg-bg cursor-pointer"
            >
              <LogOut className="w-[0.9375rem] h-[0.9375rem] shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, email, image, className }: Pick<UserMenuProps, "name" | "email" | "image"> & { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center shrink-0 rounded-full border border-border-strong bg-surface-2 overflow-hidden ${className ?? ""}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-label text-[0.6875rem] font-bold tracking-tight text-text">{iniciales(name, email)}</span>
      )}
    </span>
  );
}

/**
 * Tarjeta de usuario del pie del sidebar: foto, nombre y rol. Al presionarla abre hacia
 * arriba el menú con el correo, el tema claro/oscuro y Cerrar sesión. `colapsado` deja solo la foto.
 */
export function UserCard({ name, email, image, role, colapsado = false }: UserMenuProps & { colapsado?: boolean }) {
  const [open, setOpenBase] = useState(false);
  // Panel «Personalizar», al costado del menú; se cierra junto con él.
  const [personalizar, setPersonalizar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function setOpen(v: boolean | ((prev: boolean) => boolean)) {
    setOpenBase((prev) => {
      const siguiente = typeof v === "function" ? v(prev) : v;
      if (!siguiente) setPersonalizar(false);
      return siguiente;
    });
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={colapsado ? (name ?? email ?? undefined) : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          colapsado
            ? "flex items-center justify-center w-full py-1 cursor-pointer"
            : `flex items-center gap-2.5 w-full p-2 rounded-flesan text-left cursor-pointer transition-colors hover:bg-bg ${open ? "bg-bg" : ""}`
        }
      >
        <Avatar name={name} email={email} image={image} className="w-8 h-8" />
        {!colapsado && (
          <>
            <span className="flex flex-col min-w-0 leading-tight">
              <span className="text-sm font-semibold text-text truncate">{name || email}</span>
              {role && (
                <span className="font-label text-[0.625rem] tracking-[0.12em] uppercase text-faint">{etiquetaRol(role)}</span>
              )}
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 ml-auto shrink-0 text-faint" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute bottom-full mb-2 z-50 w-60 rounded-flesan overflow-hidden border border-border bg-surface shadow-lg ${colapsado ? "left-0" : "left-0 right-0 w-auto"}`}
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text truncate">{name || email}</p>
            {email && <p className="text-xs text-muted truncate">{email}</p>}
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
            <span className="font-label text-xs tracking-[0.08em] uppercase text-muted">Tema</span>
            <span className="ml-auto">
              <ThemeToggle />
            </span>
          </div>
          <OpcionesUsuarioModulos />
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={personalizar}
            onClick={() => setPersonalizar((v) => !v)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-border font-label text-xs tracking-[0.08em] uppercase cursor-pointer hover:bg-bg ${
              personalizar ? "text-text bg-bg" : "text-muted hover:text-text"
            }`}
          >
            <SlidersHorizontal className="w-[0.9375rem] h-[0.9375rem] shrink-0" />
            Personalizar
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
          <form action={cerrarSesion}>
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-2.5 font-label text-xs tracking-[0.08em] uppercase text-muted hover:text-flesan-red hover:bg-bg cursor-pointer"
            >
              <LogOut className="w-[0.9375rem] h-[0.9375rem] shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
      {open && personalizar && (
        <PanelPersonalizar onCerrar={() => setPersonalizar(false)} className="absolute left-full bottom-0 ml-3 z-50" />
      )}
    </div>
  );
}
