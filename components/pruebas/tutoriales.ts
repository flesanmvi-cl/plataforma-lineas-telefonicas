import type { PasoTutorial } from "@/components/tutorial/tutorial";

// Recorridos guiados de las pantallas de prueba (el del Tipo 3 está en personas/tutorial.ts). Son
// también ejemplos para copiar: cada uno sigue el orden de lectura de su pantalla y reutiliza el
// data-bloque de las tarjetas o un data-tutorial puesto a propósito.

const ACCIONES_ENCABEZADO = "[data-page-header] > .ml-auto";

/** Reporte Tipo 1 · resumen de contratación. */
export const PASOS_TIPO_1: PasoTutorial[] = [
  {
    selector: ACCIONES_ENCABEZADO,
    titulo: "En ejecución o histórico",
    texto: "Elige si ves solo los contratos vigentes o toda la historia. «Análisis por obra» te lleva al detalle de costos.",
  },
  {
    selector: '[data-bloque="kpi-principal"]',
    titulo: "Cuánto se ha contratado",
    texto: "El monto contratado contra lo ya facturado, con el avance entre ambos y la curva acumulada por año de fondo.",
  },
  {
    selector: '[data-bloque="tipo-de-contrato"]',
    titulo: "Haz clic para filtrar",
    texto: "Un clic en un tipo de contrato filtra todo el reporte. Lo demás no desaparece: queda atenuado para que compares.",
  },
  {
    selector: '[data-tutorial="filtros"]',
    titulo: "Tus filtros",
    texto: "Aquí aparece lo que elegiste en los gráficos. Quítalo con su X, o usa «Limpiar» si hay más de uno.",
  },
  {
    selector: '[data-bloque="nivel-de-aprobacion"]',
    titulo: "Quién aprobó",
    texto: "La pirámide muestra en qué nivel se firmó cada contrato, del directorio al capataz. Un clic en un nivel lo filtra.",
  },
  {
    selector: '[data-bloque="detalle"]',
    titulo: "El detalle",
    texto: "Agrupa por subcontratista o por unidad, busca, ordena por monto contratado o facturado y descarga a Excel con los filtros puestos.",
  },
];

/** Reporte Tipo 2 · ventas. */
export const PASOS_TIPO_2: PasoTutorial[] = [
  {
    selector: '[role="radiogroup"][aria-label="Período"]',
    titulo: "Mes o acumulado",
    texto: "«Acumulado» suma de enero al mes elegido; «Mes» muestra solo ese mes. Al lado eliges el mes.",
  },
  {
    selector: '[role="radiogroup"][aria-label="Vista del reporte"]',
    titulo: "Tres vistas, los mismos filtros",
    texto: "Tablero para el resumen, Territorio con el mapa protagonista y Vendedor × mes para la matriz. Lo que filtres en una sigue en las otras.",
  },
  {
    selector: '[data-bloque="kpi-principal"]',
    titulo: "Venta contra meta",
    texto: "La venta del período contra la meta, con el porcentaje de cumplimiento. El semáforo es verde sobre 100 %, ámbar entre 90 y 99 % y rojo bajo 90 %.",
  },
  {
    selector: '[data-bloque="venta-mensual"]',
    titulo: "Mes a mes",
    texto: "2026 contra 2025 y la meta punteada. Haz clic en un mes para ver el reporte solo de ese mes.",
  },
  {
    selector: '[data-bloque="por-vendedor"]',
    titulo: "Cada vendedor contra su meta",
    texto: "La barra es lo vendido y la marca negra, su meta. Un clic en un vendedor filtra todo el reporte.",
  },
  {
    selector: '[data-bloque^="detalle-"]',
    titulo: "El detalle",
    texto: "Agrupa por vendedor, proyecto o ciudad, con su tendencia, cumplimiento y variación contra el año anterior.",
  },
];

