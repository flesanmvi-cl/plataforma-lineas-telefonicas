-- Datos de DESARROLLO para la base local de `npm run db:dev`. Los catálogos y la aplicación 23 con
-- sus roles tienen los valores reales (docs/MIGRACION.md §3 y §10); todo lo demás es ficticio:
-- personas, RUT, números de línea, IMEI y empresas de prueba. NUNCA se ejecuta en QA ni en
-- producción.
--
-- Casos que cubre a propósito: un número de línea y un IMEI repetidos, una persona con dos líneas,
-- un registro de otra área, uno no vigente, líneas de Perú sin RUT ni fecha, un usuario inactivo y
-- uno de otra aplicación, y una entrada de historial de alta de dispositivo sin id (error E6).
-- Fechas con hora en UTC sin zona, como las graba el aplicativo antiguo.

-- ── Catálogos (valores reales) ──────────────────────────────────────────────

INSERT INTO s_lineas.tipo_plan (sl_id_tipo_linea, sl_nom_linea, sl_id_vigente) VALUES
  (1, 'Multimedia Internet', 1),
  (2, 'BAM', 1),
  (3, 'Multimedia Internet Pro', 1);

INSERT INTO s_lineas.estado_linea (sl_id_estado, sl_nom_estado, sl_id_vigente) VALUES
  (1, 'ACTIVA', 1),
  (2, 'INACTIVA', 1),
  (3, 'MIGRADA A PREPAGO', 1),
  (4, 'DISPONIBLE', 1);

INSERT INTO s_lineas.operador (sl_id_operador, sl_nom_operador, sl_pais_operador, sl_id_vigente) VALUES
  (1, 'ENTEL', NULL, 1),
  (2, 'MOVISTAR', NULL, 1),
  (3, 'CLARO', NULL, 1);

INSERT INTO s_lineas.tipo_dispositivo (sl_id_tipo_dispositivo, sl_nom_dispositivo, sl_id_vigente) VALUES
  (1, 'Celular', 1),
  (2, 'Bam', 1);

INSERT INTO s_lineas.estado_dispositivos (sl_id_estado, sl_nom_estado, sl_id_vigente) VALUES
  (1, 'ENTREGADO', 1),
  (2, 'DEFECTUOSO', 1),
  (3, 'ROBADO', 1),
  (4, 'EN OFICINA - NUEVO', 1),
  (5, 'EN OFICINA - USADO', 1),
  (6, 'VENDIDO COLABORADOR', 1);

INSERT INTO s_lineas.tipo_user (sl_id_tipo_user, sl_nom_tipo_user, sl_id_vigente) VALUES
  ('1', 'PROCESOS', 1),
  ('2', 'SOPORTE', 1);

-- ── Marcas y modelos (nombres guardados tal como se escriben; las listas los muestran en mayúsculas)

INSERT INTO s_lineas.marca_disp (sl_id_marca, sl_nom_marca, sl_id_vigente, user_create, date_create, tipo_dispositivo) VALUES
  (1, 'Samsung', 1, 'dev@flesan.cl', '2026-01-15 13:00:00', 1),
  (2, 'Apple', 1, 'dev@flesan.cl', '2026-01-15 13:00:00', 1),
  (3, 'Motorola', 1, 'dev@flesan.cl', '2026-01-15 13:00:00', 1),
  (4, 'Nokia', 0, 'dev@flesan.cl', '2026-01-15 13:00:00', 1),
  (5, 'Huawei', 1, 'dev@flesan.cl', '2026-01-15 13:00:00', 2),
  (6, 'ZTE', 1, 'dev@flesan.cl', '2026-01-15 13:00:00', 2);

