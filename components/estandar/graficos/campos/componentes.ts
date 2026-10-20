/**
 * Campos de formulario reutilizables (los usan las muestras del laboratorio y las pantallas de
 * prueba /pruebas/formularios/*). Todos leen t.campo del tema: estilo de caja, posición de la
 * etiqueta, alto, radio y colores por estado.
 */
export { CampoTexto, CampoArea, type PropsCampoComun, type PropsCampoTexto, type PropsCampoArea } from "./campo-texto";
export { CampoSelect, CampoBuscable, type OpcionCampo } from "./campo-select";
export { CampoFecha, CampoRangoFechas, type RangoFechas } from "./campo-fecha";
export { CampoMonto } from "./campo-monto";
export { CampoArchivo, type ArchivoCargado } from "./campo-archivo";
export { GrupoCampos } from "./grupo-campos";
export { CampoCasilla, CampoInterruptor, GrupoRadio } from "./opciones";
export { ResumenErrores, type ErrorResumen } from "./resumen-errores";
export { MarcoCampo, CajaCampo, useIdsCampo } from "./marco";
export { formatoNumero, formatoPesos, parsearNumero, fechaLegible, tamanoArchivo } from "./comun";
