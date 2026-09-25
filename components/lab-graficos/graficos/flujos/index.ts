import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { Cascada } from "./cascada";
import { ChordLineas } from "./chord-lineas";
import { Embudo } from "./embudo";
import { PipelineChevrones } from "./pipeline-chevrones";
import { ProcesoEtapas } from "./proceso-etapas";
import { SankeyCostos } from "./sankey-costos";

export const GRAFICOS_FLUJOS: GraficoLab[] = [
  {
    id: "sankey-costos",
    nombre: "Sankey de costos",
    familia: "flujos",
    libreria: "ECharts",
    descripcion: "De dónde viene y a dónde va el costo: líneas de negocio hacia partidas, con grosor por monto.",
    interacciones: ["Resaltar camino al pasar", "Tooltip con % del origen"],
    ancho: true,
    Componente: SankeyCostos,
  },
  {
    id: "embudo",
    nombre: "Embudo de etapas",
    familia: "flujos",
    libreria: "ECharts",
    descripcion: "Volumen por etapa comercial y cuánto pasa de una a la siguiente.",
    interacciones: ["Tooltip con conversión acumulada", "Leyenda que filtra"],
    Componente: Embudo,
  },
  {
    id: "pipeline-chevrones",
    nombre: "Pipeline en chevrones",
    familia: "flujos",
    libreria: "visx",
    descripcion: "Etapas en flechas con conteo, tasa de paso y lo que queda del total inicial.",
    interacciones: ["Resaltar etapa", "Clic o teclado para fijar", "Ficha de detalle"],
    Componente: PipelineChevrones,
  },
  {
    id: "cascada",
    nombre: "Cascada",
    familia: "flujos",
    libreria: "ECharts",
    descripcion: "Cómo se llega de un total a otro: alzas y bajas diferenciadas, con conectores entre tramos.",
    interacciones: ["Tooltip con acumulado", "Leyenda que filtra", "Resaltar tipo"],
    Componente: Cascada,
  },
  {
    id: "chord-lineas",
    nombre: "Chord de intercambios",
    familia: "flujos",
    libreria: "Nivo",
    descripcion: "Servicios que se prestan entre líneas de negocio; el ancho de cada cinta es el monto.",
    interacciones: ["Resaltar línea al pasar", "Tooltip por cinta"],
    Componente: ChordLineas,
  },
  {
    id: "proceso-etapas",
    nombre: "Proceso por etapas",
    familia: "flujos",
    libreria: "HTML",
    descripcion: "Estado de cada paso de un proceso (hecho, en curso, pendiente) con la ficha del paso.",
    interacciones: ["Elegir paso", "Avanzar y reiniciar", "Navegable con teclado"],
    Componente: ProcesoEtapas,
  },
];
