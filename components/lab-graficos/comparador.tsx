"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATALOGO, graficoPorId } from "@/components/lab-graficos/catalogo";
import { LabCard } from "@/components/lab-graficos/lab-card";
import { LabTemaOverride, useLabTema } from "@/components/lab-graficos/tema-context";
import { FAMILIAS, SECCIONES, type Seccion } from "@/components/lab-graficos/tipos";
import { ANIMACIONES, FUENTES, PALETAS, SUPERFICIES, type TemaLab } from "@/lib/lab-graficos/tema";

interface Variante {
  clave: string;
  nombre: string;
  cambios: Partial<TemaLab>;
}

interface Dimension {
  id: string;
  nombre: string;
  variantes: Variante[];
}

function opciones<K extends keyof TemaLab>(clave: K, pares: [TemaLab[K], string][]): Variante[] {
  return pares.map(([valor, nombre]) => ({ clave: String(valor), nombre, cambios: { [clave]: valor } as Partial<TemaLab> }));
}

const COMUNES = {
  superficie: { id: "superficie", nombre: "Superficie", variantes: opciones("superficie", Object.entries(SUPERFICIES).map(([id, d]) => [id as TemaLab["superficie"], d.nombre])) },
  paleta: { id: "paleta", nombre: "Paleta", variantes: opciones("paleta", Object.entries(PALETAS).map(([id, d]) => [id as TemaLab["paleta"], d.nombre])) },
  fuente: { id: "fuente", nombre: "Letra", variantes: opciones("fuente", Object.entries(FUENTES).map(([id, d]) => [id as TemaLab["fuente"], d.nombre])) },
  densidad: { id: "densidad", nombre: "Densidad", variantes: opciones("densidad", [["compacta", "Compacta"], ["comoda", "Cómoda"]]) },
} satisfies Record<string, Dimension>;

/** Qué se puede comparar lado a lado en cada sección. */
const DIMENSIONES: Record<Seccion, Dimension[]> = {
  graficos: [
    COMUNES.superficie,
    COMUNES.paleta,
    COMUNES.fuente,
    { id: "curva", nombre: "Curva", variantes: opciones("curva", [["recta", "Recta"], ["suave", "Suave"], ["escalonada", "Escalonada"]]) },
    {
      id: "animacion",
      nombre: "Animación",
      variantes: opciones("animacion", Object.entries(ANIMACIONES).map(([id, d]) => [id as TemaLab["animacion"], d.nombre])),
    },
  ],
  kpis: [
    { id: "kpiCifra", nombre: "Cifra", variantes: opciones("kpiCifra", [["m", "Mediana"], ["l", "Grande"], ["xl", "Muy grande"]]) },
    { id: "kpiAcento", nombre: "Acento", variantes: opciones("kpiAcento", [["ninguno", "Sin acento"], ["franja", "Franja"], ["punto", "Punto"]]) },
    COMUNES.superficie,
    COMUNES.paleta,
    COMUNES.fuente,
  ],
  tablas: [
    {
      id: "tablaEncabezado",
      nombre: "Encabezado",
      variantes: opciones("tablaEncabezado", [["suave", "Suave"], ["marcado", "Marcado"], ["oscuro", "Oscuro"]]),
    },
    { id: "tablaBordes", nombre: "Bordes", variantes: opciones("tablaBordes", [["filas", "Entre filas"], ["grilla", "Grilla"], ["ninguno", "Sin bordes"]]) },
    { id: "tablaZebra", nombre: "Zebra", variantes: opciones("tablaZebra", [[false, "Sin zebra"], [true, "Con zebra"]]) },
    COMUNES.densidad,
    COMUNES.fuente,
  ],
  botones: [
    { id: "botonForma", nombre: "Forma", variantes: opciones("botonForma", [["recta", "Recta"], ["redondeada", "Redondeada"], ["pastilla", "Pastilla"]]) },
    { id: "botonCaja", nombre: "Mayúsculas", variantes: opciones("botonCaja", [["mayusculas", "Mayúsculas"], ["normal", "Caja normal"]]) },
    { id: "botonRelleno", nombre: "Relleno", variantes: opciones("botonRelleno", [["solido", "Sólido"], ["suave", "Suave"]]) },
    { id: "botonPeso", nombre: "Peso", variantes: opciones("botonPeso", [[500, "Medio"], [600, "Semibold"], [700, "Bold"]]) },
    COMUNES.superficie,
    COMUNES.fuente,
  ],
};

/** Una muestra, todas las variantes de una dimensión del tema, lado a lado. */
export function Comparador({ seccion }: { seccion: Seccion }) {
  const params = useSearchParams();
  const { setTema } = useLabTema();
  const def = SECCIONES.find((s) => s.id === seccion)!;
  const dimensiones = DIMENSIONES[seccion];
  const [dimensionId, setDimensionId] = useState(dimensiones[0].id);
  const [busqueda, setBusqueda] = useState("");
  const deSeccion = useMemo(() => CATALOGO.filter((g) => def.familias.includes(g.familia)), [def]);
  const elegido = graficoPorId(params.get("g"));
  const grafico = elegido && def.familias.includes(elegido.familia) ? elegido : deSeccion[0];
  const dimension = dimensiones.find((d) => d.id === dimensionId) ?? dimensiones[0];

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return deSeccion.filter((g) => !q || g.nombre.toLowerCase().includes(q) || g.libreria.toLowerCase().includes(q));
  }, [busqueda, deSeccion]);

  if (!grafico) return <p className="text-sm text-muted">Todavía no hay muestras en esta sección.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-6 items-start">
      <nav aria-label="Muestras" className="lab-card p-3 flex flex-col gap-1 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] overflow-y-auto">
        <label className="flex items-center gap-2 h-8 px-2.5 mb-1 border border-border-strong rounded-flesan-sm text-faint">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar"
            aria-label="Buscar muestra"
            className="w-full bg-transparent outline-none text-sm text-text"
          />
        </label>
        {FAMILIAS.filter((f) => def.familias.includes(f.id)).map((f) => {
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
              {dimensiones.map((d) => (
                <button key={d.id} type="button" aria-pressed={dimension.id === d.id} onClick={() => setDimensionId(d.id)} className={cn(dimension.id === d.id && "is-active")}>
                  {d.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("grid grid-cols-1 gap-4", grafico.ancho ? "2xl:grid-cols-2" : "md:grid-cols-2 2xl:grid-cols-3")}>
          {dimension.variantes.map((v) => (
            <LabTemaOverride key={v.clave} cambios={v.cambios}>
              <div className={cn("flex flex-col gap-2 rounded-[var(--lab-radio)]", v.cambios.superficie === "glass" && "lab-fondo-glass p-3")}>
                <LabCard grafico={grafico} alto={grafico.alto ?? (grafico.ancho ? 320 : 250)} sinEnlace titulo={v.nombre} />
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
