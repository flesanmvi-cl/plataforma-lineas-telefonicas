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
  compartida de login CIA. `CIA_ALLOWED_DOMAINS` restringe los dominios (`flesan.cl` y
  `flesan.com.pe`, `PLAN.md` P2) y el correo debe venir verificado por Google. Con más de un
  dominio, el selector de cuentas va sin `hd`, que escondería las cuentas de los otros dominios.
- **Lista blanca** (`lib/lineas/usuarios.ts`, `buscarAcceso`): solo entran los usuarios activos de
  la aplicación 23 de `seguridadapp` (`estado_sesion = 1`, `estado_validacion = 1`, con rol en
  `usuario_rol`), como en el antiguo. El correo se compara sin distinguir mayúsculas. Quien no
  está no llega a tener sesión: el callback `signIn` lo devuelve a
  `/login?error=SinAcceso&motivo=…&correo=…`.
- **Perfiles** (`lib/roles.ts`): rol 74 → `admin`; roles 75 y 76 → `procesos` o `soporte` según
  el área (`dni`: '1' Procesos, '2' Soporte), que es lo que filtra lo que ve quien no es
  administrador. `etiquetaRol()` da el nombre del perfil para la tarjeta de usuario. Sin rol 74,
  75 o 76, o sin área válida: sin acceso (`sin-perfil`). Si un correo tiene más de un registro,
  vale el primero válido de id más bajo. `member` queda para una sesión sin acceso y para las
  maquetas del shell.
- **Llave maestra:** `CIA_ADMIN_EMAILS` entra como administrador aunque no esté registrado (sin id
  ni área) o la base no responda.
- **En cada petición:** el callback `session` vuelve a resolver el acceso (una consulta por
  petición, con `cache` de React). La sesión lleva `acceso` (`habilitado`, id, rol, área, o el
  motivo) y el correo. Sin acceso, el rol es `member` y `session.user.email` queda vacío, así que
  las piezas del shell que piden el correo (comentarios, preferencias, avisos) no ven a nadie. Si
  la base no responde, se niega el acceso (`sin-verificar`); el pool corta la conexión a los 5 s.
- **middleware.ts:** exige sesión en todo, salvo `/login`, `/api/auth/*`, `/api/health` y
  estáticos. Corre en Edge y no consulta la base: la habilitación se comprueba en el layout, en
  las páginas y en las APIs.
- **Layout del dashboard:** sin acceso, lleva a `/sin-acceso` (fuera del dashboard: el motivo, el
  correo y «Cerrar sesión» para entrar con otra cuenta).
- **APIs:** todo route handler de negocio empieza con `requerirAcceso(req, { admin? })`
  (`lib/auth-guard.ts`):
  1. En métodos que escriben, el encabezado `Origin` debe ser la propia plataforma (host, el
     host detrás del proxy o `AUTH_URL`).
  2. Sesión válida (401).
  3. Usuario habilitado (403).
  4. Rol de administrador, si se pide (403).

  Devuelve `{ correo, id, rol, area }`. Los errores inesperados salen con
  `respuestaErrorInterno()`: mensaje genérico al usuario y detalle solo en el log. Las APIs del
  shell usan `sesionConRol()`, que devuelve `null` sin acceso.
- **Páginas:** toda página que lee datos llama a `exigirAcceso()` (`lib/acceso-paginas.ts`) antes
  de leerlos, y filtra por el área si el usuario no es administrador. Las de administración viven
  en `app/(dashboard)/configuracion/(admin)/`, cuyo layout redirige a quien no es administrador,
  y llaman a `exigirAdministrador()`. Comprobado el 2026-10-26: sin esa llamada, Next renderiza
  la página en paralelo al layout y su contenido igual viaja en la respuesta a quien no
  corresponde. Con la pantalla de carga del shell (`loading.tsx`), la redirección llega con estado
  200 y la hace el navegador, pero sin el contenido de la página.
- **Encabezados de seguridad** en `next.config.ts`: `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy` y `Permissions-Policy`; sin `X-Powered-By`.
- **Bypass de desarrollo:** `AUTH_DISABLED=true` entra sin Google como `DEV_CORREO` (por defecto
  `dev@flesan.cl`, administrador) y su perfil sale de la base de desarrollo, que tiene un usuario
  de cada caso (`db/desarrollo/002_datos.sql`). Ignorado si `NODE_ENV=production`.

## API routes

| Ruta | Método | Qué hace |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Handlers estándar de Auth.js |
| `/api/health` | GET | Healthcheck de Docker, sin auth |
| `/api/estado-conexiones` | GET | Solo administradores. Estado y estructura de las dos bases |
| `/api/feedback`, `/api/feedback/mios` | POST, GET | BFF del botón de comentarios CIA |
| `/api/configuracion/*`, `/api/avisos`, `/api/notificaciones/*` | — | Del shell. Sin esquema `cia_<slug>` responden vacío o «sin base». `/api/configuracion/usuarios/*` es de la tabla `usuarios` de la plantilla, que aquí no existe ni da acceso: se reemplaza en M8 |

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

- **M1 (base técnica) y M2 (acceso y roles): hechos el 2026-10-26.**
- `npm run dev` y `npm run start` usan `NODE_OPTIONS=--use-system-ca`, que Node 20 no acepta. Con
  Node 20 se puede correr `npx dotenv -c -- next dev`, que no usa los certificados del sistema;
  lo recomendado es Node 24 LTS.
- El control de origen de `requerirAcceso()` se prueba con la primera API que escriba (M4).
- El rechazo en `signIn` solo se puede probar de punta a punta con el cliente de Google real (en
  el despliegue, M10). Lo que decide, `resolverAcceso()` y el filtro de dominio, se probó contra
  la base de desarrollo.
- Vencimiento de la sesión: sigue el de Auth.js (30 días) hasta acordarlo con CIA (`PLAN.md` S9).
  La habilitación ya se comprueba en cada petición.
