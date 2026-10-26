-- Estructura de DESARROLLO: copia de las tablas de srvpd_bd que usa la plataforma (esquemas
-- s_lineas y seguridadapp), con los mismos nombres, tipos y restricciones que producción según el
-- levantamiento del 2026-10-26 (docs/MIGRACION.md §10). Producción no tiene claves primarias en
-- los catálogos ni en el historial: aquí tampoco, para que lo que funcione en desarrollo funcione
-- igual allá.
--
-- Solo para la base local de `npm run db:dev`. NUNCA se ejecuta en QA ni en producción: esas
-- tablas ya existen y las usa el aplicativo antiguo.

CREATE SCHEMA s_lineas;
CREATE SCHEMA seguridadapp;

-- ── s_lineas: catálogos ─────────────────────────────────────────────────────

CREATE TABLE s_lineas.tipo_plan (
  sl_id_tipo_linea serial,
  sl_nom_linea     varchar(255),
  sl_id_vigente    integer
);

CREATE TABLE s_lineas.estado_linea (
  sl_id_estado  serial,
  sl_nom_estado varchar(255),
  sl_id_vigente integer
);

CREATE TABLE s_lineas.operador (
  sl_id_operador   serial,
  sl_nom_operador  varchar(255),
  sl_pais_operador varchar(255),
  sl_id_vigente    integer
);

CREATE TABLE s_lineas.tipo_dispositivo (
  sl_id_tipo_dispositivo serial,
  sl_nom_dispositivo     varchar(255),
  sl_id_vigente          integer
);

CREATE TABLE s_lineas.estado_dispositivos (
  sl_id_estado  serial,
  sl_nom_estado varchar(255),
  sl_id_vigente integer
);

-- Área de los usuarios (1 PROCESOS, 2 SOPORTE). El id es texto con secuencia, como en producción.
CREATE SEQUENCE s_lineas.tipo_user_sl_id_tipo_user_seq;
CREATE TABLE s_lineas.tipo_user (
  sl_id_tipo_user  varchar NOT NULL DEFAULT nextval('s_lineas.tipo_user_sl_id_tipo_user_seq'),
  sl_nom_tipo_user varchar(255),
  sl_id_vigente    integer
);

-- ── s_lineas: marcas y modelos ──────────────────────────────────────────────

CREATE TABLE s_lineas.marca_disp (
  sl_id_marca      serial CONSTRAINT sl_id_marca_pkey PRIMARY KEY,
  sl_nom_marca     varchar(255),
  sl_id_vigente    integer,
  user_create      varchar,
  date_create      timestamp,
  tipo_dispositivo integer
);

CREATE TABLE s_lineas.modelo_disp (
  sl_id_modelo     serial CONSTRAINT sl_id_modelo_pkey PRIMARY KEY,
  sl_id_marca      integer NOT NULL CONSTRAINT fk_sl_id_marca REFERENCES s_lineas.marca_disp (sl_id_marca),
  sl_nom_modelo    varchar(255),
  sl_id_vigente    integer,
  user_create      varchar,
  date_create      timestamp,
  tipo_dispositivo integer
);

-- ── s_lineas: líneas y dispositivos ─────────────────────────────────────────

CREATE TABLE s_lineas.sl_registro_linea_pro (
  sl_id_registro           serial CONSTRAINT sl_registro_linea_pkey PRIMARY KEY,
  sl_rut_empresa           varchar(255),
  sl_unidad_negocio        varchar(255),
  sl_centro_costos         varchar(255),
  sl_dispositivo           varchar(255),
  sl_tipo_dispositivo      varchar(255),
  sl_rut_usuario           varchar(255),
  sl_linea                 varchar(255),
  sl_tipo_linea            integer,
  sl_estado                integer,
  sl_numero_puc            varchar(255),
  sl_comentario            varchar(255),
  "sl_fecha_actualización" timestamp,
  sl_fecha_creacion        timestamp,
  sl_id_vigente            integer,
  sl_usuario               varchar,
  sl_pais                  varchar,
  sl_tipo_rut              integer,
  sl_nombre_empresa        varchar,
  sl_nombre_cc             varchar,
  sl_fecha                 date,
  sl_area                  varchar,
  sl_operador              varchar,
  sl_emp_sap               varchar
);

