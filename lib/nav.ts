import { LayoutGrid, Palette, Settings, type LucideIcon } from "lucide-react";

// Fuente única de navegación: Sidebar y TopBar consumen este arreglo para
// no mantener dos listas de secciones sincronizadas a mano.
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Oculta el ítem del menú y bloquea la ruta para roles no-admin (ver
   * app/(dashboard)/configuracion/layout.tsx para el patrón de gate). */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  { href: "/ui-kit", label: "Guía de Estilo", icon: Palette },
  { href: "/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function tituloDe(pathname: string): string {
  const exacto = NAV_ITEMS.find((item) => item.href === pathname);
  if (exacto) return exacto.label;
  const match = NAV_ITEMS.find((item) => item.href !== "/" && pathname.startsWith(item.href));
  return match ? match.label : NAV_ITEMS[0].label;
}
