"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, FileDown, Loader2, Play, Plus, Presentation, RefreshCw, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/page-header";
import { usePresentaciones } from "@/components/presentaciones/contexto";
import { useDescarga } from "@/components/presentaciones/use-descarga";
import { ALTO, ANCHO, capturarUrl, miniatura, urlDiapositiva } from "@/lib/presentaciones/capturar";
import { imagenesDe } from "@/lib/presentaciones/exportar";
import { borrarImagen, guardarImagen, leerImagen } from "@/lib/presentaciones/imagenes";
import type { Diapositiva, Presentacion } from "@/lib/presentaciones/tipos";

/** Editor de presentaciones (/presentaciones?id=…): miniaturas, vista previa y detalle. */
export function EditorPresentaciones() {
  const { listo, presentaciones, activa, activar, crear, renombrar, eliminar, actualizar, quitar, mover } = usePresentaciones();
  const { descargar, generando, texto, error } = useDescarga();
  const [seleccion, setSeleccion] = useState(0);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [presentando, setPresentando] = useState(false);

  // ?id= elige la presentación al entrar (viene del panel lateral).
  useEffect(() => {
    if (!listo) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (id && presentaciones.some((p) => p.id === id)) activar(id);
    // Solo al cargar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  useEffect(() => setSeleccion(0), [activa?.id]);

  if (!listo) return <div className="page-shell py-8"><div className="skeleton h-96" /></div>;

  if (!activa) {
    return (
      <div className="page-shell py-6 lg:py-8">
        <PageHeader title="Mis presentaciones" />
        <div className="card p-10 flex flex-col items-center gap-4 text-center">
          <Presentation className="w-8 h-8 text-faint" />
          <p className="text-sm text-muted max-w-md">
            Arma presentaciones desde los reportes: deja los filtros como los quieres y usa «Agregar a presentación» en la
            barra superior. Se guardan en este navegador y se descargan en PDF o PowerPoint cuando quieras.
          </p>
          <button type="button" onClick={() => crear("Mi presentación")} className="btn-flesan btn-flesan-primary">
            <Plus className="w-4 h-4" />
            Nueva presentación
          </button>
        </div>
      </div>
    );
  }

  const d = activa.diapositivas[seleccion];

  return (
    <div className="page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader
        title="Mis presentaciones"
        className="mb-0"
        description="Se guardan en este navegador. Cada diapositiva recuerda la vista y sus filtros, y se vuelve a dibujar con los datos del momento al descargar, salvo que esté congelada."
        actions={
          <>
            <button type="button" onClick={() => setPresentando(true)} disabled={!activa.diapositivas.length} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              <Play className="w-4 h-4" />
              Presentar
            </button>
            <button type="button" onClick={() => descargar("pptx", activa)} disabled={!activa.diapositivas.length || !!generando} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              {generando === "pptx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
              PowerPoint
            </button>
            <button type="button" onClick={() => descargar("pdf", activa)} disabled={!activa.diapositivas.length || !!generando} className="btn-flesan btn-flesan-primary btn-flesan-sm">
              {generando === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF
            </button>
          </>
        }
      />
      {(texto || error) && (
        <p className={cn("text-xs", error ? "text-status-down" : "text-muted")} aria-live="polite">
          {error ?? texto}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Presentación" value={activa.id} onChange={(e) => activar(e.target.value)} className="field-input !w-auto">
          {presentaciones.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} · {p.diapositivas.length} diapositiva{p.diapositivas.length === 1 ? "" : "s"}
            </option>
          ))}
        </select>
        <input
          aria-label="Nombre de la presentación"
          value={activa.nombre}
          onChange={(e) => renombrar(activa.id, e.target.value)}
          className="field-input !w-72"
        />
        <button type="button" onClick={() => crear(`Presentación ${presentaciones.length + 1}`)} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
          <Plus className="w-4 h-4" />
          Nueva
        </button>
        {confirmarEliminar ? (
          <span className="flex items-center gap-2 text-sm text-text">
            ¿Eliminar «{activa.nombre}»?
            <button type="button" onClick={() => { eliminar(activa.id); setConfirmarEliminar(false); }} className="btn-flesan btn-flesan-outline-danger btn-flesan-sm">
              Eliminar
            </button>
            <button type="button" onClick={() => setConfirmarEliminar(false)} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmarEliminar(true)} className="btn-flesan btn-flesan-ghost btn-flesan-sm ml-auto">
            <Trash2 className="w-4 h-4" />
            Eliminar presentación
          </button>
        )}
      </div>

      {!activa.diapositivas.length ? (
        <div className="card p-10 text-center text-sm text-muted">
          Esta presentación no tiene diapositivas. Abre un reporte y usa «Agregar a presentación».
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[11rem_minmax(0,1fr)_18rem] gap-4 items-start">
          <ol className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible" aria-label="Diapositivas">
            {activa.diapositivas.map((x, i) => (
              <li key={x.id} className="shrink-0 w-40 xl:w-auto">
                <button
                  type="button"
                  onClick={() => setSeleccion(i)}
                  aria-current={i === seleccion ? "true" : undefined}
                  className={cn(
                    "w-full flex gap-2 items-start text-left p-1 rounded-flesan-sm cursor-pointer",
                    i === seleccion ? "outline-2 outline-flesan-red outline-offset-1" : "hover:bg-surface",
                  )}
                >
                  <span className="tabular text-xs text-faint w-4 pt-1">{i + 1}</span>
                  <span className="flex-1 aspect-video rounded-sm border border-border bg-surface overflow-hidden">
                    {x.miniatura && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.miniatura} alt={x.titulo} className="w-full h-full object-cover" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {d && <VistaPrevia key={`${d.id}-${d.congelada ?? ""}`} d={d} p={activa} numero={seleccion + 1} />}

          {d && (
            <Detalle
              d={d}
              p={activa}
              numero={seleccion + 1}
              onCambiar={(c) => actualizar(activa.id, d.id, c)}
              onQuitar={() => {
                quitar(activa.id, d.id);
                setSeleccion((s) => Math.max(0, s - 1));
              }}
              onMover={(delta) => {
                const hasta = seleccion + delta;
                if (hasta < 0 || hasta >= activa.diapositivas.length) return;
                mover(activa.id, seleccion, hasta);
                setSeleccion(hasta);
              }}
            />
          )}
        </div>
      )}

      {presentando && <ModoPresentar p={activa} onCerrar={() => setPresentando(false)} />}
    </div>
  );
}

// Vista previa: la imagen congelada, o la vista en vivo en modo diapositiva escalada al ancho.
function VistaPrevia({ d, p, numero }: { d: Diapositiva; p: Presentacion; numero: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.5);
  const [imagen, setImagen] = useState<string | null>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setEscala(el.clientWidth / ANCHO));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (d.congelada) leerImagen(d.id).then(setImagen);
  }, [d.id, d.congelada]);

  return (
    <div ref={caja} className="relative w-full aspect-video rounded-flesan overflow-hidden border border-border bg-surface shadow-sm">
      {d.congelada ? (
        imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt={d.titulo} className="w-full h-full object-contain" />
        )
      ) : (
        <iframe
          title={`Vista previa: ${d.titulo}`}
          src={urlDiapositiva(d, p, numero)}
          style={{ width: ANCHO, height: ALTO, border: 0, transform: `scale(${escala})`, transformOrigin: "top left" }}
        />
      )}
    </div>
  );
}

function Detalle({
  d,
  p,
  numero,
  onCambiar,
  onQuitar,
  onMover,
}: {
  d: Diapositiva;
  p: Presentacion;
  numero: number;
  onCambiar: (c: Partial<Diapositiva>) => void;
  onQuitar: () => void;
  onMover: (delta: number) => void;
}) {
  const [trabajando, setTrabajando] = useState(false);

  // Congelar dibuja la diapositiva ahora y guarda la imagen; descongelar la borra.
  async function cambiarDatos(congelar: boolean) {
    setTrabajando(true);
    try {
      if (congelar) {
        const png = await capturarUrl(urlDiapositiva(d, p, numero));
        await guardarImagen(d.id, png);
        onCambiar({ congelada: new Date().toISOString(), miniatura: await miniatura(png) });
      } else {
        await borrarImagen(d.id);
        onCambiar({ congelada: undefined });
      }
    } finally {
      setTrabajando(false);
    }
  }

  async function refrescarMiniatura() {
    setTrabajando(true);
    try {
      onCambiar({ miniatura: await miniatura(await capturarUrl(urlDiapositiva(d, p, numero))) });
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[0.9375rem] font-semibold text-text">Diapositiva {numero}</span>
        <div className="ml-auto flex">
          <button type="button" onClick={() => onMover(-1)} aria-label="Mover antes" className="p-1 text-muted hover:text-text cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onMover(1)} aria-label="Mover después" className="p-1 text-muted hover:text-text cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <label className="flex flex-col gap-1">
        <span className="label-meta text-[0.625rem] text-faint">Título</span>
        <input value={d.titulo} onChange={(e) => onCambiar({ titulo: e.target.value })} className="field-input" />
      </label>
      <div className="flex flex-col gap-1">
        <span className="label-meta text-[0.625rem] text-faint">Vista y filtros</span>
        <span className="text-sm text-text">{d.filtros.length ? d.filtros.join(" · ") : "Sin filtros"}</span>
        {d.bloque && <span className="text-xs text-muted">Solo un bloque de la vista</span>}
        <Link href={d.ruta} className="flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-flesan-red">
          Abrir la vista <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      <label className="flex flex-col gap-1">
        <span className="label-meta text-[0.625rem] text-faint">Nota del presentador</span>
        <textarea rows={4} value={d.nota} onChange={(e) => onCambiar({ nota: e.target.value })} className="field-input resize-none" />
        <span className="text-xs text-muted">Va en las notas de cada diapositiva del PowerPoint.</span>
      </label>
      <fieldset className="flex flex-col gap-1.5" disabled={trabajando}>
        <legend className="label-meta text-[0.625rem] text-faint mb-1">Datos</legend>
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input type="radio" checked={!d.congelada} onChange={() => cambiarDatos(false)} className="accent-flesan-red" />
          Al día (se dibuja al descargar)
        </label>
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input type="radio" checked={!!d.congelada} onChange={() => cambiarDatos(true)} className="accent-flesan-red" />
          {d.congelada ? `Congelados al ${new Date(d.congelada).toLocaleDateString("es-CL")}` : "Congelar con los datos de hoy"}
        </label>
        {trabajando && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dibujando la diapositiva…
          </span>
        )}
      </fieldset>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={refrescarMiniatura} disabled={trabajando} className="flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-text cursor-pointer disabled:opacity-50">
          <RefreshCw className="w-3.5 h-3.5" /> Miniatura
        </button>
        <button type="button" onClick={onQuitar} className="ml-auto flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-status-down cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" /> Quitar
        </button>
      </div>
    </div>
  );
}

// «Presentar»: dibuja todas las diapositivas y las muestra a pantalla completa (← → Esc).
function ModoPresentar({ p, onCerrar }: { p: Presentacion; onCerrar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [imagenes, setImagenes] = useState<string[] | null>(null);
  const [progreso, setProgreso] = useState("Preparando…");
  const [i, setI] = useState(0);

  useEffect(() => {
    let vivo = true;
    ref.current?.requestFullscreen?.().catch(() => {});
    imagenesDe(p, (h, t) => vivo && setProgreso(`Dibujando ${Math.min(h + 1, t)} de ${t}…`))
      .then((imgs) => vivo && setImagenes(imgs))
      .catch(() => vivo && setProgreso("No se pudo dibujar la presentación"));
    return () => {
      vivo = false;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [p]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight" || e.key === " ") setI((n) => Math.min(n + 1, p.diapositivas.length - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onCerrar, p.diapositivas.length]);

  return (
    <div ref={ref} role="dialog" aria-label={`Presentando ${p.nombre}`} className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
      {imagenes ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagenes[i]} alt={p.diapositivas[i]?.titulo ?? ""} className="max-w-full max-h-full object-contain" />
      ) : (
        <span className="flex items-center gap-2 text-white/80 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> {progreso}
        </span>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/80 text-sm">
        <button type="button" onClick={() => setI((n) => Math.max(n - 1, 0))} aria-label="Anterior" className="p-2 hover:text-white cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="tabular">
          {i + 1} / {p.diapositivas.length}
        </span>
        <button type="button" onClick={() => setI((n) => Math.min(n + 1, p.diapositivas.length - 1))} aria-label="Siguiente" className="p-2 hover:text-white cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <button type="button" onClick={onCerrar} aria-label="Salir (Esc)" className="absolute top-4 right-4 p-2 text-white/80 hover:text-white cursor-pointer">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
