import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { TablaAgrupada } from "./tabla-agrupada";
import { TablaBarrasCelda } from "./tabla-barras-celda";
import { TablaHeatmap } from "./tabla-heatmap";
import { TablaSparkline } from "./tabla-sparkline";

export const GRAFICOS_TABLAS: GraficoLab[] = [
  {
    id: "tabla-barras-celda",
    nombre: "Tabla con barras en la celda",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Avance real con barra y marca de meta dentro de la celda; ordena por cualquier columna.",
    interacciones: ["Ordenar por columna", "Resaltar fila", "Reordenamiento animado"],
    ancho: true,
    Componente: TablaBarrasCelda,
  },
  {
    id: "tabla-heatmap",
    nombre: "Tabla heatmap obras × meses",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Celdas coloreadas con la escala secuencial para ver meses fuertes y débiles de cada obra.",
    interacciones: ["Cruz de fila y columna", "Ordenar por mes", "Navegable con teclado"],
    ancho: true,
    Componente: TablaHeatmap,
  },
  {
    id: "tabla-sparkline",
    nombre: "Tabla con sparklines y variación",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Tendencia de 12 meses por fila con chips de variación mensual y anual.",
    interacciones: ["Lectura del mes en la sparkline", "Ordenar por columna", "Resaltar fila"],
    ancho: true,
    Componente: TablaSparkline,
  },
  {
    id: "tabla-agrupada",
    nombre: "Tabla agrupada con subtotales",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Líneas de negocio con subtotal que se expanden a sus obras, con total general fijo al pie.",
    interacciones: ["Expandir y contraer grupos", "Expandir todo", "Resaltar fila"],
    ancho: true,
    Componente: TablaAgrupada,
  },
];
