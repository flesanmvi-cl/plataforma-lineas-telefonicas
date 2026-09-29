import type { LucideIcon } from "lucide-react";

// SHELL · parte común de la navegación (igual en todas las plataformas; no editar por plataforma).
// Los ítems del menú de cada plataforma viven en `lib/nav.ts`, que reexporta esto.

/** Versión del estándar de plataformas (shell) que tiene esta plataforma. Se muestra en Acerca de. */
export const VERSION_SHELL = "shell-v1.1";

/** Subpanel de un ítem del menú. Se muestra en el menú flotante del sidebar. */
export interface NavChild {
  href: string;
  label: string;
  /** Encabezado del grupo dentro del menú flotante (ej. "Vistas", "Detalle"). Los hijos
   * consecutivos con el mismo grupo quedan juntos; sin grupo, van al inicio sin encabezado. */
  grupo?: string;
  /** Solo para administradores (ej. «Usuarios y roles» dentro de Configuración). */
  adminOnly?: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Oculta el ítem del menú y bloquea la ruta para roles no-admin (ver
   * app/(dashboard)/configuracion/layout.tsx para el patrón de gate). */
  adminOnly?: boolean;
  /** Con hijos, el ítem abre un menú flotante con sus subpaneles en vez de navegar.
   * Sin hijos, es un enlace directo. Ej. Ventas → [Gerencia, Vendedor]. */
  children?: NavChild[];
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** El hijo que corresponde a la ruta: coincidencia exacta primero, luego el prefijo más largo. */
export function hijoActivo(item: NavItem, pathname: string): NavChild | undefined {
  const hijos = item.children ?? [];
  return (
    hijos.find((h) => h.href === pathname) ??
    hijos
      .filter((h) => h.href !== item.href && isNavActive(pathname, h.href))
      .sort((a, b) => b.href.length - a.href.length)[0]
  );
}

/** Agrupa los hijos por `grupo`, respetando el orden en que se declararon. */
export function gruposDe(children: NavChild[]): { grupo?: string; items: NavChild[] }[] {
  const grupos: { grupo?: string; items: NavChild[] }[] = [];
  for (const hijo of children) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.grupo === hijo.grupo) ultimo.items.push(hijo);
    else grupos.push({ grupo: hijo.grupo, items: [hijo] });
  }
  return grupos;
}

export interface Miga {
  label: string;
  href: string;
}

/** Ruta de migas según la URL: Inicio › Sección › Subpanel. Los niveles de drilldown
 * propios de una página (estado interno) se agregan aparte vía BreadcrumbContext. */
export function crearMigas(pathname: string, items: NavItem[], config?: NavItem): Miga[] {
  const inicio = items[0];
  const migas: Miga[] = [{ label: inicio.label, href: inicio.href }];
  const item = [...items, ...(config ? [config] : [])].find((i) => i.href !== "/" && isNavActive(pathname, i.href));
  if (!item) return migas;
  migas.push({ label: item.label, href: item.href });
  const hijo = hijoActivo(item, pathname);
  if (hijo && hijo.href !== item.href) migas.push({ label: hijo.label, href: hijo.href });
  return migas;
}

/** Accesos directos del pie del sidebar (enlaces externos, abren en otra pestaña).
 * Se pueden sobrescribir por .env; si una URL queda vacía, su acceso no se muestra.
 * Ojo: son NEXT_PUBLIC_*, se inlinean en `next build`. */
export const SAP_WORKZONE_URL =
  process.env.NEXT_PUBLIC_SAP_WORKZONE_URL ??
  "https://workzone-4is5tnfp.workzonehr.cfapps.br10.hana.ondemand.com/site#workzone-home&/home";
export const PORTAL_CIA_URL = process.env.NEXT_PUBLIC_PORTAL_CIA_URL ?? "https://portal-cia.flesanmvi.com";
