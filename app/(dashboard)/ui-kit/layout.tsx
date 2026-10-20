import { PageHeader } from "@/components/page-header";

export default function UiKitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="page-shell pt-6 lg:pt-8">
        <PageHeader
          title="Guía de Estilo"
          className="mb-0"
          description={
            <>
              Lo vigente para toda plataforma nueva: identidad y color, tipografía, escala,
              superficie, formularios y las piezas del estándar. Las opciones en prueba viven en el
              laboratorio de diseño. Ver <code className="font-label text-xs">docs/UI-KIT-CATALOG.md</code>.
            </>
          }
        />
      </div>
      {children}
    </div>
  );
}
