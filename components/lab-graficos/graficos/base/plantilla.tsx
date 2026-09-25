"use client";

import { useState } from "react";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";

// Plantilla actual (.chip-flesan y .badge de app/globals.css), tal como estaban en Fundamentos.
export function PlantillaChipsBadges({ alto }: PropsGraficoLab) {
  const [activo, setActivo] = useState("Construcción");
  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-5">
      <div className="flex flex-wrap gap-2">
        {["Construcción", "Minería", "Vialidad"].map((sector) => (
          <button
            key={sector}
            type="button"
            aria-pressed={activo === sector}
            onClick={() => setActivo(sector)}
            className={`chip-flesan ${activo === sector ? "is-active" : ""}`}
          >
            {sector}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="badge">Activo</span>
        <span className="badge">Próximamente</span>
      </div>
    </div>
  );
}

// Plantilla actual (.card, .card-hover y .skeleton de app/globals.css).
export function PlantillaCardsSkeleton({ alto }: PropsGraficoLab) {
  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card card-hover p-4">
          <p className="font-label text-sm text-text mb-1">Card con hover</p>
          <p className="font-body text-sm text-muted">Borde rojo y sombra al pasar el mouse.</p>
        </div>
        <div className="card p-4">
          <p className="font-label text-sm text-text mb-1">Card simple</p>
          <p className="font-body text-sm text-muted">Sin interacción, solo contenedor.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 max-w-sm" aria-hidden>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}
