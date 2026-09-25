/** Estadística mínima para los gráficos de distribución (KDE, cuantiles, histograma). */

export function cuantil(ordenados: number[], p: number): number {
  const i = (ordenados.length - 1) * p;
  const b = Math.floor(i);
  const r = i - b;
  return ordenados[b + 1] !== undefined ? ordenados[b] + r * (ordenados[b + 1] - ordenados[b]) : ordenados[b];
}

export function resumen(valores: number[]) {
  const o = [...valores].sort((a, b) => a - b);
  const media = o.reduce((s, v) => s + v, 0) / o.length;
  const desv = Math.sqrt(o.reduce((s, v) => s + (v - media) ** 2, 0) / Math.max(1, o.length - 1));
  return { n: o.length, min: o[0], max: o[o.length - 1], q1: cuantil(o, 0.25), mediana: cuantil(o, 0.5), q3: cuantil(o, 0.75), media, desv };
}

/** Ancho de banda de Silverman. */
export function anchoSilverman(valores: number[]): number {
  const { desv, q1, q3, n } = resumen(valores);
  const s = Math.min(desv, (q3 - q1) / 1.34) || desv || 1;
  return 0.9 * s * Math.pow(n, -0.2);
}

/** Densidad por núcleo gaussiano evaluada en `puntos`. */
export function kde(valores: number[], puntos: number[], ancho = anchoSilverman(valores)) {
  const k = 1 / (Math.sqrt(2 * Math.PI) * ancho * valores.length);
  return puntos.map((x) => ({ x, d: k * valores.reduce((s, v) => s + Math.exp(-0.5 * ((x - v) / ancho) ** 2), 0) }));
}

export function rango(desde: number, hasta: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => desde + ((hasta - desde) * i) / (n - 1));
}

/** Histograma de ancho fijo entre `desde` y `hasta`. */
export function histograma(valores: number[], desde: number, hasta: number, clases: number) {
  const ancho = (hasta - desde) / clases;
  const conteos = Array.from({ length: clases }, (_, i) => ({ desde: desde + i * ancho, hasta: desde + (i + 1) * ancho, n: 0 }));
  for (const v of valores) conteos[Math.min(clases - 1, Math.max(0, Math.floor((v - desde) / ancho)))].n++;
  return { conteos, ancho };
}
