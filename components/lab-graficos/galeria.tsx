"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { CATALOGO } from "@/components/lab-graficos/catalogo";
import { LabCard } from "@/components/lab-graficos/lab-card";
import { FAMILIAS, SECCIONES, type Familia, type Libreria, type Seccion } from "@/components/lab-graficos/tipos";

const LIBRERIAS: Libreria[] = ["ECharts", "Nivo", "visx", "SVG", "MapLibre", "HTML", "Motion", "CSS", "View Transitions", "three.js"];
type Origen = "todos" | "nuevos" | "plantilla";

/** Galería de una sección del laboratorio, con filtros; cada muestra lleva al comparador. */
export function Galeria({ seccion }: { seccion: Seccion }) {
  const def = SECCIONES.find((s) => s.id === seccion)!;
  const [familia, setFamilia] = useState<Familia | "todas">("todas");
  const [libreria, setLibreria] = useState<Libreria | "todas">("todas");
  const [origen, setOrigen] = useState<Origen>("todos");

  const deSeccion = useMemo(() => CATALOGO.filter((g) => def.familias.includes(g.familia)), [def]);
  const filtrados = deSeccion.filter(
    (g) =>
      (familia === "todas" || g.familia === familia) &&
      (libreria === "todas" || g.libreria === libreria) &&
      (origen === "todos" || (origen === "plantilla" ? g.plantilla : !g.plantilla)),
  );
  const familias = FAMILIAS.filter((f) => def.familias.includes(f.id));
  const familiasConDatos = familias.filter((f) => filtrados.some((g) => g.familia === f.id));
  const librerias = LIBRERIAS.filter((l) => deSeccion.some((g) => g.libreria === l));
  const hayPlantilla = deSeccion.some((g) => g.plantilla);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {familias.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <Chip activo={familia === "todas"} onClick={() => setFamilia("todas")}>
              Todas · {deSeccion.length}
            </Chip>
            {familias.map((f) => {
              const n = deSeccion.filter((g) => g.familia === f.id).length;
              if (!n) return null;
              return (
                <Chip key={f.id} activo={familia === f.id} onClick={() => setFamilia(f.id)}>
                  {f.nombre} · {n}
                </Chip>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {hayPlantilla && (
            <Filtro<Origen>
              titulo="Origen"
              valor={origen}
              opciones={[
                { id: "todos", nombre: "Todos" },
                { id: "nuevos", nombre: "Exploración" },
                { id: "plantilla", nombre: "Plantilla actual" },
              ]}
              onChange={setOrigen}
            />
          )}
          {librerias.length > 1 && (
            <Filtro<Libreria | "todas">
              titulo="Librería"
              valor={libreria}
              opciones={[{ id: "todas", nombre: "Todas" }, ...librerias.map((l) => ({ id: l, nombre: l }))]}
              onChange={setLibreria}
            />
          )}
        </div>
      </div>

      {filtrados.length === 0 && <p className="text-sm text-muted">No hay muestras con esa combinación de filtros.</p>}

      {familiasConDatos.map((f) => (
        <section key={f.id} className="flex flex-col gap-3">
          {familias.length > 1 && <h2 className="label-eyebrow brand-bullet">{f.nombre}</h2>}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filtrados
              .filter((g) => g.familia === f.id)
              .map((g) => (
                <LabCard key={g.id} grafico={g} alto={g.alto ?? (g.ancho ? 340 : 260)} className={cn(g.ancho && "lg:col-span-2")} />
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

function Filtro<T extends string>({
  titulo,
  valor,
  opciones,
  onChange,
}: {
  titulo: string;
  valor: T;
  opciones: { id: T; nombre: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint mr-1">{titulo}</span>
      <div className="lab-seg">
        {opciones.map((o) => (
          <button key={o.id} type="button" aria-pressed={valor === o.id} onClick={() => onChange(o.id)} className={cn(valor === o.id && "is-active")}>
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
