"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Search, Download, List, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { GalleryItem } from "@/components/ui-kit/gallery-item";

export default function BotonesPage() {
  const [vista, setVista] = useState<"lista" | "grilla">("lista");

  return (
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto">
      <p className="label-meta text-faint mb-6">
        Familia completa de <code className="font-label text-xs normal-case">.btn-flesan</code> más variantes de
        estado, ícono y forma.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GalleryItem code="BT-101" title="Primario" description="CTA principal — único uso del rojo de marca como fondo.">
          <button className="btn-flesan btn-flesan-primary" onClick={() => toast.success("Acción confirmada")}>
            Confirmar
          </button>
        </GalleryItem>

        <GalleryItem code="BT-102" title="Ghost" description="Acción secundaria, sin competir con el primario.">
          <button className="btn-flesan btn-flesan-ghost">Cancelar</button>
        </GalleryItem>

        <GalleryItem code="BT-103" title="Dark" description="Invertido — se usa sobre fondos claros para jerarquía alta sin ser el CTA rojo.">
          <button className="btn-flesan btn-flesan-dark">Ver detalle</button>
        </GalleryItem>

        <GalleryItem code="BT-104" title="Outline danger" description="Confirmar una acción destructiva (borrar, rechazar, revocar).">
          <button className="btn-flesan btn-flesan-outline-danger" onClick={() => toast.error("Elemento eliminado")}>
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </GalleryItem>

        <GalleryItem code="BT-105" title="Outline success" description="Confirmar una acción positiva (aprobar, validar, activar).">
          <button className="btn-flesan btn-flesan-outline-success" onClick={() => toast.success("Aprobado")}>
            <Check className="w-4 h-4" />
            Aprobar
          </button>
        </GalleryItem>

        <GalleryItem code="BT-106" title="Solo ícono" description="Acción compacta en toolbars/headers — siempre con aria-label.">
          <div className="flex gap-2">
            <button className="btn-flesan btn-flesan-ghost btn-flesan-icon" aria-label="Buscar" title="Buscar">
              <Search className="w-4 h-4" />
            </button>
            <button className="btn-flesan btn-flesan-primary btn-flesan-icon" aria-label="Agregar" title="Agregar">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </GalleryItem>

        <GalleryItem code="BT-107" title="Ícono + texto" description="Ícono como refuerzo visual, no reemplaza el label.">
          <button className="btn-flesan btn-flesan-ghost">
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </GalleryItem>

        <GalleryItem code="BT-108" title="Pill" description="Esquinas redondeadas — uso puntual (ej. filtros tipo tag), no el default.">
          <button className="btn-flesan btn-flesan-primary btn-flesan-pill">Filtrar</button>
        </GalleryItem>

        <GalleryItem code="BT-109" title="Segmented / toggle group" description="Selección exclusiva entre 2-3 opciones, mismo patrón que ThemeToggle.">
          <div className="inline-flex">
            <button
              type="button"
              onClick={() => setVista("lista")}
              aria-pressed={vista === "lista"}
              className={`inline-flex items-center gap-1.5 px-3 h-9 border font-label text-xs uppercase tracking-wider transition-colors ${
                vista === "lista" ? "border-text bg-text text-surface" : "border-border bg-surface text-muted hover:text-text hover:border-text"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
            <button
              type="button"
              onClick={() => setVista("grilla")}
              aria-pressed={vista === "grilla"}
              className={`-ml-px inline-flex items-center gap-1.5 px-3 h-9 border font-label text-xs uppercase tracking-wider transition-colors ${
                vista === "grilla" ? "border-text bg-text text-surface" : "border-border bg-surface text-muted hover:text-text hover:border-text"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grilla
            </button>
          </div>
        </GalleryItem>

        <GalleryItem code="BT-110" title="Tamaños" description="Mismas variantes en -lg/-sm, para jerarquía dentro de una misma vista.">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-flesan btn-flesan-primary btn-flesan-lg">Grande</button>
            <button className="btn-flesan btn-flesan-primary btn-flesan-sm">Chico</button>
          </div>
        </GalleryItem>

        <GalleryItem code="BT-111" title="Deshabilitado" description="Opacidad reducida + cursor not-allowed, igual en todas las variantes.">
          <button className="btn-flesan btn-flesan-primary" disabled>
            No disponible
          </button>
        </GalleryItem>
      </div>
    </div>
  );
}
