"use client";

import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";

// Plantilla actual (.btn-flesan): las cinco variantes de color tal como están hoy en la plantilla.
export function PlantillaVariantes({ alto }: PropsGraficoLab) {
  return (
    <div style={{ minHeight: alto }} className="flex flex-col justify-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-flesan btn-flesan-primary" onClick={() => toast.success("Acción confirmada")}>
          Confirmar
        </button>
        <button type="button" className="btn-flesan btn-flesan-ghost">
          Cancelar
        </button>
        <button type="button" className="btn-flesan btn-flesan-dark">
          Ver detalle
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-flesan btn-flesan-outline-danger" onClick={() => toast.error("Elemento eliminado")}>
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
        <button type="button" className="btn-flesan btn-flesan-outline-success" onClick={() => toast.success("Aprobado")}>
          <Check className="w-4 h-4" />
          Aprobar
        </button>
      </div>
    </div>
  );
}
