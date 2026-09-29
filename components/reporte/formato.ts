// Formatos de cifras del Reporte Tipo 1 (es-CL). Los montos se muestran en millones (MM).

const entero = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
const unDecimal = new Intl.NumberFormat("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 30495 → «30.495». */
export function cifra(n: number) {
  return entero.format(n);
}

/** Participación de `n` en `total` con un decimal: «22,2». Total cero → «0,0». */
export function porcentaje(n: number, total: number) {
  return unDecimal.format(total ? (n / total) * 100 : 0);
}

/** Iniciales para el avatar de una fila: «Constructora Los Andes SpA» → «CL». */
export function iniciales(nombre: string) {
  const palabras = nombre
    .replace(/\b(SpA|Ltda\.?|S\.A\.?|y|de|del|la|las|los)\b/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  return ((palabras[0]?.[0] ?? "") + (palabras[1]?.[0] ?? "")).toUpperCase();
}

/**
 * Colores de serie (tokens --color-serie-N de app/shell.css), en orden. Escritos completos a
 * propósito: Tailwind v4 solo emite las variables del @theme que encuentra escritas en el
 * código, y un nombre armado con plantilla (`--color-serie-${i}`) no lo detecta.
 */
export const SERIES = [
  "var(--color-serie-1)",
  "var(--color-serie-2)",
  "var(--color-serie-3)",
  "var(--color-serie-4)",
  "var(--color-serie-5)",
  "var(--color-serie-6)",
  "var(--color-serie-7)",
  "var(--color-serie-8)",
];

/** Fondo suave de una serie para insignias y avatares. */
export function fondoSerie(color: string, pctMezcla = 15) {
  return `color-mix(in srgb, ${color} ${pctMezcla}%, transparent)`;
}
