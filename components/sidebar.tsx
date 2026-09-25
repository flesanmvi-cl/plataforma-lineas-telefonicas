"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  NAV_CONFIG,
  NAV_ITEMS,
  PORTAL_CIA_URL,
  SAP_WORKZONE_URL,
  gruposDe,
  hijoActivo,
  isNavActive,
  type NavItem,
} from "@/lib/nav";
import { esAdmin } from "@/lib/roles";
import { useUsuarioActual } from "@/components/user-context";
import { CiaLogo } from "@/components/cia-logo";
import { UserCard } from "@/components/user-menu";

const COLLAPSE_KEY = "sidebar-collapsed";

// Margen para cruzar del ítem al menú flotante sin que se cierre.
const CIERRE_MS = 150;

const claseItem = (active: boolean, collapsed: boolean) =>
  cn(
    "flex items-center gap-3 w-full px-3 py-2.5 font-label text-xs tracking-[0.08em] uppercase transition-colors border-l-2 whitespace-nowrap cursor-pointer",
    collapsed && "justify-center px-0",
    active ? "border-flesan-red bg-bg text-text" : "border-transparent text-muted hover:text-text hover:bg-bg",
  );

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const cierre = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const user = useUsuarioActual();
  const admin = esAdmin(user?.role);
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || admin);

  // Persistido en localStorage para que sobreviva un refresh, no solo la
  // navegacion dentro de la SPA.
  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  // Al navegar, el menú flotante se cierra.
  useEffect(() => setAbierto(null), [pathname]);

  // Clic fuera o Esc cierran el menú flotante.
  useEffect(() => {
    if (!abierto) return;
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setAbierto(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function abrir(href: string) {
    if (cierre.current) clearTimeout(cierre.current);
    setAbierto(href);
  }

  function cerrarLuego() {
    if (cierre.current) clearTimeout(cierre.current);
    cierre.current = setTimeout(() => setAbierto(null), CIERRE_MS);
  }

  const configActiva = isNavActive(pathname, NAV_CONFIG.href);
  const ConfigIcon = NAV_CONFIG.icon;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 relative z-40 border-r border-border bg-surface transition-[width] duration-150",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Encabezado: logo + nombre + colapsar (su borde calza con el de la barra superior), y bajo
          el título los accesos a los portales */}
      <div className={cn((SAP_WORKZONE_URL || PORTAL_CIA_URL) && "border-b border-border")}>
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
        {(SAP_WORKZONE_URL || PORTAL_CIA_URL) && (
          <div className={cn("flex gap-1.5 py-3", collapsed ? "flex-col items-center px-2" : "px-4")}>
            {SAP_WORKZONE_URL && (
              <AccesoDirecto
                href={SAP_WORKZONE_URL}
                label="WZ"
                nombre="SAP Workzone"
                collapsed={collapsed}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sap-logo.svg" alt="" className="h-4 w-auto shrink-0" />
              </AccesoDirecto>
            )}
            {PORTAL_CIA_URL && (
              <AccesoDirecto
                href={PORTAL_CIA_URL}
                label="CIA"
                nombre="Portal CIA"
                collapsed={collapsed}
              >
                <CiaLogo className="w-4 h-4 shrink-0 text-flesan-red dark:text-white" />
              </AccesoDirecto>
            )}
          </div>
        )}
      </div>

      {/* Navegación: enlace directo, o menú flotante si el ítem tiene subpaneles */}
      <nav ref={navRef} aria-label="Principal" className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map((item) =>
          item.children?.length ? (
            <ItemConSubpaneles
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              abierto={abierto === item.href}
              onAbrir={() => abrir(item.href)}
              onCerrarLuego={cerrarLuego}
            />
          ) : (
            <ItemDirecto key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ),
        )}
      </nav>

      {/* Pie: configuración (solo admin) y usuario; el tema vive en el menú del usuario */}
      <div className={cn("border-t border-border flex flex-col gap-2 py-3", collapsed ? "px-2 items-center" : "px-3")}>
        {admin && (
          <Link
            href={NAV_CONFIG.href}
            title={collapsed ? NAV_CONFIG.label : undefined}
            aria-current={configActiva ? "page" : undefined}
            className={claseItem(configActiva, collapsed)}
          >
            <ConfigIcon className={cn("w-4 h-4 shrink-0", configActiva && "text-flesan-red")} />
            {!collapsed && NAV_CONFIG.label}
          </Link>
        )}
        <div className="w-full">
          <UserCard name={user?.name} email={user?.email} image={user?.image} role={user?.role} colapsado={collapsed} />
        </div>
      </div>
    </aside>
  );
}

