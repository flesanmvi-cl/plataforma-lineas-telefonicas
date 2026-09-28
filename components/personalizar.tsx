"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ESTILOS_PORTALES, useEstiloPortales, type EstiloPortales } from "@/components/portales/estilo";

/**
 * Panel «Personalizar» del menú de usuario: preferencias de apariencia que cada usuario elige
 * para sí (se guardan en su navegador). Por ahora, el estilo del acceso a portales CIA / SAP.
 */
export function PanelPersonalizar({ onCerrar, className }: { onCerrar: () => void; className?: string }) {
  const [estilo, elegir] = useEstiloPortales();

  return (
    <div
      role="dialog"
      aria-label="Personalizar"
      className={cn("w-72 rounded-flesan border border-border bg-surface shadow-lg p-4 flex flex-col gap-3", className)}
    >
      <div className="flex items-center">
        <span className="text-[0.9375rem] font-semibold text-text">Personalizar</span>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="ml-auto text-muted hover:text-text cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="label-meta text-[0.625rem] text-faint mb-2">Acceso a portales CIA / SAP</legend>
        <div className="grid grid-cols-2 gap-2">
          {ESTILOS_PORTALES.map((op) => {
            const activo = op.id === estilo;
            return (
              <button
                key={op.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => elegir(op.id)}
                title={op.detalle}
                className={cn(
                  "relative flex flex-col items-stretch gap-1.5 p-1.5 rounded-flesan border text-left cursor-pointer transition-colors",
                  activo ? "border-flesan-red bg-bg" : "border-border hover:border-border-strong hover:bg-bg",
                )}
              >
                <Muestra estilo={op.id} />
                <span className="flex items-center gap-1 px-0.5 font-label text-[0.6875rem] tracking-[0.08em] uppercase text-text">
                  {op.nombre}
                  {activo && <Check className="w-3 h-3 ml-auto text-flesan-red" />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted leading-relaxed">
          {ESTILOS_PORTALES.find((e) => e.id === estilo)?.detalle}.
        </p>
      </fieldset>
    </div>
  );
}

// Miniatura de cada estilo: un trozo de sidebar con el acceso a escala.
function Muestra({ estilo }: { estilo: EstiloPortales }) {
  return (
    <span className="relative block h-12 rounded-[0.375rem] bg-surface border border-border overflow-hidden" aria-hidden>
      <span className="absolute inset-y-0 right-0 w-5 bg-bg border-l border-border" />
      {estilo === "lengueta" && (
        <span className="acceso-portales lengueta-portales absolute left-0 top-2.5 w-3 h-7 rounded-r-md" />
      )}
      {estilo === "media-luna" && (
        <span className="acceso-portales media-luna-portales absolute left-0 top-3.5 w-[0.9375rem] h-5 rounded-r-full" />
      )}
      {estilo === "cinta" && (
        <span className="acceso-portales absolute left-0 top-2 h-8 flex items-center gap-1">
          <span className="cinta-portales-linea w-[2px] h-full" />
          <span className="flex flex-col gap-0.5">
            <span className="w-[3px] h-2.5 rounded-full bg-(--portales-cia)" />
            <span className="w-[3px] h-2.5 rounded-full bg-(--portales-sap)" />
          </span>
        </span>
      )}
      {estilo === "burbuja" && (
        <span className="acceso-portales burbuja-portales absolute left-[calc(50%-1.375rem)] top-3 w-6 h-6 rounded-full [animation:none]" />
      )}
    </span>
  );
}
