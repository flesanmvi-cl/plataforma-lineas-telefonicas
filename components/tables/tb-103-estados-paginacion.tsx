"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// TB-103 · Tabla con badges de estado (color vía inline style — .badge no
// está en @layer, así que una utilidad Tailwind de color no la vencería en
// la cascada) y paginación simple al pie.
type Estado = "En plazo" | "En riesgo" | "Atrasado";

const DATA: { nombre: string; estado: Estado; responsable: string }[] = [
  { nombre: "Obra Vespucio", estado: "En plazo", responsable: "M. Herrera" },
  { nombre: "Obra Aysén", estado: "En riesgo", responsable: "J. Soto" },
  { nombre: "Obra Toro", estado: "En plazo", responsable: "P. Rojas" },
  { nombre: "Obra Dolores", estado: "Atrasado", responsable: "C. Muñoz" },
  { nombre: "Obra Colina", estado: "En plazo", responsable: "F. Díaz" },
  { nombre: "Obra Mapocho", estado: "En riesgo", responsable: "M. Herrera" },
  { nombre: "Obra Cachapoal", estado: "En plazo", responsable: "J. Soto" },
];

const ESTADO_COLOR: Record<Estado, string> = {
  "En plazo": "var(--color-status-ok)",
  "En riesgo": "var(--color-status-warn)",
  Atrasado: "var(--color-status-down)",
};

const POR_PAGINA = 4;

export function TB103EstadosPaginacion() {
  const [pagina, setPagina] = useState(0);
  const totalPaginas = Math.ceil(DATA.length / POR_PAGINA);
  const filas = DATA.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-label text-[10px] uppercase tracking-wider text-faint px-4 py-2.5">Obra</th>
            <th className="text-left font-label text-[10px] uppercase tracking-wider text-faint px-4 py-2.5">Responsable</th>
            <th className="text-left font-label text-[10px] uppercase tracking-wider text-faint px-4 py-2.5">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((d) => (
            <tr key={d.nombre} className="border-b border-border last:border-0 hover:bg-bg">
              <td className="px-4 py-2.5 font-body text-text">{d.nombre}</td>
              <td className="px-4 py-2.5 font-body text-muted">{d.responsable}</td>
              <td className="px-4 py-2.5">
                <span className="badge" style={{ color: ESTADO_COLOR[d.estado], borderColor: ESTADO_COLOR[d.estado] }}>
                  {d.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <p className="font-label text-[10px] text-faint">
          Página {pagina + 1} de {totalPaginas}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="w-7 h-7 flex items-center justify-center border border-border-strong text-muted hover:text-text hover:border-text disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
            className="w-7 h-7 flex items-center justify-center border border-border-strong text-muted hover:text-text hover:border-text disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
