"use client";

import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";

// Plantilla actual (.btn-flesan): tamaños -lg / normal / -sm, forma pastilla y deshabilitado.
export function PlantillaTamanos({ alto }: PropsGraficoLab) {
  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-flesan btn-flesan-primary btn-flesan-lg">
          Grande
        </button>
        <button type="button" className="btn-flesan btn-flesan-primary">
          Normal
        </button>
        <button type="button" className="btn-flesan btn-flesan-primary btn-flesan-sm">
          Chico
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-flesan btn-flesan-primary btn-flesan-pill">
          Filtrar
        </button>
        <button type="button" className="btn-flesan btn-flesan-primary" disabled>
          No disponible
        </button>
        <button type="button" className="btn-flesan btn-flesan-ghost" disabled>
          No disponible
        </button>
      </div>
    </div>
  );
}
