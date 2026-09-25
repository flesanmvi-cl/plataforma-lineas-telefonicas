/**
 * Datos ficticios para las muestras y pantallas de prueba de formularios (sin personas reales).
 */
import type { OpcionCampo } from "./campo-select";
import { normalizar } from "./comun";

export const REGIONES: OpcionCampo[] = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
].map((r) => ({ valor: normalizar(r).replace(/[^a-z]+/g, "-"), etiqueta: r }));

export const PROVEEDORES: OpcionCampo[] = [
  { valor: "hormigones-sur", etiqueta: "Hormigones del Sur Ltda.", detalle: "Hormigón premezclado" },
  { valor: "aceros-andes", etiqueta: "Aceros Los Andes S.A.", detalle: "Enfierradura" },
  { valor: "aridos-maipo", etiqueta: "Áridos Maipo SpA", detalle: "Áridos y rellenos" },
  { valor: "moldajes-norte", etiqueta: "Moldajes Norte Ltda.", detalle: "Arriendo de moldajes" },
  { valor: "gruas-pacifico", etiqueta: "Grúas Pacífico S.A.", detalle: "Grúas torre" },
  { valor: "electro-centro", etiqueta: "Electro Centro SpA", detalle: "Instalaciones eléctricas" },
  { valor: "sanitarias-valle", etiqueta: "Sanitarias del Valle Ltda.", detalle: "Instalaciones sanitarias" },
  { valor: "vidrios-costa", etiqueta: "Vidrios Costa SpA", detalle: "Ventanas y cristales" },
  { valor: "pinturas-cordillera", etiqueta: "Pinturas Cordillera S.A.", detalle: "Pinturas y revestimientos" },
  { valor: "maquinaria-austral", etiqueta: "Maquinaria Austral Ltda.", detalle: "Movimiento de tierra" },
  { valor: "seguridad-obra", etiqueta: "Seguridad en Obra SpA", detalle: "EPP y señalética" },
  { valor: "topografia-precisa", etiqueta: "Topografía Precisa Ltda.", detalle: "Topografía" },
  { valor: "asfaltos-ruta", etiqueta: "Asfaltos Ruta 5 S.A.", detalle: "Pavimentos" },
  { valor: "madera-bosque", etiqueta: "Maderas Bosque Nativo SpA", detalle: "Madera y tableros" },
  { valor: "clima-total", etiqueta: "Clima Total Ltda.", detalle: "Climatización" },
];

export const OBRAS: OpcionCampo[] = [
  { valor: "obra-norte", etiqueta: "Obra Norte", detalle: "Edificio habitacional · Antofagasta" },
  { valor: "obra-costa", etiqueta: "Obra Costa", detalle: "Hotel · Viña del Mar" },
  { valor: "obra-parque", etiqueta: "Edificio Parque", detalle: "Oficinas · Santiago" },
  { valor: "obra-puente", etiqueta: "Puente Río Claro", detalle: "Vialidad · Maule" },
  { valor: "obra-planta", etiqueta: "Planta Concentradora Sur", detalle: "Minería · Atacama" },
  { valor: "obra-ruta", etiqueta: "Mejoramiento Ruta Costera", detalle: "Vialidad · Biobío" },
];

export const CENTROS_COSTO: OpcionCampo[] = [
  { valor: "cc-100", etiqueta: "CC-100 Obra gruesa" },
  { valor: "cc-200", etiqueta: "CC-200 Terminaciones" },
  { valor: "cc-300", etiqueta: "CC-300 Instalaciones" },
  { valor: "cc-400", etiqueta: "CC-400 Gastos generales" },
];

/** Valor referencial de la UF para convertir en las muestras (no es el oficial del día). */
export const UF_REFERENCIAL = 38000;
