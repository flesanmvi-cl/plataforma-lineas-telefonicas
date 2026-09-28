# Shell estándar de las plataformas

El «shell» es el marco común de todas las plataformas de la CIA que nacen de este mockup:
sidebar, barra superior, navegación, escala fluida, densidad compacta, tokens de marca y los
componentes del marco (acceso a portales, estado de los datos, pantalla completa, Personalizar).
El contenido de cada plataforma (pantallas, gráficos, datos) no es parte del shell.

Versión vigente: **shell-v1** (etiqueta git `shell-v1` en este repo).

## Archivos del shell (se copian tal cual, no se editan por plataforma)

| Archivo | Qué es |
|---|---|
| `app/shell.css` | Tokens `@theme`, escala fluida, densidad, clases base (`.btn-flesan`, `.card`…), portales, estado de los datos |
| `app/(dashboard)/loading.tsx` | Pantalla de carga al navegar |
| `app/fonts/**` (Barlow, Barlow Condensed, Barlow Semi Condensed, Inter Tight) | Fuentes auto-hospedadas |
| `components/app-shell.tsx` | Marco: sidebar + barra superior + contenido |
| `components/sidebar.tsx` | Sidebar con menú flotante, pie con Configuración, colapsar y usuario |
| `components/topbar.tsx` | Barra superior: ruta de migas, estado de los datos, pantalla completa |
| `components/user-menu.tsx` | Tarjeta de usuario y su menú (tema, Personalizar, cerrar sesión) |
| `components/theme-toggle.tsx` | Claro / oscuro |
| `components/pantalla-completa.tsx` | Pantalla completa para reportería |
| `components/estado-datos.tsx` | Indicador de frescura de los datos |
| `components/personalizar.tsx` | Panel «Personalizar» del menú de usuario |
| `components/portales/*` | Acceso a Portal CIA / SAP Work Zone (lengüeta, media luna, cinta, burbuja) |
| `components/breadcrumb-context.tsx` | Niveles de drilldown en la ruta de migas |
| `components/cia-logo.tsx` | Símbolo CIA |
| `components/section-tabs.tsx`, `components/page-header.tsx` | Pestañas de sección y encabezado de página |
| `lib/nav-base.ts` | Tipos y funciones de navegación (`isNavActive`, `gruposDe`, `crearMigas`…) |
| `lib/cn.ts` | `cn()` (clsx + tailwind-merge) |

Dependencias npm: `clsx`, `tailwind-merge`, `lucide-react`, `next-themes`.

## Archivos de cada plataforma (se adaptan)

| Archivo | Qué define |
|---|---|
| `lib/nav.ts` | `NOMBRE_PLATAFORMA`, `NAV_ITEMS` (menú), `NAV_CONFIG` (Configuración, en el pie), `migasDe`. Reexporta `lib/nav-base.ts` |
| `components/modulos.tsx` | Módulos opcionales enchufados al shell (ej. Presentaciones). Sin módulos: versión mínima abajo |
| `lib/estado-datos.ts` | `obtenerEstadoDatos()` (fuente real de la fecha) y `CADA_HORAS`. Sin datos que refrescar: devolver `null` |
| `app/globals.css` | `@import "tailwindcss"; @import "./shell.css";` y luego lo propio de la plataforma |
| `app/layout.tsx` | Fuentes (`next/font/local`, con `--font-inter-tight`), metadata, ThemeProvider |
| `app/(dashboard)/layout.tsx` | Sesión y providers propios, y `<AppShell>` alrededor de `children` |

El shell además espera que la plataforma tenga (todas las derivadas del mockup ya los tienen):
`components/user-context.tsx` (`useUsuarioActual`), `lib/roles.ts` (`esAdmin`, `etiquetaRol`, `Rol`)
y `lib/auth-actions.ts` (`cerrarSesion`).

### `components/modulos.tsx` mínimo (sin módulos opcionales)

```tsx
"use client";

import type { ReactNode } from "react";

// PLATAFORMA · módulos opcionales enchufados al shell. Esta plataforma no usa ninguno.
export function ModulosProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function useVistaEspecialModulos(_children: ReactNode): ReactNode | null {
  return null;
}
export function BotonesBarraModulos() {
  return null;
}
export function OpcionesUsuarioModulos() {
  return null;
}
export function SuperposicionesModulos() {
  return null;
}
```

## Módulos opcionales

- **Presentaciones** (armar PDF / PowerPoint con vistas): `components/presentaciones/*`,
  `lib/presentaciones/*`, `app/(dashboard)/presentaciones/page.tsx`, el bloque «MODO DIAPOSITIVA»
  de `app/globals.css`, el ítem en `NAV_ITEMS` y la versión de `components/modulos.tsx` de este
  repo. Dependencias: `html-to-image`, `jspdf`, `pptxgenjs` (y el reemplazo de `node:` en
  `next.config.ts`). En revisión; por ahora no se instala en las plataformas.
- **Descarga a Excel**: `lib/exportar/excel.ts`, `components/boton-excel.tsx`. Dependencia: `exceljs`.

## Cómo aplicar el shell a una plataforma

1. Rama `estandar-shell-v1` en la plataforma.
2. Copiar los archivos del shell (tabla de arriba).
3. Convertir su menú a `lib/nav.ts` (sacar Configuración de `NAV_ITEMS` a `NAV_CONFIG`) y poner su nombre.
4. Crear `components/modulos.tsx` (mínimo) y `lib/estado-datos.ts` (su fuente real, o `null`).
5. `app/globals.css`: dejar solo lo propio después de `@import "./shell.css"`.
6. `app/(dashboard)/layout.tsx`: usar `<AppShell>`; borrar el sidebar/topbar viejos si quedaron sin uso.
7. `npx tsc --noEmit`, lint y revisar en Chrome (claro, oscuro, sidebar colapsado).
