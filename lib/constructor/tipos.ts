import type { TemaLab } from "@/lib/lab-graficos/tema";

// Modelo de una maqueta del constructor (/pruebas/constructor). Se guarda en el navegador y se
// exporta como JSON: por eso solo lleva datos planos (el elemento va por su id de catálogo).

export const ANCHOS = [3, 4, 6, 8, 12] as const;
export type Ancho = (typeof ANCHOS)[number];

/** Altos del área del gráfico, en px. */
export const ALTOS: { id: string; texto: string; px: number }[] = [
  { id: "s", texto: "S", px: 160 },
  { id: "m", texto: "M", px: 240 },
  { id: "l", texto: "L", px: 340 },
  { id: "xl", texto: "XL", px: 460 },
];

export interface Bloque {
  id: string;
  /** Id del elemento en el catálogo del constructor. */
  elemento: string;
  titulo: string;
  detalle: string;
  ancho: Ancho;
  /** Alto del área del gráfico, en px. */
  alto: number;
  /** Lleva el número de bloque en su título (1, 2, 3…). */
  numerado: boolean;
}

/** «reporte» dibuja con Inter Tight (data-estilo="reporte"); «formulario», con Barlow. */
export type TipoMaqueta = "reporte" | "formulario";

export interface Maqueta {
  id: string;
  nombre: string;
  tipo: TipoMaqueta;
  tema: TemaLab;
  bloques: Bloque[];
  actualizada: string;
}

export const nuevoId = () => Math.random().toString(36).slice(2, 10);
