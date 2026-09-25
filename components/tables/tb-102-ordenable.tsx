"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// TB-102 · Tabla con columnas ordenables (click en el encabezado alterna asc/desc).
interface Fila {
  nombre: string;
  region: string;
  avance: number;
}

const DATA: Fila[] = [
  { nombre: "Obra Vespucio", region: "Metropolitana", avance: 92 },
  { nombre: "Obra Aysén", region: "Aysén", avance: 78 },
  { nombre: "Obra Toro", region: "Metropolitana", avance: 65 },
  { nombre: "Obra Dolores", region: "Valparaíso", avance: 54 },
  { nombre: "Obra Colina", region: "Metropolitana", avance: 41 },
];

type Col = "nombre" | "region" | "avance";

export function TB102Ordenable() {
  const [sortCol, setSortCol] = useState<Col>("avance");
  const [asc, setAsc] = useState(false);

  function toggleSort(col: Col) {
    if (sortCol === col) setAsc((v) => !v);
    else {
      setSortCol(col);
      setAsc(true);
    }
  }

  const filas = [...DATA].sort((a, b) => {
    const dir = asc ? 1 : -1;
    if (typeof a[sortCol] === "number") return ((a[sortCol] as number) - (b[sortCol] as number)) * dir;
    return String(a[sortCol]).localeCompare(String(b[sortCol])) * dir;
  });

  function Th({ col, label, align = "left" }: { col: Col; label: string; align?: "left" | "right" }) {
    const activo = sortCol === col;
    return (
      <th
        className={`px-(--densidad-celda-x) py-(--densidad-celda-y) font-label text-[10px] uppercase tracking-wider text-faint cursor-pointer select-none ${
          align === "right" ? "text-right" : "text-left"
        }`}
        onClick={() => toggleSort(col)}
      >
        <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
          {label}
          {activo ? (
            asc ? (
              <ChevronUp className="w-3 h-3 text-text" />
            ) : (
              <ChevronDown className="w-3 h-3 text-text" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-40" />
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <Th col="nombre" label="Obra" />
            <Th col="region" label="Región" />
            <Th col="avance" label="Avance" align="right" />
          </tr>
        </thead>
        <tbody>
          {filas.map((d) => (
            <tr key={d.nombre} className="border-b border-border last:border-0 hover:bg-bg">
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-text">{d.nombre}</td>
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-muted">{d.region}</td>
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-text text-right tabular">{d.avance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
