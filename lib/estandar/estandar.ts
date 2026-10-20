import { TEMA_INICIAL, type TemaLab } from "@/lib/estandar/tema";

/**
 * El estándar vigente: el tema con que se dibujan la Guía de estilo, las Plantillas y el
 * constructor de maquetas (tokens fijos, no se editan en pantalla). Sale del laboratorio de
 * diseño (_prototipos/laboratorio-diseno): allí se elige, «Exportar tema» entrega el JSON y se
 * pega en `tema`. Mientras `provisorio` sea true, es el tema inicial del laboratorio y las piezas
 * de components/estandar no fueron elegidas formalmente: quedaron porque las Plantillas las usan.
 */
export interface Estandar {
  provisorio: boolean;
  /** Fecha ISO de la última aprobación (null mientras sea provisorio). */
  vigenteDesde: string | null;
  version: number;
  tema: TemaLab;
}

export const ESTANDAR: Estandar = {
  provisorio: true,
  vigenteDesde: null,
  version: 0,
  tema: { ...TEMA_INICIAL },
};
