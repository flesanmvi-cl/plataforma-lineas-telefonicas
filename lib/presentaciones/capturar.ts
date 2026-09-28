/**
 * Captura de diapositivas en el navegador: abre la vista en modo diapositiva dentro de un
 * iframe fuera de pantalla (mismo origen), espera a que termine de dibujarse y la convierte en
 * imagen con html-to-image. Es la etapa 1: sin servidor, cada diapositiva queda como imagen.
 */
import type { Diapositiva, Presentacion } from "@/lib/presentaciones/tipos";

export const ANCHO = 1600;
export const ALTO = 900;
const ESPERA_MAXIMA_MS = 20000;
const CAPTURA_MAXIMA_MS = 45000;

// Las letras se incrustan en cada imagen; calcularlas es lo más lento, así que se reutilizan.
let cssLetras: Promise<string> | null = null;

function conLimite<T>(promesa: Promise<T>, ms: number, mensaje: string): Promise<T> {
  return Promise.race([promesa, new Promise<T>((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms))]);
}

/** URL de la vista en modo diapositiva, con el encabezado y pie de la presentación. */
export function urlDiapositiva(d: Diapositiva, p: Presentacion, numero: number): string {
  const [ruta, busqueda = ""] = d.ruta.split("?");
  const q = new URLSearchParams(busqueda);
  q.set("diapositiva", "1");
  q.set("t", d.titulo);
  q.set("p", p.nombre);
  q.set("n", String(numero));
  q.set("de", String(p.diapositivas.length));
  if (d.filtros.length) q.set("f", d.filtros.join("|"));
  if (d.bloque) q.set("b", d.bloque);
  return `${ruta}?${q.toString()}`;
}

/** Dibuja una URL de modo diapositiva en un iframe oculto y devuelve un PNG (data URL). */
export async function capturarUrl(url: string, { resolucion = 1.5 }: { resolucion?: number } = {}): Promise<string> {
  const { toPng, getFontEmbedCSS } = await import("html-to-image");
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  // Fuera de la vista pero con tamaño real: si se oculta con display:none no hay layout.
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-20000px",
    top: "0",
    width: `${ANCHO}px`,
    height: `${ALTO}px`,
    border: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);
  try {
    await new Promise<void>((resolver, rechazar) => {
      iframe.onload = () => resolver();
      iframe.onerror = () => rechazar(new Error("No se pudo abrir la vista"));
      iframe.src = url;
    });
    const ventana = iframe.contentWindow as (Window & { __diapositivaLista?: boolean }) | null;
    const inicio = Date.now();
    while (!ventana?.__diapositivaLista) {
      if (Date.now() - inicio > ESPERA_MAXIMA_MS) throw new Error("La vista tardó demasiado en dibujarse");
      await new Promise((r) => setTimeout(r, 200));
    }
    const marco = iframe.contentDocument?.querySelector<HTMLElement>("[data-diapositiva-marco]");
    if (!marco) throw new Error("La vista no se abrió en modo diapositiva");
    cssLetras ??= getFontEmbedCSS(marco).catch(() => "");
    const fontEmbedCSS = await cssLetras;
    return await conLimite(
      toPng(marco, { width: ANCHO, height: ALTO, pixelRatio: resolucion, fontEmbedCSS }),
      CAPTURA_MAXIMA_MS,
      "La diapositiva tardó demasiado en convertirse en imagen",
    );
  } finally {
    iframe.remove();
  }
}

/** Reduce una imagen a una miniatura JPEG chica para el panel y el editor. */
export async function miniatura(dataUrl: string, ancho = 320): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = Math.round((ancho * img.height) / img.width);
  lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return lienzo.toDataURL("image/jpeg", 0.72);
}