INSERT INTO s_lineas.modelo_disp (sl_id_modelo, sl_id_marca, sl_nom_modelo, sl_id_vigente, user_create, date_create, tipo_dispositivo) VALUES
  (1, 1, 'Galaxy A15', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (2, 1, 'Galaxy A25', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (3, 2, 'iPhone 13', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (4, 2, 'iPhone 15', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (5, 3, 'Moto G54', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (6, 4, 'Nokia G21', 0, 'dev@flesan.cl', '2026-01-15 13:05:00', 1),
  (7, 5, 'E3372', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 2),
  (8, 6, 'MF79U', 1, 'dev@flesan.cl', '2026-01-15 13:05:00', 2);

-- ── Líneas (ficticias) ──────────────────────────────────────────────────────

INSERT INTO s_lineas.sl_registro_linea_pro (
  sl_id_registro, sl_pais, sl_linea, sl_tipo_linea, sl_estado, sl_operador, sl_tipo_rut, sl_rut_usuario, sl_usuario,
  sl_rut_empresa, sl_nombre_empresa, sl_unidad_negocio, sl_centro_costos, sl_nombre_cc,
  sl_numero_puc, sl_comentario, sl_fecha, sl_area, sl_id_vigente, sl_fecha_creacion, "sl_fecha_actualización"
) VALUES
  (1, 'CL', '912340001', 1, 1, '1', 1, '11111111-1', 'Colaborador Prueba Uno',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0001', 'CENTRO DE PRUEBA 1',
   '1234', NULL, '2026-03-10', '1', 1, '2026-03-10 14:00:00', '2026-05-04 15:30:00'),
  (2, 'CL', '912340002', 2, 1, '1', 1, '11111111-1', 'Colaborador Prueba Uno',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0001', 'CENTRO DE PRUEBA 1',
   NULL, NULL, '2026-04-02', '1', 1, '2026-04-02 12:10:00', '2026-04-02 12:10:00'),
  (3, 'CL', '912340003', 1, 3, '1', 2, '9876543-3', 'Persona Externa Prueba',
   '96000000-5', 'CONSTRUCTORA DE PRUEBA SPA', 'EDIFICACION PRUEBA', 'CC0101', 'OBRA DE PRUEBA',
   NULL, 'Asignada a contratista', NULL, '1', 1, '2026-02-20 18:45:00', '2026-06-11 13:00:00'),
  (4, 'CL', '912340004', 1, 4, '1', 2, 'DISPONIBLE', 'DISPONIBLE',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0002', 'CENTRO DE PRUEBA 2',
   NULL, NULL, '2026-06-01', '1', 1, '2026-06-01 16:00:00', '2026-06-01 16:00:00'),
  (5, 'CL', '912340005', 1, 2, '2', 1, '12345678-5', 'Colaborador Prueba Dos',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0001', 'CENTRO DE PRUEBA 1',
   NULL, NULL, '2026-07-15', '1', 1, '2026-01-05 15:00:00', '2026-07-15 14:20:00'),
  (6, 'CL', '912340006', 3, 1, '3', 1, '13131313-6', 'Colaborador Prueba Tres',
   '96000000-5', 'CONSTRUCTORA DE PRUEBA SPA', 'EDIFICACION PRUEBA', 'CC0101', 'OBRA DE PRUEBA',
   '5678', 'Línea de jefatura', '2026-08-03', '1', 1, '2026-08-03 13:00:00', '2026-08-03 13:00:00'),
  -- Mismo número que la línea 1 (el antiguo solo avisa y deja guardar).
  (7, 'CL', '912340001', 1, 1, '1', 1, '15555555-6', 'Colaborador Prueba Cuatro',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0002', 'CENTRO DE PRUEBA 2',
   NULL, NULL, '2026-09-01', '1', 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00'),
  -- Línea de Chile del área Soporte: no la ve un usuario de Procesos (rol 75).
  (8, 'CL', '912340008', 1, 1, '1', 1, '22222222-2', 'Colaborador Prueba Cinco',
   '76000000-0', 'EMPRESA DE PRUEBA S.A.', 'UNIDAD DE PRUEBA', 'CC0002', 'CENTRO DE PRUEBA 2',
   NULL, NULL, '2026-09-20', '2', 1, '2026-09-20 17:00:00', '2026-09-20 17:00:00'),
  -- Perú: sin RUT ni fecha, como las 364 líneas reales (error E1).
  (9, 'PE', '987650001', 1, 1, '1', NULL, NULL, 'Colaborador Perú Uno',
   '20100000001', 'EMPRESA PERU DE PRUEBA S.A.C.', 'UNIDAD PERU', 'PE0001', 'CENTRO PERU 1',
   NULL, NULL, NULL, '2', 1, '2025-11-12 15:00:00', '2025-11-12 15:00:00'),
  (10, 'PE', '987650002', 2, 3, '1', NULL, NULL, 'Colaborador Perú Dos',
   '20100000001', 'EMPRESA PERU DE PRUEBA S.A.C.', 'UNIDAD PERU', 'PE0001', 'CENTRO PERU 1',
   NULL, NULL, NULL, '2', 1, '2025-11-12 15:00:00', '2025-11-12 15:00:00'),
  (11, 'PE', '987650003', 1, 1, '1', NULL, NULL, 'Colaborador Perú Tres',
   '20100000001', 'EMPRESA PERU DE PRUEBA S.A.C.', 'UNIDAD PERU', 'PE0002', 'CENTRO PERU 2',
   NULL, NULL, NULL, '2', 1, '2025-11-12 15:00:00', '2025-11-12 15:00:00');

INSERT INTO s_lineas.historial_linea (
  sl_id_registro, sl_historial, sl_usuario, sl_rut_usuario, sl_rut_empresa, sl_unidad_negocio, sl_centro_costos,
  sl_fecha_creacion, "sl_fecha_actualización", sl_id_vigente
) VALUES
  (1, 'dev@flesan.cl ha agregado línea para Colaborador Prueba Uno con fecha 10-03-2026 14:00:00.', 'Colaborador Prueba Uno', NULL,
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', '2026-03-10 14:00:00', '2026-03-10 14:00:00', 1),
  (1, 'procesos.prueba@flesan.cl ha actualizado línea para Colaborador Prueba Uno con fecha 04-05-2026 15:30:00.', 'Colaborador Prueba Uno', NULL,
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', '2026-05-04 15:30:00', '2026-05-04 15:30:00', 1),
  (3, 'dev@flesan.cl ha agregado línea para Persona Externa Prueba con fecha 20-02-2026 18:45:00.', 'Persona Externa Prueba', NULL,
   '96000000-5', 'EDIFICACION PRUEBA', 'CC0101', '2026-02-20 18:45:00', '2026-02-20 18:45:00', 1),
  (3, 'dev@flesan.cl ha actualizado línea para Persona Externa Prueba con fecha 11-06-2026 13:00:00.', 'Persona Externa Prueba', NULL,
   '96000000-5', 'EDIFICACION PRUEBA', 'CC0101', '2026-06-11 13:00:00', '2026-06-11 13:00:00', 1),
  (5, 'dev@flesan.cl ha actualizado línea para Colaborador Prueba Dos con fecha 15-07-2026 14:20:00.', 'Colaborador Prueba Dos', NULL,
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', '2026-07-15 14:20:00', '2026-07-15 14:20:00', 1);

-- ── Dispositivos (ficticios; todos de Chile, como en producción) ────────────

INSERT INTO s_lineas.sl_dispositivo (
  sl_id_dispositivo, sl_pais, sl_tipo_dispo, sl_marca, sl_modelo, sl_imei, sl_tipo_costo, sl_estado, sl_operador,
  sl_tipo_rut, sl_rut, sl_usuario, sl_rut_empresa, sl_unidad_negocio, sl_centro_costos,
  sl_numero_puc, sl_facturas, sl_comentario, sl_fecha, sl_area, sl_id_vigente, sl_fecha_creacion, "sl_fecha_actualización"
) VALUES
  (1, 'CL', 1, 1, 1, '350000000000001', 2, 1, '1', '1', '11111111-1', 'Colaborador Prueba Uno',
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', NULL, 'F-1001', NULL, '2026-03-10', '1', 1, '2026-03-10', '2026-05-04'),
  (2, 'CL', 1, 2, 4, '350000000000002', 1, 4, '1', NULL, NULL, 'EN OFICINA',
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0002', NULL, 'F-1002', 'Equipo de reemplazo', '2026-06-01', '1', 1, '2026-06-01', '2026-06-01'),
  (3, 'CL', 2, 5, 7, '350000000000003', 2, 1, '1', '1', '12345678-5', 'Colaborador Prueba Dos',
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', NULL, 'F-1003', NULL, '2026-01-05', '1', 1, '2026-01-05', '2026-01-05'),
  -- Mismo IMEI que el dispositivo 1 (el antiguo solo avisa y deja guardar).
  (4, 'CL', 1, 3, 5, '350000000000001', 2, 2, '1', '1', '13131313-6', 'Colaborador Prueba Tres',
   '96000000-5', 'EDIFICACION PRUEBA', 'CC0101', NULL, 'F-1004', 'Pantalla rota', '2026-08-03', '1', 1, '2026-08-03', '2026-08-20'),
  -- Del área Soporte.
  (5, 'CL', 1, 1, 2, '350000000000005', 2, 1, '1', '1', '22222222-2', 'Colaborador Prueba Cinco',
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0002', NULL, 'F-1005', NULL, '2026-09-20', '2', 1, '2026-09-20', '2026-09-20'),
  -- No vigente: no debe aparecer en el listado.
  (6, 'CL', 1, 2, 3, '350000000000006', 2, 6, '1', '1', '15555555-6', 'Colaborador Prueba Cuatro',
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0002', NULL, 'F-1006', NULL, '2025-12-01', '1', 0, '2025-12-01', '2025-12-01');

INSERT INTO s_lineas.historial_dispositivos (
  sl_id_registro, sl_historial, sl_usuario, sl_rut_usuario, sl_rut_empresa, sl_unidad_negocio, sl_centro_costos,
  sl_fecha_creacion, "sl_fecha_actualización", sl_id_vigente
) VALUES
  -- Alta guardada sin id, como lo hace el antiguo (error E6).
  (NULL, 'dev@flesan.cl ha agregado un dispositivo para Colaborador Prueba Uno con fecha 10-03-2026 14:05:00.', 'Colaborador Prueba Uno', NULL,
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', '2026-03-10 14:05:00', '2026-03-10 14:05:00', 1),
  (1, 'procesos.prueba@flesan.cl ha actualizado el registro para Colaborador Prueba Uno con fecha 04-05-2026 15:40:00.', 'Colaborador Prueba Uno', NULL,
   '76000000-0', 'UNIDAD DE PRUEBA', 'CC0001', '2026-05-04 15:40:00', '2026-05-04 15:40:00', 1);

-- ── seguridadapp: aplicación 23 y sus roles (valores reales) ────────────────

INSERT INTO seguridadapp.aplicacion (id_aplicacion, nombre, descripcion, fecha_ini, fecha_fin) VALUES
  (22, 'OTRA APLICACION DE PRUEBA', 'Para comprobar que solo cuenta la aplicación 23', '2023-01-01', NULL),
  (23, 'LINEAS GRUPOFLESAN', 'REPOSITORIO DE TELEFONIA Y LINEAS GRUPOFLESAN', '2023-06-23', NULL);

INSERT INTO seguridadapp.rol_aplicacion (id_rol, id_aplicacion, nombre) VALUES
  (73, 22, 'ADMINISTRADOR'),
  (74, 23, 'ADMINISTRADOR'),
  (75, 23, 'ADMINISTRADOR PROCESOS'),
  (76, 23, 'ADMINISTRADOR SOPORTE');

-- Usuarios ficticios. dev@flesan.cl coincide con la sesión de prueba de AUTH_DISABLED (auth.ts).
INSERT INTO seguridadapp.aplicacion_usuario (
  id_aplicacion_usuario, id_aplicacion, username, name, nombres, pais, dni, estado_sesion, estado_validacion, fecha_ini
) VALUES
  (1, 23, 'dev@flesan.cl', 'Usuario de prueba', 'Usuario de prueba', 'CL', '1', 1, 1, '2026-10-26'),
  (2, 23, 'procesos.prueba@flesan.cl', 'Procesos Prueba', 'Procesos Prueba', 'CL', '1', 1, 1, '2026-10-26'),
  (3, 23, 'soporte.prueba@flesan.cl', 'Soporte Prueba', 'Soporte Prueba', 'CL', '2', 1, 1, '2026-10-26'),
  (4, 23, 'inactivo.prueba@flesan.cl', 'Inactivo Prueba', 'Inactivo Prueba', 'CL', '1', 0, 1, '2026-10-26'),
  (5, 22, 'otra.app@flesan.cl', 'Otra Aplicación', 'Otra Aplicación', 'CL', NULL, 1, 1, '2026-10-26');

INSERT INTO seguridadapp.usuario_rol (id_aplicacion_usuario, id_rol, id_empresa, objeto_permitido, id_unidad_negocio, fecha_ini) VALUES
  (1, 74, '', '', '', '2026-10-26'),
  (2, 75, '', '', '', '2026-10-26'),
  (3, 76, '', '', '', '2026-10-26'),
  (4, 75, '', '', '', '2026-10-26'),
  (5, 73, '', '', '', '2026-10-26');

-- ── Secuencias: el próximo id sigue al último cargado ───────────────────────

SELECT setval(pg_get_serial_sequence('s_lineas.tipo_plan', 'sl_id_tipo_linea'), 3);
SELECT setval(pg_get_serial_sequence('s_lineas.estado_linea', 'sl_id_estado'), 4);
SELECT setval(pg_get_serial_sequence('s_lineas.operador', 'sl_id_operador'), 3);
SELECT setval(pg_get_serial_sequence('s_lineas.tipo_dispositivo', 'sl_id_tipo_dispositivo'), 2);
SELECT setval(pg_get_serial_sequence('s_lineas.estado_dispositivos', 'sl_id_estado'), 6);
SELECT setval('s_lineas.tipo_user_sl_id_tipo_user_seq', 2);
SELECT setval(pg_get_serial_sequence('s_lineas.marca_disp', 'sl_id_marca'), 6);
SELECT setval(pg_get_serial_sequence('s_lineas.modelo_disp', 'sl_id_modelo'), 8);
SELECT setval(pg_get_serial_sequence('s_lineas.sl_registro_linea_pro', 'sl_id_registro'), 11);
SELECT setval(pg_get_serial_sequence('s_lineas.sl_dispositivo', 'sl_id_dispositivo'), 6);
SELECT setval(pg_get_serial_sequence('seguridadapp.aplicacion', 'id_aplicacion'), 23);
SELECT setval(pg_get_serial_sequence('seguridadapp.rol_aplicacion', 'id_rol'), 76);
SELECT setval(pg_get_serial_sequence('seguridadapp.aplicacion_usuario', 'id_aplicacion_usuario'), 5);
