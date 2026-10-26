# Arquitectura — Líneas Telefónicas

Referencia técnica para quien vaya a tocar backend, datos o acceso. Qué hace el aplicativo antiguo:
[`MIGRACION.md`](MIGRACION.md). Decisiones, seguridad y módulos: [`PLAN.md`](PLAN.md). Stack y
cómo correr el proyecto: [`README.md`](../README.md).

## Datos

### Conexiones

| Variable | Módulo | Base | Uso |
|---|---|---|---|
| `DATABASE_URL` | `lib/db.ts` | `flesan` (transaccional de Chile) | **Solo lectura**, forzada en la sesión (`default_transaction_read_only`): empresas (`public.maestro_rut`), unidades de negocio (`public.maestro_cc`), centros de costo (`public.centro_gestion_actividad`) y colaboradores (`flesan_rrhh.sap_maestro_colaborador`) |
| `DATABASE_URL_PLATAFORMA` | `lib/lineas-db.ts` | `srvpd_bd` | Lectura y escritura sobre los esquemas del aplicativo antiguo: `s_lineas` y `seguridadapp` |

- Los esquemas salen de `ESQUEMA_LINEAS` y `ESQUEMA_SEGURIDAD` (por defecto `s_lineas` y
  `seguridadapp`) y se validan antes de interpolarlos. Las tablas se nombran solo con
  `tablaLineas()` y `tablaSeguridad()`, que aceptan una lista cerrada de nombres.
- No hay esquema `cia_<slug>` (desvío aprobado, `PLAN.md` P0): `ESQUEMA_PLATAFORMA` queda vacío y
  `lib/configuracion-db.ts` del shell queda inerte (Mi personalización en el navegador, sin
  avisos).
- Perú (`grupo_flesan_pe`) no se conecta por ahora (`PLAN.md` P1).

### Formato de escritura

Mientras convivan los dos aplicativos, lo que escribe esta plataforma queda igual que lo que
escribe el antiguo (`PLAN.md` §2.3). En `lib/lineas-db.ts`:

- `AHORA_UTC`: la hora actual en UTC sin zona, como la graba Laravel.
- Los `timestamp without time zone` se leen como UTC y las columnas `date` como texto
  `AAAA-MM-DD`, sin importar la zona horaria del servidor.
- `enTransaccion()`: un cambio y su historial se graban juntos o no se graba ninguno.

### Estructura esperada

`lib/lineas/estructura.ts` lista las tablas y columnas que la plataforma lee o escribe.
`GET /api/estado-conexiones` (solo administradores) la compara con `information_schema` de cada
base y responde `ok`, `incompleta` (con lo que falta), `sin conexión` o `sin configurar`. Se usa
para validar la base de desarrollo y cada despliegue. Al empezar a usar una columna nueva, se
agrega a esa lista.

### Base de desarrollo

`npm run db:dev` levanta un Postgres 16 embebido (paquete `embedded-postgres`, sin Docker ni
permisos de administrador) en `localhost:54329`, base `lineas_dev`, con datos en `.db-dev/`
(ignorado por git). La primera vez aplica `db/desarrollo/001_estructura.sql` (copia de la
estructura real) y `002_datos.sql` (catálogos y roles reales; personas, líneas e IMEI ficticios).
`npm run db:dev -- --reset` la recrea. Nunca se prueba escribiendo en `srvpd_bd`.

### SQL aplicado en QA

Ninguno. La plataforma usa las tablas existentes del aplicativo antiguo y no ejecuta DDL. Los
archivos `db/001`–`003` son de la plantilla y no se aplican en esta plataforma.

## Autenticación y autorización

- **Login:** Auth.js v5 con Google (`auth.config.ts`, `auth.ts`), heredado de la plantilla
  compartida de login CIA. `CIA_ALLOWED_DOMAINS` restringe los dominios.
