"use client";

import type { TokensLab } from "@/lib/lab-graficos/tema";

// Checkbox nativo con el acento del tema; admite estado indeterminado («seleccionar todo» parcial).
export function Casilla({
  t,
  marcada,
  indeterminada = false,
  etiqueta,
  onCambiar,
}: {
  t: TokensLab;
  marcada: boolean;
  indeterminada?: boolean;
  etiqueta: string;
  onCambiar: (marcada: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={etiqueta}
      checked={marcada}
      ref={(el) => {
        if (el) el.indeterminate = indeterminada;
      }}
      onChange={(e) => onCambiar(e.target.checked)}
      style={{ width: 15, height: 15, margin: 0, accentColor: t.acento, cursor: "pointer", verticalAlign: "middle" }}
    />
  );
}
