import type { ComponentType } from "react";

export type Familia =
  | "comparacion"
  | "composicion"
  | "tiempo"
  | "flujos"
  | "distribucion"
  | "mapas"
  | "kpi"
  | "tablas"
  | "botones"
  | "controles";
export type Libreria = "ECharts" | "Nivo" | "visx" | "MapLibre" | "HTML" | "SVG";
export type Seccion = "graficos" | "kpis" | "tablas" | "botones";

export const SECCIONES: { id: Seccion; nombre: string; familias: Familia[] }[] = [
  { id: "graficos", nombre: "Gráficos", familias: ["comparacion", "composicion", "tiempo", "flujos", "distribucion", "mapas"] },
  { id: "kpis", nombre: "KPIs", familias: ["kpi"] },
  { id: "tablas", nombre: "Tablas", familias: ["tablas"] },
  { id: "botones", nombre: "Botones", familias: ["botones", "controles"] },
];

export function seccionDe(familia: Familia): Seccion {
  return SECCIONES.find((s) => s.familias.includes(familia))?.id ?? "graficos";
}

export const FAMILIAS: { id: Familia; nombre: string }[] = [
  { id: "comparacion", nombre: "Comparación" },
  { id: "composicion", nombre: "Composición" },
  { id: "tiempo", nombre: "Tiempo y obras" },
  { id: "flujos", nombre: "Flujos y pipelines" },
  { id: "distribucion", nombre: "Distribución" },
  { id: "mapas", nombre: "Mapas" },
  { id: "kpi", nombre: "KPI y micro" },
  { id: "tablas", nombre: "Tablas" },
  { id: "botones", nombre: "Botones y acciones" },
  { id: "controles", nombre: "Grupos y controles" },
];

/** Propiedades que recibe todo gráfico del laboratorio. */
export interface PropsGraficoLab {
  /** Alto disponible en px para el gráfico (el ancho es el del contenedor). */
  alto: number;
}

export interface GraficoLab {
  /** Identificador estable en kebab-case, único en todo el catálogo (va en la URL). */
  id: string;
  nombre: string;
  familia: Familia;
  libreria: Libreria;
  /** Una línea: qué muestra y cuándo conviene. */
  descripcion: string;
  /** Interacciones que trae (ej. "Tooltip", "Zoom", "Clic para drilldown"). */
  interacciones: string[];
  /** Ocupa dos columnas en la galería (mapas, Gantt, tablas anchas). */
  ancho?: boolean;
  /** Viene de la plantilla actual (lo que existía antes del laboratorio), para comparar. */
  plantilla?: boolean;
  /** Alto sugerido en la galería si no sirve el estándar (ej. un botón necesita poco). */
  alto?: number;
  Componente: ComponentType<PropsGraficoLab>;
}