CREATE TABLE s_lineas.sl_dispositivo (
  sl_id_dispositivo        serial CONSTRAINT sl_id_dispositivo_pkey PRIMARY KEY,
  sl_id_linea              integer,
  sl_tipo_dispo            integer,
  sl_marca                 integer,
  sl_modelo                integer,
  sl_imei                  varchar(1000),
  sl_tipo_costo            integer,
  sl_rut_empresa           varchar(255),
  sl_unidad_negocio        varchar(255),
  sl_centro_costos         varchar(255),
  sl_estado                integer,
  sl_usuario               varchar(255),
  sl_rut                   varchar(255),
  sl_numero_puc            varchar(255),
  "sl_fecha_actualización" date,
  sl_fecha_creacion        date,
  sl_id_vigente            integer,
  sl_pais                  varchar,
  sl_fecha                 date,
  sl_tipo_rut              varchar,
  sl_comentario            varchar,
  sl_facturas              varchar,
  sl_area                  varchar,
  sl_operador              varchar
);

-- ── s_lineas: historial (texto libre por cambio) ────────────────────────────

CREATE TABLE s_lineas.historial_linea (
  sl_id_historial          serial,
  sl_id_registro           integer,
  sl_historial             varchar(255),
  sl_usuario               varchar(255),
  sl_rut_usuario           varchar(255),
  sl_rut_empresa           varchar(255),
  sl_unidad_negocio        varchar(255),
  sl_centro_costos         varchar(255),
  "sl_fecha_actualización" timestamp,
  sl_fecha_creacion        timestamp,
  sl_id_vigente            integer
);

CREATE TABLE s_lineas.historial_dispositivos (
  sl_id_historial          serial,
  sl_id_registro           integer,
  sl_historial             varchar(255),
  sl_usuario               varchar(255),
  sl_rut_usuario           varchar(255),
  sl_rut_empresa           varchar(255),
  sl_unidad_negocio        varchar(255),
  sl_centro_costos         varchar(255),
  "sl_fecha_actualización" timestamp,
  sl_fecha_creacion        timestamp,
  sl_id_vigente            integer
);

-- ── seguridadapp: solo las tablas que usa la plataforma ─────────────────────

CREATE TABLE seguridadapp.aplicacion (
  id_aplicacion serial PRIMARY KEY,
  nombre        varchar NOT NULL,
  descripcion   varchar,
  fecha_ini     date NOT NULL,
  fecha_fin     date
);

CREATE TABLE seguridadapp.rol_aplicacion (
  id_rol        serial PRIMARY KEY,
  id_aplicacion integer NOT NULL,
  nombre        varchar NOT NULL
);

CREATE TABLE seguridadapp.aplicacion_usuario (
  id_aplicacion_usuario bigserial PRIMARY KEY,
  id_aplicacion         integer NOT NULL,
  username              varchar,
  fecha_ini             date NOT NULL,
  fecha_fin             date,
  name                  varchar,
  provider              varchar,
  provider_id           varchar,
  remember_token        varchar,
  estado_sesion         integer,
  fecha_validacion      date,
  dni                   varchar,
  nombres               varchar,
  apellidos             varchar,
  estado_validacion     integer,
  pais                  varchar,
  refresh_token         text,
  avatar                text,
  password              varchar,
  old_id                integer,
  fecha_purga           date
);

CREATE TABLE seguridadapp.usuario_rol (
  id_usuario_rol        bigserial PRIMARY KEY,
  id_aplicacion_usuario bigint NOT NULL,
  id_rol                integer NOT NULL,
  id_empresa            varchar,
  objeto_permitido      varchar,
  fecha_ini             date NOT NULL,
  fecha_fin             date,
  id_unidad_negocio     varchar,
  old_id_usu            integer,
  pais                  varchar,
  estado                integer
);
