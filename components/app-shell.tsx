"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { TopNav } from "@/components/top-nav";
import { useNavStyle } from "@/components/nav-style-context";

// Punto único donde se decide el layout del dashboard según la preferencia
// guardada (ver NavStyleToggle): riel lateral colapsable (por defecto) o
// nav superior estilo portal-cia, sin sidebar.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { navStyle } = useNavStyle();

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
