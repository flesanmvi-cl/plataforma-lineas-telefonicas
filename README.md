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
- **Auth.js v5** — login con Google Workspace corporativo + roles (`admin`/`member`), ver sección
  de auth más abajo
- **swr** — data fetching client-side (`components/swr-provider.tsx`)

Sin base de datos por defecto — `lib/db.ts` (pool de Postgres) ya está instalado pero queda inerte
mientras no definas `DATABASE_URL` en el `.env`. Actívalo solo si la plataforma nueva lo necesita
(ver sección "Base de datos y roles persistidos" más abajo y `docs/ARQUITECTURA.md`).

## Cómo arrancar

```bash
npm install
cp .env.example .env.local   # completa AUTH_GOOGLE_ID/SECRET, AUTH_SECRET, etc.
npm run dev
```

Abre `http://localhost:3000` (o el puerto que hayas puesto en `PORT=` dentro de `.env.local` — `npm run
dev`/`npm run start` lo leen solos, no hace falta pasar `-p`). Sin `.env.local` completo el login con
Google no funcionará, pero el resto
de la UI (ui-kit, componentes) se puede revisar igual navegando directo a esas rutas antes de que
el middleware las proteja... salvo que ya esté corriendo `middleware.ts`, que protege *todo* el
sitio — completa el `.env.local` antes de levantar el server.

## Estructura

```
auth.ts / auth.config.ts    ← Auth.js v5: config edge-safe (auth.config.ts) + rol y handlers (auth.ts)
middleware.ts               ← gate de sesión para toda la app (excepto /login, /api/auth, /api/health)
app/
  layout.tsx              ← fonts (Barlow vía next/font), ThemeProvider, Toaster, widget CIA
  globals.css             ← tokens de marca + clases utilitarias (.btn-flesan, .card, .chip-flesan, etc.)
  login/page.tsx           ← pantalla de login (botón "Iniciar sesión con Google")
  api/
    auth/[...nextauth]/route.ts  ← handlers estándar de Auth.js
    health/route.ts              ← healthcheck para Docker (sin auth)
    feedback/route.ts            ← BFF del widget CIA (POST)
    feedback/mios/route.ts       ← BFF del widget CIA (GET historial propio)
  (dashboard)/
    layout.tsx             ← Sidebar + TopBar + BreadcrumbProvider + UserProvider + SwrProvider
    page.tsx                ← Inicio (cards de navegación)
    ui-kit/page.tsx          ← guía de estilo viva — referencia de todos los componentes
    configuracion/
      layout.tsx             ← gate por rol (adminOnly, ver lib/nav.ts)
      page.tsx                ← landing de Configuración: grilla de secciones adminOnly
      usuarios/                ← ejemplo funcional de panel admin con datos reales (opcional, ver abajo)
  api/
    configuracion/
      usuarios/route.ts, [correo]/route.ts  ← listar/asignar/revocar rol (requiere DATABASE_URL)
      colaboradores/route.ts                ← buscador de colaboradores para asignar rol
components/
  sidebar.tsx, topbar.tsx  ← consumen lib/nav.ts (adminOnly) y muestran el UserMenu
  user-menu.tsx, user-context.tsx  ← menú de usuario + contexto de sesión para client components
  swr-provider.tsx         ← wrapper de SWRConfig
  theme-provider.tsx, theme-toggle.tsx, breadcrumb-context.tsx
lib/
  nav.ts                   ← ÚNICA fuente de las secciones del menú (sidebar y topbar la consumen)
  roles.ts                 ← tipo Rol ("admin" | "member") + helpers esAdmin/etiquetaRol
  auth-actions.ts          ← Server Action cerrarSesion()
  auth-guard.ts            ← helper de sesión+rol para route handlers
  db.ts                    ← pool de Postgres (pg), inerte sin DATABASE_URL
  usuarios-db.ts           ← rol persistido en BBDD (opcional, ver "Base de datos" abajo)
  colaboradores-db.ts      ← lee el maestro de colaboradores (opcional, junto con usuarios-db.ts)
  cn.ts                    ← merge de clases Tailwind
types/cia-feedback.d.ts    ← tipado JSX del web component <cia-feedback>
public/brand/              ← logos oficiales (color / blanco / negro)
db/001_usuarios_roles.sql  ← migración SQL de la tabla de roles (aplicar a mano, opcional)
maestro_colaborador.sql    ← query al maestro corporativo de RR.HH. (opcional, junto con lo de arriba)
docs/ARQUITECTURA.md       ← referencia técnica de auth/datos/API (plantilla a completar)
Dockerfile, docker-compose.yml, .dockerignore  ← build/despliegue en contenedor
.env.example                ← variables de entorno necesarias (auth, widget, DB/email opcionales)
```

## Cómo personalizar para una plataforma nueva

1. **Nombre de la plataforma**: reemplaza "Nombre Plataforma" en `components/sidebar.tsx`,
   `app/login/page.tsx`, `metadata.title` de `app/layout.tsx`, y `data-plataforma` del widget CIA
   (mismo archivo).
