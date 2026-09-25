"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { LabTemaProvider, useLabTema } from "@/components/lab-graficos/tema-context";
import { PanelTema } from "@/components/lab-graficos/panel-tema";
import { SECCIONES, type Seccion } from "@/components/lab-graficos/tipos";

const BASE = "/ui-kit/laboratorio";

/** Sección actual según la URL (/ui-kit/laboratorio/<sección>/…); null en «En contexto». */
export function seccionDeRuta(pathname: string): Seccion | null {
  const tramo = pathname.slice(BASE.length + 1).split("/")[0];
  return SECCIONES.some((s) => s.id === tramo) ? (tramo as Seccion) : null;
}

export function LabShell({ children }: { children: ReactNode }) {
  return (
    <LabTemaProvider>
      <LabMarco>{children}</LabMarco>
    </LabTemaProvider>
  );
}

// Aplica el tema como variables CSS sobre el laboratorio y ordena contenido + panel.
function LabMarco({ children }: { children: ReactNode }) {
  const { tokens } = useLabTema();
  const pathname = usePathname();
  const [panelMovil, setPanelMovil] = useState(false);
  const seccion = seccionDeRuta(pathname);
  const vistas = seccion
    ? [
        { href: `${BASE}/${seccion}`, label: "Galería" },
        { href: `${BASE}/${seccion}/comparador`, label: "Comparador" },
      ]
    : [];

  const variables = {
    "--lab-fuente": tokens.fuente,
    "--lab-radio": `${tokens.radio}px`,
    "--lab-fondo-tarjeta": tokens.fondoTarjeta,
    "--lab-acento": tokens.acento,
    "--lab-color-2": tokens.colores[1],
    "--lab-color-3": tokens.colores[2],
  } as CSSProperties;

  return (
    <div className="lab-raiz page-shell py-6" data-superficie={tokens.superficie} style={variables}>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {vistas.length > 0 && (
          <nav aria-label="Vistas del laboratorio" className="toggle-pill">
            {vistas.map((v) => {
              const activa = v.label === "Galería" ? pathname === v.href : pathname.startsWith(v.href);
              return (
                <Link
                  key={v.href}
                  href={v.href}
                  aria-current={activa ? "page" : undefined}
                  className={cn(
                    "toggle-pill-option !w-auto px-3 font-label text-xs tracking-[0.06em] uppercase",
                    activa && "is-active",
                  )}
                >
                  {v.label}
                </Link>
              );
            })}
          </nav>
        )}
        <span className="badge border border-status-warn/50 text-status-warn">Exploración · datos de ejemplo</span>
        {/* El span lleva el xl:hidden: .btn-flesan fija su display y le ganaría a la utilidad. */}
        <span className="xl:hidden ml-auto">
          <button
            type="button"
            onClick={() => setPanelMovil((v) => !v)}
            aria-expanded={panelMovil}
            className="btn-flesan btn-flesan-ghost btn-flesan-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Tema
          </button>
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_18rem] gap-6 items-start">
        <div className={cn("xl:hidden", !panelMovil && "hidden")}>
          <PanelTema seccion={seccion} />
        </div>
        <div className="min-w-0">{children}</div>
        <aside className="hidden xl:block sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto">
          <PanelTema seccion={seccion} />
        </aside>
      </div>
    </div>
  );
}
