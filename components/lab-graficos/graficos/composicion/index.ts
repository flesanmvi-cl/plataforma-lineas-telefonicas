import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { AreaApilada100 } from "./area-apilada-100";
import { CirclePackingZoom } from "./circle-packing-zoom";
import { DonaValorCentral } from "./dona-valor-central";
import { Marimekko } from "./marimekko";
import { PlantillaDonaLeyenda } from "./plantilla-dona-leyenda";
import { PlantillaDonaValorCentral } from "./plantilla-dona-valor-central";
import { PlantillaTortaBasica } from "./plantilla-torta-basica";
import { RosaNightingale } from "./rosa-nightingale";
import { SunburstDrilldown } from "./sunburst-drilldown";
import { TortaClasica } from "./torta-clasica";
import { TreemapDrilldown } from "./treemap-drilldown";
import { Waffle } from "./waffle";

export const GRAFICOS_COMPOSICION: GraficoLab[] = [
  {
    id: "waffle",
    nombre: "Waffle",
    familia: "composicion",
    libreria: "Nivo",
    descripcion: "Participación sobre 100 celdas: más legible que una torta para 3-5 partes.",
    interacciones: ["Tooltip"],
    Componente: Waffle,
  },
  {
    id: "dona-valor-central",
    nombre: "Dona con valor central",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Total al centro que cambia al sector bajo el mouse: parte y todo en una sola lectura.",
    interacciones: ["Hover actualiza el centro", "Leyenda filtra"],
    Componente: DonaValorCentral,
  },
  {
    id: "rosa-nightingale",
    nombre: "Rosa de Nightingale",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Pétalos de igual ángulo y radio según el valor: llamativa para 6-10 categorías.",
    interacciones: ["Tooltip", "Leyenda filtra"],
    Componente: RosaNightingale,
  },
  {
    id: "sunburst-drilldown",
    nombre: "Sunburst con drilldown",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Jerarquía de tres niveles en anillos (línea, región, obra); se entra con un clic.",
    interacciones: ["Tooltip", "Clic para drilldown", "Clic al centro para subir"],
    Componente: SunburstDrilldown,
  },
  {
    id: "treemap-drilldown",
    nombre: "Treemap con migas",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Un nivel a la vez con áreas proporcionales; las migas permiten volver.",
    interacciones: ["Tooltip", "Clic para drilldown", "Migas de navegación"],
    Componente: TreemapDrilldown,
  },
  {
    id: "circle-packing-zoom",
    nombre: "Circle packing con zoom",
    familia: "composicion",
    libreria: "Nivo",
    descripcion: "Círculos anidados por jerarquía; más orgánico que el treemap, menos preciso.",
    interacciones: ["Tooltip", "Clic para acercar", "Subir de nivel"],
    Componente: CirclePackingZoom,
  },
  {
    id: "area-apilada-100",
    nombre: "Área apilada 100%",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Cómo cambia la mezcla entre líneas mes a mes, independiente del volumen.",
    interacciones: ["Tooltip por mes", "Leyenda filtra", "Resalta serie"],
    Componente: AreaApilada100,
  },
  {
    id: "marimekko",
    nombre: "Marimekko",
    familia: "composicion",
    libreria: "Nivo",
    descripcion: "Dos participaciones a la vez: ancho por línea de negocio y alto por ítem de costo.",
    interacciones: ["Tooltip"],
    Componente: Marimekko,
  },
  {
    id: "torta-clasica",
    nombre: "Torta clásica",
    familia: "composicion",
    libreria: "ECharts",
    descripcion: "Sectores separados con rótulos y guías; referencia para comparar con las demás.",
    interacciones: ["Tooltip", "Clic destaca sector", "Leyenda filtra"],
    Componente: TortaClasica,
  },
  {
    id: "plantilla-torta-basica",
    nombre: "Plantilla actual: Torta básica",
    familia: "composicion",
    libreria: "SVG",
    descripcion: "Torta de cuatro líneas de negocio con leyenda lateral y porcentaje por sector.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaTortaBasica,
  },
  {
    id: "plantilla-dona-valor-central",
    nombre: "Plantilla actual: Dona con valor central",
    familia: "composicion",
    libreria: "SVG",
    descripcion: "Un solo indicador de avance: el porcentaje al centro y el resto del anillo en gris.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaDonaValorCentral,
  },
  {
    id: "plantilla-dona-leyenda",
    nombre: "Plantilla actual: Dona con leyenda",
    familia: "composicion",
    libreria: "SVG",
    descripcion: "Estado de un portafolio (en plazo, en riesgo, atrasado) con colores de estado y porcentajes al lado.",
    interacciones: [],
    plantilla: true,
    Componente: PlantillaDonaLeyenda,
  },
];
