"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, MonitorUp, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { migasDe } from "@/lib/nav";
import { usePresentaciones } from "@/components/presentaciones/contexto";
import { useVistaActual } from "@/components/presentaciones/vista-actual";
import { capturarUrl, miniatura, urlDiapositiva } from "@/lib/presentaciones/capturar";
import { guardarImagen } from "@/lib/presentaciones/imagenes";
import { Desplegable } from "@/components/desplegable";

const NUEVA = "__nueva__";

/** Bloques de la vista que se pueden agregar solos (data-bloque + data-bloque-titulo). */
function bloquesDeLaVista(): { id: string; titulo: string }[] {
  return Array.from(document.querySelectorAll<HTMLElement>("main [data-bloque]")).map((el) => ({
    id: el.dataset.bloque ?? "",
    titulo: el.dataset.bloqueTitulo ?? el.dataset.bloque ?? "",
  }));
}

/**
 * Botón «Agregar a presentación» de la barra superior: guarda la vista actual (ruta + filtros
 * de la URL) como diapositiva. La miniatura y, si se congela, la imagen se generan después, en
 * segundo plano.
 */
export function BotonAgregarVista() {
  const pathname = usePathname();
  const vista = useVistaActual();
  const { presentaciones, activa, crear, agregar, actualizar, setPanelAbierto, listo, habilitadas } = usePresentaciones();
  const [abierto, setAbierto] = useState(false);
  const [destino, setDestino] = useState<string>(NUEVA);
  const [nombreNueva, setNombreNueva] = useState("Mi presentación");
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState("");
  const [bloque, setBloque] = useState("");
  const [bloques, setBloques] = useState<{ id: string; titulo: string }[]>([]);
  const [congelar, setCongelar] = useState(false);
  const [hecho, setHecho] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const migas = migasDe(pathname);
  const tituloSugerido = vista?.titulo ?? migas[migas.length - 1]?.label ?? "Vista";
  const filtros = vista?.filtros ?? [];

  function abrir() {
    setDestino(activa?.id ?? NUEVA);
    setTitulo(filtros.length ? `${tituloSugerido} · ${filtros.join(" · ")}` : tituloSugerido);
    setNota("");
    setBloque("");
    setBloques(bloquesDeLaVista());
    setCongelar(false);
    setHecho(null);
    setAbierto(true);
  }

  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setAbierto(false);
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  function guardar() {
    const presentacionId = destino === NUEVA ? crear(nombreNueva.trim() || "Mi presentación") : destino;
    const datos = {
      titulo: titulo.trim() || tituloSugerido,
      ruta: `${window.location.pathname}${window.location.search}`,
      filtros,
      nota: nota.trim(),
      bloque: bloque || undefined,
    };
    const diapositivaId = agregar(presentacionId, datos);
    const nombre = destino === NUEVA ? nombreNueva : (presentaciones.find((p) => p.id === destino)?.nombre ?? "");
    setHecho(nombre);
    setTimeout(() => setAbierto(false), 1400);

    // En segundo plano: miniatura (y la imagen, si se congela) dibujando la diapositiva.
    const p = { id: presentacionId, nombre, creada: "", editada: "", diapositivas: [{ ...datos, id: diapositivaId, agregada: "" }] };
    capturarUrl(urlDiapositiva(p.diapositivas[0], p, 1))
      .then(async (png) => {
        const cambios: { miniatura: string; congelada?: string } = { miniatura: await miniatura(png) };
        if (congelar) {
          await guardarImagen(diapositivaId, png);
          cambios.congelada = new Date().toISOString();
        }
        actualizar(presentacionId, diapositivaId, cambios);
      })
      .catch((e) => console.warn("[presentaciones] no se pudo generar la miniatura", e));
  }

  if (!listo || !habilitadas) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label="Agregar a presentación"
        title="Agregar a presentación"
        // Solo ícono, igual que el botón de pantalla completa.
        className={cn(
          "flex items-center justify-center w-8 h-8 shrink-0 rounded-flesan-sm text-muted hover:text-text hover:bg-bg cursor-pointer transition-colors",
          abierto && "text-text bg-bg",
        )}
      >
        <MonitorUp className="w-4 h-4" />
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Agregar esta vista a una presentación"
          className="absolute right-0 top-10 z-50 w-[23rem] rounded-flesan border border-border bg-surface shadow-lg p-4 flex flex-col gap-3"
        >
          {hecho !== null ? (
            <div className="flex items-center gap-2 text-sm text-text py-2">
              <Check className="w-4 h-4 text-status-ok" />
              Agregada a «{hecho}».
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  setPanelAbierto(true);
                }}
                className="ml-auto font-label text-[0.6875rem] tracking-[0.06em] uppercase text-flesan-red cursor-pointer"
              >
                Ver
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <span className="text-[0.9375rem] font-semibold text-text">Agregar esta vista</span>
                <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="ml-auto text-muted hover:text-text cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Campo etiqueta="Presentación" htmlFor={`${id}-destino`}>
                <Desplegable
                  id={`${id}-destino`}
                  variante="campo"
                  etiqueta="Presentación"
                  valor={destino}
                  onCambio={setDestino}
                  opciones={[
                    ...presentaciones.map((p) => ({ valor: p.id, texto: p.nombre, detalle: `${p.diapositivas.length} diapositiva${p.diapositivas.length === 1 ? "" : "s"}` })),
                    { valor: NUEVA, texto: "Nueva presentación…" },
                  ]}
                />
              </Campo>
              {destino === NUEVA && (
                <Campo etiqueta="Nombre de la nueva presentación" htmlFor={`${id}-nombre`}>
                  <input id={`${id}-nombre`} value={nombreNueva} onChange={(e) => setNombreNueva(e.target.value)} className="field-input" />
                </Campo>
              )}
              <Campo etiqueta="Título de la diapositiva" htmlFor={`${id}-titulo`}>
                <input id={`${id}-titulo`} value={titulo} onChange={(e) => setTitulo(e.target.value)} className="field-input" />
              </Campo>
              {bloques.length > 0 && (
                <Campo etiqueta="Qué incluir" htmlFor={`${id}-bloque`}>
                  <Desplegable
                    id={`${id}-bloque`}
                    variante="campo"
                    etiqueta="Qué incluir"
                    valor={bloque}
                    onCambio={setBloque}
                    opciones={[{ valor: "", texto: "Toda la vista" }, ...bloques.map((b) => ({ valor: b.id, texto: `Solo: ${b.titulo}` }))]}
                  />
                </Campo>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="label-meta text-[0.625rem] text-faint">Se guardan estos filtros</span>
                {filtros.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {filtros.map((f) => (
                      <span key={f} className="text-xs text-muted bg-bg border border-border rounded-full px-2 py-0.5">
                        {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted">La vista tal como está (sin filtros).</span>
                )}
              </div>
              <Campo etiqueta="Nota (opcional)" htmlFor={`${id}-nota`}>
                <textarea id={`${id}-nota`} rows={2} value={nota} onChange={(e) => setNota(e.target.value)} className="field-input resize-none" />
              </Campo>
              <label className="flex items-start gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={congelar} onChange={(e) => setCongelar(e.target.checked)} className="mt-0.5 accent-flesan-red" />
                <span>
                  Congelar datos
                  <span className="block text-xs text-muted">Usa siempre los datos de hoy en vez de actualizarlos al descargar.</span>
                </span>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setAbierto(false)} className="btn-flesan btn-flesan-ghost btn-flesan-sm">
                  Cancelar
                </button>
                <button type="button" onClick={guardar} className="btn-flesan btn-flesan-primary btn-flesan-sm">
                  Agregar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Campo({ etiqueta, htmlFor, children }: { etiqueta: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="label-meta text-[0.625rem] text-faint">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}
