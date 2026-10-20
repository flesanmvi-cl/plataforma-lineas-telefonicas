import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { GrillaFiltro, ListaAFicha, PestanasDeslizan, TemaCircular } from "./muestras";

export const GRAFICOS_TRANSICIONES: GraficoLab[] = [
  {
    id: "vt-lista-ficha",
    nombre: "De la lista a la ficha",
    familia: "transiciones",
    libreria: "View Transitions",
    descripcion: "La miniatura y el nombre viajan desde la fila hasta el encabezado de la ficha.",
    interacciones: ["Clic en una obra", "Volver a la lista"],
    alto: 260,
    Componente: ListaAFicha,
  },
  {
    id: "vt-tema-circular",
    nombre: "Cambio de tema con círculo",
    familia: "transiciones",
    libreria: "View Transitions",
    descripcion: "El tema nuevo se abre en círculo desde el botón. Al lado, el cambio de hoy para comparar.",
    interacciones: ["Cambia toda la plataforma", "Comparar con el actual"],
    alto: 170,
    Componente: TemaCircular,
  },
  {
    id: "vt-grilla-filtro",
    nombre: "Grilla que se reordena",
    familia: "transiciones",
    libreria: "View Transitions",
    descripcion: "Al filtrar, cada tarjeta viaja a su nuevo lugar y las que sobran se desvanecen.",
    interacciones: ["Filtrar por negocio"],
    ancho: true,
    alto: 260,
    Componente: GrillaFiltro,
  },
  {
    id: "vt-pestanas",
    nombre: "Pestañas que se deslizan",
    familia: "transiciones",
    libreria: "View Transitions",
    descripcion: "El subrayado viaja a la pestaña elegida y el contenido entra desde el lado que corresponde.",
    interacciones: ["Cambiar de pestaña"],
    alto: 230,
    Componente: PestanasDeslizan,
  },
];
