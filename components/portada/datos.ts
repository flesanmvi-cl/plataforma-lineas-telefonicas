import { ChartColumn, LayoutTemplate, Palette, Settings, SquarePen, type LucideIcon } from "lucide-react";

// Contenido de las portadas (Inicio y Plantillas): qué es cada mundo de la plantilla y para qué
// sirve cada pantalla tipo. Lo leen las tres opciones de diseño en /opciones-portada.

export interface Mundo {
  href: string;
  nombre: string;
  icono: LucideIcon;
  proposito: string;
  contiene: string[];
}

export const MUNDOS: Mundo[] = [
  {
    href: "/pruebas",
    nombre: "Plantillas",
    icono: LayoutTemplate,
    proposito: "Pantallas tipo listas para copiar a una plataforma: se cambian los datos de ejemplo por la consulta real y los bloques se mantienen.",
    contiene: ["5 reportes", "3 formularios", "Constructor de maquetas"],
  },
  {
    href: "/ui-kit",
    nombre: "Guía de estilo",
    icono: Palette,
    proposito: "Lo vigente para toda plataforma nueva: color, tipografía, escala, botones, estados y gráficos del estándar.",
    contiene: ["Identidad y color", "Tipografía y escala", "Piezas del estándar"],
  },
  {
    href: "/configuracion",
    nombre: "Configuración",
    icono: Settings,
    proposito: "Lo común a toda plataforma, ya resuelto: personalización, usuarios y roles, avisos, fuentes de datos y actividad.",
    contiene: ["Mi personalización", "Usuarios y roles", "Avisos y notificaciones"],
  },
];

/** Pasos para crear una plataforma nueva (detalle en docs/ARRANQUE.md y README.md). */
export const PASOS_ARRANQUE = [
  { titulo: "Responder el arranque", texto: "Identidad, naturaleza, acceso, datos y módulos (docs/ARRANQUE.md)." },
  { titulo: "Copiar la plantilla", texto: "Esta carpeta completa, sin /pruebas, como punto de partida." },
  { titulo: "Elegir plantillas", texto: "El reporte o formulario tipo que calza con cada pantalla." },
  { titulo: "Construir", texto: "Primero 2-3 opciones de diseño; con aprobación, la versión real." },
];

/** Un bloque del esquema de una pantalla: columnas (de 12) y alto relativo. */
export type BloqueEsquema = [columnas: number, alto: number, destacado?: boolean];

export interface Plantilla {
  href: string;
  nombre: string;
  ejemplo: string;
  grupo: "Reportes" | "Formularios" | "Maquetas";
  proposito: string;
  cuando: string;
  piezas: string[];
  esquema: BloqueEsquema[];
}