- **Rol (estado actual):** `admin` por `CIA_ADMIN_EMAILS`, el resto `member`. El módulo M2 lo
  reemplaza por la lista de usuarios de `seguridadapp` (aplicación 23): solo entran los
  habilitados; rol 74 → `admin`, 75 y 76 → `member` con su área.
- **middleware.ts:** exige sesión en todo, salvo `/login`, `/api/auth/*`, `/api/health` y
  estáticos.
- **APIs:** todo route handler de negocio empieza con `requerirAcceso(req, { admin? })`
  (`lib/auth-guard.ts`):
  1. En métodos que escriben, el encabezado `Origin` debe ser la propia plataforma (host, el
     host detrás del proxy o `AUTH_URL`).
  2. Sesión válida.
  3. Rol de administrador, si se pide.

  Los errores inesperados salen con `respuestaErrorInterno()`: mensaje genérico al usuario y
  detalle solo en el log.
- **Páginas de administración:** viven en `app/(dashboard)/configuracion/(admin)/`, cuyo layout
  redirige a quien no es administrador. Además, cada página llama a `exigirAdministrador()`
  (`lib/acceso-paginas.ts`) antes de leer datos. Comprobado el 2026-10-26: sin esa llamada, Next
  renderiza la página en paralelo al layout y su contenido igual viaja en la respuesta a un
  `member`.
- **Encabezados de seguridad** en `next.config.ts`: `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy` y `Permissions-Policy`; sin `X-Powered-By`.
- **Bypass de desarrollo:** `AUTH_DISABLED=true` (+ `DEV_ROLE`) usa la sesión falsa de
  `dev@flesan.cl`, que existe en la base de desarrollo. Ignorado si `NODE_ENV=production`.

## API routes

| Ruta | Método | Qué hace |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Handlers estándar de Auth.js |
| `/api/health` | GET | Healthcheck de Docker, sin auth |
| `/api/estado-conexiones` | GET | Solo administradores. Estado y estructura de las dos bases |
| `/api/feedback`, `/api/feedback/mios` | POST, GET | BFF del botón de comentarios CIA |
| `/api/configuracion/*`, `/api/avisos`, `/api/notificaciones/*` | — | Del shell. Sin esquema `cia_<slug>` responden vacío o «sin base»; Usuarios y roles se reemplaza en M8 |

Las rutas de negocio (líneas, dispositivos, maestros, marcas y modelos, usuarios) se agregan aquí
a medida que se construyen.

## Widget de feedback CIA

El botón de comentarios lo dibuja el shell (`components/comentarios/*`) y envía por
`/api/feedback`, que reenvía al servicio central con `CIA_SERVICE_TOKEN`. Antes de producción,
coordinar con el equipo CIA el registro del slug `plataforma_lineas_telefonicas` en
`CIA_SERVICE_TOKENS` del `feedback-api` central.

## Docker

`Dockerfile` multi-stage (deps → builder → runner), output `standalone`, usuario no-root y
healthcheck contra `/api/health`. `docker-compose.yml` levanta solo el servicio `web`
(`plataforma-lineas-telefonicas`). La base de desarrollo no va en Docker: es `npm run db:dev`.

## Estado conocido y pendientes

- **M1 (base técnica): hecho el 2026-10-26.** Siguiente: M2 (acceso y roles con `seguridadapp`).
- `npm run dev` y `npm run start` usan `NODE_OPTIONS=--use-system-ca`, que Node 20 no acepta. Con
  Node 20 se puede correr `npx dotenv -c -- next dev`, que no usa los certificados del sistema;
  lo recomendado es Node 24 LTS.
- El control de origen de `requerirAcceso()` se prueba con la primera API que escriba (M4).
- Pendiente de M2: la sesión falsa de desarrollo trae el rol fijo (`DEV_ROLE`). Cuando el rol
  salga de `seguridadapp`, hará falta poder elegir con qué usuario de prueba se entra.
