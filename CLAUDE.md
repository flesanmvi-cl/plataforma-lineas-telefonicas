# Grupo Flesan — Contexto para Claude Code

Este proyecto es **Líneas Telefónicas**, una plataforma interna construida sobre la plantilla base
de plataformas de Grupo Flesan (repositorio `flesanmvi-cl/plataforma-lineas-telefonicas`; la
plantilla queda como remoto `mockup`). Ya trae el stack de frontend y el sistema de diseño de marca
instalados — antes de escribir UI nueva, lee este archivo y los puntos de referencia abajo.

## Esta plataforma: Líneas Telefónicas

Reemplaza al aplicativo Laravel `gf_telefonia_grupoflesan`: registro de líneas telefónicas de
Chile y Perú y de los dispositivos móviles asignados a colaboradores. Antes de tocar datos o
pantallas, lee:

- `docs/MIGRACION.md` — levantamiento del aplicativo antiguo: pantallas, campos, reglas, tablas y
  errores conocidos (E1–E14).
- `docs/PLAN.md` — decisiones, arquitectura, seguridad y módulos (M0–M10) con su estado.

Reglas propias. **Prevalecen** sobre «Base de datos de una plataforma nueva» (desvío aprobado,
`docs/PLAN.md` P0):

- Se escribe en los esquemas del aplicativo antiguo, `s_lineas` y `seguridadapp` de `srvpd_bd`
  (`DATABASE_URL_PLATAFORMA`, `lib/lineas-db.ts`), no en un esquema `cia_<slug>`. La transaccional
  `flesan` (`DATABASE_URL`, `lib/db.ts`) solo se lee, y la conexión lo fuerza.
- Mientras convivan los dos aplicativos, todo lo que se escribe queda con el formato del antiguo
  (`docs/PLAN.md` §2.3): fechas en UTC sin zona (`AHORA_UTC`), `sl_area` `'1'`/`'2'`, mismo texto
  de historial, usuarios en `aplicacion_usuario`/`usuario_rol` de la aplicación 23.
- Nunca se prueba escribiendo en `srvpd_bd`: es productiva en la práctica. Para desarrollar,
  `npm run db:dev` levanta una base local (Postgres embebido) con la misma estructura y datos de
  prueba (`db/desarrollo/`).
- Acceso (M2): solo entran los usuarios activos de la aplicación 23 de `seguridadapp`
  (`lib/lineas/usuarios.ts`), resueltos de nuevo en cada petición. Perfiles: `admin` (rol 74),
  `procesos` y `soporte` (roles 75 y 76, según el área de la columna `dni`); quien no es
  administrador solo ve y escribe su área. `CIA_ADMIN_EMAILS` es la llave maestra.
- Todo route handler de negocio empieza con `requerirAcceso()` (`lib/auth-guard.ts`), que devuelve
  correo, id, rol y área, y usa SQL parametrizado con `tablaLineas()`/`tablaSeguridad()`. Toda
  página que lee datos llama a `exigirAcceso()`, y las de administración a
  `exigirAdministrador()` (`lib/acceso-paginas.ts`), antes de leer: el gate del layout solo no
  basta, porque Next renderiza layout y página en paralelo (`docs/PLAN.md` §3.2).
- Para probar perfiles en desarrollo, `AUTH_DISABLED=true` con `DEV_CORREO` (un usuario de
  `db/desarrollo/002_datos.sql`).
- Solo Chile por ahora: Perú es de consulta, sin conexión a `grupo_flesan_pe`.
- Las pruebas de estructura de una base van por `/api/estado-conexiones` (solo administradores),
  contra la lista de `lib/lineas/estructura.ts`.

## Stack (no cambiar sin que el usuario lo pida)

- Next.js 15 App Router + React 19 + TypeScript
- **Tailwind v4**: no hay `tailwind.config.js`. Los tokens de marca viven en `app/shell.css`
  dentro del bloque `@theme` (CSS nativo de Tailwind v4), no en JS.
- Fonts vía `next/font/local` en `app/layout.tsx` (Barlow, Barlow Condensed, Barlow Semi
  Condensed), con los `.ttf` auto-hospedados en `app/fonts/` — variables CSS `--font-barlow*`
  consumidas por `--font-display/body/label` en `shell.css`. Deliberadamente NO se usa
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
   contenedor de ancho de todas las páginas (hasta 120rem + padding), no reintroducir `max-w-5xl`
   suelto en cada page.
   **Gráficos, KPIs, tablas, botones y formularios se eligen en el laboratorio de diseño**, que
   es otro proyecto: `proyectos/_prototipos/laboratorio-diseno` (galería, comparador y panel
   «Tema» por sección). Aquí solo está lo vigente: la Guía de estilo (`/ui-kit`), las piezas de
   `components/estandar/` y `lib/estandar/` (tema fijo en `lib/estandar/estandar.ts`, hoy
   provisorio) y las de `components/reporte/`. Las pantallas tipo (Reportes Tipo 1-5,
   Formularios Tipo 1-3 y el constructor de maquetas) se quitaron de esta plataforma: se ven en
   el mockup (remoto `mockup`). `/ui-kit` solo se publica en desarrollo. Para traer
   algo del laboratorio, sigue «Cómo llega algo nuevo desde el laboratorio» en
   `docs/UI-KIT-CATALOG.md`; no reinstales aquí sus librerías de exploración.
