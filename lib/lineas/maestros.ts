import { pool } from "@/lib/db";

/**
 * Datos maestros de Chile (docs/MIGRACION.md §9, docs/PLAN.md M3), de la base `flesan` en solo
 * lectura: empresas, unidades de negocio, centros de costo y colaboradores activos. Runtime Node
 * únicamente.
 *
 * Cada consulta trae el maestro completo y lo guarda 15 minutos en memoria del servidor: son pocos
 * miles de filas que cambian poco. Los filtros por empresa, unidad o texto se aplican sobre esa
 * copia.
 */

const DURACION_CACHE_MS = 15 * 60 * 1000;

/** Memoriza el resultado de `cargar` durante 15 minutos. Si la carga falla no queda en caché, y dos
 * peticiones simultáneas comparten la misma carga. */
function enCache<T>(cargar: () => Promise<T>): () => Promise<T> {
  let valor: { datos: Promise<T>; vence: number } | null = null;
  return () => {
    if (valor && valor.vence > Date.now()) return valor.datos;
    const datos = cargar();
    valor = { datos, vence: Date.now() + DURACION_CACHE_MS };
    datos.catch(() => {
      valor = null;
    });
    return datos;
  };
}

// ---------------------------------------------------------------- empresas

export interface Empresa {
  rut: string;
  razonSocial: string;
}

/** Empresas de `maestro_rut` con `esquema = 'public'`, en mayúsculas y por razón social, como el
 * antiguo. */
export const listarEmpresas = enCache(async (): Promise<Empresa[]> => {
  const { rows } = await pool.query<Empresa>(
    `SELECT rut, upper(razon_social) AS "razonSocial"
       FROM public.maestro_rut
      WHERE esquema = 'public'
      ORDER BY upper(razon_social), rut`,
  );
  return rows;
});

// ---------------------------------------------------------------- unidades y centros

export interface CentroCosto {
  /** Código del centro (`codigo_centro_gestion`): lo que se graba en `sl_centro_costos`. */
  codigo: string;
  nombre: string;
  /** Unidad de negocio según `maestro_cc`. null si el centro no está en `maestro_cc`: en ese caso
   * no cae bajo ninguna unidad (igual que en el antiguo). */
  unidad: string | null;
  activo: boolean;
}

interface CentrosEmpresa {
  /** Unidades de la empresa en `maestro_cc`, como el antiguo: todas, tengan o no centros activos. */
  unidades: string[];
  centros: CentroCosto[];
}

/**
 * Por empresa, sus unidades y todos sus centros (activos e inactivos). Reglas del antiguo:
 * mayúsculas, centro unido a `maestro_cc` por empresa y código, sin los de nombre `0`. Si un mismo
 * código aparece más de una vez (pasa en ambas tablas), vale una sola fila, la activa si la hay.
 */
const centrosPorEmpresa = enCache(async (): Promise<Map<string, CentrosEmpresa>> => {
  const [unidades, centros] = await Promise.all([
    pool.query<{ rut: string; unidad: string }>(
      `SELECT DISTINCT rut_comprador AS rut, upper(unidad_negocio) AS unidad
         FROM public.maestro_cc
        WHERE rut_comprador IS NOT NULL AND unidad_negocio IS NOT NULL`,
    ),
    pool.query<{ rut: string; codigo: string; nombre: string; unidad: string | null; activo: boolean }>(
      `SELECT DISTINCT ON (c.rut, upper(c.codigo_centro_gestion))
              c.rut,
              upper(c.codigo_centro_gestion) AS codigo,
              upper(c.nombre) AS nombre,
              upper(m.unidad_negocio) AS unidad,
              c.activo = '1' AS activo
         FROM public.centro_gestion_actividad c
         LEFT JOIN public.maestro_cc m
           ON m.rut_comprador = c.rut AND m.cod_cc = c.codigo_centro_gestion
        WHERE c.nombre <> '0' AND c.rut IS NOT NULL AND c.codigo_centro_gestion IS NOT NULL
        ORDER BY c.rut, upper(c.codigo_centro_gestion), c.activo = '1' DESC, m.unidad_negocio NULLS LAST, c.nombre`,
    ),
  ]);

  const porEmpresa = new Map<string, CentrosEmpresa>();
  const de = (rut: string) => {
    let e = porEmpresa.get(rut);
    if (!e) porEmpresa.set(rut, (e = { unidades: [], centros: [] }));
    return e;
  };
  for (const u of unidades.rows) de(u.rut).unidades.push(u.unidad);
  for (const { rut, ...centro } of centros.rows) de(rut).centros.push(centro);
  for (const e of porEmpresa.values()) {
    e.unidades.sort((a, b) => a.localeCompare(b, "es"));
    e.centros.sort((a, b) => a.nombre.localeCompare(b.nombre, "es") || a.codigo.localeCompare(b.codigo));
  }
  return porEmpresa;
});

