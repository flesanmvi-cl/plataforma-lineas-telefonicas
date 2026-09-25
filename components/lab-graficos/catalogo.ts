import type { GraficoLab } from "@/components/lab-graficos/tipos";
import { GRAFICOS_COMPARACION } from "@/components/lab-graficos/graficos/comparacion";
import { GRAFICOS_COMPOSICION } from "@/components/lab-graficos/graficos/composicion";
import { GRAFICOS_TIEMPO } from "@/components/lab-graficos/graficos/tiempo";
import { GRAFICOS_FLUJOS } from "@/components/lab-graficos/graficos/flujos";
import { GRAFICOS_DISTRIBUCION } from "@/components/lab-graficos/graficos/distribucion";
import { GRAFICOS_KPI } from "@/components/lab-graficos/graficos/kpi";
import { GRAFICOS_TABLAS } from "@/components/lab-graficos/graficos/tablas";
import { GRAFICOS_MAPAS } from "@/components/lab-graficos/graficos/mapas";

/** Catálogo completo del laboratorio, en el orden de las familias. */
export const CATALOGO: GraficoLab[] = [
  ...GRAFICOS_COMPARACION,
  ...GRAFICOS_COMPOSICION,
  ...GRAFICOS_TIEMPO,
  ...GRAFICOS_FLUJOS,
  ...GRAFICOS_DISTRIBUCION,
  ...GRAFICOS_KPI,
  ...GRAFICOS_TABLAS,
  ...GRAFICOS_MAPAS,
];

export function graficoPorId(id: string | null | undefined): GraficoLab | undefined {
  return CATALOGO.find((g) => g.id === id);
}
