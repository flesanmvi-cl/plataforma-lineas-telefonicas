"use client";

import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";

// Plantilla actual (.field-input de app/globals.css): el único campo que traía Fundamentos,
// aquí con etiqueta y deshabilitado para compararlo con los campos nuevos.
export function PlantillaInputs({ alto }: PropsGraficoLab) {
  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-4 max-w-sm">
      <input className="field-input" placeholder="Campo de texto" aria-label="Campo de texto" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="plantilla-obra" className="label-meta text-faint">
          Nombre de la obra
        </label>
        <input id="plantilla-obra" className="field-input" defaultValue="Obra Norte" />
      </div>
      <input className="field-input opacity-50 cursor-not-allowed" disabled placeholder="Deshabilitado" aria-label="Deshabilitado" />
    </div>
  );
}