/** Unidades de negocio de una empresa. */
export async function listarUnidades(rutEmpresa: string): Promise<string[]> {
  return (await centrosPorEmpresa()).get(rutEmpresa)?.unidades ?? [];
}

/**
 * Centros de costo activos de una empresa y unidad (P5, con E7 corregido: el antiguo ofrecía los
 * centros de esa unidad en cualquier empresa).
 *
 * `actual` es el código que el registro ya tiene: si ese centro se cerró o cambió de unidad, se
 * incluye igual (con `activo: false` si corresponde) para que la ficha siga mostrando su valor.
 */
export async function listarCentros(rutEmpresa: string, unidad: string, actual?: string): Promise<CentroCosto[]> {
  const centros = (await centrosPorEmpresa()).get(rutEmpresa)?.centros ?? [];
  const unidadBuscada = unidad.trim().toUpperCase();
  const codigoActual = actual?.trim().toUpperCase();
  return centros.filter((c) => (c.activo && c.unidad === unidadBuscada) || c.codigo === codigoActual);
}

// ---------------------------------------------------------------- colaboradores

export interface Colaborador {
  rut: string;
  /** Como lo arma el antiguo: nombre y primer apellido. */
  nombre: string;
  correo: string | null;
  empresa: string | null;
}

/**
 * Colaboradores activos del origen `flesan_rrhh` (P6), un registro por RUT: el de `user_id` más
 * alto, como el antiguo con su copia.
 */
const colaboradoresActivos = enCache(async (): Promise<Colaborador[]> => {
  const { rows } = await pool.query<Colaborador>(
    `SELECT DISTINCT ON (national_id)
            national_id AS rut,
            regexp_replace(btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '\\s+', ' ', 'g') AS nombre,
            nullif(lower(btrim(correo_flesan)), '') AS correo,
            empresa
       FROM flesan_rrhh.sap_maestro_colaborador
      WHERE right(empl_status, 1) = '1' AND national_id IS NOT NULL
      ORDER BY national_id, user_id DESC`,
  );
  return rows.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
});

const sinTildes = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const soloRut = (texto: string) => texto.replace(/[^0-9kK]/g, "").toUpperCase();

export const LARGO_MINIMO_BUSQUEDA = 3;
const MAXIMO_RESULTADOS = 20;

/**
 * Busca colaboradores activos por RUT (con o sin puntos y guion) o por nombre (todas las palabras,
 * sin distinguir tildes ni mayúsculas). Devuelve hasta 20.
 */
export async function buscarColaboradores(texto: string): Promise<Colaborador[]> {
  const consulta = texto.trim();
  if (consulta.length < LARGO_MINIMO_BUSQUEDA) return [];
  const todos = await colaboradoresActivos();

  const esRut = /^[\d.\-\s]+[kK]?$/.test(consulta);
  const encontrados = esRut
    ? todos.filter((c) => soloRut(c.rut).startsWith(soloRut(consulta)))
    : (() => {
        const palabras = sinTildes(consulta).split(/\s+/);
        return todos.filter((c) => {
          const nombre = sinTildes(c.nombre);
          return palabras.every((p) => nombre.includes(p));
        });
      })();
  return encontrados.slice(0, MAXIMO_RESULTADOS);
}
