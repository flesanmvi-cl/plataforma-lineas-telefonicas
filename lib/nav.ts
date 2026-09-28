import { FlaskConical, LayoutGrid, Palette, Presentation, Settings, type LucideIcon } from "lucide-react";

// Fuente única de navegación: Sidebar, TopBar (ruta de migas) y las tabs de sección
// consumen estos arreglos para no mantener listas sincronizadas a mano.

/** Subpanel de un ítem del menú. Se muestra en el menú flotante del sidebar. */
export interface NavChild {
  href: string;
  label: string;
  /** Encabezado del grupo dentro del menú flotante (ej. "Vistas", "Detalle"). Los hijos
   * consecutivos con el mismo grupo quedan juntos; sin grupo, van al inicio sin encabezado. */
  grupo?: string;
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

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  {
    href: "/ui-kit",
    label: "Guía de Estilo",
    icon: Palette,
    children: [
      { href: "/ui-kit", label: "Estándar", grupo: "Vigente" },
      { href: "/ui-kit/laboratorio/graficos", label: "Gráficos", grupo: "Laboratorio" },
      { href: "/ui-kit/laboratorio/kpis", label: "KPIs", grupo: "Laboratorio" },
      { href: "/ui-kit/laboratorio/tablas", label: "Tablas", grupo: "Laboratorio" },
      { href: "/ui-kit/laboratorio/botones", label: "Botones", grupo: "Laboratorio" },
      { href: "/ui-kit/laboratorio/formularios", label: "Formularios", grupo: "Laboratorio" },
      { href: "/ui-kit/laboratorio/contexto", label: "En contexto", grupo: "Laboratorio" },
    ],
  },
  // Presentaciones armadas desde las vistas (agregar desde la barra superior; se guardan en este navegador).
  { href: "/presentaciones", label: "Presentaciones", icon: Presentation },
  {
    // Pantallas de prueba armadas solo con el estándar vigente (lib/lab-graficos/estandar.ts):
    // sirven para ver cómo queda una plataforma real con lo elegido.
    href: "/pruebas",
    label: "Pruebas",
    icon: FlaskConical,
    children: [
      { href: "/pruebas/reportes/tipo-1", label: "Reporte Tipo 1", grupo: "Reportes" },
      { href: "/pruebas/reportes/tipo-2", label: "Reporte Tipo 2", grupo: "Reportes" },
      { href: "/pruebas/reportes/tipo-3", label: "Reporte Tipo 3", grupo: "Reportes" },
      { href: "/pruebas/formularios/tipo-1", label: "Formulario Tipo 1", grupo: "Formularios" },
      { href: "/pruebas/formularios/tipo-2", label: "Formulario Tipo 2", grupo: "Formularios" },
      { href: "/pruebas/formularios/tipo-3", label: "Formulario Tipo 3", grupo: "Formularios" },
    ],
  },
];

/** Configuración no va en el menú principal: vive en el pie del sidebar. Se declara aquí
 * para que la ruta de migas la reconozca igual que al resto. */
export const NAV_CONFIG: NavItem = {
  href: "/configuracion",
  label: "Configuración",
  icon: Settings,
  adminOnly: true,
  children: [{ href: "/configuracion/usuarios", label: "Usuarios" }],
};

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
export function migasDe(pathname: string): Miga[] {
  const inicio = NAV_ITEMS[0];
  const migas: Miga[] = [{ label: inicio.label, href: inicio.href }];
  const item = [...NAV_ITEMS, NAV_CONFIG].find((i) => i.href !== "/" && isNavActive(pathname, i.href));
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
