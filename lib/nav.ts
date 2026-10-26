import { LayoutGrid, Phone, Settings, Smartphone } from "lucide-react";
import { crearMigas, type NavItem } from "@/lib/nav-base";

export * from "@/lib/nav-base";

// PLATAFORMA · menú de Líneas Telefónicas (este archivo sí se edita en cada plataforma).
// Fuente única de navegación: Sidebar, TopBar (ruta de migas) y las tabs de sección consumen
// estos arreglos. Los tipos y las funciones comunes vienen de `lib/nav-base.ts` (shell).

/** Nombre en el encabezado del sidebar: texto normal + palabra destacada en rojo. */
export const NOMBRE_PLATAFORMA = { texto: "Líneas", destacado: "Telefónicas" };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  {
    href: "/lineas",
    label: "Líneas",
    icon: Phone,
    children: [
      { href: "/lineas/chile", label: "Chile" },
      { href: "/lineas/peru", label: "Perú" },
    ],
  },
  { href: "/dispositivos", label: "Dispositivos", icon: Smartphone },
];

/** Configuración vive en el pie del sidebar y está abierta a todos. Las secciones `adminOnly` van
 * además dentro de app/(dashboard)/configuracion/(admin)/, cuyo layout las protege en el servidor.
 * «Usuarios y roles» se suma con el módulo M8 (docs/PLAN.md). */
export const NAV_CONFIG: NavItem = {
  href: "/configuracion",
  label: "Configuración",
  icon: Settings,
  children: [
    { href: "/configuracion/personalizacion", label: "Mi personalización" },
    { href: "/configuracion/comentarios", label: "Mis comentarios" },
    { href: "/configuracion/acerca", label: "Acerca de" },
    { href: "/configuracion/marcas-modelos", label: "Marcas y modelos", adminOnly: true },
  ],
};

/** Ruta de migas según la URL: Inicio › Sección › Subpanel. */
export function migasDe(pathname: string) {
  return crearMigas(pathname, NAV_ITEMS, NAV_CONFIG);
}
