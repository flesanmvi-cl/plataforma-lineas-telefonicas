"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { CATALOGO } from "@/components/lab-graficos/catalogo";
import { LabCard } from "@/components/lab-graficos/lab-card";
import { FAMILIAS, type Familia, type Libreria } from "@/components/lab-graficos/tipos";

const LIBRERIAS: Libreria[] = ["ECharts", "Nivo", "visx", "MapLibre", "HTML"];

/** Galería por familias con filtros; cada tarjeta lleva al comparador de estilos. */
export function Galeria() {
  const [familia, setFamilia] = useState<Familia | "todas">("todas");
  const [libreria, setLibreria] = useState<Libreria | "todas">("todas");

  const filtrados = useMemo(
    () => CATALOGO.filter((g) => (familia === "todas" || g.familia === familia) && (libreria === "todas" || g.libreria === libreria)),
    [familia, libreria],
  );
  const familiasConDatos = FAMILIAS.filter((f) => filtrados.some((g) => g.familia === f.id));
  const librerias = LIBRERIAS.filter((l) => CATALOGO.some((g) => g.libreria === l));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip activo={familia === "todas"} onClick={() => setFamilia("todas")}>
            Todas · {CATALOGO.length}
          </Chip>
          {FAMILIAS.map((f) => {
            const n = CATALOGO.filter((g) => g.familia === f.id).length;
            if (!n) return null;
            return (
              <Chip key={f.id} activo={familia === f.id} onClick={() => setFamilia(f.id)}>
                {f.nombre} · {n}
              </Chip>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint mr-1">Librería</span>
          <div className="lab-seg">
            {(["todas", ...librerias] as const).map((l) => (
              <button key={l} type="button" aria-pressed={libreria === l} onClick={() => setLibreria(l)} className={cn(libreria === l && "is-active")}>
                {l === "todas" ? "Todas" : l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtrados.length === 0 && <p className="text-sm text-muted">No hay gráficos con esa combinación de filtros.</p>}

      {familiasConDatos.map((f) => (
        <section key={f.id} className="flex flex-col gap-3">
          <h2 className="label-eyebrow brand-bullet">{f.nombre}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filtrados
              .filter((g) => g.familia === f.id)
              .map((g) => (
                <LabCard key={g.id} grafico={g} alto={g.ancho ? 340 : 260} className={cn(g.ancho && "lg:col-span-2")} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={activo} onClick={onClick} className={cn("chip-flesan", activo && "is-active")}>
      {children}
    </button>
  );
}
