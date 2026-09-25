import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { Beeswarm } from "./beeswarm";
import { BoxplotGrupos } from "./boxplot-grupos";
import { DispersionBurbujas } from "./dispersion-burbujas";
import { HeatmapObras } from "./heatmap-obras";
import { HistogramaDensidad } from "./histograma-densidad";
import { Ridgeline } from "./ridgeline";
import { ViolinGrupos } from "./violin-grupos";

export const GRAFICOS_DISTRIBUCION: GraficoLab[] = [
  {
    id: "histograma-densidad",
    nombre: "Histograma con densidad",
    familia: "distribucion",
    libreria: "ECharts",
    descripcion: "Frecuencias por tramo con la curva suavizada y la mediana marcada.",
    interacciones: ["Tooltip por tramo", "Cambiar cantidad de clases"],
    Componente: HistogramaDensidad,
  },
  {
    id: "boxplot-grupos",
    nombre: "Boxplot por grupo",
    familia: "distribucion",
    libreria: "Nivo",
    descripcion: "Mediana, cuartiles y rango por obra: la comparación de dispersión más compacta.",
    interacciones: ["Tooltip con resumen", "Resalta grupo"],
    Componente: BoxplotGrupos,
  },
  {
    id: "violin-grupos",
    nombre: "Violín por grupo",
    familia: "distribucion",
    libreria: "visx",
    descripcion: "Forma completa de cada distribución con la caja interior; revela bimodalidad.",
    interacciones: ["Resalta grupo", "Resumen al pasar el mouse"],
    Componente: ViolinGrupos,
  },
  {
    id: "beeswarm",
    nombre: "Beeswarm",
    familia: "distribucion",
    libreria: "Nivo",
    descripcion: "Cada caso como punto sin superponerse; tamaño por horas-hombre.",
    interacciones: ["Tooltip", "Resalta grupo"],
    Componente: Beeswarm,
  },
  {
    id: "dispersion-burbujas",
    nombre: "Dispersión con burbujas",
    familia: "distribucion",
    libreria: "ECharts",
    descripcion: "Costo contra plazo por proyecto, tamaño por dotación y color por línea.",
    interacciones: ["Tooltip", "Zoom con rueda y arrastre", "Leyenda filtra", "Restablecer zoom"],
    Componente: DispersionBurbujas,
  },
  {
    id: "heatmap-obras",
    nombre: "Heatmap obra × semana",
    familia: "distribucion",
    libreria: "ECharts",
    descripcion: "Cumplimiento semanal por obra en una matriz; el control filtra por rango.",
    interacciones: ["Tooltip", "Filtro por rango de valor"],
    Componente: HeatmapObras,
  },
  {
    id: "ridgeline",
    nombre: "Ridgeline",
    familia: "distribucion",
    libreria: "visx",
    descripcion: "Densidades apiladas con traslape: compara la forma de muchas distribuciones en poco alto.",
    interacciones: ["Resalta fila", "Mediana al pasar el mouse"],
    Componente: Ridgeline,
  },
];
