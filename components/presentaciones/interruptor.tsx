"use client";

import { usePresentaciones } from "@/components/presentaciones/contexto";

// Fila «Presentaciones» del menú de usuario: activa o desactiva «Agregar a presentación».
export function InterruptorPresentaciones() {
  const { habilitadas, setHabilitadas } = usePresentaciones();
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
      <span id="etiqueta-presentaciones" className="font-label text-xs tracking-[0.08em] uppercase text-muted">
        Presentaciones
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={habilitadas}
        aria-labelledby="etiqueta-presentaciones"
        onClick={() => setHabilitadas(!habilitadas)}
        className={`ml-auto relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
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
