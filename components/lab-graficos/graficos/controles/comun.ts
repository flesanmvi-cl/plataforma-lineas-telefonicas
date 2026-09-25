import type { KeyboardEvent } from "react";

/**
 * Navegación con flechas en un grupo de opción única (radiogroup, segmentado): mueve la
 * selección y el foco a la opción vecina. Devuelve true si manejó la tecla.
 */
export function moverConFlechas(
  e: KeyboardEvent<HTMLElement>,
  indice: number,
  total: number,
  elegir: (i: number) => void,
  enfocar: (i: number) => void,
): boolean {
  const pasos: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  let destino: number | null = null;
  if (e.key in pasos) destino = (indice + pasos[e.key] + total) % total;
  else if (e.key === "Home") destino = 0;
  else if (e.key === "End") destino = total - 1;
  if (destino === null) return false;
  e.preventDefault();
  elegir(destino);
  enfocar(destino);
  return true;
}
