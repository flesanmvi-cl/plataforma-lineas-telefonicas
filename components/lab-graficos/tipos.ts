import type { ComponentType } from "react";

export type Familia = "comparacion" | "composicion" | "tiempo" | "flujos" | "distribucion" | "kpi" | "tablas" | "mapas";
export type Libreria = "ECharts" | "Nivo" | "visx" | "MapLibre" | "HTML";

export const FAMILIAS: { id: Familia; nombre: string }[] = [
  { id: "comparacion", nombre: "Comparación" },
  { id: "composicion", nombre: "Composición" },
  { id: "tiempo", nombre: "Tiempo y obras" },
  { id: "flujos", nombre: "Flujos y pipelines" },
  { id: "distribucion", nombre: "Distribución" },
  { id: "kpi", nombre: "KPI y micro" },
  { id: "tablas", nombre: "Tablas enriquecidas" },
  { id: "mapas", nombre: "Mapas" },
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
  Componente: ComponentType<PropsGraficoLab>;
}
