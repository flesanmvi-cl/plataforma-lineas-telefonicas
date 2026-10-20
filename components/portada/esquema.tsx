import { cn } from "@/lib/cn";
import type { BloqueEsquema } from "./datos";

/** Esquema de una pantalla tipo: sus bloques en una grilla de 12 columnas, sin datos. */
export function Esquema({ bloques, className }: { bloques: BloqueEsquema[]; className?: string }) {
  return (
    <div aria-hidden className={cn("grid grid-cols-12 auto-rows-[0.375rem] gap-1 p-2 bg-bg border border-border", className)}>
      {bloques.map(([columnas, alto, destacado], i) => (
        <span
          key={i}
          className={cn("rounded-[2px]", destacado ? "bg-flesan-red/80" : "bg-border-strong/60")}
          style={{ gridColumn: `span ${columnas}`, gridRow: `span ${alto}` }}
        />
      ))}
    </div>
  );
}
