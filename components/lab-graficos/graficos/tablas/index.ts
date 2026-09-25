import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { PlantillaEstadosPaginacion } from "./plantilla-estados-paginacion";
import { PlantillaOrdenable } from "./plantilla-ordenable";
import { PlantillaZebra } from "./plantilla-zebra";
import { TablaAgrupada } from "./tabla-agrupada";
import { TablaBarrasCelda } from "./tabla-barras-celda";
import { TablaColumnasConfigurables } from "./tabla-columnas-configurables";
import { TablaEdicionCelda } from "./tabla-edicion-celda";
import { TablaEstadosAcciones } from "./tabla-estados-acciones";
import { TablaEstadosCarga } from "./tabla-estados-carga";
import { TablaFijaScroll } from "./tabla-fija-scroll";
import { TablaFilasExpandibles } from "./tabla-filas-expandibles";
import { TablaFiltrosColumna } from "./tabla-filtros-columna";
import { TablaHeatmap } from "./tabla-heatmap";
import { TablaPaginacion } from "./tabla-paginacion";
import { TablaSeleccionMasiva } from "./tabla-seleccion-masiva";
import { TablaSparkline } from "./tabla-sparkline";
import { TablaTotalesCondicional } from "./tabla-totales-condicional";

export const GRAFICOS_TABLAS: GraficoLab[] = [
  {
    id: "tabla-barras-celda",
    nombre: "Tabla con barras en la celda",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Avance real con barra y marca de meta dentro de la celda; ordena por cualquier columna.",
    interacciones: ["Ordenar por columna", "Resaltar fila", "Reordenamiento animado"],
    ancho: true,
    Componente: TablaBarrasCelda,
  },
  {
    id: "tabla-heatmap",
    nombre: "Tabla heatmap obras × meses",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Celdas coloreadas con la escala secuencial para ver meses fuertes y débiles de cada obra.",
    interacciones: ["Cruz de fila y columna", "Ordenar por mes", "Navegable con teclado"],
    ancho: true,
    Componente: TablaHeatmap,
  },
  {
    id: "tabla-sparkline",
    nombre: "Tabla con sparklines y variación",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Tendencia de 12 meses por fila con chips de variación mensual y anual.",
    interacciones: ["Lectura del mes en la sparkline", "Ordenar por columna", "Resaltar fila"],
    ancho: true,
    Componente: TablaSparkline,
  },
  {
    id: "tabla-agrupada",
    nombre: "Tabla agrupada con subtotales",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Líneas de negocio con subtotal que se expanden a sus obras, con total general fijo al pie.",
    interacciones: ["Expandir y contraer grupos", "Expandir todo", "Resaltar fila"],
    ancho: true,
    Componente: TablaAgrupada,
  },
  {
    id: "tabla-fija-scroll",
    nombre: "Encabezado y primera columna fijos",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Muchas filas y columnas: el encabezado queda fijo al bajar y la columna Obra al desplazar a la derecha.",
    interacciones: ["Scroll vertical y horizontal", "Encabezado fijo", "Primera columna fija", "Resaltar fila"],
    ancho: true,
    Componente: TablaFijaScroll,
  },
  {
    id: "tabla-seleccion-masiva",
    nombre: "Selección de filas y acciones masivas",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Checkbox por fila y «seleccionar todo» con estado indeterminado; al marcar aparece la barra de acciones.",
    interacciones: ["Seleccionar fila o todas", "Estado indeterminado", "Barra de acciones animada", "Clic en la fila"],
    ancho: true,
    Componente: TablaSeleccionMasiva,
  },
  {
    id: "tabla-filtros-columna",
    nombre: "Filtros por columna con chips",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Búsqueda y selects bajo cada encabezado, chips de filtros activos y «Limpiar»; estado sin resultados.",
    interacciones: ["Búsqueda sin tildes", "Filtro por línea y estado", "Quitar chip", "Limpiar filtros"],
    ancho: true,
    Componente: TablaFiltrosColumna,
  },
  {
    id: "tabla-paginacion",
    nombre: "Paginación completa",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Tamaño de página 5/10/20, rango «1–10 de 48», páginas con elipsis y salto directo a una página.",
    interacciones: ["Filas por página", "Anterior y siguiente", "Ir a página", "Navegable con teclado"],
    ancho: true,
    Componente: TablaPaginacion,
  },
  {
    id: "tabla-edicion-celda",
    nombre: "Edición en celda",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Doble clic o Enter para editar un monto o un estado; Esc cancela y las celdas cambiadas quedan marcadas.",
    interacciones: ["Doble clic para editar", "Enter guarda, Esc cancela", "Marca de celda editada", "Deshacer cambios"],
    ancho: true,
    Componente: TablaEdicionCelda,
  },
  {
    id: "tabla-filas-expandibles",
    nombre: "Filas expandibles con detalle",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Cada obra abre bajo su fila una mini ficha y un gráfico del avance mensual contra meta.",
    interacciones: ["Expandir y contraer fila", "Panel animado", "Lectura del mes en las barras"],
    ancho: true,
    Componente: TablaFilasExpandibles,
  },
  {
    id: "tabla-columnas-configurables",
    nombre: "Columnas ocultables y reordenables",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Menú «Columnas» con checkbox para mostrar u ocultar y flechas o arrastre para cambiar el orden.",
    interacciones: ["Mostrar u ocultar columnas", "Reordenar con flechas", "Arrastrar para mover", "Restablecer"],
    ancho: true,
    Componente: TablaColumnasConfigurables,
  },
  {
    id: "tabla-estados-acciones",
    nombre: "Estados, responsable y acciones por fila",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Insignias en plazo / en riesgo / atrasado, iniciales del responsable y menú de acciones por fila.",
    interacciones: ["Menú kebab con teclado", "Archivar con deshacer", "Resumen por estado", "Resaltar fila"],
    ancho: true,
    Componente: TablaEstadosAcciones,
  },
  {
    id: "tabla-totales-condicional",
    nombre: "Totales al pie y formato condicional",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "Producción mensual contra meta con cada celda en verde o rojo, cumplimiento por fila y totales fijos al pie.",
    interacciones: ["Formato condicional", "Totales fijos al pie", "Resaltar fila"],
    ancho: true,
    Componente: TablaTotalesCondicional,
  },
  {
    id: "tabla-estados-carga",
    nombre: "Estados de carga y vacío",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "La misma tabla con datos, cargando (esqueleto con su estructura) y vacía con mensaje y acción.",
    interacciones: ["Alternar con datos / cargando / vacío", "Esqueleto animado", "Acción en estado vacío"],
    Componente: TablaEstadosCarga,
  },
  {
    id: "plantilla-tabla-zebra",
    nombre: "Plantilla actual: zebra",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "La tabla simple de la plantilla con filas alternas y cifras a la derecha, para comparar.",
    interacciones: ["Sin interacción"],
    plantilla: true,
    Componente: PlantillaZebra,
  },
  {
    id: "plantilla-tabla-ordenable",
    nombre: "Plantilla actual: ordenable",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "La tabla de la plantilla con columnas ordenables por clic en el encabezado, para comparar.",
    interacciones: ["Ordenar por columna", "Resaltar fila"],
    plantilla: true,
    Componente: PlantillaOrdenable,
  },
  {
    id: "plantilla-tabla-estados-paginacion",
    nombre: "Plantilla actual: estados y paginación",
    familia: "tablas",
    libreria: "HTML",
    descripcion: "La tabla de la plantilla con insignias de estado con borde y paginación simple, para comparar.",
    interacciones: ["Página anterior y siguiente", "Resaltar fila"],
    plantilla: true,
    Componente: PlantillaEstadosPaginacion,
  },
];
