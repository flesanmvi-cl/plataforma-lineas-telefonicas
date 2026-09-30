"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, Download, Eye, GripVertical, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/page-header";
import { Pildoras, TarjetaReporte } from "@/components/reporte/tarjeta";
import { LabTemaControlado, useTokens } from "@/components/lab-graficos/tema-context";
import { PanelTema } from "@/components/lab-graficos/panel-tema";
import { LimiteError } from "@/components/lab-graficos/lab-card";
import { ESTANDAR } from "@/lib/lab-graficos/estandar";
import { TEMA_INICIAL } from "@/lib/lab-graficos/tema";
import { ALTOS, ANCHOS, nuevoId, type Ancho, type Bloque, type Maqueta, type TipoMaqueta } from "@/lib/constructor/tipos";
import { ELEMENTOS, elementoPorId, GRUPOS, type ElementoConstructor } from "./elementos";
import { Desplegable } from "@/components/desplegable";

// Constructor de maquetas en /pruebas/maquetas: la ruta no puede llamarse «constructor», porque
// las herramientas de desarrollo de Next guardan las rutas en un objeto y el segmento choca con
// Object.prototype.constructor (la página se cae en dev). Opción A, tres paneles): catálogo a la izquierda (textos, piezas de
// reportería y todo el laboratorio), lienzo de 12 columnas al centro y propiedades del bloque o
// tema de la maqueta a la derecha. Las maquetas se guardan en este navegador y se comparten
// exportando e importando JSON.

const CLAVE = "cia-constructor-maquetas";
const TIPO_NUEVO = "application/x-constructor-nuevo";
const TIPO_MOVER = "application/x-constructor-mover";

const TIPOS: { id: TipoMaqueta; texto: string }[] = [
  { id: "reporte", texto: "Reporte" },
  { id: "formulario", texto: "Formulario" },
];

// Clases escritas completas: Tailwind v4 no detecta nombres armados con plantilla.
const SPAN: Record<Ancho, string> = {
  3: "col-span-6 @2xl:col-span-3",
  4: "col-span-12 @2xl:col-span-4",
  6: "col-span-12 @2xl:col-span-6",
  8: "col-span-12 @2xl:col-span-8",
  12: "col-span-12",
};

function bloqueDe(e: ElementoConstructor, cambios: Partial<Bloque> = {}): Bloque {
  return { id: nuevoId(), elemento: e.id, titulo: e.titulo, detalle: e.detalle ?? "", ancho: e.ancho, alto: e.alto, numerado: e.marco === "tarjeta", ...cambios };
}

function maquetaEjemplo(): Maqueta {
  const b = (id: string, cambios: Partial<Bloque> = {}) => bloqueDe(elementoPorId(id)!, cambios);
  return {
    id: nuevoId(),
    nombre: "Maqueta de ejemplo",
    tipo: "reporte",
    tema: { ...ESTANDAR.tema },
    actualizada: new Date().toISOString(),
    bloques: [
      b("texto-titulo", { titulo: "Resumen de contratación" }),
      b("rep-kpi-principal"),
      b("rep-kpi", { ancho: 4 }),
      b("texto-filtros"),
      b("rep-dona"),
      b("rep-ranking-meta"),
      b("rep-barras-comparadas"),
      b("rep-cascada", { ancho: 4 }),
      b("rep-tabla"),
    ],
  };
}

function maquetaVacia(n: number): Maqueta {
  return { id: nuevoId(), nombre: `Maqueta ${n}`, tipo: "reporte", tema: { ...ESTANDAR.tema }, actualizada: new Date().toISOString(), bloques: [] };
}

