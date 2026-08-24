import { GalleryItem } from "@/components/ui-kit/gallery-item";
import { KP101Simple } from "@/components/kpis/kp-101-simple";
import { KP102IconoFranja } from "@/components/kpis/kp-102-icono-franja";
import { KP103Gauge } from "@/components/kpis/kp-103-gauge";
import { KP104Comparativo } from "@/components/kpis/kp-104-comparativo";
import { KP105Sparkline } from "@/components/kpis/kp-105-sparkline";

export default function KpisPage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <p className="label-meta text-faint mb-6">
        Cada tarjeta es un componente independiente en <code className="font-label text-xs normal-case">components/kpis/</code>, ya con su propia .card — insértala tal cual.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GalleryItem code="KP-101" title="Simple" description="Valor + variación vs período anterior." bordered={false}>
          <KP101Simple />
        </GalleryItem>
        <GalleryItem code="KP-102" title="Ícono + franja" description="Franja de color superior para categorizar." bordered={false}>
          <KP102IconoFranja />
        </GalleryItem>
        <GalleryItem code="KP-103" title="Gauge" description="Arco de progreso, color según umbral (ok/warn/down)." bordered={false}>
          <KP103Gauge />
        </GalleryItem>
        <GalleryItem code="KP-104" title="Comparativo" description="Actual vs meta con barra de progreso lineal." bordered={false}>
          <KP104Comparativo />
        </GalleryItem>
        <GalleryItem code="KP-105" title="Sparkline" description="Valor + mini gráfico de tendencia embebido." bordered={false}>
          <KP105Sparkline />
        </GalleryItem>
      </div>
    </div>
  );
}
