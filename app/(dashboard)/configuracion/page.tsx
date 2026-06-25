"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
  const [nombre, setNombre] = useState("");

  return (
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-lg mx-auto">
      <p className="label-eyebrow brand-bullet mb-3">Ejemplo</p>
      <h1 className="display-title text-3xl text-text mb-2">Configuración</h1>
      <p className="body-lede mb-8">
        Página de ejemplo — reemplaza este formulario por las opciones reales de la plataforma.
      </p>

      <form
        className="card p-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(`Guardado: ${nombre || "(sin nombre)"}`);
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="label-meta text-muted">Nombre de la plataforma</span>
          <input
            className="field-input"
            placeholder="Ej. Portal de Obras"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-flesan btn-flesan-primary">
            Guardar
          </button>
          <button type="button" className="btn-flesan btn-flesan-ghost" onClick={() => setNombre("")}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
