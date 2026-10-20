import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Espacios de una plantilla: los lugares donde va una pieza (KPI, gráfico, tabla). Sirven para
// que el laboratorio de diseño pruebe otra pieza en ese lugar sin editar la plantilla: la
// plantilla recibe `espacios` (lo que reemplaza a su pieza) y `marcas` (numerar los espacios).

export type SeccionEspacio = "kpis" | "graficos" | "tablas";

export interface DefEspacio<T extends string = string> {
  id: T;
  nombre: string;
  /** Qué piezas del laboratorio caben aquí. */
  seccion: SeccionEspacio;
  /** La pieza que tiene hoy la plantilla. */
  actual: string;
  /** Alto para dibujar una pieza de reemplazo, en px. */
  alto: number;
}

export function Espacio({
  n,
  nombre,
  marcas,
  reemplazado,
  className,
  children,
}: {
  n: number;
  nombre: string;
  marcas?: boolean;
  reemplazado?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-espacio={n} className={cn("relative min-w-0 grid", className)}>
      {children}
      {marcas && (
        <span
          title={nombre}
          className={cn(
            "pointer-events-none absolute -top-2 -left-2 z-10 min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-full font-label text-xs font-semibold shadow",
            reemplazado ? "bg-flesan-red text-white" : "bg-text text-bg",
          )}
        >
          {n}
        </span>
      )}
      {marcas && reemplazado && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-flesan-red/60" />}
    </div>
  );
}