/** Reporte Tipo 4 · costos por obra (drilldown). */
export const PASOS_TIPO_4: PasoTutorial[] = [
  {
    selector: '[data-bloque="filtros"]',
    titulo: "Filtra a la izquierda",
    texto: "Elige el período, las líneas de negocio, la región y el estado de las obras. El número de cada opción dice cuántas obras quedan.",
  },
  {
    selector: '[data-tutorial="resumen"]',
    titulo: "El resumen",
    texto: "Presupuesto, costo real, desviación y avance físico de lo que tienes filtrado.",
  },
  {
    selector: '[data-bloque^="costo-por"]',
    titulo: "Baja al detalle",
    texto: "Haz clic en una barra para bajar de línea de negocio a obra, y de obra a partida. «Volver» sube un nivel.",
  },
  {
    selector: '[data-bloque^="detalle-por"]',
    titulo: "La tabla sigue al gráfico",
    texto: "Muestra el mismo nivel que el gráfico, con presupuesto, costo, desviación y avance. Un clic en una fila también baja.",
  },
];

/** Reporte Tipo 5 · ficha de obra. */
export const PASOS_TIPO_5: PasoTutorial[] = [
  {
    selector: '[data-tutorial="ficha"]',
    titulo: "La ficha",
    texto: "Los datos de la obra (código, estado, mandante, línea) y sus cifras principales al corte.",
  },
  {
    selector: '[data-bloque="programa-de-obra"]',
    titulo: "El programa",
    texto: "Cada tarea del programa con su avance real al corte.",
  },
  {
    selector: '[data-bloque="curva-s-de-avance-fisico"]',
    titulo: "¿Vamos al día?",
    texto: "La curva S compara el avance programado con el real acumulado. Si la real queda bajo la programada, la obra va atrasada.",
  },
  {
    selector: '[data-bloque="partidas"]',
    titulo: "Cada partida",
    texto: "El estado de cada partida al corte. Se descarga a Excel desde la esquina de la tarjeta.",
  },
  {
    selector: "[data-page-header] > .ml-auto",
    titulo: "Registra el avance",
    texto: "Comparte la ficha, expórtala o registra el avance de la semana.",
  },
];

/** Formulario Tipo 2 · solicitud de compra por pasos. */
export const PASOS_FORMULARIO_2: PasoTutorial[] = [
  {
    selector: 'nav[aria-label="Pasos de la solicitud"]',
    titulo: "Un formulario por pasos",
    texto: "La solicitud se completa en cuatro pasos: datos, ítems, aprobadores y revisión. Puedes volver a uno anterior haciendo clic en él; lo avanzado no se pierde.",
  },
  {
    selector: '[data-grupo="Datos de la solicitud"]',
    titulo: "Los datos",
    texto: "Completa lo obligatorio (asterisco rojo). Cada paso se revisa al avanzar y te avisa qué falta.",
  },
  {
    selector: '[data-tutorial="navegacion"]',
    titulo: "Avanza o vuelve",
    texto: "«Siguiente» revisa el paso y te lleva al que sigue. En el último revisas todo en modo lectura antes de enviar.",
  },
];

/** Formulario Tipo 3 · estado de pago con líneas. */
export const PASOS_FORMULARIO_3: PasoTutorial[] = [
  {
    selector: '[aria-label="Encabezado del estado de pago"]',
    titulo: "El encabezado",
    texto: "Los datos generales del estado de pago. Los obligatorios llevan asterisco rojo.",
  },
  {
    selector: '[aria-labelledby="ep-lineas-titulo"]',
    titulo: "Las líneas",
    texto: "Agrega una línea por partida con «Agregar línea». Las líneas se pueden descargar a Excel.",
  },
  {
    selector: '[aria-label="Resumen del estado de pago"]',
    titulo: "El resumen",
    texto: "El total, la retención y el líquido a pagar se actualizan mientras escribes. Desde aquí lo envías a revisión o guardas un borrador.",
  },
];
