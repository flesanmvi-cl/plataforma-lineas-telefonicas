import { TEMA_INICIAL, type TemaLab } from "@/lib/lab-graficos/tema";
import type { Seccion } from "@/components/lab-graficos/tipos";

/**
 * El estándar vigente: lo elegido en el laboratorio de diseño. Lo leen la pestaña «Estándar»
 * de /ui-kit y las pantallas de prueba del sidebar (/pruebas/*), que se dibujan solo con esto.
 *
 * Para cambiarlo: elegir en el laboratorio, «Exportar tema» (JSON) y pegar la combinación en
 * `tema`; en `muestras`, el id (del index.ts de cada familia) de la muestra elegida por sección.
 * Mientras `provisorio` sea true, lo que se ve es el tema inicial del laboratorio, no una
 * elección aprobada.
 */
export interface Estandar {
  provisorio: boolean;
  /** Fecha ISO de la última aprobación (null mientras sea provisorio). */
  vigenteDesde: string | null;
  version: number;
  tema: TemaLab;
  muestras: Record<Seccion, string>;
}

export const ESTANDAR: Estandar = {
  provisorio: true,
  vigenteDesde: null,
  version: 0,
  tema: { ...TEMA_INICIAL },
  muestras: {
    graficos: "linea-multiserie",
    kpis: "kpi-meta",
    tablas: "tabla-estados-acciones",
    botones: "botones-variantes",
    formularios: "campos-texto",
  },
};
