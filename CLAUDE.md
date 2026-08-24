# Grupo Flesan — Contexto para Claude Code

Este proyecto es la **plantilla base** de plataformas internas de Grupo Flesan. Ya trae el stack
de frontend y el sistema de diseño de marca instalados — antes de escribir UI nueva, lee este
archivo y los puntos de referencia abajo.

## Stack (no cambiar sin que el usuario lo pida)

- Next.js 15 App Router + React 19 + TypeScript
- **Tailwind v4**: no hay `tailwind.config.js`. Los tokens de marca viven en `app/globals.css`
  dentro del bloque `@theme` (CSS nativo de Tailwind v4), no en JS.
- Fonts vía `next/font/local` en `app/layout.tsx` (Barlow, Barlow Condensed, Barlow Semi
  Condensed), con los `.ttf` auto-hospedados en `app/fonts/` — variables CSS `--font-barlow*`
  consumidas por `--font-display/body/label` en `globals.css`. Deliberadamente NO se usa
  `next/font/google`: en redes corporativas con inspección TLS, Next no logra descargar la fuente
  en caliente y cae a una fuente de respaldo sin avisar (visualmente distinto a lo esperado). Si
  agregas un nuevo peso/estilo, descárgalo desde el repo `google/fonts` en GitHub (licencia OFL) y
  súmalo al arreglo `src` correspondiente.
- Dark mode con `next-themes`, atributo `class` (`.dark`). Nunca usar `prefers-color-scheme`
  directo en componentes; los tokens semánticos (`--color-bg`, `--color-text`, etc.) ya resuelven
  ambos temas.
- Iconos: `lucide-react` exclusivamente, stroke por defecto.

## Antes de crear un componente nuevo

1. Mira `app/(dashboard)/ui-kit/page.tsx` (o corre `npm run dev` y visita `/ui-kit`) — ahí están
   todas las clases utilitarias ya disponibles: `.btn-flesan` (+ `-primary/-ghost/-dark/-lg/-sm`),
   `.card` / `.card-hover`, `.chip-flesan` (+ `.is-active`), `.badge`, `.field-input`, `.skeleton`,
   `.display-title`, `.label-eyebrow`, `.label-meta`, `.body-lede`, `.brand-bullet`,
   `.toggle-pill` (+ `.toggle-pill-option.is-active`) y `.page-shell` — este último es el
   contenedor de ancho de todas las páginas (84rem + padding), no reintroducir `max-w-5xl`
   suelto en cada page. `/ui-kit` tiene además tabs (KPIs/Gráficos/Tablas/Botones) con una
   vitrina de componentes reales, cada uno con
   un código de catálogo (ej. `GL-201`) — ver `docs/UI-KIT-CATALOG.md` para el índice completo
   código → archivo. Si el usuario pide "usar el gráfico/KPI/tabla/botón <código>", el componente
   ya existe en `components/charts|kpis|tables/`; ábrelo y reutilízalo en vez de escribirlo de cero.
2. Si necesitas un color o tamaño que no está en `app/globals.css` (`@theme`), agrégalo ahí como
   variable CSS — no hardcodees hex sueltos en componentes ni reintroduzcas un
   `tailwind.config.js`.
3. Para añadir o reordenar secciones del menú: edita únicamente `lib/nav.ts` (`NAV_ITEMS`).
   `components/sidebar.tsx` y `components/topbar.tsx` lo consumen — no dupliques la lista de
   navegación en ambos archivos.

## Skill de marca completa

La guía completa de marca (voz y tono, copy, logos de sub-marcas, reglas de accesibilidad,
templates de presentación) está instalada como skill en
`~/.claude/skills/grupo-flesan-skill/README.md`. Útil para:
- Copy en español (tono institucional, tagline oficial "Confianza que construye")
- Variantes de logo y cuándo usar cada una
- Paleta extendida y reglas de contraste

**Importante**: el `tokens/tailwind.config.js` de esa skill es para **Tailwind v3** — no lo copies
tal cual a este proyecto (Tailwind v4). Usa sus valores de color/tipografía como referencia y
agrégalos al bloque `@theme` de `app/globals.css`, igual que ya está hecho aquí.

## Reglas de marca rápidas

- Rojo Flesan `#E30613` — única marca de acento. No usar otros rojos para call-to-action.
- Copy en español (Chile), institucional, sin emojis, sin "líder/revolucionar/increíble".
- Tagline oficial: "Confianza que construye" (no inventar otras).
- Bullet de marca: cuadrado rojo (`.brand-bullet`), no usar viñetas redondas.
