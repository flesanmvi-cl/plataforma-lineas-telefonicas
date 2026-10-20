"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// TEMPORAL · opciones de encabezado de vista con identidad de marca (2026-10-20). Se borra al
// elegir: la elegida reemplaza a components/page-header.tsx (shell).

export interface DatosEncabezado {
  seccion: string;
  titulo: string;
  meta: { rotulo: string; valor: string }[];
  codigo: string;
  acciones?: ReactNode;
}

/** Paralelogramo con la inclinación de la marca (-9°): el texto va derecho adentro. */
function Paralelogramo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex -skew-x-[9deg] px-3 py-1", className)}>
      <span className="skew-x-[9deg] inline-flex items-center">{children}</span>
    </span>
  );
}

/** A · Paralelogramo: la sección en un paralelogramo rojo (como el logo Flesan), el título en
 * Barlow Condensed ExtraBold itálica y una regla con un tramo rojo inclinado; los datos de la
 * vista sobre la regla. */
export function EncabezadoA({
  seccion,
  titulo,
  meta,
  acciones,
}: DatosEncabezado) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Paralelogramo className="bg-flesan-red text-white font-label font-semibold text-xs tracking-[0.14em] uppercase">
          {seccion}
        </Paralelogramo>
        <h1 className="display-title text-3xl sm:text-[2.5rem] leading-none tracking-[-0.01em] text-text">
          {titulo}
        </h1>
        {acciones && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {acciones}
          </div>
        )}
      </div>
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-1 pt-2">
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px bg-border-strong"
        />
        <span
          aria-hidden
          className="absolute -top-[1.5px] left-0 h-1 w-24 bg-flesan-red -skew-x-[30deg] origin-left"
        />
        {meta.map((m) => (
          <span
            key={m.rotulo}
            className="font-label text-[0.6875rem] tracking-[0.1em] uppercase text-muted"
          >
            {m.rotulo} <b className="text-text font-semibold">{m.valor}</b>
          </span>
        ))}
      </div>
    </header>
  );
}

/** B · Rótulo de plano (forma distinta): el encabezado como el cajetín de un plano de obra,
 * con celdas rotuladas, el título grande y el código de la vista; bordes rectos. */
export function EncabezadoB({
  seccion,
  titulo,
  meta,
  codigo,
  acciones,
}: DatosEncabezado) {
  return (
    <header className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] border-2 border-text bg-surface">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] border-b-2 md:border-b-0 md:border-r-2 border-text">
          <div className="flex flex-col justify-between gap-2 border-r-2 border-text px-3 py-2 bg-text text-bg">
            <span className="font-label text-[0.625rem] tracking-[0.14em] uppercase opacity-70">
              Vista
            </span>
            <span className="display-title normal-case text-2xl leading-none">
              {codigo}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 px-4 py-2 min-w-0">
            <span className="flex items-center gap-2 font-label text-[0.625rem] tracking-[0.14em] uppercase text-muted">
              <span aria-hidden className="w-2 h-2 bg-flesan-red" />
              {seccion}
            </span>
            <h1 className="display-title text-3xl leading-none text-text truncate">
              {titulo}
            </h1>
          </div>
        </div>
        <dl className="grid grid-cols-3 md:grid-cols-[repeat(3,minmax(7rem,auto))]">
          {meta.map((m, i) => (
            <div
              key={m.rotulo}
              className={cn(
                "flex flex-col justify-center gap-0.5 px-3 py-2",
                i > 0 && "border-l border-border-strong",
              )}
            >
              <dt className="font-label text-[0.625rem] tracking-[0.14em] uppercase text-muted">
                {m.rotulo}
              </dt>
              <dd className="font-label text-sm font-semibold text-text">
                {m.valor}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {acciones && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {acciones}
        </div>
      )}
    </header>
  );
}

/** C · Franja: una banda oscura a todo el ancho, con un corte rojo inclinado en el borde
 * izquierdo, el título en blanco y los datos de la vista dentro de la banda. */
export function EncabezadoC({
  seccion,
  titulo,
  meta,
  acciones,
}: DatosEncabezado) {
  return (
    <div className="flex flex-col gap-2">
      <header className="relative overflow-hidden bg-flesan-black text-white dark:bg-surface-2 dark:border dark:border-border">
        <span
          aria-hidden
          className="absolute inset-y-0 -left-4 w-12 bg-flesan-red -skew-x-[9deg]"
        />
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-3 pl-14 pr-5 py-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-label text-[0.6875rem] tracking-[0.16em] uppercase text-white/60">
              {seccion}
            </span>
            <h1 className="display-title text-3xl sm:text-4xl leading-none">
              {titulo}
            </h1>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            {meta.map((m) => (
              <div key={m.rotulo} className="flex flex-col">
                <dt className="font-label text-[0.625rem] tracking-[0.14em] uppercase text-white/50">
                  {m.rotulo}
                </dt>
                <dd className="font-label text-sm font-semibold">{m.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>
      {acciones && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {acciones}
        </div>
      )}
    </div>
  );
}
