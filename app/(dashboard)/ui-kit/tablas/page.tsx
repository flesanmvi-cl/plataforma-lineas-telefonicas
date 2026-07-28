import { GalleryItem } from "@/components/ui-kit/gallery-item";
import { TB101Zebra } from "@/components/tables/tb-101-zebra";
import { TB102Ordenable } from "@/components/tables/tb-102-ordenable";
import { TB103EstadosPaginacion } from "@/components/tables/tb-103-estados-paginacion";

export default function TablasPage() {
  return (
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto flex flex-col gap-8">
      <p className="label-meta text-faint -mb-2">
        Cada tabla es un componente independiente en <code className="font-label text-xs normal-case">components/tables/</code>.
      </p>
      <GalleryItem code="TB-101" title="Zebra" description="Filas alternas, alineación numérica a la derecha." bordered={false}>
        <TB101Zebra />
      </GalleryItem>
      <GalleryItem code="TB-102" title="Ordenable" description="Click en el encabezado alterna asc/desc." bordered={false}>
        <TB102Ordenable />
      </GalleryItem>
      <GalleryItem code="TB-103" title="Estados + paginación" description="Badges de estado y paginación simple al pie." bordered={false}>
        <TB103EstadosPaginacion />
      </GalleryItem>
    </div>
  );
}
