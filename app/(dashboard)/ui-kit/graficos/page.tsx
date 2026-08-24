import { GalleryItem } from "@/components/ui-kit/gallery-item";
import { GL201LineaSimple } from "@/components/charts/gl-201-linea-simple";
import { GL202LineaArea } from "@/components/charts/gl-202-linea-area";
import { GL203LineaMultiserie } from "@/components/charts/gl-203-linea-multiserie";
import { GL204LineaTooltip } from "@/components/charts/gl-204-linea-tooltip";
import { GB101BarrasVerticales } from "@/components/charts/gb-101-barras-verticales";
import { GB102BarrasHorizontales } from "@/components/charts/gb-102-barras-horizontales";
import { GB103BarrasAgrupadas } from "@/components/charts/gb-103-barras-agrupadas";
import { GT301TortaBasica } from "@/components/charts/gt-301-torta-basica";
import { GT302DonaValorCentral } from "@/components/charts/gt-302-dona-valor-central";
import { GT303DonaLeyenda } from "@/components/charts/gt-303-dona-leyenda";
import { GA401AreaSimple } from "@/components/charts/ga-401-area-simple";
import { GA402AreaApilada } from "@/components/charts/ga-402-area-apilada";

const GRUPO_TITULO = "label-meta text-faint";

export default function GraficosPage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-10">
      <p className="label-meta text-faint -mb-4">
        SVG a mano, sin librería externa — cada gráfico consume tokens <code className="font-label text-xs normal-case">--color-chart-*</code> y responde a modo oscuro solo.
      </p>

      <section>
        <h2 className={GRUPO_TITULO}>Línea</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
          <GalleryItem code="GL-201" title="Línea simple" description="Una serie, sin relleno, con puntos.">
            <GL201LineaSimple />
          </GalleryItem>
          <GalleryItem code="GL-202" title="Línea con área" description="Relleno en gradiente bajo la curva.">
            <GL202LineaArea />
          </GalleryItem>
          <GalleryItem code="GL-203" title="Multi-serie" description="2-3 líneas comparativas con leyenda.">
            <GL203LineaMultiserie />
          </GalleryItem>
          <GalleryItem code="GL-204" title="Con tooltip" description="Hover interactivo: marcador + valor.">
            <GL204LineaTooltip />
          </GalleryItem>
        </div>
      </section>

      <section>
        <h2 className={GRUPO_TITULO}>Barra</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
          <GalleryItem code="GB-101" title="Verticales" description="Barras simples, una serie.">
            <GB101BarrasVerticales />
          </GalleryItem>
          <GalleryItem code="GB-102" title="Horizontales" description="Ranking con etiquetas largas.">
            <GB102BarrasHorizontales />
          </GalleryItem>
          <GalleryItem code="GB-103" title="Agrupadas" description="Comparativa de 2 series (meta vs real).">
            <GB103BarrasAgrupadas />
          </GalleryItem>
        </div>
      </section>

      <section>
        <h2 className={GRUPO_TITULO}>Torta / Dona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
          <GalleryItem code="GT-301" title="Torta básica" description="Distribución simple con leyenda lateral.">
            <GT301TortaBasica />
          </GalleryItem>
          <GalleryItem code="GT-302" title="Dona · valor central" description="Un solo indicador tipo % de avance.">
            <GT302DonaValorCentral />
          </GalleryItem>
          <GalleryItem code="GT-303" title="Dona · leyenda" description="Multi-categoría con porcentajes al lado.">
            <GT303DonaLeyenda />
          </GalleryItem>
        </div>
      </section>

      <section>
        <h2 className={GRUPO_TITULO}>Área</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
          <GalleryItem code="GA-401" title="Área simple" description="Relleno sólido semi-transparente, sin gradiente.">
            <GA401AreaSimple />
          </GalleryItem>
          <GalleryItem code="GA-402" title="Área apilada" description="2 series acumuladas (ej. mano de obra + materiales).">
            <GA402AreaApilada />
          </GalleryItem>
        </div>
      </section>
    </div>
  );
}