// Acceso directo a un portal externo: ícono con la sigla abajo, bajo el título; el
// nombre completo aparece en un globo al pasar el mouse o con foco de teclado. Colapsado, solo
// el ícono. Abre en otra pestaña.
function AccesoDirecto({
  href,
  label,
  nombre,
  collapsed,
  children,
}: {
  href: string;
  label: string;
  nombre: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  const idGlobo = `portal-${label.toLowerCase()}`;
  return (
    <span className={cn("group relative flex", !collapsed && "flex-1")}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${nombre} en otra pestaña`}
        aria-describedby={idGlobo}
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-1.5 rounded-flesan-sm font-label text-xs font-bold tracking-[0.08em] uppercase text-muted hover:text-text hover:bg-bg transition-colors whitespace-nowrap",
          collapsed ? "w-8" : "flex-1",
        )}
      >
        {children}
        {!collapsed && label}
      </a>
      <span
        id={idGlobo}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-flesan-sm bg-text text-bg px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          collapsed ? "left-full top-1/2 -translate-y-1/2 ml-2" : "top-full left-1/2 -translate-x-1/2 mt-1.5",
        )}
      >
        {nombre}
      </span>
    </span>
  );
}

function ItemDirecto({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const active = isNavActive(pathname, item.href);
  const IconCmp = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={claseItem(active, collapsed)}
    >
      <IconCmp className={cn("w-4 h-4 shrink-0", active && "text-flesan-red")} />
      {!collapsed && item.label}
    </Link>
  );
}

interface ItemConSubpanelesProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  abierto: boolean;
  onAbrir: () => void;
  onCerrarLuego: () => void;
}

// Ítem con subpaneles: se abre al pasar el mouse o al presionarlo (táctil y teclado); se
// cierra al salir, con Esc o con un clic fuera. Muestra un menú flotante al costado del
// sidebar, agrupado por `grupo`.
function ItemConSubpaneles({ item, pathname, collapsed, abierto, onAbrir, onCerrarLuego }: ItemConSubpanelesProps) {
  const active = isNavActive(pathname, item.href);
  const actual = hijoActivo(item, pathname);
  const IconCmp = item.icon;
  const idMenu = `subpaneles-${item.href.replace(/\W+/g, "-")}`;

  return (
    <div className="relative" onMouseEnter={onAbrir} onMouseLeave={onCerrarLuego}>
      <button
        type="button"
        onClick={onAbrir}
        title={collapsed ? item.label : undefined}
        aria-expanded={abierto}
        aria-controls={idMenu}
        className={cn(claseItem(active, collapsed), abierto && !active && "bg-bg text-text")}
      >
        <IconCmp className={cn("w-4 h-4 shrink-0", active && "text-flesan-red")} />
        {!collapsed && (
          <>
            {item.label}
            <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-faint" />
          </>
        )}
      </button>

      {abierto && (
        // pl-3 transparente: puente para que el mouse cruce sin cerrar el menú.
        <div id={idMenu} className="absolute left-full top-0 pl-3 z-50">
          <div className="w-56 rounded-flesan border border-border bg-surface shadow-lg p-1.5 animate-fade-in">
            {collapsed && (
              <p className="font-label text-xs font-semibold tracking-[0.08em] uppercase text-text px-3 pt-2 pb-1">
                {item.label}
              </p>
            )}
            {gruposDe(item.children ?? []).map(({ grupo, items }, i) => (
              <div key={grupo ?? i} className={cn(i > 0 && "mt-1 pt-1 border-t border-border")}>
                {grupo && (
                  <p className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint px-3 pt-2 pb-1">
                    {grupo}
                  </p>
                )}
                {items.map((hijo) => {
                  const esActual = actual?.href === hijo.href;
                  return (
                    <Link
                      key={hijo.href}
                      href={hijo.href}
                      aria-current={esActual ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-flesan-sm text-sm transition-colors",
                        esActual ? "bg-bg text-text font-semibold" : "text-muted hover:text-text hover:bg-bg",
                      )}
                    >
                      {esActual && <span className="w-1.5 h-1.5 bg-flesan-red shrink-0" />}
                      {hijo.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