2. **Secciones del menú**: edita `lib/nav.ts` — `NAV_ITEMS`. Sidebar y TopBar se actualizan solos,
   no hace falta tocarlos. Usa `adminOnly: true` para ocultar/bloquear una sección a quien no sea
   admin (ver `app/(dashboard)/configuracion/layout.tsx` como ejemplo de gate).
3. **Páginas**: agrega carpetas dentro de `app/(dashboard)/` siguiendo el patrón de
   `configuracion/page.tsx`.
4. **Componentes nuevos**: usa las clases ya definidas en `globals.css`
   (`.btn-flesan*`, `.card`, `.chip-flesan`, `.badge`, `.field-input`, `.skeleton`) antes de
   inventar estilos nuevos — revisa `/ui-kit` en la app corriendo para verlas en vivo.
5. **Logos**: usa los PNG de `public/brand/`. Versión BLANCO sobre fondos oscuros/rojos, NEGRO o
   COLOR sobre fondos claros — nunca el logo a color sobre rojo.
6. **Roles**: por defecto son `admin`/`member` asignados por email vía `CIA_ADMIN_EMAILS` — no hace
   falta tocar nada. Si necesitas más roles o alcance granular por usuario (ej. acceso solo a
   ciertos proyectos), extiende `lib/roles.ts` y `lib/usuarios-db.ts` — `plataforma_auditorias` y
   `seguimiento_proyectos_fai` lo hicieron y sirven de referencia (ver `docs/ARQUITECTURA.md`).
7. **Widget de feedback**: coordina con el equipo CIA para registrar el token de esta plataforma en
   `CIA_SERVICE_TOKENS` del `feedback-api` central (repo `servicios-compartidos`); sin eso el
   widget se ve pero el envío falla.

## Base de datos y roles persistidos (opcional)

**No es obligatorio para arrancar una plataforma nueva.** Sin `DATABASE_URL`, todo funciona igual
que siempre (rol por lista de correos en `CIA_ADMIN_EMAILS`, sin panel de usuarios). Actívalo solo
si la plataforma va a guardar datos propios en Postgres, o si quieres administrar roles desde
`/configuracion/usuarios` en vez de a mano en el `.env`.

Pasos para activarlo:

1. Define `DATABASE_URL` en el `.env` (no lo subas a git).
2. Si quieres el panel `/configuracion/usuarios`: aplica `db/001_usuarios_roles.sql` a mano contra
   esa base de datos (no hay herramienta de migraciones — copia y pega el SQL en tu cliente de
   Postgres).
3. Reemplaza el texto `<slug>` por el nombre de esta plataforma en **los tres lugares donde
   aparece**: `lib/usuarios-db.ts`, `app/api/configuracion/usuarios/route.ts` y
   `db/001_usuarios_roles.sql` — debe quedar el mismo nombre de tabla en los tres.
4. Reinicia el servidor. Prueba entrando con un correo que no esté en `CIA_ADMIN_EMAILS`, asígnale
   rol admin desde `/configuracion/usuarios`, y confirma que el cambio de rol se refleja sin volver
   a loguearte.

**Resguardos:**

- **Nunca borres `CIA_ADMIN_EMAILS`.** Es tu llave maestra: sigue funcionando aunque la base de
  datos esté caída o la tabla no exista todavía — es la forma de no quedar bloqueado.
- **Las fallas son silenciosas por diseño**: si la tabla no existe, `DATABASE_URL` está mal, o
  olvidaste reemplazar `<slug>`, nadie ve un error — todos los correos fuera de `CIA_ADMIN_EMAILS`
  quedan como `member` (el rol de menor privilegio) sin aviso. Es la opción segura (nunca da acceso
  de más por error), pero si un rol asignado "no aparece", revisa los logs del servidor en vez de
  asumir que el problema es otro.
- Si cambias el esquema de la tabla más adelante, agrega un archivo nuevo `db/002_algo.sql` — no
  edites el `001` que ya aplicaste en producción.
- El panel de usuarios busca colaboradores en el maestro corporativo de RR.HH.
  (`maestro_colaborador.sql` + `lib/colaboradores-db.ts`) — requiere que `DATABASE_URL` apunte a
  una base con acceso al esquema `flesan_rrhh`. Si esta plataforma no necesita ese buscador, borra
  esos dos archivos y adapta `/configuracion/usuarios` para buscar de otra forma.

## Variables de entorno

Ver `.env.example` para la lista completa (puerto, auth con Google Workspace, widget de feedback
CIA, y placeholders comentados para DB/SMTP/tracking si la plataforma los necesita). `PORT` es la
única fuente del puerto: lo leen `npm run dev`/`npm run start` (vía `dotenv -c`, ver
`package.json`) y `docker-compose.yml`, sin tocar nada más. El login (`auth.ts` /
`auth.config.ts` / `middleware.ts`) sigue la plantilla compartida
`servicios-compartidos/login-estandar/nextjs` — mismo Client ID de Google en todas las plataformas,
`AUTH_SECRET` propio de cada una.

## Sistema de diseño completo

Para guía de marca completa (voz y tono, copy, logos de sub-marcas, accesibilidad), está instalada
como skill de Claude Code en `~/.claude/skills/grupo-flesan-skill/`. Ábrela con Claude Code y pide
`/grupo-flesan-skill` o simplemente pide "diseña X con la marca Flesan".
