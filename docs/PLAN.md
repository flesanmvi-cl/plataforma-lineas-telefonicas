# Plan de construcción — Líneas Telefónicas

Módulos para hacer en esta plataforma todo lo que hoy hace el aplicativo antiguo, sobre las mismas
bases de datos y cerrando sus problemas de seguridad. El detalle de cada pantalla, campo y regla
está en [`MIGRACION.md`](MIGRACION.md) (levantamiento del 2026-10-26); aquí se citan sus secciones.

## Índice

1. [Decisiones de partida](#1-decisiones-de-partida)
2. [Arquitectura](#2-arquitectura)
3. [Seguridad](#3-seguridad)
4. [Módulos](#4-módulos)
5. [Orden, tamaño y dependencias](#5-orden-tamaño-y-dependencias)
6. [Decisiones pendientes](#6-decisiones-pendientes)

---

## 1. Decisiones de partida

Tomadas el 2026-10-26:

1. **Solo Chile por ahora.** Se conecta la base transaccional de Chile (`flesan`). La de Perú
   (`grupo_flesan_pe`) queda para una etapa posterior.
2. **Mismas bases y tablas.** La plataforma lee y escribe las mismas tablas que el aplicativo
   antiguo: `s_lineas` (líneas, dispositivos, historial, marcas, modelos y catálogos) y
   `seguridadapp` (usuarios y roles de la aplicación 23), ambas en `srvpd_bd`. No hay esquema
   nuevo ni migración de datos.
3. **Se cierran los problemas de seguridad** de `MIGRACION.md` §13.
4. **P0 aprobado:** se escribe en `s_lineas` y `seguridadapp`, sin esquema `cia_<slug>`.
5. **P1 = A:** Perú queda solo en consulta en la plataforma nueva; su alta y edición siguen en el
   antiguo hasta conectar la base de Perú.
6. **P8:** repositorio `flesanmvi-cl/plataforma-lineas-telefonicas`; nombre «Líneas
   **Telefónicas**»; slug `plataforma_lineas_telefonicas`, tomado del repositorio (se puede
   cambiar hasta registrarlo en el buzón CIA).
7. **P2 = sí:** los 4 usuarios `@flesan.com.pe` entran desde ya, con la misma lista blanca
   (`CIA_ALLOWED_DOMAINS=flesan.cl,flesan.com.pe`). Falta que CIA confirme que el cliente de
   Google compartido acepta ese dominio (M10).

Qué implica:

- Los dos aplicativos pueden funcionar a la vez sobre los mismos datos. El corte final consiste en
  cambiar el dominio, sin mover datos.
- Mientras convivan, la plataforma escribe con el mismo formato que el antiguo (§2.3), para que
  cada uno vea bien lo que hace el otro.
- **Desvío del estándar (aprobado, P0):** lo que se escribe va en `s_lineas` y `seguridadapp`, no
  en un esquema `cia_<slug>` (README, «Base de datos de la plataforma», reglas 2 y 8). La regla
  central se cumple: la transaccional `flesan` solo se lee. Queda anotado en `CLAUDE.md`, «Esta
  plataforma».
- Sin esquema `cia_<slug>`, Mi personalización queda en el navegador y no hay Avisos; el shell ya
  funciona así. Se pueden activar después creando ese esquema solo para las tablas del estándar.

Supuestos de este plan (por confirmar):

- Los errores E1 a E14 de `MIGRACION.md` §13 se corrigen, siempre que la corrección no rompa la
  convivencia con el antiguo.
- El Excel exporta lo que muestra la tabla, con sus filtros.
- No se agregan funciones que el antiguo no tiene (baja de registros, notificaciones, correos,
  carga masiva), salvo desactivar usuarios, que es necesario por seguridad.

---

## 2. Arquitectura

### 2.1 Conexiones

| Variable | Base | Qué se usa | Acceso |
|---|---|---|---|
| `DATABASE_URL` → `lib/db.ts` | `flesan` (`10.168.0.22`) | `public.maestro_rut`, `public.maestro_cc`, `public.centro_gestion_actividad`, `flesan_rrhh.sap_maestro_colaborador` | Solo lectura, forzada en la conexión (`default_transaction_read_only`) |
| `DATABASE_URL_PLATAFORMA` → `lib/lineas-db.ts` (nuevo) | `srvpd_bd` (`192.168.50.101`) | Esquemas `s_lineas` y `seguridadapp` | Lectura y escritura |
| `ESQUEMA_LINEAS`, `ESQUEMA_SEGURIDAD` | — | Nombres de esquema (por defecto `s_lineas` y `seguridadapp`), validados al arrancar | — |

`ESQUEMA_PLATAFORMA` queda vacío porque no hay esquema `cia_<slug>`, así que
`lib/configuracion-db.ts` del shell queda inerte.

### 2.2 Capas

- **Pantallas:** Server Components que leen con la sesión ya resuelta, y formularios cliente con
  los campos del estándar (`components/estandar/graficos/campos/*` y `Desplegable`).
- **API:** route handlers en `app/api/…`. Todos pasan por el mismo guard (§3.2).
- **Datos:** módulos de servidor en `lib/lineas/*` con SQL parametrizado. Ninguna consulta se arma
  con texto que venga del usuario.

### 2.3 Escritura compatible con el antiguo

| Dato | Cómo se escribe |
|---|---|
| Fechas de creación y actualización | En UTC sin zona, como lo hace Laravel |
| `sl_area` | `'1'` Procesos, `'2'` Soporte (texto) |
| `sl_operador` | Id del operador como texto |
| `sl_tipo_rut` | 1 en SAP, 2 fuera de SAP |
| `sl_id_vigente` | 1 |
| `sl_nombre_empresa`, `sl_nombre_cc` | Se toman del maestro en el servidor, no del formulario |
| Historial | El mismo texto que hoy, siempre con el id del registro y en la misma transacción que el cambio |
| Usuarios | `aplicacion_usuario` y `usuario_rol` con los mismos campos que hoy: área en `dni`, `pais`, `estado_sesion`, `estado_validacion = 1`, `id_aplicacion = 23` |
| Ids nuevos | Las secuencias de cada tabla, así no chocan con los del antiguo |

### 2.4 Entorno de desarrollo

`srvpd_bd` es productiva en la práctica, así que las pruebas no se hacen ahí. `npm run db:dev`
levanta un Postgres 16 embebido (paquete `embedded-postgres`) con la estructura de `s_lineas` y
`seguridadapp` tomada del levantamiento (`db/desarrollo/`) y datos de prueba. No necesita Docker
ni permisos de administrador; el plan decía `docker-compose`, pero los equipos de desarrollo no
tienen Docker. La base `flesan` se puede leer real, porque la conexión es de solo lectura.

---

## 3. Seguridad

### 3.1 Del antiguo a la plataforma nueva

| # | Problema en el antiguo | En la plataforma nueva | Módulo |
|---|---|---|---|
| S1 | La API no exige sesión y el usuario llega en un campo oculto del formulario | `middleware.ts` exige sesión en todo. Cada route handler pasa por el guard y la identidad sale de la sesión (correo verificado por Google), nunca del cuerpo de la petición | M1, M2 |
| S2 | La administración solo se oculta en el menú | Gate en el layout `(admin)`, control en cada página de administración (`exigirAdministrador()`) y guard de administrador en cada API de administración | M1, M2, M7, M8 |
| S3 | Suplantación fija en el login | No existe, y una prueba lo verifica | M2, M9 |
| S4 | Credenciales en el código | Solo en variables de entorno (`.env` fuera de git, `connections.env` en la VM). `ApiGF` no se porta. Las del antiguo quedan como están (M0 no aplica) | M1 |
| S5 | `APP_DEBUG=true`: trazas a la vista | Build de producción. El usuario ve un mensaje genérico y el detalle queda solo en el log del servidor | M1 |
| S6 | Cualquiera abre o edita un registro de otra área cambiando el id en la URL | Cada lectura y escritura por id valida el área en el servidor; si no corresponde, responde «no encontrado» | M4, M5, M6 |
| S7 | Sin protección CSRF en la API | Cookie de sesión `SameSite=Lax` de Auth.js, solo JSON y verificación del encabezado `Origin` en todo lo que escribe | M1 |
| S8 | Cualquiera crea usuarios con cualquier rol | Solo un administrador; perfiles limitados a 74, 75 y 76 de la aplicación 23; correo único; siempre queda un administrador activo | M8 |
| S9 | Sesión prácticamente permanente (cookie «recordarme») y sin forma de desactivar usuarios | La habilitación se verifica en cada petición: desactivar a alguien le corta el acceso de inmediato. Sesión con vencimiento, a acordar con CIA (propuesta: 12 horas) | M2, M8 |
| S10 | Usuario de base con permisos amplios | `flesan` en sesión de solo lectura. Usuario propio para `srvpd_bd`, con permisos solo sobre las tablas que se usan (P7) | M1 |
| S11 | Se confía en datos que manda el navegador (nombres de empresa y centro, país, área) | El servidor fija país y área y toma los nombres del maestro; valida que empresa, unidad y centro sean coherentes | M4, M6 |
| S12 | — | Encabezados de seguridad (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, ya en M1) y `npm audit` antes de cada despliegue | M1, M9 |

### 3.2 Reglas para todo endpoint

1. Empieza con el guard: sesión válida y usuario habilitado en la aplicación 23. Si no, 401.
2. Comprueba rol y área según la acción. Si no corresponde, 403, o 404 cuando se pide un registro
   por id.
3. Valida la entrada: tipos, obligatorios, largos máximos (las columnas son de hasta 255), que los
   ids existan en sus catálogos y que empresa, unidad y centro sean coherentes.
4. Usa SQL parametrizado; los nombres de esquema vienen de la configuración validada.
5. En las escrituras, el cambio y su historial van en la misma transacción.
6. Ante un error, mensaje genérico al usuario y detalle en el log.

Y en las páginas: toda página de administración llama a `exigirAdministrador()`
(`lib/acceso-paginas.ts`) antes de leer datos. El gate del layout `(admin)` no basta: Next
renderiza layout y página en paralelo, y se comprobó (2026-10-26) que el contenido de la página
igual viaja en la respuesta a un `member`. Lo mismo vale para las páginas filtradas por área.

### 3.3 Mientras conviven

El antiguo conserva sus vulnerabilidades hasta que se apague y comparte los datos con la nueva:
una escritura por su API abierta afecta también a la plataforma nueva. M0 proponía contenerlo, pero
no aplica (P3, 2026-10-26): el antiguo no se modifica. El riesgo queda aceptado hasta el corte.

---

## 4. Módulos

### M0. Contención en el aplicativo antiguo — no aplica (P3, 2026-10-26)

Decisión: el aplicativo antiguo no se modifica (ni código, ni repositorio, ni servidor). Se
conserva la propuesta como registro de los riesgos que quedan abiertos mientras conviven.


Cambios mínimos en Laravel para que la convivencia no deje la puerta abierta:

1. Commitear la copia local antes de tocar nada (hoy hay 18 archivos sin commitear).
2. Exigir sesión y CSRF en `routes/api.php`: agrupar las rutas con los middleware `web` y `auth`
   (los formularios ya envían el token) y fijar `id_aplicacion_usuario` al usuario de la sesión con
   un middleware de una línea.
3. Middleware de rol 74 para usuarios, marcas y modelos, tanto en las pantallas como en la API.
4. Quitar la suplantación del login (`LoginController.php`, líneas 82-84).
5. `APP_DEBUG=false` y `APP_ENV=production` en el servidor.
6. Rotar las credenciales de API GF y Builder con sus dueños y borrar `ApiGF.php`, que no se usa.

Si no se quiere tocar el código, la alternativa es bloquear `/api/*` en el proxy para tráfico
externo, que no protege de usuarios internos.

**Listo cuando:** un POST a `/api/saveUser` sin sesión es rechazado y un usuario de rol 75 no puede
abrir `/listUsers`.

### M1. Base técnica — hecho el 2026-10-26

- Repositorio: `origin` apunta a `flesanmvi-cl/plataforma-lineas-telefonicas` y la plantilla queda
  como remoto `mockup`, para traer actualizaciones del shell.
- Limpieza del mockup: fuera `/plantillas`, la portada del mockup y el módulo Presentaciones (con
  sus librerías `html-to-image`, `jspdf` y `pptxgenjs`). `/ui-kit` solo se publica en desarrollo.
- Nombre en `lib/nav.ts`, `metadata`, login (con los dominios desde `CIA_ALLOWED_DOMAINS` y en
  español de Chile), `package.json` y Docker.
- Menú: Inicio, Líneas (Chile y Perú) y Dispositivos. **Marcas y modelos pasó a Configuración**
  (`/configuracion/marcas-modelos`, `adminOnly`), junto a Usuarios y roles, como «Gestión
  plataforma» en el antiguo; así hereda el gate de administración. Configuración quedó sin las
  secciones del mockup que necesitan un esquema `cia_<slug>`.
- Inicio con accesos a Líneas Chile, Líneas Perú y Dispositivos; esas secciones muestran «en
  preparación» hasta su módulo.
- Conexiones (§2.1): `lib/db.ts` en solo lectura forzada y `lib/lineas-db.ts`, con esquemas
  validados, nombres de tabla cerrados, lectura de fechas en UTC, `AHORA_UTC` y `enTransaccion()`.
- Seguridad común: `requerirAcceso()` (origen, sesión, rol), errores genéricos y
  `exigirAdministrador()` para páginas; encabezados de seguridad adelantados de M9.
- `/api/estado-conexiones` (administradores): estado y estructura de las dos bases contra
  `lib/lineas/estructura.ts`.
- Base de desarrollo `npm run db:dev` (§2.4). Sin notificaciones ni indicador de frescura.
- La validación de campos (RUT, fechas, largos) se escribe con su primer uso, en M4.

Verificado: tipos, lint y build de producción limpios; todas las pantallas responden; como
`member`, las secciones de administración redirigen sin enviar su contenido y la API de estado
responde 403; la verificación de estructura da `ok` contra la base de desarrollo y lista las 12
tablas que faltan si se apunta a un esquema inexistente.

### M2. Acceso y roles — hecho el 2026-10-26

- Login con Google de la plantilla para `flesan.cl` y `flesan.com.pe` (P2). Con más de un
  dominio, el selector de cuentas va sin `hd`: con `hd=flesan.cl` escondería las cuentas de Perú.
  Además, el correo debe venir verificado por Google (`email_verified`).
- Lista blanca, como hoy (`lib/lineas/usuarios.ts`): solo entran los correos con usuario activo en
  la aplicación 23 (`estado_sesion = 1`, `estado_validacion = 1`) y un rol en `usuario_rol`. El
  correo se compara sin distinguir mayúsculas. Quien no está registrado no llega a tener sesión:
  el callback `signIn` lo devuelve a `/login` con el correo que usó, el motivo y a quién pedir
  acceso.
- Perfiles: rol 74 → `admin`; roles 75 y 76 → `procesos` o `soporte` según el área de `dni`, que es
  lo que filtra lo que ven (el antiguo filtra por el área, no por el rol). La tarjeta de usuario
  muestra el nombre del perfil («Administrador Procesos»). Sin rol 74, 75 o 76, o sin área 1 o 2:
  sin acceso. Si un correo tiene más de un registro, vale el primero válido de id más bajo.
- `CIA_ADMIN_EMAILS` sigue como llave maestra: entra como administrador aunque no esté registrado
  o la base no responda.
- Rol, área y habilitación se resuelven en cada petición (callback `session`, una consulta por
  petición). Quien pierde el acceso con la sesión abierta va a `/sin-acceso` (con «Cerrar
  sesión»), las APIs le responden 403 y su sesión queda sin correo para las piezas del shell. Si la
  base no responde, se niega el acceso (con un tope de 5 s por conexión).
- Para las páginas, `exigirAcceso()` y `exigirAdministrador()` devuelven correo, id, rol y área;
  para las APIs, `requerirAcceso()`. M4 a M8 filtran por ese área.
- Sin suplantaciones ni excepciones por correo. Quien hoy entra al antiguo con la identidad de otra
  cuenta (`LoginController.php`, líneas 82-84) necesita su propio usuario.
- Desarrollo: `AUTH_DISABLED` entra como `DEV_CORREO` y su perfil sale de la base de desarrollo,
  que tiene un usuario de cada caso (`db/desarrollo/002_datos.sql`).

Verificado contra la base de desarrollo: cada caso de prueba resuelve el perfil esperado (también
el `@flesan.com.pe` guardado con mayúsculas, el correo repetido, el sin área, el inactivo y el de
otra aplicación); un usuario desactivado con la sesión abierta pierde el acceso en su siguiente
petición y lo recupera al reactivarlo; un `procesos` no ve Administración, recibe 403 en la API de
administración y la página de administración redirige sin enviar su contenido; con la base caída
nadie entra salvo la llave maestra. Tipos, lint y build limpios.

**Listo cuando:** un correo no registrado no entra; uno desactivado pierde el acceso en su
siguiente petición; cada rol ve el menú que le corresponde y las secciones de administración
rechazan a un `member` aunque escriba la URL.

### M3. Datos maestros de Chile — hecho el 2026-10-26

Implementado en `lib/lineas/maestros.ts` y `/api/maestros/*` (cualquier usuario habilitado):

| Endpoint | Devuelve |
|---|---|
| `GET /api/maestros/empresas` | Las 110 empresas (`rut`, `razonSocial`) |
| `GET /api/maestros/unidades?empresa=<rut>` | Unidades de esa empresa en `maestro_cc` |
| `GET /api/maestros/centros?empresa=<rut>&unidad=<u>[&actual=<código>]` | Centros activos de esa empresa y unidad; con `actual`, además el centro que el registro ya tiene, aunque esté cerrado (`activo: false`) |
| `GET /api/maestros/colaboradores?q=<texto>` | Hasta 20 activos por RUT (con o sin puntos) o por nombre (sin distinguir tildes), desde 3 caracteres |

- Un centro repetido por empresa y código (19 casos en `centro_gestion_actividad`, 4 en
  `maestro_cc`) sale una vez, la fila activa si la hay. Un colaborador con varias filas activas
  (23 RUT) sale una vez, la de `user_id` más alto, como el antiguo.
- Hay 45 centros activos sin fila en `maestro_cc`: no tienen unidad y, como en el antiguo, no se
  ofrecen bajo ninguna.
- Verificado con FLESAN S.A., FLESAN ANCLAJES S.A. y CONSTRUCTORA DE VICENTE S.A.: empresas y
  unidades idénticas al antiguo; de los centros, todos los que ofrece la nueva los ofrecía el
  antiguo, y todo lo que deja de ofrecer es de otra empresa (E7) o está inactivo (P5).

Lo planificado:


- Endpoints de solo lectura: empresas, unidades de negocio por empresa, centros de costo por
  empresa y unidad, y búsqueda de colaboradores activos por RUT o nombre.
- Reglas de `MIGRACION.md` §9, con E7 corregido: se ofrecen los centros de la empresa y unidad
  elegidas, solo activos (P5). Si un registro tiene un centro que ya se cerró, se sigue mostrando
  como su valor actual.
- Colaboradores desde `flesan_rrhh` (P6), con el nombre armado como hoy (nombre y apellido).
- Caché en memoria del servidor de 15 minutos: son datos que cambian poco.

**Listo cuando:** para tres empresas de prueba, las listas coinciden con las del antiguo, salvo
las diferencias que vienen de corregir E7.

### M4. Líneas de Chile

Es el módulo más grande y fija el patrón que reutilizan M5 y M6.

- **Listado** `/lineas/chile` (`MIGRACION.md` §4): filtros por rol y área, las mismas columnas,
  búsqueda, orden y paginación. «Estado usuario» con la fila resaltada, calculado de una sola vez y
  no fila por fila. «Cant. líneas», que también cuenta el tipo 3 (E10). Botones «Agregar» y
  «Descargar».
- **Alta** `/lineas/nueva` **y ficha** `/lineas/[id]`: los campos y obligatorios de §4, la cascada
  empresa → unidad → centro y el RUT en SAP. Si es «sí», un buscador de colaboradores completa el
  nombre; si es «no», el RUT se escribe a mano. Número repetido con aviso o bloqueo (P4). La ficha
  muestra el historial al costado.
- **En el servidor:** país y área los pone el servidor; un `member` solo lee y edita líneas de su
  área; los nombres de empresa y centro salen del maestro; el historial se graba en la misma
  transacción.
- **Excel** `LINEAS_ENTEL.xlsx` (`lib/exportar/excel.ts` y `BotonExcel`): las mismas columnas, con
  el operador y «RUT en SAP» corregidos (E4, E5).

**Listo cuando:** un usuario de cada rol ve las mismas líneas que en el antiguo; una línea creada o
editada aquí se ve bien en el antiguo, con su historial; el Excel cuadra con la tabla.

### M5. Líneas de Perú (consulta)

Alcance según P1; esta es la opción recomendada.

- `/lineas/peru`: listado, ficha de solo lectura con historial y Excel. Empresa y centro se
  muestran con el nombre que la línea ya tiene guardado, así que no hace falta la conexión a Perú.
- Alta y edición de Perú quedan para la etapa con conexión a Perú. Mientras tanto se siguen
  haciendo en el antiguo, que comparte los datos.

**Listo cuando:** Soporte ve las 364 líneas de Perú y las puede exportar, cosa que hoy no puede
(E3).

### M6. Dispositivos

- Listado `/dispositivos`, alta `/dispositivos/nuevo` y ficha `/dispositivos/[id]`
  (`MIGRACION.md` §5), con las mismas piezas de M4.
- Cascada tipo → marca → modelo (solo vigentes), IMEI con aviso o bloqueo (P4), Costo $0,
  Factura e historial siempre con el id del dispositivo (E6).
- Excel `DISPOSITIVOS_GRUPO_FLESAN_PROCESOS.xlsx` con las mismas columnas.
- Solo Chile.

**Listo cuando:** se cumplen los mismos criterios que en M4.

### M7. Marcas y modelos

- `/configuracion/marcas-modelos` (`adminOnly`): tablas de marcas y modelos vigentes, y «Agregar
  marca» y «Agregar modelo» en un panel lateral.
- Se bloquean los duplicados exactos, sin distinguir mayúsculas. Hoy no hay duplicados, así que no
  afecta datos existentes. El autor se toma de la sesión.
- No se agrega edición ni baja, porque el antiguo no las tiene.

**Listo cuando:** una marca o modelo agregado aparece en el formulario de dispositivos de ambos
aplicativos.

### M8. Usuarios

- Configuración › Usuarios y roles (`adminOnly`), sobre la pantalla de la plantilla
  (`usuarios-client.tsx`) adaptada a `seguridadapp`.
- Tabla con correo, nombre, país, perfil, área y estado.
- Alta con el buscador de colaboradores de la plantilla, o con el correo escrito a mano para
  cuentas que no están en el maestro de Chile.
- Edición de perfil, área, país y nombre, y **desactivar o reactivar** (`estado_sesion`), que el
  antiguo no permite.
- En el servidor: solo administradores; perfiles 74, 75 y 76; correo único dentro de la aplicación
  23; siempre queda al menos un administrador activo; nombres con tildes y ñ (E11, E12).
- Reemplaza lo que la plantilla trae para su propia tabla `usuarios`, que en esta plataforma no
  se usa: `lib/usuarios-db.ts`, `/api/configuracion/usuarios/*` y la maqueta de
  `/configuracion/usuarios`. El acceso ya lee `seguridadapp` en `lib/lineas/usuarios.ts` (M2), que
  suma aquí el listado, el alta y la edición.

**Listo cuando:** un usuario creado aquí entra en ambos aplicativos con el mismo rol, y uno
desactivado no entra en la nueva ni puede iniciar sesión en el antiguo.

### M9. Seguridad transversal y pruebas

- Encabezados de seguridad en `next.config.ts`.
- Revisión de cada endpoint contra §3.2.
- Pruebas de acceso:
  - sin sesión;
  - con un correo no habilitado;
  - un `member` pidiendo registros de otra área por id;
  - un `member` llamando a las APIs de administración;
  - una petición con `Origin` ajeno;
  - entradas inválidas o maliciosas, que deben recibir una respuesta genérica, sin trazas.
- `npm audit` sin vulnerabilidades altas.

**Listo cuando:** todas las pruebas pasan y quedan anotadas en `docs/ARQUITECTURA.md`.

### M10. Despliegue, marcha blanca y corte

- Despliegue: imagen Docker de la plantilla en la VM, con su puerto y dominio; `AUTH_SECRET`
  propio; la ruta `/api/auth/callback/google` registrada en el cliente OAuth de CIA; las variables
  en `connections.env`.
- Marcha blanca: ambos aplicativos sobre los mismos datos, con Procesos y Soporte trabajando en la
  nueva.
- Corte: `lineastelefonicas.flesanmvi.com` pasa a apuntar a la nueva y el antiguo se apaga. Si
  Perú sigue en el antiguo (P1), este queda vivo solo para eso, sin cambios (M0 no aplica).

**Listo cuando:** el antiguo está apagado, o limitado a Perú, y nadie lo necesita para Chile.

---

## 5. Orden, tamaño y dependencias

Tamaño relativo: S chico, M mediano, L grande.

| Orden | Módulo | Tamaño | Depende de | Estado |
|---|---|---|---|---|
| — | M0 Contención en el antiguo | S | — | No aplica (P3) |
| 1 | M1 Base técnica | M | — | **Hecho** (2026-10-26) |
| 2 | M2 Acceso y roles | S | M1 | **Hecho** (2026-10-26) |
| 3 | M3 Datos maestros de Chile | S | M1 | **Hecho** (2026-10-26) |
| 4 | M4 Líneas de Chile | L | M2, M3 | Pendiente |
| 5 | M5 Líneas de Perú (consulta) | S | M4 | Pendiente |
| 6 | M6 Dispositivos | M | M4 | Pendiente |
| 7 | M7 Marcas y modelos | S | M2 | Pendiente |
| 8 | M8 Usuarios | M | M2 | Pendiente |
| 9 | M9 Seguridad transversal y pruebas | S | M4 a M8 | Pendiente |
| 10 | M10 Despliegue, marcha blanca y corte | S | M9 | Pendiente |

Hitos:

1. **Acceso (M1 a M3):** se entra con Google, la lista blanca funciona y los maestros responden.
2. **Operación (M4 a M6):** Procesos y Soporte pueden trabajar líneas y dispositivos en la nueva;
   desde aquí se puede iniciar la marcha blanca.
3. **Cierre (M7 a M10):** administración completa, pruebas de seguridad, despliegue y corte.

---

## 6. Decisiones pendientes

P0, P1, P2 y P8 quedaron resueltas el 2026-10-26 (§1). P3 también: M0 no aplica, el antiguo no se
modifica. P5 (solo centros activos, conservando el valor actual de cada registro) y P6 (colaboradores
desde el origen `flesan_rrhh`) se confirmaron el 2026-10-26 y se aplicaron en M3.

| # | Pregunta | Recomendación | Afecta |
|---|---|---|---|
| P4 | Número de línea e IMEI repetidos: ¿aviso, como hoy, o bloqueo? | Bloquear entre los vigentes al crear o al cambiar el número; los 4 números y 8 IMEI ya repetidos se pueden seguir editando sin cambiarlos | M4, M6 |
| P7 | Usuario de base de datos propio para la nueva, con permisos solo sobre lo que usa (coordinar con quien administra `srvpd_bd` y `flesan`) | Sí | M1, M10 |
| P9 | Dominio: ¿se reutiliza `lineastelefonicas.flesanmvi.com`? | Sí, en el corte | M10 |

Este plan cumple el papel de `docs/DECISIONES.md` de `docs/ARRANQUE.md`: las respuestas se anotan
aquí, en §1, a medida que se tomen.
