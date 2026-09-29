# Mockup Plataforma — Base Grupo Flesan

Plantilla base y guía para crear nuevas plataformas internas de la CIA, con el stack, el sistema
de diseño de Grupo Flesan y el **shell estándar** ya instalados: sidebar, barra superior,
Configuración, Mi personalización, avisos y comentarios CIA. Se copia esta carpeta completa como
punto de partida y se siguen los pasos de «Crear una plataforma nueva».

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — tokens de marca en `app/shell.css` (bloque `@theme`, no hay
  `tailwind.config.js`); `app/globals.css` importa el shell y guarda solo lo propio de la plataforma
- **next-themes** — modo oscuro vía clase `.dark`; botón en la barra superior y opción «Sistema» en
  Mi personalización
- **lucide-react** — iconos
- **sonner** — notificaciones (`toast(...)`)
- **clsx + tailwind-merge** — utilidad `cn()` en `lib/cn.ts`
- **Auth.js v5** — login con Google Workspace corporativo + roles (`admin`/`member`), ver sección
  de auth más abajo
- **swr** — data fetching client-side (`components/swr-provider.tsx`)

El mockup no tiene base de datos propia: sin las variables de la base, Mi personalización queda en
el navegador y no hay avisos. **Una plataforma real sí la tiene**: ver «Base de datos de la
plataforma» más abajo, con las reglas y las tablas obligatorias.

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
  layout.tsx              ← fonts (Barlow e Inter Tight vía next/font/local), ThemeProvider, Toaster
  shell.css               ← SHELL: tokens de marca, escala, densidad y clases (.btn-flesan, .card…)
  globals.css             ← importa shell.css + estilos propios de la plataforma
  login/page.tsx           ← pantalla de login (botón "Iniciar sesión con Google")
  api/
    auth/[...nextauth]/route.ts  ← handlers estándar de Auth.js
    health/route.ts              ← healthcheck para Docker (sin auth)
    feedback/route.ts            ← BFF de comentarios CIA (POST)
    feedback/mios/route.ts       ← BFF de comentarios CIA (GET historial propio)
    avisos/route.ts              ← avisos vigentes (franja)
  (dashboard)/
    layout.tsx             ← Sidebar + TopBar + BreadcrumbProvider + UserProvider + SwrProvider
    page.tsx                ← Inicio (cards de navegación)
    ui-kit/page.tsx          ← guía de estilo viva — referencia de todos los componentes
    configuracion/
      page.tsx                ← grilla «Para ti» (todos) / «Administración» (solo admin)
      personalizacion/, comentarios/, acerca/, presentaciones/  ← abiertas a todos
      usuarios/, avisos/        ← solo admin (gate en su layout.tsx)
  api/
    configuracion/
      usuarios/route.ts, [correo]/route.ts  ← listar/asignar/revocar rol (requiere DATABASE_URL)
      preferencias/route.ts                 ← Mi personalización en la base
      avisos/route.ts, [id]/route.ts         ← administrar avisos (solo admin)
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
public/brand/              ← logos oficiales (color / blanco / negro)
db/001_usuarios_roles.sql  ← tabla de roles (aplicar a mano, opcional)
db/002_configuracion.sql   ← tablas obligatorias del estándar: preferencias_usuario y avisos
docs/SHELL.md              ← qué archivos son del shell y cuáles de cada plataforma
maestro_colaborador.sql    ← query al maestro corporativo de RR.HH. (opcional, junto con lo de arriba)
docs/ARQUITECTURA.md       ← referencia técnica de auth/datos/API (plantilla a completar)
Dockerfile, docker-compose.yml, .dockerignore  ← build/despliegue en contenedor
.env.example                ← variables de entorno necesarias (auth, widget, DB/email opcionales)
```

## Crear una plataforma nueva

1. **Repo**: copia esta carpeta, crea el repo en la org `flesanmvi-cl` y ajusta `name` en
   `package.json`.
2. **Nombre**: `NOMBRE_PLATAFORMA` en `lib/nav.ts` (texto + palabra en rojo; los nombres largos se
   achican solos), `metadata.title` de `app/layout.tsx` y `app/login/page.tsx`.
3. **Menú**: `NAV_ITEMS` en `lib/nav.ts` (con `children` abre menú flotante; `adminOnly` lo
   oculta a quien no es administrador). Configuración va en `NAV_CONFIG`, en el pie del sidebar:
   abierta a todos, con las secciones de administración marcadas `adminOnly`.
4. **Shell**: no edites los archivos del shell (lista en `docs/SHELL.md`). Lo propio va en
   `lib/nav.ts`, `components/modulos.tsx` (módulos opcionales, como Presentaciones),
   `lib/estado-datos.ts` (fecha de los datos, o `null`) y `app/globals.css`.
5. **Base de datos**: crea el esquema y aplica las tablas obligatorias (sección siguiente). Sin
   eso, Mi personalización no sigue al usuario entre equipos y no hay avisos.
6. **Configuración**: la grilla de `app/(dashboard)/configuracion/page.tsx` tiene «Para ti»
   (todos) y «Administración» (solo administradores). Cada sección de administración lleva su gate
   en un layout (ver `configuracion/usuarios/layout.tsx`, o agrúpalas en `configuracion/(admin)/`).
7. **Comentarios CIA**: el botón lo dibuja el shell y envía por `/api/feedback`. Coordina con el
   equipo CIA el registro del token de la plataforma en `CIA_SERVICE_TOKENS` del `feedback-api`
   central (repo `servicios-compartidos`); sin eso el envío falla.
8. **Componentes y estilo**: reutiliza lo del estándar (`/ui-kit` y el laboratorio de diseño) antes
   de crear estilos nuevos. Logos en `public/brand/`.
9. **Roles**: `admin`/`member` por `CIA_ADMIN_EMAILS` sin tocar nada; roles propios en
   `lib/roles.ts` (ver `plataforma_auditorias`).
10. **Revisión**: `npx tsc --noEmit`, lint, y revisar en Chrome en claro, oscuro y con el sidebar
    colapsado, como administrador y como usuario común.

## Base de datos de la plataforma

Reglas para toda plataforma que nace de este mockup:

1. **Todo lo propio va en un esquema propio `cia_<slug>`** (ej. `cia_plataforma_auditorias`) en
   la base de QA de plataformas (`srvpd_bd`). Nada propio en la base transaccional `flesan`, que es
   **solo lectura**.
2. **Variables de entorno** (en el `.env`, nunca en git): `DATABASE_URL_PLATAFORMA` (conexión a
   QA) y `ESQUEMA_PLATAFORMA=cia_<slug>` (si falta, se usa `DB_QA_SCHEMA`). En la VM las
   credenciales salen de `connections.env` (`CONN_*`).
3. **QA es productiva en la práctica**: todo SQL se revisa y se aprueba antes de ejecutarlo, y se
   ejecuta una sola vez por plataforma. Crear el esquema (`CREATE SCHEMA cia_<slug>`) también.
4. **Tablas obligatorias del estándar** — `db/002_configuracion.sql` (reemplazar `cia_<slug>`):

   | Tabla | Para qué |
   |---|---|
   | `preferencias_usuario` | Mi personalización guardada en la base (sigue al usuario) |
   | `avisos` | Franja de avisos y Configuración › Avisos |

   Las próximas del estándar (fuentes de datos, registro de actividad, notificaciones) se sumarán
   como `db/003_…`, `db/004_…` (plan en `docs/SHELL.md`).
5. **Nunca se edita un SQL ya aplicado**: los cambios van en un archivo nuevo numerado.
6. **Registra lo aplicado** en `docs/ARQUITECTURA.md` de la plataforma: archivo, esquema y fecha.
7. **Archivos adjuntos fuera de la base** siempre que se pueda (disco o almacenamiento de
   objetos): hoy los adjuntos guardados en `bytea` son lo que más pesa en los esquemas `cia_`.
8. Las tablas de negocio de la plataforma van en el mismo esquema, con nombres en español y sin
   repetir el prefijo del esquema.

El mockup mismo no tiene esquema: sirve de plantilla, y sus funciones de base quedan inertes.

## Roles persistidos en la base (opcional)

> **Ojo:** el ejemplo de roles de la plantilla todavía usa `DATABASE_URL` y la tabla
> `flesan_procesos.cia_<slug>_usuarios`, de antes de la regla de esquema propio. En una plataforma
> nueva crea esa tabla dentro de `cia_<slug>` (como `plataforma_auditorias`) y apunta
> `lib/usuarios-db.ts` a ella.

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

Ver `.env.example` para la lista completa (puerto, auth con Google Workspace, comentarios CIA,
base de la plataforma `DATABASE_URL_PLATAFORMA` + `ESQUEMA_PLATAFORMA`, y placeholders comentados
para SMTP/tracking si la plataforma los necesita). `PORT` es la
única fuente del puerto: lo leen `npm run dev`/`npm run start` (vía `dotenv -c`, ver
`package.json`) y `docker-compose.yml`, sin tocar nada más. El login (`auth.ts` /
`auth.config.ts` / `middleware.ts`) sigue la plantilla compartida
`servicios-compartidos/login-estandar/nextjs` — mismo Client ID de Google en todas las plataformas,
`AUTH_SECRET` propio de cada una.

## Sistema de diseño completo

Para guía de marca completa (voz y tono, copy, logos de sub-marcas, accesibilidad), está instalada
como skill de Claude Code en `~/.claude/skills/grupo-flesan-skill/`. Ábrela con Claude Code y pide
`/grupo-flesan-skill` o simplemente pide "diseña X con la marca Flesan".
