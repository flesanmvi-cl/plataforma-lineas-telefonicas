"use client";

import { useState } from "react";
import { descargarPdf, descargarPptx } from "@/lib/presentaciones/exportar";
import type { Presentacion } from "@/lib/presentaciones/tipos";

export type TipoDescarga = "pdf" | "pptx";

/** Genera y descarga una presentación, con progreso («2 de 4») y error visibles. */
export function useDescarga() {
  const [generando, setGenerando] = useState<TipoDescarga | null>(null);
  const [progreso, setProgreso] = useState<{ hechas: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function descargar(tipo: TipoDescarga, p: Presentacion) {
    if (!p.diapositivas.length || generando) return;
    setGenerando(tipo);
    setError(null);
    try {
      const alAvanzar = (hechas: number, total: number) => setProgreso({ hechas, total });
      if (tipo === "pdf") await descargarPdf(p, alAvanzar);
      else await descargarPptx(p, alAvanzar);
    } catch (e) {
      console.error("[presentaciones]", e);
      setError(e instanceof Error ? e.message : "No se pudo generar el archivo");
    } finally {
      setGenerando(null);
      setProgreso(null);
    }
  }

  const texto = generando && progreso ? `Generando ${Math.min(progreso.hechas + 1, progreso.total)} de ${progreso.total}…` : null;
  return { descargar, generando, texto, error };
}
