"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { cerrarSesion } from "@/lib/auth-actions";
import { etiquetaRol, type Rol } from "@/lib/roles";

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
          className="absolute right-0 top-10 z-40 w-60 border border-border bg-surface shadow-lg"
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
              <LogOut size={15} className="shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
