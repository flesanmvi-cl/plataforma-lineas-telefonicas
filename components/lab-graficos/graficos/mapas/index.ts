import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { BurbujasObras } from "./burbujas-obras";
import { CoropletaChile } from "./coropleta-chile";
import { MapaObrasMaplibre } from "./mapa-obras-maplibre";

export const GRAFICOS_MAPAS: GraficoLab[] = [
  {
    id: "coropleta-chile",
    nombre: "Coropleta de Chile con ranking",
    familia: "mapas",
    libreria: "ECharts",
    descripcion: "Intensidad por región con un ranking al lado: el mapa ubica y las barras comparan.",
    interacciones: ["Tooltip", "Zoom y arrastre", "Resaltado sincronizado mapa ↔ ranking"],
    ancho: true,
    Componente: CoropletaChile,
  },
  {
    id: "burbujas-obras-chile",
    nombre: "Burbujas de obras sobre Chile",
    familia: "mapas",
    libreria: "ECharts",
    descripcion: "Obras ubicadas en el país, tamaño por monto y color por línea; el mapa puede girarse.",
    interacciones: ["Tooltip", "Zoom y arrastre", "Filtro por leyenda", "Orientación horizontal o vertical"],
    ancho: true,
    Componente: BurbujasObras,
  },
  {
    id: "mapa-obras-maplibre",
    nombre: "Mapa real de obras",
    familia: "mapas",
    libreria: "MapLibre",
    descripcion: "Mapa con calles y relieve (OpenFreeMap) y las obras como círculos; útil para ubicar en detalle.",
    interacciones: ["Zoom con Ctrl + rueda", "Arrastre", "Clic para detalle", "Resaltado al pasar"],
    ancho: true,
    Componente: MapaObrasMaplibre,
  },
];
