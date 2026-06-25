# Mockup Plataforma — Base Grupo Flesan

Plantilla base para arrancar nuevas plataformas internas con el stack y el sistema de diseño de
Grupo Flesan ya instalados. Pensada para copiar esta carpeta completa como punto de partida de un
proyecto nuevo.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — tokens de marca definidos en `app/globals.css` (bloque `@theme`, no hay
  `tailwind.config.js`; así funciona Tailwind v4)
- **next-themes** — modo oscuro vía clase `.dark`, toggle en `components/theme-toggle.tsx`
- **lucide-react** — iconos
- **sonner** — notificaciones (`toast(...)`)
- **clsx + tailwind-merge** — utilidad `cn()` en `lib/cn.ts`

No incluye base de datos, IA ni mapas — agrega esas dependencias solo si la plataforma nueva las
necesita.

## Cómo arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Estructura

```
app/
  layout.tsx              ← fonts (Barlow vía next/font), ThemeProvider, Toaster
  globals.css             ← tokens de marca + clases utilitarias (.btn-flesan, .card, .chip-flesan, etc.)
  (dashboard)/
    layout.tsx             ← Sidebar + TopBar + BreadcrumbProvider
    page.tsx                ← Inicio (cards de navegación)
    ui-kit/page.tsx          ← guía de estilo viva — referencia de todos los componentes
    configuracion/page.tsx   ← ejemplo de formulario
components/
  sidebar.tsx              ← menú lateral colapsable
  topbar.tsx               ← barra superior (título / breadcrumb + theme toggle)
  theme-provider.tsx, theme-toggle.tsx, breadcrumb-context.tsx
lib/
  nav.ts                   ← ÚNICA fuente de las secciones del menú (sidebar y topbar la consumen)
  cn.ts                    ← merge de clases Tailwind
public/brand/              ← logos oficiales (color / blanco / negro)
```

## Cómo personalizar para una plataforma nueva

1. **Nombre de la plataforma**: reemplaza "Nombre Plataforma" en `components/sidebar.tsx` y en
   `metadata.title` de `app/layout.tsx`.
2. **Secciones del menú**: edita `lib/nav.ts` — `NAV_ITEMS`. Sidebar y TopBar se actualizan solos,
   no hace falta tocarlos.
3. **Páginas**: agrega carpetas dentro de `app/(dashboard)/` siguiendo el patrón de
   `configuracion/page.tsx`.
4. **Componentes nuevos**: usa las clases ya definidas en `globals.css`
   (`.btn-flesan*`, `.card`, `.chip-flesan`, `.badge`, `.field-input`, `.skeleton`) antes de
   inventar estilos nuevos — revisa `/ui-kit` en la app corriendo para verlas en vivo.
5. **Logos**: usa los PNG de `public/brand/`. Versión BLANCO sobre fondos oscuros/rojos, NEGRO o
   COLOR sobre fondos claros — nunca el logo a color sobre rojo.

## Sistema de diseño completo

Para guía de marca completa (voz y tono, copy, logos de sub-marcas, accesibilidad), está instalada
como skill de Claude Code en `~/.claude/skills/grupo-flesan-skill/`. Ábrela con Claude Code y pide
`/grupo-flesan-skill` o simplemente pide "diseña X con la marca Flesan".
