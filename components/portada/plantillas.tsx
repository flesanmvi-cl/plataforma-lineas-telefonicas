"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/page-header";
import { GRUPOS_PLANTILLAS, ICONO_GRUPO, PLANTILLAS } from "./datos";

// Portada de Plantillas: la lista agrupada a la izquierda y, a la derecha, la parte superior de
// la pantalla elegida en vivo, con para qué sirve, cuándo usarla y sus piezas. Opción C de las
// portadas, elegida el 2026-10-20.

export function Plantillas() {
  const [elegida, setElegida] = useState(PLANTILLAS[0].href);
  const p = PLANTILLAS.find((x) => x.href === elegida) ?? PLANTILLAS[0];
  return (
    <div className="page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader
        title="Plantillas"
        description="Pantallas tipo armadas solo con el estándar vigente. Elige una para verla en vivo; para usarla en una plataforma, se copia y se cambian sus datos de ejemplo por la consulta real."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-4 items-start">
        <nav aria-label="Plantillas" className="card overflow-hidden">
          {GRUPOS_PLANTILLAS.map((g) => {
            const Icono = ICONO_GRUPO[g.id];
            return (
              <div key={g.id} className="border-b border-border last:border-b-0">
                <p className="flex items-center gap-2 px-3 pt-3 pb-1 label-meta text-faint">
                  <Icono className="w-3.5 h-3.5" />
                  {g.id}
                </p>
                <ul className="pb-2">
                  {PLANTILLAS.filter((x) => x.grupo === g.id).map((x) => (
                    <li key={x.href}>
                      <button
                        type="button"
                        onClick={() => setElegida(x.href)}
                        aria-pressed={x.href === elegida}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-sm cursor-pointer border-l-2",
                          x.href === elegida ? "border-l-flesan-red bg-surface-2 text-text font-600" : "border-l-transparent text-muted hover:text-text",
                        )}
                      >
                        {x.nombre} <span className="font-400 text-faint">· {x.ejemplo}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <section className="card dens-card flex flex-col gap-3 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-label font-600 text-lg text-text">
              {p.nombre} <span className="text-muted font-400">· {p.ejemplo}</span>
            </h2>
            <Link href={p.href} className="ml-auto btn-flesan btn-flesan-primary btn-flesan-sm">
              Abrir plantilla
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p className="text-text leading-snug">{p.proposito}</p>
            <p className="text-muted leading-snug">
              <span className="label-meta text-faint">Úsala cuando </span>
              {p.cuando.charAt(0).toLowerCase() + p.cuando.slice(1)}
            </p>
          </div>
          <span className="flex flex-wrap gap-1">
            {p.piezas.map((x) => (
              <span key={x} className="badge">
                {x}
              </span>
            ))}
          </span>
          <VistaPrevia href={p.href} titulo={`${p.nombre} · ${p.ejemplo}`} />
        </section>
      </div>
    </div>
  );
}

// La pantalla real vista en un monitor de 1600×900 (lo que se ve sin bajar), escalada al ancho
// disponible. Se oculta el ofrecimiento del tutorial, que aquí solo estorba.
const OCULTAR = '[aria-labelledby="oferta-tutorial-titulo"]{display:none!important}';

function VistaPrevia({ href, titulo }: { href: string; titulo: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.5);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setEscala(e.contentRect.width / 1600));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={caja} className="relative w-full border border-border bg-bg overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        key={href}
        src={href}
        onLoad={(e) => {
          const doc = e.currentTarget.contentDocument;
          if (!doc) return;
          const estilo = doc.createElement("style");
          estilo.textContent = OCULTAR;
          doc.head.appendChild(estilo);
        }}
        title={`Vista previa de ${titulo}`}
        loading="lazy"
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{ width: 1600, height: 900, transform: `scale(${escala})` }}
        tabIndex={-1}
      />
    </div>
  );
}
