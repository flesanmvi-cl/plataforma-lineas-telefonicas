"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

// Tabs de navegación secundaria dentro de una misma sección del sidebar
// (ej. /ui-kit → Fundamentos/KPIs/Gráficos/Tablas/Botones). Subrayado rojo
// en el tab activo, igual convención que el resto de la nav.
export interface SectionTab {
  href: string;
  label: string;
  disabled?: boolean;
}

export function SectionTabs({ tabs }: { tabs: SectionTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.disabled ? "#" : tab.href}
            aria-disabled={tab.disabled}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-4 py-2.5 font-label text-xs tracking-[0.08em] uppercase whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab.disabled
                ? "border-transparent text-faint pointer-events-none opacity-50"
                : active
                  ? "border-flesan-red text-text"
                  : "border-transparent text-muted hover:text-text",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
