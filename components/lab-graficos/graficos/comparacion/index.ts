import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { BarrasAgrupadas } from "./barras-agrupadas";
import { BarrasApiladas } from "./barras-apiladas";
import { BarrasDivergentes } from "./barras-divergentes";
import { BarrasMeta } from "./barras-meta";
import { Bullet } from "./bullet";
import { Bump } from "./bump";
import { Dumbbell } from "./dumbbell";
import { Lollipop } from "./lollipop";
import { PlantillaBarrasAgrupadas } from "./plantilla-barras-agrupadas";
import { PlantillaBarrasHorizontales } from "./plantilla-barras-horizontales";
import { PlantillaBarrasVerticales } from "./plantilla-barras-verticales";
import { Radar } from "./radar";
import { Slope } from "./slope";

export const GRAFICOS_COMPARACION: GraficoLab[] = [
  {
    id: "bullet",
    nombre: "Bullet: real contra meta",
    familia: "comparacion",
    libreria: "visx",
    descripcion: "Avance real, meta y rangos de referencia en una sola barra por obra.",
    interacciones: ["Resaltar fila", "Animación de entrada"],
    Componente: Bullet,
  },
  {
    id: "barras-agrupadas",
    nombre: "Barras agrupadas",
    familia: "comparacion",
    libreria: "ECharts",
    descripcion: "Ventas por línea de negocio en tres años: compara dentro y entre grupos.",
    interacciones: ["Tooltip por categoría", "Clic en leyenda filtra", "Resaltar serie"],
    Componente: BarrasAgrupadas,
  },
  {
    id: "barras-apiladas",
    nombre: "Barras apiladas y 100%",
    familia: "comparacion",
    libreria: "ECharts",
    descripcion: "Costo por partida y obra; alterna entre montos y participación porcentual.",
    interacciones: ["Toggle montos / 100%", "Tooltip por categoría", "Clic en leyenda filtra"],
    Componente: BarrasApiladas,
  },
  {
    id: "barras-divergentes",
    nombre: "Barras divergentes",
    familia: "comparacion",
    libreria: "ECharts",
    descripcion: "Variación contra el período anterior por región: alzas y bajas desde el cero.",
    interacciones: ["Tooltip", "Etiqueta en la punta"],
    Componente: BarrasDivergentes,
  },
  {
    id: "barras-meta",
    nombre: "Barras con línea de meta",
    familia: "comparacion",
    libreria: "ECharts",
    descripcion: "Cumplimiento por obra rotulado en la barra y contrastado con una meta común.",
    interacciones: ["Tooltip con brecha a la meta", "Clic en leyenda filtra"],
    Componente: BarrasMeta,
  },
  {
    id: "lollipop",
    nombre: "Lollipop ordenado",
    familia: "comparacion",
    libreria: "visx",
    descripcion: "Ranking liviano de obras adjudicadas por región, con el promedio como referencia.",
    interacciones: ["Animación de entrada en cascada", "Resaltar fila"],
    Componente: Lollipop,
  },
  {
    id: "dumbbell",
    nombre: "Dumbbell: antes y después",
    familia: "comparacion",
    libreria: "visx",
    descripcion: "Avance del mes anterior contra el actual por obra y la diferencia en puntos.",
    interacciones: ["Animación del cambio", "Resaltar fila con detalle"],
    Componente: Dumbbell,
  },
  {
    id: "slope",
    nombre: "Slope chart",
    familia: "comparacion",
    libreria: "visx",
    descripcion: "Margen por obra entre dos cortes: quién sube y quién baja de un vistazo.",
    interacciones: ["Resaltar línea al pasar el mouse", "Animación de entrada"],
    Componente: Slope,
  },
  {
    id: "bump-ranking",
    nombre: "Bump chart de ranking",
    familia: "comparacion",
    libreria: "Nivo",
    descripcion: "Cómo cambia el puesto de cada obra en el ranking mes a mes.",
    interacciones: ["Resaltar serie", "Tooltip por línea"],
    Componente: Bump,
  },
  {
    id: "radar-obras",
    nombre: "Radar de desempeño",
    familia: "comparacion",
    libreria: "Nivo",
    descripcion: "Tres obras en seis dimensiones: perfil de fortalezas y debilidades.",
    interacciones: ["Chips muestran u ocultan obras", "Tooltip por dimensión"],
    Componente: Radar,
  },
  {
    id: "plantilla-barras-verticales",
    nombre: "Plantilla actual: Barras verticales",
    familia: "comparacion",
    libreria: "SVG",
    descripcion: "Barras simples de una serie por mes, sin ejes ni valores; SVG hecho a mano.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaBarrasVerticales,
  },
  {
    id: "plantilla-barras-horizontales",
    nombre: "Plantilla actual: Barras horizontales",
    familia: "comparacion",
    libreria: "SVG",
    descripcion: "Ranking de obras con riel de fondo y el porcentaje en la punta de cada barra.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaBarrasHorizontales,
  },
  {
    id: "plantilla-barras-agrupadas",
    nombre: "Plantilla actual: Barras agrupadas",
    familia: "comparacion",
    libreria: "SVG",
    descripcion: "Meta contra real por trimestre en pares de barras, con leyenda debajo.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaBarrasAgrupadas,
  },
];
