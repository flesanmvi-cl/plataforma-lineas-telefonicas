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
              Fundamentos y escala de la plantilla, y el laboratorio de diseño para elegir el estándar de
              gráficos, KPIs, tablas y botones. Ver{" "}
              <code className="font-label text-xs">docs/UI-KIT-CATALOG.md</code>.
            </>
          }
        />
      </div>
      <div className="sticky top-14 z-20 bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85 mt-4">
        <div className="page-shell">
          <SectionTabs tabs={TABS} />
        </div>
      </div>
      {children}
    </div>
  );
}
