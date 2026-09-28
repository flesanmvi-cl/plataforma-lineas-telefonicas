/**
 * Descarga de una presentación como PDF (jsPDF) o PowerPoint (pptxgenjs), en el navegador.
 * Cada diapositiva se dibuja con los datos del momento (o se usa su imagen si está congelada).
 */
import { ALTO, ANCHO, capturarUrl, urlDiapositiva } from "@/lib/presentaciones/capturar";
import { leerImagen } from "@/lib/presentaciones/imagenes";
import type { Presentacion } from "@/lib/presentaciones/tipos";

export type Progreso = (hechas: number, total: number) => void;

/** Imagen de cada diapositiva, en orden. */
export async function imagenesDe(p: Presentacion, progreso?: Progreso): Promise<string[]> {
  const imagenes: string[] = [];
  for (const [i, d] of p.diapositivas.entries()) {
    progreso?.(i, p.diapositivas.length);
    const congelada = d.congelada ? await leerImagen(d.id) : null;
    imagenes.push(congelada ?? (await capturarUrl(urlDiapositiva(d, p, i + 1))));
  }
  progreso?.(p.diapositivas.length, p.diapositivas.length);
  return imagenes;
}

function nombreArchivo(p: Presentacion, extension: string) {
  const fecha = new Date().toISOString().slice(0, 10);
  return `${p.nombre.replace(/[\\/:*?"<>|]/g, " ").trim() || "Presentación"} ${fecha}.${extension}`;
}

export async function descargarPdf(p: Presentacion, progreso?: Progreso) {
  const imagenes = await imagenesDe(p, progreso);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [ANCHO, ALTO], hotfixes: ["px_scaling"], compress: true });
  pdf.setProperties({ title: p.nombre, creator: "Grupo Flesan", subject: "Uso interno" });
  imagenes.forEach((img, i) => {
    if (i > 0) pdf.addPage([ANCHO, ALTO], "landscape");
    pdf.addImage(img, "PNG", 0, 0, ANCHO, ALTO, undefined, "FAST");
  });
  pdf.save(nombreArchivo(p, "pdf"));
}

export async function descargarPptx(p: Presentacion, progreso?: Progreso) {
  const imagenes = await imagenesDe(p, progreso);
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13,33 × 7,5 pulgadas = 16:9
  pptx.title = p.nombre;
  pptx.company = "Grupo Flesan";
  p.diapositivas.forEach((d, i) => {
    const slide = pptx.addSlide();
    slide.addImage({ data: imagenes[i], x: 0, y: 0, w: "100%", h: "100%" });
    // Nota del presentador (y la vista de origen, para volver a ella).
    slide.addNotes([d.nota, `Vista: ${d.ruta}`].filter(Boolean).join("\n\n"));
  });
  await pptx.writeFile({ fileName: nombreArchivo(p, "pptx") });
}
