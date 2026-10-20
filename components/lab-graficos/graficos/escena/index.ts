import dynamic from "next/dynamic";
import type { GraficoLab } from "@/components/lab-graficos/tipos";

// three.js pesa: se carga solo cuando una de estas tarjetas entra en pantalla, para que el resto
// del laboratorio (y de la plantilla) no lo arrastre en su bundle.
const Sinapsis3D = dynamic(() => import("./sinapsis-3d").then((m) => m.Sinapsis3D), { ssr: false });
const RedNeuronal = dynamic(() => import("./red-neuronal").then((m) => m.RedNeuronal), { ssr: false });

export const GRAFICOS_ESCENA: GraficoLab[] = [
  {
    id: "escena-sinapsis-3d",
    nombre: "Sinapsis en 3D",
    familia: "escena",
    libreria: "three.js",
    descripcion: "El símbolo CIA con volumen: impulsos que viajan por las espigas, nodos que laten y giro que sigue al mouse.",
    interacciones: ["Mover el mouse", "Animación continua"],
    alto: 300,
    Componente: Sinapsis3D,
  },
  {
    id: "escena-red-neuronal",
    nombre: "Red neuronal de portada",
    familia: "escena",
    libreria: "three.js",
    descripcion: "Fondo para login o portada del Portal: nodos que se conectan al acercarse, con el texto encima.",
    interacciones: ["Mover el mouse", "Animación continua"],
    ancho: true,
    alto: 300,
    Componente: RedNeuronal,
  },
];
