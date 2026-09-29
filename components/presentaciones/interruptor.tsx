"use client";

import { usePresentaciones } from "@/components/presentaciones/contexto";

/**
 * Tarjeta para activar o desactivar Presentaciones (vive en Configuración › Presentaciones).
 * Desactivadas, desaparece «Agregar a presentación» de la barra superior; las presentaciones ya
 * armadas se conservan.
 */
export function InterruptorPresentaciones() {
  const { habilitadas, setHabilitadas } = usePresentaciones();
  return (
    <div className="card dens-card flex items-center gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span id="etiqueta-presentaciones" className="text-sm font-semibold text-text">
          Presentaciones {habilitadas ? "activadas" : "desactivadas"}
        </span>
        <span className="text-xs text-muted">
          {habilitadas
            ? "Se muestra «Agregar a presentación» en la barra superior de cada vista."
            : "«Agregar a presentación» está oculto. Tus presentaciones se conservan."}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={habilitadas}
        aria-labelledby="etiqueta-presentaciones"
        onClick={() => setHabilitadas(!habilitadas)}
        className={`ml-auto shrink-0 relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
          habilitadas ? "bg-flesan-red" : "bg-border-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            habilitadas ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
