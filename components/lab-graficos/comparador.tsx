"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATALOGO, graficoPorId } from "@/components/lab-graficos/catalogo";
import { LabCard } from "@/components/lab-graficos/lab-card";
import { LabTemaOverride, useLabTema } from "@/components/lab-graficos/tema-context";
import { FAMILIAS } from "@/components/lab-graficos/tipos";
import {
  ANIMACIONES,
  FUENTES,
  PALETAS,
  SUPERFICIES,
  type AnimacionId,
  type FuenteId,
  type PaletaId,
  type Superficie,
  type TemaLab,
} from "@/lib/lab-graficos/tema";

type Dimension = "superficie" | "paleta" | "fuente" | "curva" | "animacion";

interface Variante {
  clave: string;
  nombre: string;
  cambios: Partial<TemaLab>;
}

function variantesDe(dimension: Dimension): Variante[] {
  switch (dimension) {
    case "superficie":
      return (Object.keys(SUPERFICIES) as Superficie[]).map((id) => ({ clave: id, nombre: SUPERFICIES[id].nombre, cambios: { superficie: id } }));
    case "paleta":
      return (Object.keys(PALETAS) as PaletaId[]).map((id) => ({ clave: id, nombre: PALETAS[id].nombre, cambios: { paleta: id } }));
    case "fuente":
      return (Object.keys(FUENTES) as FuenteId[]).map((id) => ({ clave: id, nombre: FUENTES[id].nombre, cambios: { fuente: id } }));
    case "curva":
      return [
        { clave: "recta", nombre: "Recta", cambios: { curva: "recta" } },
        { clave: "suave", nombre: "Suave", cambios: { curva: "suave" } },
        { clave: "escalonada", nombre: "Escalonada", cambios: { curva: "escalonada" } },
      ];
    case "animacion":
      return (Object.keys(ANIMACIONES) as AnimacionId[]).map((id) => ({ clave: id, nombre: ANIMACIONES[id].nombre, cambios: { animacion: id } }));
  }
}

const DIMENSIONES: { id: Dimension; nombre: string }[] = [
  { id: "superficie", nombre: "Superficie" },
  { id: "paleta", nombre: "Paleta" },
  { id: "fuente", nombre: "Letra" },
  { id: "curva", nombre: "Curva" },
  { id: "animacion", nombre: "Animación" },
];

/** Un gráfico, todas las variantes de una dimensión del tema, lado a lado. */
export function Comparador() {
  const params = useSearchParams();
  const { setTema } = useLabTema();
  const [dimension, setDimension] = useState<Dimension>("superficie");
  const [busqueda, setBusqueda] = useState("");
  const grafico = graficoPorId(params.get("g")) ?? CATALOGO[0];

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CATALOGO.filter((g) => !q || g.nombre.toLowerCase().includes(q) || g.libreria.toLowerCase().includes(q));
  }, [busqueda]);

  if (!grafico) return <p className="text-sm text-muted">Todavía no hay gráficos en el catálogo.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-6 items-start">
      <nav aria-label="Gráficos" className="lab-card p-3 flex flex-col gap-1 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] overflow-y-auto">
        <label className="flex items-center gap-2 h-8 px-2.5 mb-1 border border-border-strong rounded-flesan-sm text-faint">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar gráfico"
            className="w-full bg-transparent outline-none text-sm text-text"
          />
        </label>
        {FAMILIAS.map((f) => {
          const items = lista.filter((g) => g.familia === f.id);
          if (!items.length) return null;
          return (
            <div key={f.id} className="flex flex-col">
              <p className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint px-2 pt-3 pb-1">{f.nombre}</p>
              {items.map((g) => {
                const activo = g.id === grafico.id;
                return (
                  <Link
                    key={g.id}
                    href={`?g=${g.id}`}
                    scroll={false}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-flesan-sm text-[0.8125rem]",
                      activo ? "bg-bg text-text font-semibold" : "text-muted hover:text-text hover:bg-bg",
                    )}
                  >
                    {activo && <span className="w-1.5 h-1.5 bg-flesan-red shrink-0" />}
                    <span className="truncate">{g.nombre}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h2 className="display-title text-2xl text-text">{grafico.nombre}</h2>
            <p className="text-sm text-muted">{grafico.descripcion}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint">Comparar por</span>
            <div className="lab-seg">
              {DIMENSIONES.map((d) => (
                <button key={d.id} type="button" aria-pressed={dimension === d.id} onClick={() => setDimension(d.id)} className={cn(dimension === d.id && "is-active")}>
                  {d.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("grid grid-cols-1 gap-4", grafico.ancho ? "2xl:grid-cols-2" : "md:grid-cols-2 2xl:grid-cols-3")}>
          {variantesDe(dimension).map((v) => (
            <LabTemaOverride key={v.clave} cambios={v.cambios}>
              <div className={cn("flex flex-col gap-2 rounded-[var(--lab-radio)]", v.cambios.superficie === "glass" && "lab-fondo-glass p-3")}>
                <LabCard grafico={grafico} alto={grafico.ancho ? 320 : 250} sinEnlace titulo={v.nombre} />
                <button
                  type="button"
                  onClick={() => setTema(v.cambios)}
                  className="self-end font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-flesan-red cursor-pointer"
                >
                  Usar en todo el laboratorio
                </button>
              </div>
            </LabTemaOverride>
          ))}
        </div>
      </div>
    </div>
  );
}
