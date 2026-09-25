import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { BarraAcciones } from "./barra-acciones";
import { BotonDividido } from "./boton-dividido";
import { BotonFlotante } from "./boton-flotante";
import { BotonInsignia } from "./boton-insignia";
import { ConIcono } from "./con-icono";
import { EnlaceAccionMuestra } from "./enlace-accion";
import { Estados } from "./estados";
import { PlantillaIcono } from "./plantilla-icono";
import { PlantillaTamanos } from "./plantilla-tamanos";
import { PlantillaVariantes } from "./plantilla-variantes";
import { Tamanos } from "./tamanos";
import { Variantes } from "./variantes";

export const GRAFICOS_BOTONES: GraficoLab[] = [
  {
    id: "botones-variantes",
    nombre: "Variantes",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Primario, secundario, contorno, fantasma, texto, peligro y éxito lado a lado.",
    interacciones: ["Hover y presionado", "Foco con teclado"],
    alto: 200,
    Componente: Variantes,
  },
  {
    id: "botones-tamanos",
    nombre: "Tamaños",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Chico, mediano y grande en tres variantes; el alto sale de la densidad.",
    interacciones: ["Hover y presionado"],
    alto: 170,
    Componente: Tamanos,
  },
  {
    id: "botones-con-icono",
    nombre: "Con ícono",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Ícono + texto, texto + flecha y solo ícono con aria-label y tooltip nativo.",
    interacciones: ["Tooltip nativo", "Hover y presionado"],
    alto: 220,
    Componente: ConIcono,
  },
  {
    id: "botones-estados",
    nombre: "Estados",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Normal, hover, foco, cargando, deshabilitado y el ciclo de confirmación tras guardar.",
    interacciones: ["Clic: cargando y confirmado", "Estados simulados"],
    alto: 210,
    Componente: Estados,
  },
  {
    id: "botones-dividido",
    nombre: "Botón dividido",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Acción habitual más una flecha con las alternativas, para no llenar la barra de botones.",
    interacciones: ["Menú desplegable", "Esc y clic fuera cierran", "Flechas del teclado"],
    alto: 200,
    Componente: BotonDividido,
  },
  {
    id: "botones-flotante",
    nombre: "Botón flotante (FAB)",
    familia: "botones",
    libreria: "HTML",
    descripcion: "La acción principal de una vista móvil o de lista larga, en círculo o extendida con texto.",
    interacciones: ["Clic contrae el extendido", "Hover y presionado"],
    alto: 180,
    Componente: BotonFlotante,
  },
  {
    id: "botones-insignia",
    nombre: "Con contador",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Notificaciones y mensajes con insignia numérica o punto de novedad.",
    interacciones: ["Clic marca como leído", "Simular aviso"],
    alto: 140,
    Componente: BotonInsignia,
  },
  {
    id: "botones-enlace-accion",
    nombre: "Enlace de acción",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Acción con forma de enlace: subrayado que crece y flecha que avanza; también dentro de un párrafo.",
    interacciones: ["Subrayado animado", "Foco con teclado"],
    alto: 170,
    Componente: EnlaceAccionMuestra,
  },
  {
    id: "botones-barra-acciones",
    nombre: "Barra de acciones",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Encabezado de página y pie de formulario: un solo primario por zona y el resto subordinado.",
    interacciones: ["Hover y presionado"],
    ancho: true,
    alto: 190,
    Componente: BarraAcciones,
  },
  {
    id: "plantilla-botones-variantes",
    nombre: "Plantilla actual: variantes",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Los .btn-flesan de hoy: primario, ghost, dark y los contornos de peligro y éxito.",
    interacciones: ["Hover", "Toast al hacer clic"],
    plantilla: true,
    alto: 150,
    Componente: PlantillaVariantes,
  },
  {
    id: "plantilla-botones-tamanos",
    nombre: "Plantilla actual: tamaños y estados",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Tamaños -lg / normal / -sm, forma pastilla y deshabilitado de la plantilla.",
    interacciones: ["Hover"],
    plantilla: true,
    alto: 150,
    Componente: PlantillaTamanos,
  },
  {
    id: "plantilla-botones-icono",
    nombre: "Plantilla actual: ícono y segmentado",
    familia: "botones",
    libreria: "HTML",
    descripcion: "Solo ícono, ícono + texto y el segmentado lista/grilla de la plantilla.",
    interacciones: ["Hover", "Cambiar vista"],
    plantilla: true,
    alto: 150,
    Componente: PlantillaIcono,
  },
];
