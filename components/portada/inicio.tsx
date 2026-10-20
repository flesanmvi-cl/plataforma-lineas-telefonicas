import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MUNDOS, PASOS_ARRANQUE } from "./datos";

// Inicio de la plantilla: una tarjeta por mundo (qué es y qué trae) y los pasos para crear una
// plataforma nueva. Opción A de las portadas, elegida el 2026-10-20.

export function Inicio() {
  return (
    <div className="page-shell py-6 lg:py-8 flex flex-col gap-6">
      <PageHeader
        title="Nombre Plataforma"
        description="Plantilla base de las plataformas de la CIA: shell, marca y pantallas tipo ya resueltos. Se copia completa como punto de partida."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {MUNDOS.map(({ href, nombre, icono: Icono, proposito, contiene }) => (
          <Link key={href} href={href} className="card card-hover dens-card flex flex-col gap-3 group">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-flesan-red/10 text-flesan-red">
                <Icono className="w-5 h-5" />
              </span>
              <h2 className="font-label font-600 text-lg text-text tracking-wide">{nombre}</h2>
              <ArrowRight className="ml-auto w-4 h-4 text-faint group-hover:text-flesan-red transition-colors" />
            </div>
            <p className="font-body text-sm text-muted leading-snug">{proposito}</p>
            <ul className="mt-auto flex flex-col gap-1 pt-3 border-t border-border">
              {contiene.map((c) => (
                <li key={c} className="brand-bullet text-sm text-text">
                  {c}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <section className="card dens-card flex flex-col gap-3">
        <h2 className="label-eyebrow">Para crear una plataforma nueva</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PASOS_ARRANQUE.map((p, i) => (
            <li key={p.titulo} className="flex gap-3">
              <span className="font-display text-2xl leading-none text-flesan-red">{i + 1}</span>
              <div>
                <p className="font-label font-600 text-sm text-text">{p.titulo}</p>
                <p className="text-sm text-muted leading-snug">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
