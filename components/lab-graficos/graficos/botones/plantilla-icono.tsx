"use client";

import { useState } from "react";
import { Download, LayoutGrid, List, Plus, Search } from "lucide-react";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";

// Plantilla actual (.btn-flesan): solo ícono, ícono + texto y el segmentado lista/grilla.
export function PlantillaIcono({ alto }: PropsGraficoLab) {
  const [vista, setVista] = useState<"lista" | "grilla">("lista");
  const opciones = [
    { id: "lista" as const, texto: "Lista", Icono: List },
    { id: "grilla" as const, texto: "Grilla", Icono: LayoutGrid },
  ];

  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-flesan btn-flesan-ghost btn-flesan-icon" aria-label="Buscar" title="Buscar">
          <Search className="w-4 h-4" />
        </button>
        <button type="button" className="btn-flesan btn-flesan-primary btn-flesan-icon" aria-label="Agregar" title="Agregar">
          <Plus className="w-4 h-4" />
        </button>
        <button type="button" className="btn-flesan btn-flesan-ghost">
          <Download className="w-4 h-4" />
          Descargar
        </button>
      </div>
      <div className="inline-flex self-start">
        {opciones.map(({ id, texto, Icono }, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setVista(id)}
            aria-pressed={vista === id}
            className={`${i > 0 ? "-ml-px " : ""}inline-flex items-center gap-1.5 px-3 h-9 border font-label text-xs uppercase tracking-wider transition-colors ${
              vista === id ? "border-text bg-text text-surface" : "border-border bg-surface text-muted hover:text-text hover:border-text"
            }`}
          >
            <Icono className="w-3.5 h-3.5" />
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
}
