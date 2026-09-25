"use client";

import type { CSSProperties } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { estiloEncabezado } from "./comun";

export type Direccion = "asc" | "desc";

// Encabezado de columna ordenable: botón accesible con aria-sort en el <th>.
export function EncabezadoOrdenable({
  t,
  etiqueta,
  activo,
  direccion,
  alinear = "left",
  onOrdenar,
  estilo,
}: {
  t: TokensLab;
  etiqueta: string;
  activo: boolean;
  direccion: Direccion;
  alinear?: "left" | "right" | "center";
  onOrdenar: () => void;
  estilo?: CSSProperties;
}) {
  const Icono = !activo ? ArrowUpDown : direccion === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={activo ? (direccion === "asc" ? "ascending" : "descending") : "none"}
      style={{ ...estiloEncabezado(t), textAlign: alinear, ...estilo }}
    >
      <button
        type="button"
        onClick={onOrdenar}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          flexDirection: alinear === "right" ? "row-reverse" : "row",
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          cursor: "pointer",
          color: activo ? t.texto : t.textoSuave,
        }}
      >
        {etiqueta}
        <Icono size={12} strokeWidth={2} aria-hidden style={{ opacity: activo ? 1 : 0.5 }} />
      </button>
    </th>
  );
}
