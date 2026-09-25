import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { AreaBrush } from "./area-brush";
import { AreaMeta } from "./area-meta";
import { CalendarioActividad } from "./calendario-actividad";
import { CarreraBarras } from "./carrera-barras";
import { CurvaS } from "./curva-s";
import { GanttObra } from "./gantt-obra";
import { LineaHitos } from "./linea-hitos";
import { LineaMultiserie } from "./linea-multiserie";
import { LineaPeriodo } from "./linea-periodo";
import { PlantillaAreaApilada } from "./plantilla-area-apilada";
import { PlantillaAreaSimple } from "./plantilla-area-simple";
import { PlantillaLineaArea } from "./plantilla-linea-area";
import { PlantillaLineaMultiserie } from "./plantilla-linea-multiserie";
import { PlantillaLineaSimple } from "./plantilla-linea-simple";
import { PlantillaLineaTooltip } from "./plantilla-linea-tooltip";
import { Streamgraph } from "./streamgraph";

export const GRAFICOS_TIEMPO: GraficoLab[] = [
  {
    id: "linea-multiserie",
    nombre: "Líneas multiserie",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Evolución mensual de varias series; la primera con área para dar foco.",
    interacciones: ["Tooltip compartido", "Leyenda que filtra", "Resaltar serie"],
    Componente: LineaMultiserie,
  },
  {
    id: "area-brush",
    nombre: "Área con selector de rango",
    familia: "tiempo",
    libreria: "visx",
    descripcion: "Serie diaria larga: el mini gráfico elige el tramo que se ve en detalle arriba.",
    interacciones: ["Selector de rango (brush)", "Cruz con tooltip"],
    ancho: true,
    Componente: AreaBrush,
  },
  {
    id: "area-meta",
    nombre: "Área con meta y evento",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Rendimiento contra meta y banda objetivo, con anotación de un evento que explica la caída.",
    interacciones: ["Zoom con barra inferior", "Shift + rueda para zoom", "Tooltip"],
    Componente: AreaMeta,
  },
  {
    id: "streamgraph",
    nombre: "Streamgraph",
    familia: "tiempo",
    libreria: "Nivo",
    descripcion: "Cómo cambia el peso de cada línea en el tiempo; se lee la forma, no el valor exacto.",
    interacciones: ["Tooltip por semana", "Leyenda que filtra"],
    Componente: Streamgraph,
  },
  {
    id: "calendario-actividad",
    nombre: "Calendario de actividad",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Intensidad diaria de un año, tipo GitHub: muestra estacionalidad y días sin actividad.",
    interacciones: ["Tooltip por día", "Leyenda por tramo que resalta"],
    ancho: true,
    Componente: CalendarioActividad,
  },
  {
    id: "gantt-obra",
    nombre: "Gantt de obra",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Programa por tarea con avance real y línea de hoy; marca en rojo lo que va atrasado.",
    interacciones: ["Tooltip con avance esperado", "Leyenda por fase"],
    ancho: true,
    Componente: GanttObra,
  },
  {
    id: "linea-hitos",
    nombre: "Línea de tiempo con hitos",
    familia: "tiempo",
    libreria: "visx",
    descripcion: "Fases, avance a la fecha e hitos cumplidos o pendientes de una obra.",
    interacciones: ["Ficha del hito al pasar o enfocar", "Navegable con teclado"],
    Componente: LineaHitos,
  },
  {
    id: "curva-s",
    nombre: "Curva S",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Avance programado contra real acumulado, con la brecha sombreada y la desviación al corte.",
    interacciones: ["Tooltip con desviación", "Leyenda que filtra"],
    Componente: CurvaS,
  },
  {
    id: "linea-periodo",
    nombre: "Línea por período",
    familia: "tiempo",
    libreria: "visx",
    descripcion: "La misma serie por mes, trimestre o año; la línea se transforma en vez de redibujarse.",
    interacciones: ["Cambio de período animado", "Tooltip por punto"],
    Componente: LineaPeriodo,
  },
  {
    id: "carrera-barras",
    nombre: "Carrera de barras",
    familia: "tiempo",
    libreria: "ECharts",
    descripcion: "Ranking acumulado que se reordena mes a mes; útil para contar una historia en presentación.",
    interacciones: ["Reproducir y pausar", "Deslizador de mes", "Tooltip"],
    Componente: CarreraBarras,
  },
  {
    id: "plantilla-linea-simple",
    nombre: "Plantilla actual: Línea simple",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Una serie mensual suavizada con puntos y grilla horizontal, sin ejes; SVG hecho a mano.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaLineaSimple,
  },
  {
    id: "plantilla-linea-area",
    nombre: "Plantilla actual: Línea con área",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Tendencia semanal con relleno en degradado bajo la curva.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaLineaArea,
  },
  {
    id: "plantilla-linea-multiserie",
    nombre: "Plantilla actual: Línea multiserie",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Tres obras comparadas mes a mes en líneas suavizadas, con leyenda debajo.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaLineaMultiserie,
  },
  {
    id: "plantilla-linea-tooltip",
    nombre: "Plantilla actual: Línea con tooltip",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Serie mensual que marca el punto más cercano al mouse con guía punteada y valor.",
    interacciones: ["Tooltip al pasar el mouse", "Resaltar punto"],
    plantilla: true,
    Componente: PlantillaLineaTooltip,
  },
  {
    id: "plantilla-area-simple",
    nombre: "Plantilla actual: Área simple",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Volumen semanal con relleno sólido semitransparente, sin degradado.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaAreaSimple,
  },
  {
    id: "plantilla-area-apilada",
    nombre: "Plantilla actual: Área apilada",
    familia: "tiempo",
    libreria: "SVG",
    descripcion: "Mano de obra y materiales acumulados por mes en dos capas, con leyenda debajo.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaAreaApilada,
  },
];