export const PLANTILLAS: Plantilla[] = [
  {
    href: "/pruebas/reportes/tipo-1",
    nombre: "Reporte Tipo 1",
    ejemplo: "Contratación",
    grupo: "Reportes",
    proposito: "Resumen ejecutivo del período en una página, con filtros cruzados.",
    cuando: "Gerencia necesita la cifra principal, su composición y un ranking de un vistazo.",
    piezas: ["KPI principal", "Dona", "Ranking", "Tabla de detalle"],
    esquema: [[8, 3, true], [4, 3], [12, 1], [6, 4], [6, 4], [12, 3]],
  },
  {
    href: "/pruebas/reportes/tipo-2",
    nombre: "Reporte Tipo 2",
    ejemplo: "Ventas",
    grupo: "Reportes",
    proposito: "Avance contra meta en tres vistas: Tablero, Territorio y Vendedor × mes.",
    cuando: "Hay metas y se quiere ver el avance por quién, dónde y cuándo.",
    piezas: ["KPIs con meta", "Línea acumulada", "Mapa de Chile", "Matriz de calor"],
    esquema: [[3, 2, true], [3, 2], [3, 2], [3, 2], [8, 4], [4, 4], [12, 3]],
  },
  {
    href: "/pruebas/reportes/tipo-3",
    nombre: "Reporte Tipo 3",
    ejemplo: "RR.HH.",
    grupo: "Reportes",
    proposito: "Stock al cierre, movimientos del mes y rotación de 12 meses.",
    cuando: "Se sigue una población en el tiempo: personas, equipos, contratos.",
    piezas: ["Flujo mensual", "Cascada", "Pirámide de edad", "Ranking contra tope"],
    esquema: [[4, 2, true], [4, 2], [4, 2], [7, 4], [5, 4], [6, 3], [6, 3]],
  },
  {
    href: "/pruebas/reportes/tipo-4",
    nombre: "Reporte Tipo 4",
    ejemplo: "Costos",
    grupo: "Reportes",
    proposito: "Presupuesto contra real con drilldown Línea → Obra → Partida.",
    cuando: "Hay una jerarquía y se quiere bajar al detalle sin cambiar de pantalla.",
    piezas: ["Filtros laterales", "Barras comparadas", "Tabla con drilldown"],
    esquema: [[3, 9], [9, 2, true], [9, 3], [9, 4]],
  },
  {
    href: "/pruebas/reportes/tipo-5",
    nombre: "Reporte Tipo 5",
    ejemplo: "Ficha de obra",
    grupo: "Reportes",
    proposito: "La ficha de una entidad: datos, avance, programa, curva S, hitos y ubicación.",
    cuando: "Se mira una sola cosa en profundidad (una obra, un proyecto, un contrato).",
    piezas: ["Ficha", "Gantt", "Curva S", "Línea de hitos", "Mapa de obras"],
    esquema: [[5, 3], [7, 3, true], [12, 4], [7, 4], [5, 4]],
  },
  {
    href: "/pruebas/formularios/tipo-1",
    nombre: "Formulario Tipo 1",
    ejemplo: "Nueva obra",
    grupo: "Formularios",
    proposito: "Crear un registro en una sola pantalla, con grupos de campos y validación al guardar.",
    cuando: "Son pocos campos y se completan de una vez.",
    piezas: ["Grupos de campos", "Resumen de errores", "Acciones al pie"],
    esquema: [[12, 1], [6, 2], [6, 2], [6, 2], [6, 2], [12, 3], [12, 1, true]],
  },
  {
    href: "/pruebas/formularios/tipo-2",
    nombre: "Formulario Tipo 2",
    ejemplo: "Solicitud de compra",
    grupo: "Formularios",
    proposito: "Por pasos: cada uno se valida al avanzar y al final se revisa todo antes de enviar.",
    cuando: "Son muchos campos o tienen un orden natural, y el usuario necesita guía.",
    piezas: ["Pasos", "Validación por paso", "Revisión final"],
    esquema: [[12, 1, true], [6, 2], [6, 2], [12, 3], [12, 1]],
  },
  {
    href: "/pruebas/formularios/tipo-3",
    nombre: "Formulario Tipo 3",
    ejemplo: "Estado de pago",
    grupo: "Formularios",
    proposito: "Maestro-detalle: encabezado del documento, tabla editable de líneas y totales en vivo.",
    cuando: "Es un documento con líneas: ítems, partidas, detalle de un pago.",
    piezas: ["Encabezado", "Tabla editable", "Totales", "Adjuntos"],
    esquema: [[9, 2], [3, 6, true], [9, 4], [9, 1]],
  },
  {
    href: "/pruebas/maquetas",
    nombre: "Constructor de maquetas",
    ejemplo: "Sin código",
    grupo: "Maquetas",
    proposito: "Arma una pantalla arrastrando piezas del estándar a una grilla de 12 columnas.",
    cuando: "Antes de construir, para acordar con el usuario qué va en la pantalla.",
    piezas: ["Catálogo", "Lienzo de 12 columnas", "Exportar JSON"],
    esquema: [[3, 8], [6, 8, true], [3, 8]],
  },
];

export const GRUPOS_PLANTILLAS = [
  { id: "Reportes", texto: "Leer y analizar datos: tableros, KPIs, cruces." },
  { id: "Formularios", texto: "Ingresar o solicitar algo: una obra, una compra, un estado de pago." },
  { id: "Maquetas", texto: "Acordar una pantalla antes de construirla." },
] as const;

export const ICONO_GRUPO: Record<Plantilla["grupo"], LucideIcon> = {
  Reportes: ChartColumn,
  Formularios: SquarePen,
  Maquetas: LayoutTemplate,
};
