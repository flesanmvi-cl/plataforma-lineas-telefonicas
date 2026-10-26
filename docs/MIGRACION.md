# Migración de Líneas Telefónicas

Levantamiento del aplicativo antiguo `gf_telefonia_grupoflesan` (Laravel) y propuesta para
construir lo mismo en esta plataforma (Next.js, estándar CIA). Fecha del levantamiento:
**2026-10-26**.

Fuentes:

- Lectura completa del código local del aplicativo antiguo (rutas, controladores, modelos, vistas,
  exportaciones y configuración).
- Una consulta de **solo lectura** a las bases que usa (estructura, catálogos y conteos
  agregados, sin filas con datos personales), como pide `docs/ARRANQUE.md` («Validación de
  estructura»).

> **Ojo con la versión del código.** La copia local del aplicativo antiguo tiene 18 archivos con
> cambios sin commitear respecto de GitHub (`Flesan-Gestion/gf_telefonia_grupoflesan`), entre
> ellos los modelos de líneas y dispositivos y sus vistas. Este levantamiento describe la copia
> local. Antes de migrar, confirmar que es la que corre en producción y commitearla.

## Índice

1. [Resumen](#1-resumen)
2. [Pantallas y rutas](#2-pantallas-y-rutas)
3. [Acceso, usuarios y roles](#3-acceso-usuarios-y-roles)
4. [Líneas](#4-líneas)
5. [Dispositivos](#5-dispositivos)
6. [Marcas y modelos](#6-marcas-y-modelos)
7. [Usuarios](#7-usuarios)
8. [Exportaciones a Excel](#8-exportaciones-a-excel)
9. [Datos maestros](#9-datos-maestros)
10. [Modelo de datos propio](#10-modelo-de-datos-propio)
11. [Conexiones e integraciones](#11-conexiones-e-integraciones)
12. [Volumen y calidad de los datos](#12-volumen-y-calidad-de-los-datos)
13. [Seguridad, errores y código muerto](#13-seguridad-errores-y-código-muerto)
14. [Propuesta, decisiones y plan](#14-propuesta-decisiones-y-plan)

---

## 1. Resumen

| | |
|---|---|
| **Qué es** | Registro de las líneas telefónicas corporativas de Chile y Perú y de los dispositivos móviles (celulares y BAM) asignados a colaboradores, con su empresa, unidad de negocio y centro de costo |
| **Qué hace** | Alta y edición (sin borrado) de líneas y dispositivos, historial de cambios, marca de colaborador desvinculado (cruce con el maestro SAP), conteo de líneas por persona, descarga a Excel, mantenedores de marcas/modelos y de usuarios |
| **Qué no hace** | Aprobaciones, correos, notificaciones, borrado o baja de registros, carga masiva |
| **Registro en `seguridadapp`** | Aplicación 23, «LINEAS GRUPOFLESAN — Repositorio de telefonía y líneas Grupo Flesan», desde 2023-06-23 |
| **URL actual** | `https://lineastelefonicas.flesanmvi.com` |
| **Stack** | Laravel 6 (PHP 7.3), Blade + AdminLTE 3 + jQuery (DataTables, Select2, SweetAlert), Socialite (Google), Maatwebsite Excel |
| **Usuarios** | 17 registros (16 correos distintos): 12 Administrador, 4 Administrador Procesos, 1 Administrador Soporte |
| **Datos** | 1.513 líneas (1.149 Chile, 364 Perú), 887 dispositivos (todos Chile), 3.809 entradas de historial, 10 marcas, 120 modelos |

---

## 2. Pantallas y rutas

### Pantallas

Todas exigen sesión, salvo el login.

| Ruta | Pantalla | En el menú para |
|---|---|---|
| `/` | Login: «Ingresar con tu cuenta de Google» | Todos |
| `/home` | «Menú de bandejas»: tarjetas Mantenedor Chile y Mantenedor Perú | Todos |
| `/list_pro/{CL\|PE}` | Listado de líneas del país | Todos |
| `/newFormPro/{CL\|PE}` | Alta de línea | Todos |
| `/editFormPro/{id}` | Ficha y edición de línea, con historial | Todos |
| `/exportFormPro` | Descarga `LINEAS_ENTEL.xlsx` | Todos |
| `/list_disp` | Listado de dispositivos | Todos (solo bajo Mantenedor Chile) |
| `/newDisp` | Alta de dispositivo | Todos |
| `/editDisp/{id}` | Ficha y edición de dispositivo, con historial | Todos |
| `/exportFormDP` | Descarga `DISPOSITIVOS_GRUPO_FLESAN_PROCESOS.xlsx` | Todos |
| `/list_marcas_modelos` | Marcas y modelos: dos tablas y «Agregar» en ventana modal | Rol Administrador |
| `/newMarcas`, `/newModelo` | Contenido de las ventanas de alta | Rol Administrador |
| `/listUsers` | Usuarios: tabla, alta y edición en ventana modal | Rol Administrador |
| `/newUser`, `/editUser/{id}` | Contenido de las ventanas de usuario | Rol Administrador |
| `/logout` | Cerrar sesión | Todos |

Menú lateral: Inicio · Mantenedor Chile (Líneas Telefónicas, Dispositivos Móviles) · Mantenedor
Perú (Líneas Telefónicas) · Gestión plataforma (Usuarios, Marcas y modelos; solo rol
Administrador) · Cerrar sesión. Muestra el nombre y el rol del usuario.

«Rol Administrador» solo oculta el menú: las rutas no validan el rol (ver §13).

### API

Los formularios guardan por AJAX contra `/api/*`. Las respuestas tienen la forma
`{error, mensaje, tipo, titulo}` y se muestran con SweetAlert. Cualquier excepción se traduce en
«Existe un problema de conexión, inténtelo nuevamente».

| Ruta | Qué hace | Estado |
|---|---|---|
| `POST /api/saveSolicitud` | Crea una línea y su historial | En uso |
| `POST /api/editSolicitud` | Edita una línea y agrega historial | En uso |
| `POST /api/saveSolicitudDisp` | Crea un dispositivo y su historial | En uso |
| `POST /api/editSolicitudDisp` | Edita un dispositivo y agrega historial | En uso |
| `POST /api/saveUser` | Crea un usuario, o lo edita si llega `id_aplicacion_usuario` | En uso |
| `POST /api/saveMarca` | Crea una marca | En uso |
| `POST /api/saveModelo` | Crea un modelo | En uso |
| `POST /api/updateUser` | — | Rota: el método no existe |
| `POST /api/saveSolicitudTi`, `saveSolicitudDispTi`, `saveSolicitudNote` | Módulos TI y notebooks | Sin pantalla; tablas vacías |
| `POST /api/editSolicitudTi`, `editSolicitudDispTi`, `editSolicitudNote` | — | Rotas: el método no existe |
| `GET /editFormTI/{id}` | — | Rota: el método no existe |

---

## 3. Acceso, usuarios y roles

### Login

1. Google OAuth (Socialite), sin restricción de dominio: el filtro es la lista de usuarios.
2. Busca en `seguridadapp.aplicacion_usuario` (unida a `usuario_rol`) el correo de Google con
   `id_aplicacion = 23` y `estado_sesion = 1`.
3. Si no existe: vuelve al login con «Este usuario {correo} no se encuentra registrado en el
   sistema».
4. Si `estado_validacion = 0`: «Es necesario validar su dirección de correo Electrónico para poder
   Iniciar Sesión». El alta de usuarios siempre deja 1, así que en la práctica no ocurre.
5. Si existe: guarda en el usuario el token de Google (`refresh_token`), `provider_id`,
   `provider = 'GOOGLE'` y el avatar; inicia sesión con «recordarme» y lleva a `/home`.
6. La sesión se guarda en archivos del servidor y dura 120 minutos, pero la cookie de «recordarme»
   es de larga duración: en la práctica el usuario no vuelve a pasar por el login.

### Atributos que gobiernan los permisos

| Atributo | Dónde vive | Valores | Para qué se usa |
|---|---|---|---|
| Rol | `usuario_rol.id_rol` (se toma el primero) | 74 ADMINISTRADOR · 75 ADMINISTRADOR PROCESOS · 76 ADMINISTRADOR SOPORTE | Menú de administración (74) y filtro por área (75 y 76) |
| Área | `aplicacion_usuario.dni` (se reutiliza la columna DNI) → `s_lineas.tipo_user` | 1 PROCESOS · 2 SOPORTE | Se graba en cada registro que el usuario crea (`sl_area`) y filtra lo que ven los roles 75 y 76 |
| País | `aplicacion_usuario.pais` | CL · PE | Decide los campos de RUT de los formularios, el país de los dispositivos y el de la exportación de líneas (ver errores E1, E3 y E9) |

Hoy los 17 usuarios tienen país CL, aunque 4 tienen correo `@flesan.com.pe`. Rol y área van
juntos: los roles 74 y 75 son área Procesos; el rol 76, área Soporte.

### Qué ve cada rol

| | 74 Administrador | 75 Adm. Procesos | 76 Adm. Soporte |
|---|---|---|---|
| Listado de líneas (Chile o Perú) | Todas las del país | Solo las de su área | Solo las de su área |
| Listado de dispositivos | Todos los del país del usuario | Solo los de su área | Solo los de su área |
| Crear y editar líneas y dispositivos | Sí | Sí | Sí |
| Excel de líneas | País y área del usuario | Igual | Igual |
| Excel de dispositivos | Igual que su listado | Igual que su listado | Igual que su listado |
| Usuarios, marcas y modelos (menú) | Sí | No | No |

En la práctica, Procesos administra las líneas de Chile (todas son área Procesos) y Soporte las de
Perú (todas son área Soporte) más 15 dispositivos.

---

## 4. Líneas

Tabla `s_lineas.sl_registro_linea_pro`.

### Listado (`/list_pro/{país}`)

- Filtros: `sl_id_vigente = 1` y país de la URL; para los roles 75 y 76, además el área del
  usuario.
- Orden: la más reciente primero. Búsqueda, orden por columna y paginación en el navegador.
- Columnas: ver · Línea · Usuario · RUT usuario · Tipo línea · Empresa · Unidad de negocio ·
  Centro de costo · Estado · Estado usuario · Fecha registro · Fecha actualización · Cant. líneas.
- «Fecha registro» es la fecha de creación (dd-mm-aaaa). «Fecha actualización» es la fecha que
  ingresa el usuario (`sl_fecha`) o «SIN ACTUALIZAR» si está vacía.
- Botones «Descargar reporte» (Excel, §8) y «Agregar».

**Estado usuario (VIGENTE o DESVINCULADO)**

- Solo se calcula si la línea tiene RUT registrado en SAP (`sl_tipo_rut = 1`) y el RUT no es uno
  de los textos `DISPONIBLE`, `Familia Salgado` u `Obra Espacio Urbano 15 Norte`, que se usan en
  lugar de un RUT.
- Busca en `s_lineas.sap_maestro_colaborador` una fila con ese RUT (`national_id`) y
  `empl_status = '41111'` (activo). Si la encuentra: VIGENTE. Si no: DESVINCULADO, y la fila se
  pinta en rojo claro.
- El resto de las líneas (RUT fuera de SAP, Perú, sin RUT) muestra VIGENTE sin verificar.

**Cant. líneas**

- Cuántas líneas tiene el mismo RUT con el mismo tipo de línea, contando toda la tabla (sin
  filtrar país, área ni vigencia).
- Se muestra como «N Multimedia Internet» (tipo 1) o «N BAM» (tipo 2). Tipo 3 y líneas sin RUT:
  vacío.

### Alta (`/newFormPro/{país}`) y edición (`/editFormPro/{id}`)

| Campo | Oblig. | Origen y reglas | Columna |
|---|---|---|---|
| Empresa | Sí | Empresas del país (§9). Guarda también el nombre | `sl_rut_empresa`, `sl_nombre_empresa` |
| Unidad de negocio | Sí | Filtrada por la empresa elegida | `sl_unidad_negocio` |
| Centro de costos | Sí | Filtrado por el nombre de la unidad de negocio (§9). Guarda también el nombre | `sl_centro_costos` (código), `sl_nombre_cc` |
| Línea | Sí | Texto libre. Al salir del campo avisa «Esta línea ya está registrada.» si el número existe en cualquier país (en la edición avisa también con el número de la misma línea); **no impide guardar** | `sl_linea` |
| Tipo línea | Sí | Catálogo `tipo_plan` | `sl_tipo_linea` |
| Operador telefonía | Sí | Catálogo `operador` | `sl_operador` |
| Estado | Sí | Catálogo `estado_linea` | `sl_estado` |
| Fecha (en edición, «Fecha de actualización») | Sí | Fecha que informa el usuario | `sl_fecha` |
| RUT registrado en SAP (Chile) | Sí | Sí / No | `sl_tipo_rut` (1 / 2) |
| RUT usuario (Chile, SAP = Sí) | Sí | Lista de RUT de colaboradores activos; al elegir uno completa el nombre (nombre + apellido) | `sl_rut_usuario` |
| RUT usuario (Chile, SAP = No) | Sí | Texto libre | `sl_rut_usuario` |
| RUC usuario (Perú) | No | Texto libre | `sl_rut_usuario` |
| Nombre - apellido usuario | Sí | Texto libre o autocompletado | `sl_usuario` |
| N° PUC | No | Texto libre | `sl_numero_puc` |
| Comentario | No | Texto libre | `sl_comentario` |

Lo que pone el sistema: país (el de la URL), área (la de quien crea), `sl_id_vigente = 1`, fecha
de creación y de actualización. En la edición no cambian país, área ni fecha de creación; se
actualiza la fecha de actualización. Al crear vuelve al listado; al editar recarga la ficha.

En la edición de una línea de Chile, si el RUT guardado no está entre los colaboradores activos,
se muestra el campo de RUT manual.

**Historial** (`s_lineas.historial_linea`). Cada alta y cada edición agrega un texto:

- «{correo} ha agregado línea para {usuario} con fecha {dd-mm-aaaa hh:mm:ss}.»
- «{correo} ha actualizado línea para {usuario} con fecha {dd-mm-aaaa hh:mm:ss}.»

No registra qué cambió. La ficha muestra todas las entradas, la más reciente primero. La hora está
en UTC (§10).

**No hay** borrado ni baja: `sl_id_vigente` siempre queda en 1.

---

## 5. Dispositivos

Tabla `s_lineas.sl_dispositivo`. Usa siempre el país del usuario (hoy, Chile) y solo aparece en el
menú de Chile. No se asocia a una línea (`sl_id_linea` siempre vacío).

### Listado (`/list_disp`)

- Filtros: `sl_id_vigente = 1` y país del usuario; para los roles 75 y 76, además su área.
- Columnas: ver · Marca · Modelo · Tipo dispositivo · IMEI · Nombre empresa · Unidad de negocio ·
  Usuario · RUT usuario · Estado · Fecha registro · Fecha actualización.
- «Nombre empresa» se busca en el maestro de empresas; el dispositivo solo guarda el RUT.

### Alta (`/newDisp`) y edición (`/editDisp/{id}`)

| Campo | Oblig. | Origen y reglas | Columna |
|---|---|---|---|
| Empresa | Sí | Empresas del país del usuario | `sl_rut_empresa` |
| Unidad de negocio | Sí | Filtrada por empresa | `sl_unidad_negocio` |
| Centro de costos | Sí | Filtrado por unidad de negocio. Solo guarda el código | `sl_centro_costos` |
| Estado | Sí | Catálogo `estado_dispositivos` | `sl_estado` |
| Fecha | Sí | Fecha que informa el usuario | `sl_fecha` |
| Operador telefonía | Sí | Catálogo `operador` | `sl_operador` |
| Tipo dispositivo | Sí | Catálogo `tipo_dispositivo` (Celular, Bam) | `sl_tipo_dispo` |
| Marca | Sí | Marcas vigentes del tipo elegido | `sl_marca` |
| Modelo | Sí | Modelos de la marca elegida | `sl_modelo` |
| IMEI | Sí | Texto libre. Avisa «Este Imei ya está registrado.» si existe; **no impide guardar** | `sl_imei` |
| Costo $0 | Sí | Sí (1) / No (2) | `sl_tipo_costo` |
| RUT registrado en SAP y RUT usuario (Chile) | Sí | Igual que en líneas | `sl_tipo_rut`, `sl_rut` |
| RUC usuario (Perú) | No | Texto libre | `sl_rut` |
| Nombre - apellido usuario | Sí | Texto libre o autocompletado | `sl_usuario` |
| N° PUC | No | Texto libre | `sl_numero_puc` |
| Factura | Sí | Texto libre | `sl_facturas` |
| Comentario | No | Texto libre | `sl_comentario` |

- Marca, modelo, IMEI y costo aparecen al elegir el tipo. En la edición, IMEI y costo solo se
  muestran si el tipo es Celular.
- Historial (`s_lineas.historial_dispositivos`): «{correo} ha agregado un dispositivo para
  {usuario} con fecha …» y «{correo} ha actualizado el registro para {usuario} con fecha …». El
  alta se graba sin el id del dispositivo (error E6), por eso la ficha solo muestra ediciones.

---

## 6. Marcas y modelos

Solo en el menú del rol Administrador.

- Dos tablas: marcas vigentes (marca, tipo de dispositivo) y modelos vigentes (marca, modelo,
  tipo), en orden alfabético y en mayúsculas.
- Agregar marca: tipo de dispositivo y nombre. Avisa si ya existe esa marca para el mismo tipo, sin
  impedir guardar.
- Agregar modelo: tipo, luego marca (filtrada por tipo), luego nombre. Avisa si ya existe el mismo
  modelo para esa marca y tipo, sin impedir guardar.
- Guarda autor (`user_create`), fecha (`date_create`) y `sl_id_vigente = 1`. El nombre queda tal
  como se escribió: las mayúsculas del formulario son solo visuales.
- No hay edición ni baja. Las 2 marcas y el modelo que figuran como no vigentes se cambiaron
  directo en la base.

---

## 7. Usuarios

Solo en el menú del rol Administrador.

- Tabla: Usuario (correo) · País · Perfil (rol) · Área · Estado (ACTIVO o NO ACTIVO).
- Alta y edición en ventana modal: Correo, País (Perú o Chile), Nombre y apellido (solo letras sin
  tildes ni ñ, y espacios), Perfil (roles de la aplicación 23) y Área (Procesos o Soporte). Todos
  obligatorios.
- Guarda en `seguridadapp.aplicacion_usuario` (correo, nombre, país, área en la columna `dni`,
  `id_aplicacion = 23`, `estado_sesion = 1`, `estado_validacion = 1`, `fecha_ini` = hoy) y en
  `usuario_rol` (rol y `fecha_ini`).
- No permite desactivar (siempre deja `estado_sesion = 1`) ni revisa correos repetidos (hay uno).
  Cada edición reescribe la fecha de inicio.

---

## 8. Exportaciones a Excel

### `LINEAS_ENTEL.xlsx`

- Botón en el listado de líneas de cualquier país.
- Filtro: líneas vigentes del **país y área del usuario**, sin importar el rol ni el país del
  listado (error E3).
- Columnas: Línea · Usuario · RUT usuario · Tipo línea · Estado · Fecha registro (dd/mm/aaaa) ·
  Fecha actualización (o «SIN ACTUALIZAR») · PUC · Empresa (mayúsculas) · RUT empresa · Unidad de
  negocio · Centro de costo (nombre) · Cod centro de costo · Comentario · Operador · RUT en SAP
  (EN SAP / NO EN SAP) · Estado colaborador (ACTIVO / DESVINCULADO, solo para RUT en SAP).

### `DISPOSITIVOS_GRUPO_FLESAN_PROCESOS.xlsx`

- Filtro: el mismo del listado de dispositivos.
- Columnas: Marca · Modelo (mayúsculas) · Tipo dispositivo · IMEI · Usuario · RUT_usuario · Estado
  · Fecha registro · Fecha actualización · Nro PUC · Costo (SÍ si es 1, NO en cualquier otro caso)
  · Comentario · Factura · Operador · Unidad de negocio · Centro de gestión (código) · RUT empresa ·
  Nombre empresa.

Ambas tienen el error del operador (E4); la de líneas, además, el de «RUT en SAP» (E5).

---

## 9. Datos maestros

Todo de solo lectura.

| Dato | Chile (base `flesan`) | Perú (base `grupo_flesan_pe`) |
|---|---|---|
| Empresas | `public.maestro_rut` con `esquema = 'public'` (110) | `legal.ejb_con_maestro_rut_gf` (26) |
| Unidades de negocio | Distintas de `upper(unidad_negocio)` en `public.maestro_cc`; la empresa es `rut_comprador` (33 unidades, 107 empresas) | Distintas de `upper(unidad_negocio)` en `ggo.ejb_centro_gestion_actividad_gf`; la empresa es `rut` (17 unidades) |
| Centros de costo | `public.centro_gestion_actividad` unido a `maestro_cc` por empresa (`rut = rut_comprador`) y código (`codigo_centro_gestion = cod_cc`). Excluye `nombre = '0'`. **Incluye inactivos** (1.136 activos de 4.341) | Vista `ggo.vw_ceco_consolidad_gf` (3.702), sin los nombres `.`, `0`, `1` y `NO APLICA` |
| Colaboradores | Copia `s_lineas.sap_maestro_colaborador` en `srvpd_bd`, con `empl_status = '41111'` | — |

Cascadas:

- Empresa → unidades de negocio de esa empresa.
- Unidad de negocio → centros de costo cuya unidad tiene ese nombre, **de cualquier empresa** (E7).
  En el alta de líneas, además, se cargan juntos los centros de Chile y Perú.
- En la edición, los centros se cargan por empresa, sin filtrar por unidad.
- Todo se carga completo al abrir el formulario y se filtra en el navegador. Nombres y códigos se
  muestran en mayúsculas.

Colaboradores: la copia `s_lineas.sap_maestro_colaborador` tiene 35.091 filas (3.070 activas); el
origen `flesan_rrhh.sap_maestro_colaborador` tiene 70.204 (3.058 RUT activos distintos). El
aplicativo no carga esa copia y no está documentado quién la actualiza. En el origen, la regla de
la plantilla nueva (`right(empl_status, 1) = '1'`) y la del aplicativo (`= '41111'`) hoy dan el
mismo resultado.

---

## 10. Modelo de datos propio

Base `srvpd_bd`, esquema `s_lineas`. No hay claves foráneas (salvo `modelo_disp → marca_disp`), ni
restricciones de unicidad, ni índices fuera de las claves primarias. Las fechas con hora se graban
**en UTC** sin zona (`timestamp without time zone`, porque Laravel usa `timezone = UTC`); las de
`sl_dispositivo` son de tipo `date`.

| Tabla | Filas | Uso |
|---|---|---|
| `sl_registro_linea_pro` | 1.513 | Líneas |
| `sl_dispositivo` | 887 | Dispositivos |
| `historial_linea` | 2.856 | Historial de líneas |
| `historial_dispositivos` | 953 | Historial de dispositivos |
| `marca_disp` / `modelo_disp` | 10 / 120 | Marcas y modelos |
| `tipo_plan`, `estado_linea`, `operador`, `tipo_dispositivo`, `estado_dispositivos`, `tipo_user` | — | Catálogos |
| `sap_maestro_colaborador` | 35.091 | Copia del maestro de colaboradores |
| `sl_registro_linea_ti`, `sl_dispositivo_ti`, `sl_notebooks` | — | Sin uso (las dos últimas vacías) |

### Catálogos

| Catálogo | Valores actuales |
|---|---|
| `tipo_plan` (tipo de línea) | 1 Multimedia Internet · 2 BAM · 3 Multimedia Internet Pro |
| `estado_linea` | 1 ACTIVA · 2 INACTIVA · 3 MIGRADA A PREPAGO · 4 DISPONIBLE |
| `operador` | 1 ENTEL · 2 MOVISTAR · 3 CLARO |
| `tipo_dispositivo` | 1 Celular · 2 Bam |
| `estado_dispositivos` | 1 ENTREGADO · 2 DEFECTUOSO · 3 ROBADO · 4 EN OFICINA - NUEVO · 5 EN OFICINA - USADO · 6 VENDIDO COLABORADOR |
| `tipo_user` (área) | 1 PROCESOS · 2 SOPORTE |

No hay pantallas para administrar los catálogos.

### Columnas de las tablas principales

**`sl_registro_linea_pro`**: `sl_id_registro` (PK serial), `sl_pais`, `sl_linea`, `sl_tipo_linea`
(int), `sl_operador` (texto con el id), `sl_estado` (int), `sl_rut_empresa`, `sl_nombre_empresa`,
`sl_unidad_negocio`, `sl_centro_costos`, `sl_nombre_cc`, `sl_usuario`, `sl_rut_usuario`,
`sl_tipo_rut` (int 1/2), `sl_numero_puc`, `sl_comentario`, `sl_fecha` (date), `sl_area` (texto
'1'/'2'), `sl_id_vigente`, `sl_fecha_creacion`, `sl_fecha_actualización` (con tilde en el nombre).
El código no escribe `sl_dispositivo`, `sl_tipo_dispositivo` ni `sl_emp_sap`.

**`sl_dispositivo`**: `sl_id_dispositivo` (PK serial), `sl_pais`, `sl_tipo_dispo`, `sl_marca` y
`sl_modelo` (ids), `sl_imei`, `sl_tipo_costo` (int), `sl_rut_empresa`, `sl_unidad_negocio`,
`sl_centro_costos`, `sl_estado`, `sl_operador` (texto), `sl_usuario`, `sl_rut`, `sl_tipo_rut`
(texto), `sl_numero_puc`, `sl_facturas`, `sl_comentario`, `sl_fecha`, `sl_area`, `sl_id_vigente`,
`sl_fecha_creacion` y `sl_fecha_actualización` (date). `sl_id_linea` siempre vacío.

**`historial_linea` y `historial_dispositivos`**: `sl_id_historial`, `sl_id_registro` (id de la
línea o del dispositivo), `sl_historial` (texto de hasta 255), copias de `sl_usuario`,
`sl_rut_empresa`, `sl_unidad_negocio`, `sl_centro_costos`, `sl_rut_usuario` (siempre vacío),
fechas y `sl_id_vigente`.

**`marca_disp`**: `sl_id_marca`, `sl_nom_marca`, `tipo_dispositivo`, `sl_id_vigente`,
`user_create`, `date_create`. **`modelo_disp`**: lo mismo más `sl_id_marca`.

En `srvpd_bd` también están los esquemas `s_lineas eliminar`, `s_lineas eliminar 2.0` y
`s_lineas_Malo`, que el código no usa (parecen respaldos).

---

## 11. Conexiones e integraciones

| Conexión (Laravel) | Servidor / base | Qué usa | Acceso |
|---|---|---|---|
| `s_lineas` (por defecto) | `192.168.50.101` / `srvpd_bd`, esquema `s_lineas` | Todo lo propio: líneas, dispositivos, historial, catálogos, marcas, modelos y la copia del maestro de colaboradores | Lectura y escritura |
| `seguridadapp` | `192.168.50.101` / `srvpd_bd`, esquema `seguridadapp` | Usuarios y roles de la aplicación 23 (`aplicacion_usuario`, `usuario_rol`, `rol_aplicacion`) | Lectura y escritura |
| `datawarehouse-cl` | `10.168.0.22` / `flesan`, esquema `public` | Empresas, unidades de negocio y centros de costo de Chile | Lectura |
| `datawarehouse-pe-new` | `10.168.0.22` / `grupo_flesan_pe`, esquemas `legal` y `ggo` | Empresas, unidades de negocio y centros de costo de Perú | Lectura |
| `flesan_rrhh` | `10.168.0.22` / `flesan`, esquema `flesan_rrhh` | Definida, pero no se usa | — |
| Google OAuth | — | Login. El cliente OAuth se cambió el 2026-08-10 (queda un respaldo del `.env` de esa fecha) | — |

Configuradas pero sin uso (código heredado de otros aplicativos, no se migra): SMTP de Gmail y las
plantillas de correo (aprobación y rechazo de siniestros, verificación de usuario), API GF
(`api.flesanmvi.com`: correos, Drive, SUNAT, GRC), Builder (`gateway.builder.cl`), Redis, Pusher y
AWS.

---

## 12. Volumen y calidad de los datos

Al 2026-10-26.

**Líneas: 1.513, todas vigentes**

- Chile 1.149 (todas área Procesos) y Perú 364 (todas área Soporte).
- Tipo: 1.322 Multimedia Internet, 191 BAM, ninguna Multimedia Internet Pro.
- Estado: 923 Activa, 573 Migrada a prepago, 14 Inactiva, 3 Disponible.
- Operador: 1.512 ENTEL y 1 sin operador.
- RUT: en Chile, 784 en SAP y 365 fuera de SAP. **Las 364 de Perú no tienen RUT** (error E1); en
  total, 556 líneas sin RUT. Formato en Chile: 892 `12345678-9`, 1 con puntos, 64 en otros
  formatos.
- 364 líneas sin «fecha» (`sl_fecha`), la misma cifra que las de Perú: probablemente se cargaron
  de forma masiva (por verificar).
- 4 números de línea repetidos (8 filas). Textos en lugar de RUT: `DISPONIBLE` (10) y los otros
  dos (5).
- Desde 2023-06-29; último movimiento el 2026-10-21.

**Dispositivos: 887 (886 vigentes)**

- Todos de Chile: 872 área Procesos y 15 área Soporte.
- 773 celulares y 114 BAM.
- Estado: 652 Entregado, 81 En oficina - nuevo, 42 En oficina - usado, 57 Defectuoso, 29 Vendido
  colaborador, 25 Robado, 1 sin estado.
- 8 IMEI repetidos (29 filas).
- Costo $0: 197 Sí, 474 No y 216 con valores que el formulario actual no produce (0 o vacío).
- Operador: 872 ENTEL, 13 MOVISTAR y 2 con valor 0. RUT en SAP: 501 sí, 194 no, 192 vacío.

**Historial**

- Líneas: 2.856 entradas (422 altas y 2.434 ediciones) de 1.156 líneas; 357 líneas no tienen
  historial.
- Dispositivos: 953 entradas, 430 de ellas sin id de dispositivo (las altas, error E6).

**Usuarios**: 17 filas con 16 correos distintos (13 filas `@flesan.cl` y 4 `@flesan.com.pe`),
todas con país CL.

**Por verificar antes de migrar**: marcas o modelos huérfanos en dispositivos, formato de IMEI y de
números de línea, cuántas líneas se marcan hoy como DESVINCULADO, si las empresas de las líneas de
Perú están en el maestro de Perú, y si los centros de costo usados en Chile siguen activos.

---

## 13. Seguridad, errores y código muerto

### Seguridad

Conviene corregir esto en el aplicativo actual, sin esperar la migración.

1. **La API no exige sesión.** Las rutas `/api/*` no tienen autenticación ni protección CSRF, y el
   usuario que actúa llega en un campo oculto del formulario (`id_aplicacion_usuario`). Quien
   llegue al servidor puede crear o editar líneas, dispositivos, marcas y modelos, y **crear
   usuarios con rol Administrador** (`POST /api/saveUser`).
2. **Rutas de administración sin control de rol.** Usuarios, marcas y modelos solo se ocultan del
   menú; un usuario de rol 75 o 76 puede abrirlas por la URL.
3. **Suplantación fija en el login** (`app/Http/Controllers/Auth/LoginController.php`, líneas
   82-84): una cuenta inicia sesión con la identidad de otra.
4. **Credenciales en el código versionado** (`app/Models/ApiGF.php`, en GitHub): usuario y clave de
   la API GF, y clave de API y credenciales de Builder. Hay que rotarlas.
5. **`APP_DEBUG=true` y `APP_ENV=local` en el `.env` del servidor**: ante un error, Laravel muestra
   trazas y valores de configuración.

### Errores funcionales

Se corrigen en la versión nueva, salvo que se decida lo contrario (ver [`PLAN.md`](PLAN.md)).

| # | Error | Efecto hoy |
|---|---|---|
| E1 | Los campos de RUT del formulario dependen del país del **usuario**; el servidor usa el de la línea | Las líneas de Perú se guardan sin RUT (364 de 364) |
| E2 | La edición de líneas carga empresas y unidades del país del usuario | Al editar una línea de Perú se ofrecen empresas de Chile |
| E3 | El Excel de líneas filtra por país y área del usuario, no por el listado | Nadie puede exportar las líneas de Perú; el rol 74 solo exporta su área |
| E4 | Operador en Excel: el `CASE` repite el valor `'1'` | MOVISTAR nunca aparece; todo lo que no es ENTEL sale como CLARO |
| E5 | «RUT en SAP» del Excel compara `sl_operador` en vez de `sl_tipo_rut` | «NO EN SAP» queda vacío |
| E6 | El historial de alta de dispositivos se graba sin id (`Dispositivos.php`, línea 226) | 430 entradas huérfanas; la ficha no muestra el alta |
| E7 | Centros de costo filtrados por nombre de unidad, no por empresa, e incluye inactivos | Se ofrecen centros de otras empresas y centros cerrados |
| E8 | Los duplicados (línea, IMEI, marca, modelo) solo avisan | 4 números y 8 IMEI repetidos |
| E9 | Dispositivos siempre con el país del usuario | No se pueden registrar dispositivos de Perú |
| E10 | «Cant. líneas» cuenta sobre toda la tabla (sin filtrar país, área ni vigencia) e ignora el tipo 3 | Las líneas tipo 3 no muestran cantidad |
| E11 | El nombre de usuario no acepta tildes ni ñ | — |
| E12 | Usuarios: no se pueden desactivar, se permiten correos repetidos y la edición reescribe la fecha de inicio | — |
| E13 | «Volver» apunta a un dominio fijo (`lineastelefonicas.grupoflesan.com`) distinto del actual | — |
| E14 | Estado del colaborador: una consulta por línea contra una copia del maestro de origen incierto | Lentitud y posible desfase |

### Código muerto y heredado (no se migra)

- Módulos TI y notebooks: `FormTI.php` (declara la clase `FormProPE`), `DispositivosTI`, `Notebook`,
  `DispTIController` (sin rutas), sus exportaciones y vistas; tablas `sl_registro_linea_ti`,
  `sl_dispositivo_ti` y `sl_notebooks`.
- Restos de otros aplicativos: `CCostosController` y las vistas `centros/*` (su modelo no existe),
  `MailController` y `aprobate.blade.php`, los 5 `Mailable` y sus plantillas (siniestros),
  `exports/soliExports.blade.php`, `script.sql` (siniestros), `ApiGF` (SIPO), `PubliPrivado`
  (pólizas) y `welcome.blade.php`.
- Columnas sin uso: `sl_dispositivo`, `sl_tipo_dispositivo` y `sl_emp_sap` en líneas; `sl_id_linea`
  en dispositivos.
- Conexión `flesan_rrhh` y variables de SMTP, Redis, Pusher y AWS.

---

## 14. Propuesta, decisiones y plan

El 2026-10-26 se decidió construir la plataforma nueva sobre las mismas bases y tablas del
aplicativo antiguo (`s_lineas` y `seguridadapp` en `srvpd_bd`), sin esquema nuevo ni migración de
datos, y por ahora solo con la conexión de Chile. La arquitectura, las medidas de seguridad, los
módulos y las decisiones pendientes están en [`PLAN.md`](PLAN.md).