/** Maquetas guardadas en este navegador (conveniencia: se comparten exportando JSON). */
function useMaquetas() {
  const [maquetas, setMaquetas] = useState<Maqueta[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    let guardadas: Maqueta[] = [];
    try {
      const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
      if (Array.isArray(v)) guardadas = v.map((m: Maqueta) => ({ ...m, tema: { ...TEMA_INICIAL, ...m.tema } }));
    } catch {}
    setMaquetas(guardadas.length ? guardadas : [maquetaEjemplo()]);
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!montado) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(maquetas));
    } catch {}
  }, [maquetas, montado]);

  return { maquetas, setMaquetas, montado };
}

export function Constructor() {
  const { maquetas, setMaquetas, montado } = useMaquetas();
  const [actualId, setActualId] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [panel, setPanel] = useState<"bloque" | "tema">("bloque");
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement>(null);

  const maqueta = maquetas.find((m) => m.id === actualId) ?? maquetas[0];
  const bloque = maqueta?.bloques.find((b) => b.id === seleccion) ?? null;

  const cambiarMaqueta = (cambio: Partial<Maqueta> | ((m: Maqueta) => Partial<Maqueta>)) =>
    setMaquetas((todas) =>
      todas.map((m) => (m.id === maqueta?.id ? { ...m, ...(typeof cambio === "function" ? cambio(m) : cambio), actualizada: new Date().toISOString() } : m)),
    );
  const cambiarBloques = (fn: (bloques: Bloque[]) => Bloque[]) => cambiarMaqueta((m) => ({ bloques: fn(m.bloques) }));
  const cambiarBloque = (id: string, cambio: Partial<Bloque>) => cambiarBloques((bs) => bs.map((b) => (b.id === id ? { ...b, ...cambio } : b)));

  /** Agrega un elemento antes de `antesDe` o, si no, después del bloque elegido (o al final). */
  function agregar(elementoId: string, antesDe?: string | null) {
    const e = elementoPorId(elementoId);
    if (!e) return;
    const nuevo = bloqueDe(e);
    cambiarBloques((bs) => {
      const i = antesDe ? bs.findIndex((b) => b.id === antesDe) : seleccion ? bs.findIndex((b) => b.id === seleccion) + 1 : bs.length;
      const pos = i < 0 ? bs.length : i;
      return [...bs.slice(0, pos), nuevo, ...bs.slice(pos)];
    });
    setSeleccion(nuevo.id);
    setPanel("bloque");
    requestAnimationFrame(() => document.getElementById(`bloque-${nuevo.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function mover(id: string, antesDe: string | null) {
    if (id === antesDe) return;
    cambiarBloques((bs) => {
      const b = bs.find((x) => x.id === id);
      if (!b) return bs;
      const resto = bs.filter((x) => x.id !== id);
      const i = antesDe ? resto.findIndex((x) => x.id === antesDe) : resto.length;
      return [...resto.slice(0, i < 0 ? resto.length : i), b, ...resto.slice(i < 0 ? resto.length : i)];
    });
  }

  function desplazar(id: string, paso: -1 | 1) {
    cambiarBloques((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + paso;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const copia = [...bs];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  function duplicar(id: string) {
    const nuevoIdBloque = nuevoId();
    cambiarBloques((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      return i < 0 ? bs : [...bs.slice(0, i + 1), { ...bs[i], id: nuevoIdBloque }, ...bs.slice(i + 1)];
    });
    setSeleccion(nuevoIdBloque);
  }

  function quitar(id: string) {
    cambiarBloques((bs) => bs.filter((b) => b.id !== id));
    setSeleccion(null);
  }

  // Suprimir borra el bloque elegido (salvo que se esté escribiendo en un campo).
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!seleccion || vistaPrevia || t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Delete") quitar(seleccion);
      if (e.key === "Escape") setSeleccion(null);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  function nueva() {
    const m = maquetaVacia(maquetas.length + 1);
    setMaquetas((todas) => [...todas, m]);
    setActualId(m.id);
    setSeleccion(null);
  }

  function eliminarMaqueta() {
    const resto = maquetas.filter((m) => m.id !== maqueta.id);
    setMaquetas(resto.length ? resto : [maquetaVacia(1)]);
    setActualId(null);
    setSeleccion(null);
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(maqueta, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maqueta-${maqueta.nombre.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importar(f: File) {
    try {
      const m = JSON.parse(await f.text()) as Maqueta;
      if (!Array.isArray(m.bloques)) throw new Error();
      const bloques = m.bloques.filter((b) => elementoPorId(b.elemento)).map((b) => ({ ...b, id: nuevoId() }));
      const importada: Maqueta = { ...m, id: nuevoId(), tema: { ...TEMA_INICIAL, ...m.tema }, bloques, actualizada: new Date().toISOString() };
      setMaquetas((todas) => [...todas, importada]);
      setActualId(importada.id);
      setAviso(bloques.length < m.bloques.length ? `Se importó «${m.nombre}»; ${m.bloques.length - bloques.length} bloques no existen en este catálogo.` : `Se importó «${m.nombre}».`);
    } catch {
      setAviso("El archivo no es una maqueta válida.");
    }
  }

  if (!montado || !maqueta) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <div className="skeleton h-[70vh] w-full" />
      </div>
    );
  }

  return (
    <LabTemaControlado tema={maqueta.tema} onCambio={(tema) => cambiarMaqueta({ tema })}>
      <div className="animate-fade-in px-4 lg:px-6 py-6">
        <PageHeader
          title="Constructor de maquetas"
          description="Arma la maqueta de un reporte o formulario con las piezas de la guía de estilo: arrastra o haz clic en un elemento del catálogo, y ajusta su ancho, alto, título y el tema a la derecha. Las maquetas se guardan en este navegador; para compartirlas, exporta el JSON."
          className="mb-4!"
        />

        <div className="card flex flex-wrap items-center gap-2.5 px-4 py-2.5 mb-4 rounded-2xl!">
          <Desplegable
            etiqueta="Maqueta"
            valor={maqueta.id}
            onCambio={(v) => {
              setActualId(v);
              setSeleccion(null);
            }}
            opciones={maquetas.map((m) => ({ valor: m.id, texto: m.nombre, detalle: `${m.bloques.length} bloques` }))}
          />
          <input
            value={maqueta.nombre}
            onChange={(e) => cambiarMaqueta({ nombre: e.target.value })}
            className="field-input w-56! rounded-full!"
            aria-label="Nombre de la maqueta"
          />
          <Pildoras etiqueta="Tipo de maqueta" opciones={TIPOS} valor={maqueta.tipo} onCambio={(tipo) => cambiarMaqueta({ tipo })} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={nueva} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              <Plus className="w-4 h-4" aria-hidden />
              Nueva
            </button>
            <button type="button" onClick={() => setVistaPrevia((v) => !v)} className={cn("btn-flesan btn-flesan-sm", vistaPrevia ? "btn-flesan-dark" : "btn-flesan-ghost")} aria-pressed={vistaPrevia}>
              <Eye className="w-4 h-4" aria-hidden />
              Vista previa
            </button>
            <button type="button" onClick={exportar} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              <Download className="w-4 h-4" aria-hidden />
              Exportar JSON
            </button>
            <button type="button" onClick={() => archivo.current?.click()} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              <Upload className="w-4 h-4" aria-hidden />
              Importar
            </button>
            <input
              ref={archivo}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importar(f);
                e.target.value = "";
              }}
            />
            <BotonEliminar onEliminar={eliminarMaqueta} />
          </div>
        </div>

        {aviso && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-[0.8125rem] text-text" role="status">
            {aviso}
            <button type="button" onClick={() => setAviso(null)} className="ml-auto text-muted hover:text-text cursor-pointer" aria-label="Cerrar aviso">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={cn("grid gap-4 items-start", vistaPrevia ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)_18rem]")}>
          {!vistaPrevia && <Catalogo onAgregar={(id) => agregar(id)} />}

          <Lienzo
            maqueta={maqueta}
            seleccion={vistaPrevia ? null : seleccion}
            editable={!vistaPrevia}
            onSeleccion={setSeleccion}
            onAgregar={agregar}
            onMover={mover}
            onQuitar={quitar}
            onDuplicar={duplicar}
          />

          {!vistaPrevia && (
            <aside className="flex flex-col gap-3 min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
              <Pildoras
                etiqueta="Panel"
                opciones={[
                  { id: "bloque", texto: "Bloque" },
                  { id: "tema", texto: "Tema" },
                ]}
                valor={panel}
                onCambio={setPanel}
              />
              {panel === "tema" ? (
                <>
                  <p className="text-xs text-muted px-1">
                    El tema cambia los elementos del laboratorio. Las piezas de reportería estándar siguen los tokens de la plataforma.
                  </p>
                  <PanelTema />
                </>
              ) : bloque ? (
                <Propiedades
                  bloque={bloque}
                  indice={maqueta.bloques.indexOf(bloque)}
                  total={maqueta.bloques.length}
                  onCambio={(c) => cambiarBloque(bloque.id, c)}
                  onDesplazar={(p) => desplazar(bloque.id, p)}
                  onDuplicar={() => duplicar(bloque.id)}
                  onQuitar={() => quitar(bloque.id)}
                />
              ) : (
                <div className="card p-4 flex flex-col gap-2 text-[0.8125rem] text-muted">
                  <b className="text-text text-sm">{maqueta.bloques.length} bloques</b>
                  <p>Haz clic en un bloque del lienzo para editar su título, ancho, alto y elemento.</p>
                  <p>Para agregar, arrastra un elemento del catálogo al lienzo o haz clic en él: entra después del bloque elegido.</p>
                  <p className="text-faint">Suprimir borra el bloque elegido y Esc suelta la selección.</p>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </LabTemaControlado>
  );
}

function BotonEliminar({ onEliminar }: { onEliminar: () => void }) {
  const [confirmar, setConfirmar] = useState(false);
  return confirmar ? (
    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted">
      ¿Eliminar esta maqueta?
      <button
        type="button"
        onClick={() => {
          onEliminar();
          setConfirmar(false);
        }}
        className="btn-flesan btn-flesan-primary btn-flesan-sm"
      >
        Eliminar
      </button>
      <button type="button" onClick={() => setConfirmar(false)} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
        Cancelar
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setConfirmar(true)} className="btn-flesan btn-flesan-ghost btn-flesan-sm" aria-label="Eliminar maqueta" title="Eliminar maqueta">
      <Trash2 className="w-4 h-4" aria-hidden />
    </button>
  );
}

// ---- Catálogo ----

function Catalogo({ onAgregar }: { onAgregar: (id: string) => void }) {
  const [q, setQ] = useState("");
  const texto = q.trim().toLowerCase();
  const filtrados = useMemo(() => (texto ? ELEMENTOS.filter((e) => `${e.nombre} ${e.grupo}`.toLowerCase().includes(texto)) : ELEMENTOS), [texto]);

  return (
    <aside className="card flex flex-col min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-6rem)] overflow-hidden">
      <div className="p-3 border-b border-border">
        <label className="relative block">
          <span className="sr-only">Buscar elemento</span>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar elemento…" className="field-input rounded-full! pl-9! w-full!" />
        </label>
      </div>
      <div className="overflow-y-auto p-2 flex flex-col gap-1 max-lg:max-h-72">
        {GRUPOS.map((g, i) => {
          const items = filtrados.filter((e) => e.grupo === g);
          if (!items.length) return null;
          return (
            <details key={g} open={!!texto || i < 2} className="group">
              <summary className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted hover:text-text list-none">
                <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
                <span className="truncate">{g}</span>
                <span className="ml-auto text-faint font-normal tracking-normal">{items.length}</span>
              </summary>
              <ul className="flex flex-col pb-1">
                {items.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData(TIPO_NUEVO, e.id);
                        ev.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => onAgregar(e.id)}
                      title="Arrastra al lienzo o haz clic para agregar"
                      className="w-full flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-left text-[0.8125rem] text-text hover:bg-surface-2 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-faint shrink-0" aria-hidden />
                      <span className="truncate">{e.nombre}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
        {!filtrados.length && <p className="px-2 py-6 text-center text-[0.8125rem] text-muted">Sin resultados para «{q}».</p>}
      </div>
    </aside>
  );
}

// ---- Lienzo ----

function Lienzo({
  maqueta,
  seleccion,
  editable,
  onSeleccion,
  onAgregar,
  onMover,
  onQuitar,
  onDuplicar,
}: {
  maqueta: Maqueta;
  seleccion: string | null;
  editable: boolean;
  onSeleccion: (id: string | null) => void;
  onAgregar: (elemento: string, antesDe?: string | null) => void;
  onMover: (id: string, antesDe: string | null) => void;
  onQuitar: (id: string) => void;
  onDuplicar: (id: string) => void;
}) {
  const t = useTokens();
  const [destino, setDestino] = useState<string | "fin" | null>(null);

  const acepta = (e: DragEvent) => e.dataTransfer.types.includes(TIPO_NUEVO) || e.dataTransfer.types.includes(TIPO_MOVER);
  function soltar(e: DragEvent, antesDe: string | null) {
    e.preventDefault();
    e.stopPropagation();
    setDestino(null);
    const nuevo = e.dataTransfer.getData(TIPO_NUEVO);
    const mover = e.dataTransfer.getData(TIPO_MOVER);
    if (nuevo) onAgregar(nuevo, antesDe);
    else if (mover) onMover(mover, antesDe);
  }

  let numero = 0;

  return (
    <div
      className={cn("@container min-w-0 rounded-2xl", editable && "p-3 border border-dashed border-border-strong bg-bg/40")}
      data-estilo={maqueta.tipo === "reporte" ? "reporte" : undefined}
      data-densidad={maqueta.tipo === "formulario" ? "comoda" : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSeleccion(null);
      }}
    >
      <div className="grid grid-cols-12 gap-4">
        {maqueta.bloques.map((b) => {
          const el = elementoPorId(b.elemento);
          if (!el) return null;
          if (el.marco === "tarjeta" && b.numerado) numero++;
          const elegido = seleccion === b.id;
          const area = (
            <div style={el.crece ? { minHeight: el.marco === "tarjeta" ? b.alto : undefined } : { height: b.alto }} className="min-w-0 flex-1 flex flex-col" data-superficie={t.superficie}>
              <LimiteError nombre={el.nombre}>{el.render({ alto: b.alto, bloque: b })}</LimiteError>
            </div>
          );
          return (
            <div
              key={b.id}
              id={`bloque-${b.id}`}
              className={cn(SPAN[b.ancho], "relative min-w-0 flex flex-col rounded-2xl")}
              onClickCapture={editable ? () => onSeleccion(b.id) : undefined}
              onDragOver={
                editable
                  ? (e) => {
                      if (!acepta(e)) return;
                      e.preventDefault();
                      setDestino(b.id);
                    }
                  : undefined
              }
              onDragLeave={editable ? () => setDestino((d) => (d === b.id ? null : d)) : undefined}
              onDrop={editable ? (e) => soltar(e, b.id) : undefined}
            >
              {destino === b.id && <span aria-hidden className="absolute -left-2.5 top-0 bottom-0 w-1 rounded-full bg-flesan-red z-10" />}
              {el.marco === "tarjeta" ? (
                <TarjetaReporte numero={b.numerado ? numero : undefined} titulo={b.titulo} detalle={b.detalle || undefined} className="flex-1">
                  {area}
                </TarjetaReporte>
              ) : (
                <div className="flex-1 flex flex-col">{area}</div>
              )}
              {editable && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute -inset-1 rounded-[1.1rem] pointer-events-none border-2 transition-colors",
                    elegido ? "border-flesan-red" : "border-transparent",
                  )}
                />
              )}
              {editable && elegido && (
                <BarraBloque
                  onArrastrar={(e) => {
                    e.dataTransfer.setData(TIPO_MOVER, b.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDuplicar={() => onDuplicar(b.id)}
                  onQuitar={() => onQuitar(b.id)}
                  nombre={el.nombre}
                />
              )}
            </div>
          );
        })}

        {editable && (
          <div
            className={cn(
              "col-span-12 flex items-center justify-center gap-2 h-20 rounded-2xl border-2 border-dashed text-[0.8125rem] transition-colors",
              destino === "fin" ? "border-flesan-red text-text" : "border-border text-faint",
            )}
            onDragOver={(e) => {
              if (!acepta(e)) return;
              e.preventDefault();
              setDestino("fin");
            }}
            onDragLeave={() => setDestino((d) => (d === "fin" ? null : d))}
            onDrop={(e) => soltar(e, null)}
          >
            <Plus className="w-4 h-4" aria-hidden />
            {maqueta.bloques.length ? "Arrastra aquí para agregar al final" : "Arrastra aquí un elemento del catálogo para empezar"}
          </div>
        )}
      </div>
    </div>
  );
}

function BarraBloque({
  nombre,
  onArrastrar,
  onDuplicar,
  onQuitar,
}: {
  nombre: string;
  onArrastrar: (e: DragEvent) => void;
  onDuplicar: () => void;
  onQuitar: () => void;
}) {
  const boton = "w-7 h-7 inline-flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface-2 cursor-pointer";
  return (
    <div className="absolute -top-4 right-3 z-20 flex items-center gap-0.5 pl-2.5 pr-1 py-0.5 rounded-full border border-border-strong bg-surface shadow-lg">
      <span className="text-[0.6875rem] text-muted max-w-40 truncate mr-1">{nombre}</span>
      <span draggable onDragStart={onArrastrar} className={cn(boton, "cursor-grab active:cursor-grabbing")} title="Arrastra para mover" aria-label="Mover bloque">
        <GripVertical className="w-4 h-4" />
      </span>
      <button type="button" onClick={onDuplicar} className={boton} title="Duplicar" aria-label="Duplicar bloque">
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={onQuitar} className={boton} title="Quitar (Suprimir)" aria-label="Quitar bloque">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ---- Propiedades ----

function Propiedades({
  bloque,
  indice,
  total,
  onCambio,
  onDesplazar,
  onDuplicar,
  onQuitar,
}: {
  bloque: Bloque;
  indice: number;
  total: number;
  onCambio: (c: Partial<Bloque>) => void;
  onDesplazar: (paso: -1 | 1) => void;
  onDuplicar: () => void;
  onQuitar: () => void;
}) {
  const el = elementoPorId(bloque.elemento)!;
  const hermanos = ELEMENTOS.filter((e) => e.grupo === el.grupo);
  const rotuloTitulo = el.campos?.titulo === undefined ? "Título" : el.campos.titulo;
  const rotuloDetalle = el.campos?.detalle === undefined ? "Detalle" : el.campos.detalle;
  const conAlto = el.marco === "tarjeta" || !el.crece;

  return (
    <div className="card p-4 flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-faint">{el.grupo}</span>
        <b className="text-sm text-text">{el.nombre}</b>
      </div>

      <Campo rotulo="Elemento" grupo>
        <Desplegable
          variante="campo"
          etiqueta="Elemento"
          valor={bloque.elemento}
          opciones={hermanos.map((h) => ({ valor: h.id, texto: h.nombre }))}
          onCambio={(v) => {
            const nuevo = elementoPorId(v)!;
            // Si el título seguía siendo el del elemento anterior, toma el del nuevo.
            onCambio({
              elemento: nuevo.id,
              titulo: bloque.titulo === el.titulo ? nuevo.titulo : bloque.titulo,
              detalle: bloque.detalle === (el.detalle ?? "") ? (nuevo.detalle ?? "") : bloque.detalle,
              alto: nuevo.alto,
            });
          }}
        />
      </Campo>

      {rotuloTitulo && (
        <Campo rotulo={rotuloTitulo}>
          <input value={bloque.titulo} onChange={(e) => onCambio({ titulo: e.target.value })} className="field-input w-full!" />
        </Campo>
      )}
      {rotuloDetalle && (
        <Campo rotulo={rotuloDetalle}>
          <textarea value={bloque.detalle} onChange={(e) => onCambio({ detalle: e.target.value })} rows={2} className="field-input w-full! h-auto! py-2! resize-y" />
        </Campo>
      )}

      <Campo rotulo="Ancho (de 12 columnas)" grupo>
        <Segmento opciones={ANCHOS.map((a) => ({ id: String(a), texto: String(a) }))} valor={String(bloque.ancho)} onCambio={(v) => onCambio({ ancho: Number(v) as Ancho })} />
      </Campo>

      {conAlto && (
        <Campo rotulo={el.crece ? "Alto mínimo" : "Alto"} grupo>
          <Segmento
            opciones={ALTOS.map((a) => ({ id: String(a.px), texto: a.texto }))}
            valor={String(ALTOS.reduce((c, a) => (Math.abs(a.px - bloque.alto) < Math.abs(c.px - bloque.alto) ? a : c)).px)}
            onCambio={(v) => onCambio({ alto: Number(v) })}
          />
        </Campo>
      )}

      {el.marco === "tarjeta" && (
        <label className="flex items-center gap-2 text-[0.8125rem] text-text cursor-pointer">
          <input type="checkbox" checked={bloque.numerado} onChange={(e) => onCambio({ numerado: e.target.checked })} className="accent-flesan-red" />
          Número de bloque en el título
        </label>
      )}

      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
        <button type="button" onClick={() => onDesplazar(-1)} disabled={indice === 0} className="btn-flesan btn-flesan-ghost btn-flesan-sm" aria-label="Subir bloque" title="Subir">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDesplazar(1)} disabled={indice === total - 1} className="btn-flesan btn-flesan-ghost btn-flesan-sm" aria-label="Bajar bloque" title="Bajar">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button type="button" onClick={onDuplicar} className="btn-flesan btn-flesan-ghost btn-flesan-sm" aria-label="Duplicar bloque" title="Duplicar">
          <Copy className="w-4 h-4" />
        </button>
        <button type="button" onClick={onQuitar} className="btn-flesan btn-flesan-ghost btn-flesan-sm ml-auto" aria-label="Quitar bloque" title="Quitar">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Rótulo sobre un control. Con botones adentro va como grupo: un <label> activaría el primero. */
function Campo({ rotulo, grupo = false, children }: { rotulo: string; grupo?: boolean; children: ReactNode }) {
  const Etiqueta = grupo ? "div" : "label";
  return (
    <Etiqueta className="flex flex-col gap-1.5" {...(grupo ? { role: "group", "aria-label": rotulo } : {})}>
      <span className="text-xs font-semibold text-muted">{rotulo}</span>
      {children}
    </Etiqueta>
  );
}

function Segmento({ opciones, valor, onCambio }: { opciones: { id: string; texto: string }[]; valor: string; onCambio: (v: string) => void }) {
  return (
    <div role="radiogroup" className="grid gap-1 p-1 rounded-lg border border-border bg-surface-2" style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))` }}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === valor}
          onClick={() => onCambio(o.id)}
          className={cn(
            "h-7 rounded-md text-[0.8125rem] font-semibold cursor-pointer transition-colors",
            o.id === valor ? "bg-surface text-text shadow-sm ring-1 ring-flesan-red/60" : "text-muted hover:text-text",
          )}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
