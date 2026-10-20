"use client";

import { conAlfa, type TokensLab } from "@/lib/estandar/tema";
import { colorEstado, type Estado } from "./comun";

// Insignia de estado de obra (en plazo / en riesgo / atrasado) con los colores semánticos del tema.
export function InsigniaEstado({ t, estado }: { t: TokensLab; estado: Estado }) {
  const color = colorEstado(t, estado);
  const contorno = t.superficie === "contorno";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "1px 8px",
        borderRadius: 999,
        fontSize: t.tamano.eje,
        fontWeight: 600,
        lineHeight: 1.6,
        color,
        background: contorno ? "transparent" : conAlfa(color, t.oscuro ? 0.16 : 0.1),
        border: `1px solid ${contorno ? conAlfa(color, 0.6) : "transparent"}`,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {estado}
    </span>
  );
}

/** Iniciales del responsable en un círculo con un color de la paleta. */
export function Avatar({ t, nombre, indice }: { t: TokensLab; nombre: string; indice: number }) {
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const color = t.colores[indice % t.colores.length];
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        flex: "none",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: t.texto,
        background: conAlfa(color, t.oscuro ? 0.24 : 0.16),
        boxShadow: `inset 0 0 0 1.5px ${conAlfa(color, 0.7)}`,
      }}
    >
      {iniciales}
    </span>
  );
}
