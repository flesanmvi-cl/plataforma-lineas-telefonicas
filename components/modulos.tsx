"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PresentacionesProvider } from "@/components/presentaciones/contexto";
import { VistaActualProvider } from "@/components/presentaciones/vista-actual";
import { PanelPresentaciones } from "@/components/presentaciones/panel";
import { BotonAgregarVista } from "@/components/presentaciones/agregar-vista";
import { usePresentaciones } from "@/components/presentaciones/contexto";
import { Fila, Interruptor, Seccion } from "@/components/personalizar";
import {
  leerParametrosDiapositiva,
  MarcoDiapositiva,
  type ParametrosDiapositiva,
} from "@/components/presentaciones/marco-diapositiva";

// PLATAFORMA · módulos opcionales que se enchufan al shell (este archivo sí se edita en cada una).
// El shell (app-shell, topbar, user-menu, personalización) solo conoce estos seis puntos de enchufe; una
// plataforma sin módulos opcionales usa la versión mínima de docs/SHELL.md.
// Aquí: Presentaciones (armar PDF/PowerPoint con vistas de la plataforma).

/** Contextos de los módulos, alrededor de todo el dashboard. */
export function ModulosProvider({ children }: { children: ReactNode }) {
  return (
    <PresentacionesProvider>
      <VistaActualProvider>{children}</VistaActualProvider>
    </PresentacionesProvider>
  );
}

/** Si un módulo necesita dibujar la vista sin el marco normal, devuelve ese dibujo; si no, null.
 * Presentaciones: con ?diapositiva=1 la vista va sola en un marco 16:9 para capturarla. Se lee
 * al montar (en el servidor no hay URL de búsqueda). */
export function useVistaEspecialModulos(children: ReactNode): ReactNode | null {
  const [diapositiva, setDiapositiva] = useState<ParametrosDiapositiva | null>(null);
  useEffect(() => setDiapositiva(leerParametrosDiapositiva(window.location.search)), []);
  return diapositiva ? <MarcoDiapositiva p={diapositiva}>{children}</MarcoDiapositiva> : null;
}

/** Botones extra de la barra superior (a la izquierda de pantalla completa). */
export function BotonesBarraModulos() {
  return <BotonAgregarVista />;
}

/** Filas extra del menú de usuario (antes de Personalizar). Presentaciones se activa desde
 * Configuración › Presentaciones, así que aquí no agrega nada. */
export function OpcionesUsuarioModulos() {
  return null;
}

/** Secciones extra de «Mi personalización» (Configuración). Presentaciones: su interruptor. */
export function PersonalizacionModulos() {
  const { habilitadas, setHabilitadas } = usePresentaciones();
  return (
    <Seccion titulo="Herramientas">
      <Fila titulo="Presentaciones" detalle="Muestra «Agregar a presentación» en la barra superior.">
        <Interruptor activo={habilitadas} etiqueta="Presentaciones" onCambio={setHabilitadas} />
      </Fila>
    </Seccion>
  );
}

/** Paneles flotantes de los módulos (fuera del flujo del layout). */
export function SuperposicionesModulos() {
  return <PanelPresentaciones />;
}
