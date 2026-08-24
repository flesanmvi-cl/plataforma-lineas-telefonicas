"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";
import { esAdmin } from "@/lib/roles";
import { useUsuarioActual } from "@/components/user-context";
import { CiaLogo } from "@/components/cia-logo";

const COLLAPSE_KEY = "sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const user = useUsuarioActual();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || esAdmin(user?.role));

  // Persistido en localStorage para que sobreviva un refresh, no solo la
  // navegacion dentro de la SPA.
  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const fechaHoy = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 border-r border-border bg-surface transition-[width] duration-150",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo + nombre de la plataforma + toggle de colapsar */}
      <div className={cn("flex items-center h-14 border-b border-border", collapsed ? "justify-center px-2 gap-1.5" : "gap-3 px-5")}>
        <CiaLogo className="w-5 h-5 shrink-0 text-flesan-red dark:text-white" />
        {!collapsed && (
          // TODO: reemplazar por el nombre real de la plataforma.
          <span className="font-display text-sm font-bold italic uppercase tracking-[0.04em] text-text leading-none whitespace-nowrap flex-1">
            Nombre <span className="text-flesan-red">Plataforma</span>
          </span>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex items-center justify-center w-6 h-6 shrink-0 border border-border-strong text-muted hover:text-text hover:border-text cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-[0.8125rem] h-[0.8125rem]" />
          ) : (
            <ChevronLeft className="w-[0.8125rem] h-[0.8125rem]" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map(({ href, label, icon: IconCmp }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 font-label text-xs tracking-[0.08em] uppercase transition-colors border-l-2 whitespace-nowrap",
                collapsed && "justify-center px-0",
                active
                  ? "border-flesan-red bg-bg text-text"
                  : "border-transparent text-muted hover:text-text hover:bg-bg",
              )}
            >
              <IconCmp className={`w-4 h-4 ${cn("shrink-0", active ? "text-flesan-red" : "")}`} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: ejemplo de accion rapida + fecha. Agrega aqui los enlaces
          propios de la plataforma siguiendo este mismo patron. */}
      <div className={cn("border-t border-border flex flex-col gap-1 py-3", collapsed ? "px-2" : "px-3")}>
        <a
          href="https://www.grupoflesan.com"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "Sitio Corporativo" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 font-label text-xs tracking-[0.08em] uppercase text-muted hover:text-flesan-red cursor-pointer whitespace-nowrap",
            collapsed && "justify-center px-0",
          )}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && "Sitio Corporativo"}
        </a>
        {!collapsed && (
          <p className="label-meta text-[9px] text-faint px-3 mt-1 leading-relaxed">Actualizado {fechaHoy}</p>
        )}
      </div>
    </aside>
  );
}
