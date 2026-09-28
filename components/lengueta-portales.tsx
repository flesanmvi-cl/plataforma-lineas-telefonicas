"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CiaLogo } from "@/components/cia-logo";
import { PORTAL_CIA_URL, SAP_WORKZONE_URL } from "@/lib/nav";

/**
 * Lengüeta de portales: asoma por dentro del borde derecho del sidebar, justo arriba del pie
 * (configuración y usuario). Mitad roja CIA arriba y mitad azul SAP abajo, con los logos
 * legibles en reposo. Al presionarla despliega los accesos a Portal CIA y SAP
 * Work Zone, afuera del sidebar.
 */
export function LenguetaPortales() {
  const [abierta, setAbierta] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Cierra el desplegable con clic fuera o Esc.
  useEffect(() => {
    if (!abierta) return;
    const alClic = (e: MouseEvent) => raiz.current && !raiz.current.contains(e.target as Node) && setAbierta(false);
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierta]);

  if (!SAP_WORKZONE_URL && !PORTAL_CIA_URL) return null;

  return (
    // Franja sin alto sobre el pie del sidebar: la lengüeta y el desplegable cuelgan de ella.
    <div ref={raiz} className="relative h-0 z-50">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierta}
        aria-label="Portales del grupo: Portal CIA y SAP Work Zone"
        title="Portal CIA · SAP Work Zone"
        className={cn(
          "lengueta-portales absolute right-0 bottom-3 flex flex-col items-center justify-evenly rounded-l-xl cursor-pointer",
          "w-10 h-20",
        )}
      >
        <CiaLogo className="w-5 h-5 text-(--lengueta-cia)" />
        {/* Logo SAP: trapecio con la sigla, en el azul de la mitad SAP */}
        <svg viewBox="0 0 400 198" aria-hidden className="w-8 h-4">
          <path d="M0 198V0h400L202 198z" className="fill-(--lengueta-sap)" />
          <text x="32" y="142" className="fill-(--lengueta-sap-texto)" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="128" letterSpacing="-4">
            SAP
          </text>
        </svg>
      </button>

      {abierta && (
        <div
          role="menu"
          aria-label="Abrir portales"
          className="panel-portales absolute left-full bottom-0 ml-3 w-80 rounded-2xl overflow-hidden text-white"
        >
          <div className="flex items-center px-4 pt-3.5 pb-2">
            <span className="font-label text-[0.6875rem] font-semibold tracking-[0.14em] uppercase text-white/60">Abrir portales</span>
            <button type="button" onClick={() => setAbierta(false)} aria-label="Cerrar" className="ml-auto text-white/60 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative px-3 pb-3 flex flex-col gap-2.5">
            {/* Línea punteada que une los dos mundos, como en el mapa del ecosistema */}
            {PORTAL_CIA_URL && SAP_WORKZONE_URL && (
              <span className="absolute left-[2.3rem] top-[3.4rem] h-7 border-l-2 border-dashed border-white/25" aria-hidden />
            )}
            {PORTAL_CIA_URL && (
              <Portal href={PORTAL_CIA_URL} nombre="Portal CIA" detalle="Aplicativos y desafíos de la CIA" color="#ff3a3a">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(227,6,19,0.15)] ring-1 ring-inset ring-[rgba(227,6,19,0.5)]">
                  <CiaLogo className="w-6 h-6 text-[#ff3a3a]" />
                </span>
              </Portal>
            )}
            {SAP_WORKZONE_URL && (
              <Portal href={SAP_WORKZONE_URL} nombre="SAP Work Zone" detalle="Noticias, comunicaciones y trámites" color="#00aeef">
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(180deg, #00aeef, #007cc5 52%, #0066b3)" }}
                >
                  <span className="text-[0.75rem] font-bold text-white" style={{ fontFamily: "Arial, sans-serif" }}>
                    SAP
                  </span>
                </span>
              </Portal>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Portal({
  href,
  nombre,
  detalle,
  color,
  children,
}: {
  href: string;
  nombre: string;
  detalle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      className="relative flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:translate-x-0.5 transition-all"
    >
      {children}
      <span className="flex flex-col min-w-0">
        <span className="text-[0.9375rem] font-semibold">{nombre}</span>
        <span className="text-xs text-white/60">{detalle}</span>
      </span>
      <ArrowUpRight className="w-4 h-4 ml-auto shrink-0" style={{ color }} />
    </a>
  );
}
