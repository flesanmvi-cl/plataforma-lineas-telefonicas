"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavStyleToggle } from "@/components/nav-style-toggle";
import { UserMenu } from "@/components/user-menu";
import { useUsuarioActual } from "@/components/user-context";
import { useBreadcrumbContext } from "@/components/breadcrumb-context";
import { cn } from "@/lib/cn";
import { esAdmin } from "@/lib/roles";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";

// Alternativa al Sidebar: toda la navegación vive arriba, en una barra
// sticky, y el contenido ocupa el ancho completo (sin riel lateral). Misma
// fuente de items (lib/nav.ts) que Sidebar/TopBar para no duplicar la lista.
export function TopNav() {
  const pathname = usePathname();
  const { state: breadcrumb } = useBreadcrumbContext();
  const user = useUsuarioActual();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || esAdmin(user?.role));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="flex items-center gap-3 h-14 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Inicio">
          <div className="w-5 h-5 flex items-center justify-center border border-flesan-red flex-shrink-0">
            <span className="font-display text-xs font-bold italic text-flesan-red leading-none">F</span>
          </div>
          {/* TODO: reemplazar por el nombre real de la plataforma. */}
          <span className="hidden sm:block font-display text-sm font-bold italic uppercase tracking-[0.04em] text-text leading-none whitespace-nowrap">
            Nombre <span className="text-flesan-red">Plataforma</span>
          </span>
        </Link>

        {/* Navegación (desktop) */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {items.map(({ href, label, icon: IconCmp }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 font-label text-xs tracking-[0.08em] uppercase border-b-2 transition-colors",
                  active
                    ? "border-flesan-red text-text"
                    : "border-transparent text-muted hover:text-text",
                )}
              >
                <IconCmp className={cn("w-4 h-4 shrink-0", active && "text-flesan-red")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <NavStyleToggle />
        <ThemeToggle />
        <UserMenu name={user?.name} email={user?.email} image={user?.image} role={user?.role} />
      </div>

      {/* Nav móvil: misma fila horizontal scrolleable que en TopBar. */}
      <nav className="flex md:hidden items-center gap-1 px-4 pb-2 overflow-x-auto">
        {items.map(({ href, label, icon: IconCmp }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 font-label text-[10px] tracking-[0.06em] uppercase whitespace-nowrap border",
                active ? "border-flesan-red text-text" : "border-transparent text-muted",
              )}
            >
              <IconCmp className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Breadcrumb: segunda fila delgada, solo cuando una página publica su propia ruta. */}
      {breadcrumb && (
        <nav className="hidden md:flex items-center gap-1.5 h-9 px-4 lg:px-6 border-t border-border font-label text-xs tracking-[0.08em] uppercase">
          {breadcrumb.items.map((label, i) => {
            const esUltimo = i === breadcrumb.items.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-[0.6875rem] h-[0.6875rem] text-faint shrink-0" />}
                {esUltimo ? (
                  <span className="text-text truncate max-w-[280px]">{label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => breadcrumb.onNavigate(i)}
                    className="text-faint hover:text-flesan-red truncate max-w-[200px] cursor-pointer"
                  >
                    {label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      )}
    </header>
  );
}
