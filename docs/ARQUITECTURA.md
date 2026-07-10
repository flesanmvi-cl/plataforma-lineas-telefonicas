# Arquitectura — Nombre Plataforma

Referencia técnica para quien vaya a tocar backend/datos/auth de este proyecto. Para stack y cómo
correr el proyecto, ver el [`README.md`](../README.md).

> Plantilla: completa cada sección a medida que la plataforma gane lógica de negocio propia.
> Bórrala si al final no aporta más que el README.

## Modelo de datos

_(Sin Postgres activo por defecto — `lib/db.ts` ya trae el pool `pg` singleton listo para usar,
inerte mientras no haya `DATABASE_URL` en `.env`. Si la plataforma necesita Postgres: define
`DATABASE_URL`, aplica las migraciones de `db/*.sql` a mano contra esa BBDD, y documenta aquí las
tablas/esquema propias del negocio.)_

Si activas roles persistidos en BBDD (ver más abajo), aplica `db/001_usuarios_roles.sql` — crea
`flesan_procesos.cia_<slug>_usuarios` (reemplaza `<slug>` por el nombre de esta plataforma).

## Autenticación y autorización

Auth.js v5 heredado de `servicios-compartidos/login-estandar/nextjs` (plantilla compartida de
login CIA):

- **`auth.config.ts`** (edge-safe): provider Google, callback `signIn` rechaza emails fuera de
  `CIA_ALLOWED_DOMAINS`. `pages.signIn`/`pages.error` → `/login`.
- **`auth.ts`** (runtime Node, importa `auth.config.ts`): resuelve el rol en el callback
  `session` (no `jwt`, para que un cambio de rol tenga efecto sin re-login) — si el email está en
  `CIA_ADMIN_EMAILS` → `role: "admin"`; si no, y hay `DATABASE_URL` configurado, hace lookup a
  `flesan_procesos.cia_<slug>_usuarios` vía `lib/usuarios-db.ts`; si no hay `DATABASE_URL`, queda
  `"member"` (ver `lib/roles.ts`).
- **`middleware.ts`**: protege *todas* las rutas excepto `api/auth/*`, `api/health`, `/login`,
  estáticos de Next y `/brand/*`. Sin sesión, redirige a `/login?callbackUrl=<ruta original>`.
- Secciones `adminOnly` (ver `lib/nav.ts` y `app/(dashboard)/configuracion/layout.tsx`): el gate
  vive en un `layout.tsx` propio de la sección, no en el middleware, porque necesita el rol ya
  resuelto en la sesión (el middleware corre en Edge y no puede consultar BBDD).
- **Gestión de usuarios** (`/configuracion/usuarios`, solo `adminOnly`): asigna/revoca el rol
  `admin`/`member` de cualquier colaborador de Flesan, buscándolo en el maestro corporativo
  (`lib/colaboradores-db.ts` + `maestro_colaborador.sql`) y persistiendo en la tabla de arriba.
  Requiere `DATABASE_URL` — sin BBDD, el rol solo se administra por `CIA_ADMIN_EMAILS`.
- Cierre de sesión: Server Action `cerrarSesion()` en `lib/auth-actions.ts`.
- Si la plataforma necesita más de 2 roles (más allá de `admin`/`member`) o alcance granular por
  usuario (ej. acceso solo a un subconjunto de proyectos/empresas), extiende `Rol` en
  `lib/roles.ts` y `lib/usuarios-db.ts` — `plataforma_auditorias` (3 roles) y
  `seguimiento_proyectos_fai` (roles + acceso por proyecto) lo hicieron así y sirven de
  referencia.
- **Bypass de desarrollo**: `AUTH_DISABLED=true` (+ `DEV_ROLE=admin|member` opcional) en `.env`
  hace que `auth()` devuelva una sesión falsa y que `middleware.ts` no redirija a `/login` —
  pensado para iterar rápido en local/VM de pruebas sin pasar por Google. Solo tiene efecto si
  `NODE_ENV !== "production"`; en un build de producción se ignora aunque el `.env` lo traiga.

## API routes

| Ruta | Método | Qué hace |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Handlers estándar de Auth.js. |
| `/api/health` | GET | Healthcheck de Docker, sin auth. |
| `/api/feedback` | POST | BFF del widget CIA — reenvía el feedback del usuario autenticado al servicio central. |
| `/api/feedback/mios` | GET | BFF del widget CIA — lista el feedback enviado por el usuario actual. |
| `/api/configuracion/usuarios` | GET, POST | `adminOnly` — lista y asigna/actualiza rol de usuarios (requiere `DATABASE_URL`). |
| `/api/configuracion/usuarios/[correo]` | DELETE | `adminOnly` — revoca el rol administrado (vuelve al default `member`). |
| `/api/configuracion/colaboradores` | GET | `adminOnly` — busca colaboradores en el maestro corporativo para asignarles rol. |

Agrega tus rutas de negocio a esta tabla a medida que las crees.

## Widget de feedback CIA

`app/layout.tsx` carga un Web Component externo (`<cia-feedback>`, Shadow DOM) que muestra el
badge "Desarrollado por CIA" + un buzón de sugerencias. Es compartido entre todas las plataformas
CIA — el código fuente vive en el repo hermano `servicios-compartidos`
(`servicios/widget-cia/` + `servicios/feedback-api/`), no en este proyecto.

Patrón BFF: el widget hace `fetch` same-origin a `/api/feedback` (este proyecto, con la sesión del
usuario), y ese route handler reenvía al servicio central con `CIA_SERVICE_TOKEN` vía header
`X-CIA-Service-Token`.

**Antes de ir a producción**: reemplaza `data-plataforma="nombre-plataforma"` en `app/layout.tsx`
por el slug real de esta plataforma, y coordina con el equipo CIA para registrar
`<slug>:<token>` en `CIA_SERVICE_TOKENS` del `feedback-api` central — si no, el widget se ve pero
el envío de feedback falla en silencio.

## Docker

`Dockerfile` multi-stage (deps → builder → runner), output `standalone` de Next
(`next.config.ts`), usuario no-root, healthcheck contra `/api/health`. `docker-compose.yml` levanta
solo el servicio `web`; si la plataforma necesita Postgres u otro servicio, agrégalo ahí.

## Estado conocido / pendientes

_(Deja aquí notas para quien retome el proyecto: qué está a medio hacer, qué placeholder falta
reemplazar, qué decisión de diseño quedó pendiente.)_
