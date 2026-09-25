import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { AnillosActividad } from "./anillos-actividad";
import { Gauge } from "./gauge";
import { KpiCifras } from "./kpi-cifras";
import { ProgresoEtapas } from "./progreso-etapas";
import { SparklinesGrilla } from "./sparklines-grilla";
import { Termometro } from "./termometro";

export const GRAFICOS_KPI: GraficoLab[] = [
  {
    id: "kpi-cifras",
    nombre: "KPI con cifra animada",
    familia: "kpi",
    libreria: "HTML",
    descripcion: "Tres indicadores con cifra que cuenta, chip de variación y sparkline.",
    interacciones: ["Cifra animada", "Valor del mes al pasar el mouse"],
    Componente: KpiCifras,
  },
  {
    id: "anillos-actividad",
    nombre: "Anillos de progreso",
    familia: "kpi",
    libreria: "HTML",
    descripcion: "Tres metas en anillos concéntricos: avance, presupuesto y seguridad.",
    interacciones: ["Llenado animado", "Resaltar anillo y detalle"],
    Componente: AnillosActividad,
  },
  {
    id: "gauge-umbrales",
    nombre: "Gauge con umbrales",
    familia: "kpi",
    libreria: "ECharts",
    descripcion: "Un indicador contra bandas de alerta, atención y meta.",
    interacciones: ["Cambiar indicador", "Aguja y cifra animadas"],
    Componente: Gauge,
  },
  {
    id: "sparklines-grilla",
    nombre: "Sparklines en grilla",
    familia: "kpi",
    libreria: "visx",
    descripcion: "Tendencia mensual de cada obra en miniatura, con el último punto destacado.",
    interacciones: ["Mes sincronizado al pasar el mouse", "Trazo animado"],
    Componente: SparklinesGrilla,
  },
  {
    id: "progreso-etapas",
    nombre: "Progreso por etapas",
    familia: "kpi",
    libreria: "HTML",
    descripcion: "Avance de cada obra por etapa del proyecto, con el peso de cada etapa en plazo.",
    interacciones: ["Llenado animado", "Detalle del segmento al pasar el mouse"],
    Componente: ProgresoEtapas,
  },
  {
    id: "termometro-meta",
    nombre: "Termómetro contra meta",
    familia: "kpi",
    libreria: "visx",
    descripcion: "Avance anual vertical de cada indicador contra su meta.",
    interacciones: ["Relleno animado", "Detalle al pasar el mouse"],
    Componente: Termometro,
  },
];
