import { SectionTabs } from "@/components/section-tabs";

const TABS = [
  { href: "/ui-kit", label: "Fundamentos" },
  { href: "/ui-kit/kpis", label: "KPIs" },
  { href: "/ui-kit/graficos", label: "Gráficos" },
  { href: "/ui-kit/tablas", label: "Tablas" },
  { href: "/ui-kit/botones", label: "Botones" },
];

export default function UiKitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 lg:px-8 pt-8 lg:pt-10 max-w-5xl mx-auto">
        <p className="label-eyebrow brand-bullet mb-3">Sistema de Diseño</p>
        <h1 className="display-title text-4xl text-text mb-3">Guía de Estilo</h1>
        <p className="body-lede max-w-2xl">
          Referencia viva de tokens y una vitrina de componentes ya disponibles en este proyecto. Cada
          objeto de la vitrina trae un código (ej. <strong>GL-201</strong>) — ver{" "}
          <code className="font-label text-sm">docs/UI-KIT-CATALOG.md</code> para pedir ese diseño
          puntual en una sesión futura.
        </p>
      </div>
      <div className="sticky top-14 z-20 bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85 mt-6 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionTabs tabs={TABS} />
        </div>
      </div>
      {children}
    </div>
  );
}
