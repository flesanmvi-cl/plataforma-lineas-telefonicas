import { SectionTabs } from "@/components/section-tabs";
import { PageHeader } from "@/components/page-header";
import { NAV_ITEMS } from "@/lib/nav";

// Las tabs salen de los subpaneles de la Guía de Estilo en lib/nav.ts (el mismo menú
// flotante del sidebar), para no mantener dos listas.
const TABS = NAV_ITEMS.find((item) => item.href === "/ui-kit")?.children ?? [];

export default function UiKitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="page-shell pt-6 lg:pt-8">
        <PageHeader
          title="Guía de Estilo"
          className="mb-0"
          description={
            <>
              El estándar vigente para toda plataforma nueva y el laboratorio de diseño para elegirlo:
              gráficos, KPIs, tablas, botones y formularios. Ver{" "}
              <code className="font-label text-xs">docs/UI-KIT-CATALOG.md</code>.
            </>
          }
        />
      </div>
      {/* Pestañas fijas al bajar. El scroll ocurre dentro de <main> (la barra superior queda
          fuera), así que se pegan al borde superior (top-0) y con fondo sólido para que el
          contenido no se vea pasar por detrás. */}
      <div className="sticky top-0 z-20 bg-bg pt-4">
        <div className="page-shell">
          <SectionTabs tabs={TABS} />
        </div>
      </div>
      {children}
    </div>
  );
}
