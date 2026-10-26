import { ESQUEMA_LINEAS, ESQUEMA_SEGURIDAD } from "@/lib/lineas-db";

/**
 * Tablas y columnas que la plataforma lee o escribe (docs/MIGRACION.md §9 y §10). Las usa
 * /api/estado-conexiones para confirmar que una base tiene la estructura esperada antes de
 * usarla (docs/ARRANQUE.md, «Validación de estructura»). Al empezar a usar una columna nueva, se
 * agrega aquí.
 */
export interface TablaRequerida {
  esquema: string;
  tabla: string;
  columnas: readonly string[];
}

const HISTORIAL = [
  "sl_id_historial",
  "sl_id_registro",
  "sl_historial",
  "sl_usuario",
  "sl_rut_usuario",
  "sl_rut_empresa",
  "sl_unidad_negocio",
  "sl_centro_costos",
  "sl_fecha_creacion",
  "sl_fecha_actualización",
  "sl_id_vigente",
] as const;

/** Base de la plataforma (`srvpd_bd`): esquemas del aplicativo antiguo. */
export const ESTRUCTURA_PLATAFORMA: TablaRequerida[] = [
  {
    esquema: ESQUEMA_LINEAS,
    tabla: "sl_registro_linea_pro",
    columnas: [
      "sl_id_registro",
      "sl_pais",
      "sl_linea",
      "sl_tipo_linea",
      "sl_operador",
      "sl_estado",
      "sl_rut_empresa",
      "sl_nombre_empresa",
      "sl_unidad_negocio",
      "sl_centro_costos",
      "sl_nombre_cc",
      "sl_usuario",
      "sl_rut_usuario",
      "sl_tipo_rut",
      "sl_numero_puc",
      "sl_comentario",
      "sl_fecha",
      "sl_area",
      "sl_id_vigente",
      "sl_fecha_creacion",
      "sl_fecha_actualización",
    ],
  },
  {
    esquema: ESQUEMA_LINEAS,
    tabla: "sl_dispositivo",
    columnas: [
      "sl_id_dispositivo",
      "sl_pais",
      "sl_tipo_dispo",
      "sl_marca",
      "sl_modelo",
      "sl_imei",
      "sl_tipo_costo",
      "sl_rut_empresa",
      "sl_unidad_negocio",
      "sl_centro_costos",
      "sl_estado",
      "sl_operador",
      "sl_usuario",
      "sl_rut",
      "sl_tipo_rut",
      "sl_numero_puc",
      "sl_facturas",
      "sl_comentario",
      "sl_fecha",
      "sl_area",
      "sl_id_vigente",
      "sl_fecha_creacion",
      "sl_fecha_actualización",
    ],
  },
  { esquema: ESQUEMA_LINEAS, tabla: "historial_linea", columnas: HISTORIAL },
  { esquema: ESQUEMA_LINEAS, tabla: "historial_dispositivos", columnas: HISTORIAL },
  {
    esquema: ESQUEMA_LINEAS,
    tabla: "marca_disp",
    columnas: ["sl_id_marca", "sl_nom_marca", "tipo_dispositivo", "sl_id_vigente", "user_create", "date_create"],
  },
  {
    esquema: ESQUEMA_LINEAS,
    tabla: "modelo_disp",
    columnas: ["sl_id_modelo", "sl_id_marca", "sl_nom_modelo", "tipo_dispositivo", "sl_id_vigente", "user_create", "date_create"],
  },
  { esquema: ESQUEMA_LINEAS, tabla: "tipo_plan", columnas: ["sl_id_tipo_linea", "sl_nom_linea", "sl_id_vigente"] },
  { esquema: ESQUEMA_LINEAS, tabla: "estado_linea", columnas: ["sl_id_estado", "sl_nom_estado", "sl_id_vigente"] },
  { esquema: ESQUEMA_LINEAS, tabla: "operador", columnas: ["sl_id_operador", "sl_nom_operador", "sl_id_vigente"] },
  { esquema: ESQUEMA_LINEAS, tabla: "tipo_dispositivo", columnas: ["sl_id_tipo_dispositivo", "sl_nom_dispositivo", "sl_id_vigente"] },
  { esquema: ESQUEMA_LINEAS, tabla: "estado_dispositivos", columnas: ["sl_id_estado", "sl_nom_estado", "sl_id_vigente"] },
  { esquema: ESQUEMA_LINEAS, tabla: "tipo_user", columnas: ["sl_id_tipo_user", "sl_nom_tipo_user", "sl_id_vigente"] },
  {
    esquema: ESQUEMA_SEGURIDAD,
    tabla: "aplicacion_usuario",
    columnas: [
      "id_aplicacion_usuario",
      "id_aplicacion",
      "username",
      "name",
      "nombres",
      "apellidos",
      "pais",
      "dni",
      "estado_sesion",
      "estado_validacion",
      "fecha_ini",
      "fecha_fin",
    ],
  },
  {
    esquema: ESQUEMA_SEGURIDAD,
    tabla: "usuario_rol",
    columnas: ["id_usuario_rol", "id_aplicacion_usuario", "id_rol", "id_empresa", "id_unidad_negocio", "objeto_permitido", "fecha_ini"],
  },
  { esquema: ESQUEMA_SEGURIDAD, tabla: "rol_aplicacion", columnas: ["id_rol", "id_aplicacion", "nombre"] },
];

/** Base transaccional de Chile (`flesan`), solo lectura. */
export const ESTRUCTURA_TRANSACCIONAL: TablaRequerida[] = [
  { esquema: "public", tabla: "maestro_rut", columnas: ["rut", "razon_social", "esquema"] },
  { esquema: "public", tabla: "maestro_cc", columnas: ["rut_comprador", "unidad_negocio", "cod_cc"] },
  {
    esquema: "public",
    tabla: "centro_gestion_actividad",
    columnas: ["rut", "codigo_centro_gestion", "nombre", "unidad_negocio", "activo"],
  },
  {
    esquema: "flesan_rrhh",
    tabla: "sap_maestro_colaborador",
    columnas: ["national_id", "first_name", "last_name", "empl_status", "correo_flesan"],
  },
];

/** SQL de solo lectura que trae las columnas existentes de las tablas pedidas ($1 esquemas, $2 tablas). */
export const SQL_COLUMNAS = `
  SELECT table_schema AS esquema, table_name AS tabla, column_name AS columna
  FROM information_schema.columns
  WHERE table_schema = ANY($1::text[]) AND table_name = ANY($2::text[])`;

export function parametrosColumnas(requeridas: TablaRequerida[]): [string[], string[]] {
  return [[...new Set(requeridas.map((r) => r.esquema))], [...new Set(requeridas.map((r) => r.tabla))]];
}

/** Lo que falta: tablas completas que no existen y columnas ausentes en las que sí existen. */
export function faltantes(requeridas: TablaRequerida[], existentes: { esquema: string; tabla: string; columna: string }[]): string[] {
  const presentes = new Set(existentes.map((e) => `${e.esquema}.${e.tabla}.${e.columna}`));
  const tablas = new Set(existentes.map((e) => `${e.esquema}.${e.tabla}`));
  const resultado: string[] = [];
  for (const { esquema, tabla, columnas } of requeridas) {
    const nombre = `${esquema}.${tabla}`;
    if (!tablas.has(nombre)) {
      resultado.push(nombre);
      continue;
    }
    for (const columna of columnas) if (!presentes.has(`${nombre}.${columna}`)) resultado.push(`${nombre}.${columna}`);
  }
  return resultado;
}
