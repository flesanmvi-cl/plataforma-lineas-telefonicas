/**
 * Presentaciones armadas desde la plataforma (etapa 1: guardadas en este navegador).
 *
 * Una diapositiva guarda la «receta» de la vista (ruta + filtros en la URL), no una imagen: al
 * descargar se vuelve a dibujar con los datos del momento. Si se congela, se guarda además la
 * imagen de ese instante (en IndexedDB, ver imagenes.ts) y la descarga usa esa imagen.
 */

export interface Diapositiva {
  id: string;
  titulo: string;
  /** Ruta de la vista con sus filtros: pathname + search (ej. /pruebas/reportes/tipo-4?lineas=Minería). */
  ruta: string;
  /** Filtros legibles al momento de agregarla (para el pie de la diapositiva y el panel). */
  filtros: string[];
  nota: string;
  /** Si la diapositiva muestra solo un bloque de la vista (data-bloque), su id. */
  bloque?: string;
  /** Fecha ISO en que se congeló; mientras exista, la descarga usa la imagen guardada. */
  congelada?: string;
  /** Miniatura JPEG chica (data URL) para el panel y el editor. */
  miniatura?: string;
  agregada: string;
}

export interface Presentacion {
  id: string;
  nombre: string;
  creada: string;
  editada: string;
  diapositivas: Diapositiva[];
}

export interface EstadoPresentaciones {
  presentaciones: Presentacion[];
  activaId: string | null;
}
