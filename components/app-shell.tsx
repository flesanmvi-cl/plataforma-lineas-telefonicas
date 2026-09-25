"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { TopNav } from "@/components/top-nav";
import { useNavStyle, type NavStyle } from "@/components/nav-style-context";

// Por ahora la plantilla usa solo el riel lateral: el selector (NavStyleToggle) está
// oculto y la nav superior (TopNav) queda en pausa. Para reactivar la elección, vuelve
// a leer la preferencia guardada y muestra NavStyleToggle en el sidebar.
const NAV_STYLE_FIJO: NavStyle | null = "sidebar";

// Punto único donde se decide el layout del dashboard: riel lateral colapsable o nav
// superior estilo portal-cia, sin sidebar.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { navStyle: preferido } = useNavStyle();
  const navStyle = NAV_STYLE_FIJO ?? preferido;

  if (navStyle === "topnav") {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <TopNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
