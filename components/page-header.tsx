"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Encabezado estándar de cada vista (aprobado el 2026-10-20). Arriba: el título en la letra del
 * reporte con la descripción detrás de un ícono (i), a su derecha la subvista activa en un
 * paralelogramo rojo (la inclinación del logo Flesan) y las acciones al final. Abajo, una regla: si la
 * vista tiene subvistas (subdashboards), sus botones van sobre la regla y la activa lleva el
 * tramo rojo inclinado; si no, la regla lleva el tramo rojo al inicio. La descripción se abre al
 * pasar el mouse, con foco de teclado o con un clic (táctil); Esc la cierra.
 */
export interface SubvistaHeader<T extends string = string> {
  id: T;
  texto: string;
}

interface PageHeaderProps<T extends string = string> {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Subdashboards de la vista: van como botones sobre la regla. */
  subvistas?: SubvistaHeader<T>[];
  subvista?: T;
  onSubvista?: (id: T) => void;
}

/** Tramo rojo inclinado que se apoya sobre la regla del encabezado. */
const TRAMO = "pointer-events-none absolute -top-[2.5px] h-1 bg-flesan-red -skew-x-[30deg]";

export function PageHeader<T extends string = string>({ title, description, actions, className, subvistas, subvista, onSubvista }: PageHeaderProps<T>) {
  const activa = subvistas?.find((s) => s.id === subvista);
  return (
    <div data-page-header className={cn("flex flex-col gap-2 mb-6", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="titulo-vista text-2xl sm:text-3xl text-text">{title}</h1>
          {description && <InfoPopover label={`Acerca de ${title}`}>{description}</InfoPopover>}
        </div>
        {/* A la derecha del título: así el título no se mueve cuando cambia el largo de la subvista. */}
        {activa && (
          <span className="inline-flex -skew-x-[9deg] bg-flesan-red px-3 py-1">
            <span className="skew-x-[9deg] font-label text-xs font-semibold tracking-[0.14em] uppercase text-white">{activa.texto}</span>
          </span>
        )}
        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="relative flex flex-wrap items-center border-t border-border-strong">
        {subvistas && subvistas.length > 0 ? (
          <nav aria-label={`Vistas de ${title}`} className="flex flex-wrap -ml-3">
            {subvistas.map((s) => {
              const esActiva = s.id === subvista;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={esActiva}
                  onClick={() => onSubvista?.(s.id)}
                  className={cn(
                    "relative px-3 pt-2 pb-1 font-label text-xs tracking-[0.1em] uppercase cursor-pointer transition-colors",
                    esActiva ? "text-text font-semibold" : "text-muted hover:text-text",
                  )}
                >
                  {esActiva && <span aria-hidden className={cn(TRAMO, "left-3 right-3")} />}
                  {s.texto}
                </button>
              );
            })}
          </nav>
        ) : (
          <span aria-hidden className={cn(TRAMO, "left-0 w-24")} />
        )}
      </div>
    </div>
  );
}

function InfoPopover({ label, children }: { label: string; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera o con Esc cuando quedó abierto por clic.
  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  return (
    <div ref={ref} className="relative group">
      <button
        type="button"
        aria-label={label}
        aria-expanded={abierto}
        aria-describedby={id}
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-center w-7 h-7 rounded-full text-faint hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <Info className="w-4 h-4" />
      </button>
      <div
        id={id}
        role="tooltip"
        className={cn(
          "absolute left-0 top-full mt-2 z-30 w-[22rem] max-w-[calc(100vw-2rem)] card p-4 shadow-lg",
          "font-body text-sm text-muted leading-relaxed",
          // hidden (no invisible): invisible igual ocupa espacio y, en móvil, el globo de 22rem
          // desbordaba la página hacia la derecha (scroll horizontal).
          "hidden animate-fade-in",
          "group-hover:block group-has-[:focus-visible]:block",
          abierto && "block",
        )}
      >
        {children}
      </div>
    </div>
  );
}
