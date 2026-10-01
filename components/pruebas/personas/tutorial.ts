import type { PasoTutorial } from "@/components/tutorial/tutorial";

// Recorrido guiado del Reporte Tipo 3 (dotación). Sigue la lectura de la pantalla: corte, cifra
// principal, indicadores, filtros, movimientos, composición y detalle.
export const PASOS_DOTACION: PasoTutorial[] = [
  {
    selector: '[data-tutorial="cierre"]',
    titulo: "Elige el mes de cierre",
    texto: "Todo el reporte se calcula al cierre de este mes: la dotación es quien está vigente ese día, y los movimientos y la rotación son de los 12 meses anteriores.",
  },
  {
    selector: '[data-bloque="kpi-principal"]',
    titulo: "La dotación del cierre",
    texto: "Cuántas personas hay contra los cupos autorizados, cuánto entró y salió en el año y cómo se movió la dotación mes a mes (la curva de fondo).",
  },
  {
    selector: '[data-tutorial="indicadores"]',
    titulo: "Rotación y composición",
    texto: "La rotación de 12 meses se compara con el tope de las gerencias: verde holgada, ámbar cerca del tope, rojo sobre el tope. Al lado, la rotación voluntaria, la antigüedad y el porcentaje de mujeres.",
  },
  {
    selector: '[data-tutorial="filtros"]',
    titulo: "Filtra haciendo clic",
    texto: "Un clic en cualquier gráfico filtra el resto: una gerencia, un tramo de edad, un lado de la pirámide, una antigüedad o un contrato. Lo elegido aparece aquí; quítalo con su X.",
  },
  {
    selector: '[data-bloque="puente-de-dotacion"]',
    titulo: "De un año al otro",
    texto: "El puente parte en la dotación de hace un año, suma los ingresos, resta los egresos por motivo y llega a la del cierre.",
  },
  {
    selector: '[data-bloque="rotacion-por-gerencia"]',
    titulo: "Dónde está la rotación",
    texto: "Cada gerencia contra su propio tope. La marca negra es el tope; haz clic en una gerencia para ver todo el reporte solo de ella.",
  },
  {
    selector: '[data-bloque="detalle"]',
    titulo: "Baja al detalle",
    texto: "La tabla agrupa por gerencia o por nivel de cargo, se ordena por dotación o rotación y se descarga a Excel con los filtros puestos.",
  },
];
