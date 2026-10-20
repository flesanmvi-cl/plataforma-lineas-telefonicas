import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GRUPOS_PLANTILLAS, ICONO_GRUPO, MUNDOS, PLANTILLAS } from "./datos";

// Opción B · Índice por tarea. Inicio: «¿Qué necesitas?» como lista de tareas que lleva al lugar
// exacto. Plantillas: un directorio en tabla, para comparar todas de una pasada.

const TAREAS: { tarea: string; destino: string; href: string | null; detalle: string }[] = [
  { tarea: "Armar un reporte", destino: "Plantillas › Reportes", href: "/pruebas#reportes", detalle: "Cinco tipos: resumen ejecutivo, metas, población, costos con drilldown, ficha." },
  { tarea: "Armar un formulario", destino: "Plantillas › Formularios", href: "/pruebas#formularios", detalle: "Una pantalla, por pasos o maestro-detalle." },
  { tarea: "Acordar una pantalla antes de construirla", destino: "Constructor de maquetas", href: "/pruebas/maquetas", detalle: "Se arrastran piezas del estándar; se exporta en JSON." },
  { tarea: "Ver colores, letras y componentes", destino: "Guía de estilo", href: "/ui-kit", detalle: "Lo vigente, con tokens copiables." },
  { tarea: "Configurar usuarios, avisos o fuentes de datos", destino: "Configuración", href: "/configuracion", detalle: "Lo común a toda plataforma, en el pie del sidebar." },
  { tarea: "Probar un diseño que todavía no existe", destino: "Laboratorio de diseño", href: null, detalle: "Otro proyecto: proyectos/_prototipos/laboratorio-diseno." },
];

export function InicioB() {
  return (
    <div className="page-shell py-6 lg:py-8 flex flex-col gap-6">
      <PageHeader
        title="Nombre Plataforma"
        description="Plantilla base de las plataformas de la CIA. Elige lo que necesitas hacer y te lleva al lugar."
      />
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
        <section className="card overflow-hidden">
          <h2 className="label-eyebrow brand-bullet px-4 pt-4 pb-2">¿Qué necesitas?</h2>
          <ul>
            {TAREAS.map((t) => {
              const contenido = (
                <>
                  <div className="min-w-0">
                    <p className="font-label font-600 text-[0.9375rem] text-text">{t.tarea}</p>
                    <p className="text-sm text-muted leading-snug">{t.detalle}</p>
                  </div>
                  <span className="ml-auto shrink-0 flex items-center gap-2 text-xs label-meta text-muted group-hover:text-flesan-red">
                    {t.destino}
                    {t.href && <ArrowRight className="w-4 h-4" />}
                  </span>
                </>
              );
              return (
                <li key={t.tarea} className="border-t border-border">
                  {t.href ? (
                    <Link href={t.href} className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-2">
                      {contenido}
                    </Link>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">{contenido}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="flex flex-col gap-3">
          <h2 className="label-eyebrow">Qué hay en esta plantilla</h2>
          {MUNDOS.map(({ href, nombre, icono: Icono, proposito }) => (
            <Link key={href} href={href} className="card card-hover dens-card flex gap-3">
              <Icono className="w-5 h-5 text-flesan-red shrink-0 mt-0.5" />
              <div>
                <p className="font-label font-600 text-sm text-text">{nombre}</p>
                <p className="text-sm text-muted leading-snug">{proposito}</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function PlantillasB() {
  return (
    <div className="page-shell py-6 lg:py-8 flex flex-col gap-6">
      <PageHeader
        title="Plantillas"
        description="Pantallas tipo armadas solo con el estándar vigente. Para usar una en una plataforma, se copia y se cambian sus datos de ejemplo por la consulta real."
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm dens-tabla">
          <thead>
            <tr className="text-left label-meta text-faint border-b border-border">
              <th className="font-500">Plantilla</th>
              <th className="font-500">Para qué</th>
              <th className="font-500">Úsala cuando</th>
              <th className="font-500">Piezas</th>
              <th />
            </tr>
          </thead>
          {GRUPOS_PLANTILLAS.map((g) => {
            const Icono = ICONO_GRUPO[g.id];
            return (
              <tbody key={g.id} id={g.id.toLowerCase()}>
                <tr className="bg-surface-2 border-b border-border">
                  <td colSpan={5}>
                    <span className="flex items-center gap-2">
                      <Icono className="w-4 h-4 text-flesan-red" />
                      <span className="font-label font-600 text-text">{g.id}</span>
                      <span className="text-muted">· {g.texto}</span>
                    </span>
                  </td>
                </tr>
                {PLANTILLAS.filter((p) => p.grupo === g.id).map((p) => (
                  <tr key={p.href} className="border-b border-border align-top hover:bg-surface-2">
                    <td className="whitespace-nowrap">
                      <Link href={p.href} className="font-label font-600 text-text hover:text-flesan-red">
                        {p.nombre}
                      </Link>
                      <p className="text-xs text-muted">{p.ejemplo}</p>
                    </td>
                    <td className="text-text leading-snug">{p.proposito}</td>
                    <td className="text-muted leading-snug">{p.cuando}</td>
                    <td>
                      <span className="flex flex-wrap gap-1">
                        {p.piezas.map((x) => (
                          <span key={x} className="badge">
                            {x}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link href={p.href} aria-label={`Abrir ${p.nombre}`} className="inline-flex text-faint hover:text-flesan-red">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}
