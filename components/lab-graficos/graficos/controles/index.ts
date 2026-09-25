import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { ChipsFiltro } from "./chips-filtro";
import { Interruptores } from "./interruptores";
import { MenuAcciones } from "./menu-acciones";
import { Paginacion } from "./paginacion";
import { Segmentado } from "./segmentado";
import { StepperNumerico } from "./stepper";
import { Toolbar } from "./toolbar";

export const GRAFICOS_CONTROLES: GraficoLab[] = [
  {
    id: "control-segmentado",
    nombre: "Segmentado",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Selección exclusiva de 2-4 opciones: pastilla que se desliza, subrayado o bloques unidos.",
    interacciones: ["Fondo que se desliza", "Flechas del teclado"],
    alto: 210,
    Componente: Segmentado,
  },
  {
    id: "control-interruptores",
    nombre: "Interruptor, casilla y radio",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Switch con etiqueta, casillas con estado mixto y radios, en los colores del tema.",
    interacciones: ["Clic o Espacio", "Estado mixto", "Flechas en radios"],
    alto: 250,
    Componente: Interruptores,
  },
  {
    id: "control-chips-filtro",
    nombre: "Chips de filtro",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Filtros de selección múltiple con contador por opción y «Limpiar».",
    interacciones: ["Selección múltiple", "Limpiar filtros"],
    alto: 150,
    Componente: ChipsFiltro,
  },
  {
    id: "control-toolbar",
    nombre: "Grupo de íconos (toolbar)",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Íconos agrupados: formato alternable, alineación y vista exclusivas, con vista previa.",
    interacciones: ["Alternar (aria-pressed)", "Tooltip nativo"],
    alto: 170,
    Componente: Toolbar,
  },
  {
    id: "control-paginacion",
    nombre: "Paginación",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Anterior/siguiente, números con «…» y una versión compacta para tarjetas.",
    interacciones: ["Cambiar página", "Topes deshabilitados"],
    alto: 140,
    Componente: Paginacion,
  },
  {
    id: "control-menu-acciones",
    nombre: "Menú de acciones",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Botón «Acciones» y kebab por fila; la acción destructiva va al final, separada y en rojo.",
    interacciones: ["Menú desplegable", "Esc y clic fuera cierran", "Flechas del teclado"],
    alto: 230,
    Componente: MenuAcciones,
  },
  {
    id: "control-stepper",
    nombre: "Stepper numérico",
    familia: "controles",
    libreria: "HTML",
    descripcion: "Restar y sumar con topes, unido o separado; el valor acepta flechas del teclado.",
    interacciones: ["Sumar y restar", "Flechas, Inicio y Fin"],
    alto: 150,
    Componente: StepperNumerico,
  },
];
