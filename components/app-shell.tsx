"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { PantallaCompletaProvider, usePantallaCompleta } from "@/components/pantalla-completa";
import { ModulosProvider, SuperposicionesModulos, useVistaEspecialModulos } from "@/components/modulos";

// SHELL · marco del dashboard: sidebar, barra superior y contenido (igual en todas las plataformas).
// Los módulos opcionales (ej. Presentaciones) se enchufan desde components/modulos.tsx.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PantallaCompletaProvider>
      <ModulosProvider>
        <Marco>{children}</Marco>
      </ModulosProvider>
    </PantallaCompletaProvider>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  // En pantalla completa (reportería) se oculta el sidebar; la barra superior queda con la
  // ruta y el botón para salir.
  const { activa: pantallaCompleta } = usePantallaCompleta();
  // Un módulo opcional puede dibujar la vista a su manera (ej. modo diapositiva de Presentaciones).
  const especial = useVistaEspecialModulos(children);

  if (especial) return especial;

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      {!pantallaCompleta && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
      <SuperposicionesModulos />
    </div>
  );
}
