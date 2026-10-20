import { LayoutGrid, LayoutTemplate, Palette, Settings } from "lucide-react";
import { PLANTILLAS } from "@/components/portada/datos";
import { crearMigas, type NavItem } from "@/lib/nav-base";

export * from "@/lib/nav-base";

// PLATAFORMA · menú propio de cada plataforma (este archivo sí se edita en cada una).
// Fuente única de navegación: Sidebar, TopBar (ruta de migas) y las tabs de sección
// consumen estos arreglos para no mantener listas sincronizadas a mano. Los tipos y las
// funciones comunes vienen de `lib/nav-base.ts` (shell).

/** Nombre en el encabezado del sidebar: texto normal + palabra destacada en rojo. `texto` puede
 * quedar vacío si el nombre es una sola palabra (va toda en rojo). */
export const NOMBRE_PLATAFORMA = { texto: "Nombre", destacado: "Plataforma" };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  { href: "/ui-kit", label: "Guía de Estilo", icon: Palette },
  // Portada con la lista de pantallas tipo (components/portada/plantillas.tsx); cada plantilla se
  // abre desde ahí y su nombre se agrega a la ruta de migas (migasDe, abajo).
  { href: "/plantillas", label: "Plantillas", icon: LayoutTemplate },
];

/** Configuración no va en el menú principal: vive en el pie del sidebar. Está abierta a todos y
 * cada sección se muestra según el rol: «Usuarios y roles» siempre es solo de administradores
 * (gate en app/(dashboard)/configuracion/usuarios/layout.tsx). En una plataforma donde toda la
 * configuración es de administración, se marca `adminOnly: true` el ítem completo. */
export const NAV_CONFIG: NavItem = {
  href: "/configuracion",
  label: "Configuración",
  icon: Settings,
  children: [
    { href: "/configuracion/personalizacion", label: "Mi personalización" },
    { href: "/configuracion/presentaciones", label: "Presentaciones" },
    { href: "/configuracion/comentarios", label: "Mis comentarios" },
    { href: "/configuracion/acerca", label: "Acerca de" },
    { href: "/configuracion/usuarios", label: "Usuarios y roles", adminOnly: true },
    { href: "/configuracion/avisos", label: "Avisos", adminOnly: true },
    { href: "/configuracion/fuentes-datos", label: "Fuentes de datos", adminOnly: true },
    { href: "/configuracion/actividad", label: "Registro de actividad", adminOnly: true },
    { href: "/configuracion/notificaciones", label: "Notificaciones y correos", adminOnly: true },
  ],
};

/** Ruta de migas según la URL: Inicio › Sección › Subpanel. Dentro de Plantillas se agrega el
 * nombre de la plantilla abierta (no son subpaneles del menú). */
export function migasDe(pathname: string) {
  const migas = crearMigas(pathname, NAV_ITEMS, NAV_CONFIG);
  const plantilla = PLANTILLAS.find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`));
  return plantilla ? [...migas, { label: `${plantilla.nombre} · ${plantilla.ejemplo}`, href: plantilla.href }] : migas;
}
