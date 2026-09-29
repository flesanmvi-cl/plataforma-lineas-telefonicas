"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, FileDown, GripVertical, Loader2, Pencil, Plus, Presentation, Snowflake, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePresentaciones } from "@/components/presentaciones/contexto";
import { useDescarga } from "@/components/presentaciones/use-descarga";
import type { Diapositiva } from "@/lib/presentaciones/tipos";

/**
 * Panel lateral «Presentaciones»: elegir la presentación activa, ver y reordenar sus
 * diapositivas (arrastrando o con flechas), quitar, abrir la vista de origen y descargar en
 * PDF o PowerPoint. El detalle se edita en /presentaciones.
 */
export function PanelPresentaciones() {
  const { panelAbierto, setPanelAbierto, presentaciones, activa, activar, crear, quitar, mover } = usePresentaciones();
  const { descargar, generando, texto, error } = useDescarga();
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  useEffect(() => {
    if (!panelAbierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setPanelAbierto(false);
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [panelAbierto, setPanelAbierto]);

  if (!panelAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setPanelAbierto(false)} aria-hidden />
      <aside
        id="panel-presentaciones"
        aria-label="Presentaciones"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[27rem] bg-bg border-l border-border shadow-2xl flex flex-col animate-fade-in"
      >
        <div className="p-4 flex flex-col gap-3 border-b border-border bg-surface">
          <div className="flex items-center">
            <h2 className="text-base font-semibold text-text">Presentaciones</h2>
            <button type="button" onClick={() => setPanelAbierto(false)} aria-label="Cerrar" className="ml-auto text-muted hover:text-text cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <select
              aria-label="Presentación activa"
              value={activa?.id ?? ""}
              onChange={(e) => activar(e.target.value)}
              disabled={!presentaciones.length}
              className="field-input flex-1"
            >
              {!presentaciones.length && <option value="">Sin presentaciones</option>}
              {presentaciones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => crear(`Presentación ${presentaciones.length + 1}`)} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              <Plus className="w-4 h-4" />
              Nueva
            </button>
          </div>
          {activa && (
            <p className="text-xs text-muted">
              {activa.diapositivas.length} diapositiva{activa.diapositivas.length === 1 ? "" : "s"} · editada{" "}
              {new Date(activa.editada).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
            </p>
          )}
        </div>

        <ol className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {!activa?.diapositivas.length && (
            <li className="text-sm text-muted text-center py-10 px-4 border border-dashed border-border-strong rounded-flesan">
              Todavía no hay diapositivas. Abre un reporte, deja los filtros como los quieres y usa «Agregar a presentación».
            </li>
          )}
          {activa?.diapositivas.map((d, i) => (
            <li
              key={d.id}
              draggable
              onDragStart={() => setArrastrando(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastrando !== null && arrastrando !== i) mover(activa.id, arrastrando, i);
                setArrastrando(null);
              }}
              onDragEnd={() => setArrastrando(null)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-flesan-sm border border-border bg-surface",
                arrastrando === i && "opacity-40",
              )}
            >
              <GripVertical className="w-4 h-4 text-faint shrink-0 cursor-grab" aria-hidden />
              <span className="tabular text-xs text-faint w-4 shrink-0">{i + 1}</span>
              <Miniatura d={d} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text truncate" title={d.titulo}>
                  {d.titulo}
                </p>
                <p className="text-xs text-muted truncate">
                  {d.congelada ? `Congelada ${new Date(d.congelada).toLocaleDateString("es-CL")}` : "Datos al día"}
                  {d.bloque ? " · un bloque" : ""}
                </p>
              </div>
              <div className="flex flex-col shrink-0">
                <IconoAccion etiqueta="Subir" onClick={() => mover(activa.id, i, i - 1)} disabled={i === 0}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </IconoAccion>
                <IconoAccion etiqueta="Bajar" onClick={() => mover(activa.id, i, i + 1)} disabled={i === activa.diapositivas.length - 1}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </IconoAccion>
              </div>
              <div className="flex flex-col shrink-0">
                <Link
                  href={d.ruta}
                  onClick={() => setPanelAbierto(false)}
                  aria-label="Abrir la vista"
                  title="Abrir la vista con sus filtros"
                  className="p-1 text-muted hover:text-text"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <IconoAccion etiqueta="Quitar" onClick={() => quitar(activa.id, d.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </IconoAccion>
              </div>
            </li>
          ))}
        </ol>

        <div className="p-4 border-t border-border bg-surface flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => activa && descargar("pdf", activa)}
              disabled={!activa?.diapositivas.length || !!generando}
              className="btn-flesan btn-flesan-primary flex-1"
            >
              {generando === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF
            </button>
            <button
              type="button"
              onClick={() => activa && descargar("pptx", activa)}
              disabled={!activa?.diapositivas.length || !!generando}
              className="btn-flesan btn-flesan-ghost flex-1"
            >
              {generando === "pptx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
              PowerPoint
            </button>
          </div>
          <p className={cn("text-xs text-center", error ? "text-status-down" : "text-muted")} aria-live="polite">
            {error ?? texto ?? "Se generan con los datos al momento de descargar."}
          </p>
          {activa && (
            <Link
              href={`/configuracion/presentaciones?id=${activa.id}`}
              onClick={() => setPanelAbierto(false)}
              className="flex items-center justify-center gap-1.5 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-flesan-red"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar presentación
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

function Miniatura({ d }: { d: Diapositiva }) {
  return (
    <span className="relative w-24 aspect-video shrink-0 rounded-sm border border-border bg-bg overflow-hidden flex items-center justify-center">
      {d.miniatura ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.miniatura} alt="" className="w-full h-full object-cover" />
      ) : (
        <Loader2 className="w-4 h-4 text-faint animate-spin" aria-label="Generando miniatura" />
      )}
      {d.congelada && (
        <span className="absolute top-0.5 right-0.5 bg-surface/90 rounded-sm p-0.5" title="Datos congelados">
          <Snowflake className="w-3 h-3 text-muted" />
        </span>
      )}
    </span>
  );
}

function IconoAccion({ etiqueta, onClick, disabled, children }: { etiqueta: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      title={etiqueta}
      className="p-1 text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}