2. Si necesitas un color o tamaño que no está en `app/shell.css` (`@theme`), agrégalo ahí como
   variable CSS — no hardcodees hex sueltos en componentes ni reintroduzcas un
   `tailwind.config.js`.
3. Para añadir o reordenar secciones del menú: edita únicamente `lib/nav.ts` (`NAV_ITEMS`).
   `components/sidebar.tsx` y `components/topbar.tsx` lo consumen — no dupliques la lista de
   navegación en ambos archivos.
   - Un ítem **sin** `children` es enlace directo; **con** `children` abre un menú flotante con
     sus subpaneles (agrupables con `grupo`). Pedido típico: «Ventas: Gerencia, Vendedor» o
     «Ventas: Vistas [Gerencia, Vendedor] / Detalle [Por proyecto]».
   - Configuración (`NAV_CONFIG`), el tema y el usuario viven en el pie del sidebar. La barra
     superior solo muestra la ruta (`migasDe`); los niveles de drilldown de una página se
     agregan con `BreadcrumbContext`.

## Shell estándar (lo común a todas las plataformas)

El marco común (sidebar, barra superior, navegación, escala, tokens, portales, estado de los
datos) es el «shell» y se replica en las plataformas: ver `docs/SHELL.md` (qué archivos son
shell y cuáles define cada plataforma). Un cambio en un archivo del shell aquí se propaga
después a las plataformas; lo propio de esta plantilla va en `lib/nav.ts`, `components/modulos.tsx`,
`lib/estado-datos.ts` y `app/globals.css`.

## Base de datos de una plataforma nueva

**En esta plataforma rige el desvío aprobado de «Esta plataforma», arriba.** Lo que sigue es la
regla general del estándar.

Reglas completas en README.md, «Base de datos de la plataforma». Lo esencial: **la base
transaccional (`DATABASE_URL`, `lib/db.ts`) se usa solo para leer** (maestro de colaboradores,
centros de gestión, movimientos…); **todo lo que se escribe va en el esquema propio `cia_<slug>`**
de la base de QA (`DATABASE_URL_PLATAFORMA` + `ESQUEMA_PLATAFORMA`, `lib/configuracion-db.ts`).
Tablas del estándar en `db/002_configuracion.sql` (y `db/001_usuarios_roles.sql` si hay roles
administrados, `db/003_notificaciones.sql` si hay campanita); todo SQL se muestra y aprueba antes de ejecutarlo en QA. El mockup no tiene esquema.

## Escala y densidad (default de la plantilla)

- Raíz **fluida suave**: `html { font-size: clamp(14px, calc(8.5px + 0.5vw), 16px) }`. Todo va
  en rem; no hardcodear `px` en tamaños de texto ni de controles.
- Densidad **compacta** por defecto: tokens `--densidad-*` en `:root` (`app/shell.css`), que
  consumen `.btn-flesan`, `.field-input`, `.dens-card`, `.dens-gap`, `.dens-control`, `.dens-tabla`
  y las celdas de TB-1xx. Para un formulario largo, `data-densidad="comoda"` en su contenedor.
  En tarjetas nuevas usar `dens-card` en vez de `p-5`/`p-6`.
- La comparación de alternativas de escala quedó en el laboratorio de diseño.

## Skill de marca completa

La guía completa de marca (voz y tono, copy, logos de sub-marcas, reglas de accesibilidad,
templates de presentación) está instalada como skill en
`~/.claude/skills/grupo-flesan-skill/README.md`. Útil para:
- Copy en español (tono institucional, tagline oficial "Confianza que construye")
- Variantes de logo y cuándo usar cada una
- Paleta extendida y reglas de contraste

**Importante**: el `tokens/tailwind.config.js` de esa skill es para **Tailwind v3** — no lo copies
tal cual a este proyecto (Tailwind v4). Usa sus valores de color/tipografía como referencia y
agrégalos al bloque `@theme` de `app/shell.css`, igual que ya está hecho aquí.

## Reglas de marca rápidas

- Dos capas de color (decisión de Sebastián, 2026-10-20, a prueba):
  - **Cascarón** (sidebar, barra superior, títulos, Configuración, portadas del mockup): rojo
    Flesan `#E30613` como único acento, con `.btn-flesan`.
  - **Contenido** (reportes, formularios, gráficos): **Tableau 10**. Los botones son los del
    estándar (`BotonLab`, `components/estandar`) y su primario toma el azul `#4E79A7`; los datos
    usan la misma paleta (`ESTANDAR.tema.paleta = "tableau"` y `--color-serie-1…8`).
  - Esto reemplaza la regla anterior («rojo único acento también en el contenido» y la paleta de
    series del panel de Conflicto de Interés). Receta y piezas de los reportes tipo: `docs/REPORTES.md`.
- Títulos de vista y de sección en la letra del reporte (Inter Tight 700, recta, caja normal:
  `.titulo-vista` / `.display-title`). Barlow Condensed itálica solo para el nombre de la
  plataforma (sidebar y login). Decisión de Sebastián del 2026-10-21; difiere de la skill de marca.
- Copy en español (Chile), institucional, sin emojis, sin "líder/revolucionar/increíble".
- Tagline oficial: "Confianza que construye" (no inventar otras).
- Bullet de marca: cuadrado rojo (`.brand-bullet`), no usar viñetas redondas.
