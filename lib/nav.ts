import { FlaskConical, LayoutGrid, Palette, Settings } from "lucide-react";
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

/** Ruta de migas según la URL: Inicio › Sección › Subpanel. */
export function migasDe(pathname: string) {
  return crearMigas(pathname, NAV_ITEMS, NAV_CONFIG);
}
