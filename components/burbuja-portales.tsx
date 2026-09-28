"use client";

import { useEffect, useRef, useState, type PointerEvent as EventoPuntero } from "react";
import { ArrowUpRight, EyeOff, Grid3x3, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CiaLogo } from "@/components/cia-logo";
import { PORTAL_CIA_URL, SAP_WORKZONE_URL } from "@/lib/nav";

const CLAVE = "cia-burbuja-portales";
const TAMANO = 40;
const UMBRAL_ARRASTRE = 4;

interface Estado {
  /** Distancia desde el borde superior del sidebar, en px. */
  y: number;
  oculta: boolean;
}

/**
 * Burbuja de portales pegada al borde derecho del sidebar: al presionarla despliega los accesos
 * a SAP Workzone y Portal CIA. Se arrastra hacia arriba o abajo por el borde y se puede ocultar
 * (queda una pestaña delgada para traerla de vuelta). Posición y visibilidad se recuerdan en este
 * navegador.
 */
export function BurbujaPortales() {
  const [estado, setEstado] = useState<Estado>({ y: 180, oculta: false });
  const [abierta, setAbierta] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ inicioY: number; yInicial: number; movio: boolean } | null>(null);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
      if (guardado) setEstado((e) => ({ ...e, ...guardado }));
    } catch {}
  }, []);

  function guardar(siguiente: Estado) {
    setEstado(siguiente);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {}
  }

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

  // Límite vertical: dentro del sidebar (el padre posicionado).
  function acotar(y: number) {
    const alto = raiz.current?.offsetParent?.clientHeight ?? window.innerHeight;
    return Math.max(8, Math.min(y, alto - TAMANO - 8));
  }

  function alPresionar(e: EventoPuntero<HTMLButtonElement>) {
    arrastre.current = { inicioY: e.clientY, yInicial: estado.y, movio: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function alMover(e: EventoPuntero<HTMLButtonElement>) {
    const a = arrastre.current;
    if (!a) return;
    const delta = e.clientY - a.inicioY;
    if (!a.movio && Math.abs(delta) < UMBRAL_ARRASTRE) return;
    a.movio = true;
    setArrastrando(true);
    setAbierta(false);
    setEstado((s) => ({ ...s, y: acotar(a.yInicial + delta) }));
  }

  function alSoltar() {
    const a = arrastre.current;
    arrastre.current = null;
    setArrastrando(false);
    if (!a) return;
    if (a.movio) guardar({ ...estado, y: acotar(estado.y) });
    else setAbierta((v) => !v);
  }

  if (!SAP_WORKZONE_URL && !PORTAL_CIA_URL) return null;

  if (estado.oculta) {
    return (
      <button
        type="button"
        onClick={() => guardar({ ...estado, oculta: false })}
        title="Mostrar portales"
        aria-label="Mostrar la burbuja de portales"
        className="absolute -right-1.5 z-50 w-1.5 h-10 rounded-r-full bg-border-strong hover:bg-flesan-red transition-colors cursor-pointer"
        style={{ top: estado.y }}
      />
    );
  }

  return (
    <div ref={raiz} className="absolute z-50" style={{ top: estado.y, right: -TAMANO / 2 }}>
      <button
        type="button"
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onKeyDown={(e) => {
          // Teclado: Enter/Espacio abre; flechas mueven la burbuja.
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            guardar({ ...estado, y: acotar(estado.y + (e.key === "ArrowUp" ? -24 : 24)) });
          }
        }}
        onClick={(e) => {
          // El clic de puntero se resuelve en alSoltar; aquí solo el del teclado.
          if (e.detail === 0) setAbierta((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={abierta}
        aria-label="Portales del grupo (arrastra para mover)"
        title="Portales · arrastra para mover"
        className={cn(
          "flex items-center justify-center rounded-full border border-border-strong bg-surface text-muted shadow-md hover:text-text hover:border-text transition-colors touch-none select-none",
          arrastrando ? "cursor-grabbing shadow-lg" : "cursor-pointer",
          abierta && "text-flesan-red border-flesan-red",
        )}
        style={{ width: TAMANO, height: TAMANO }}
      >
        <Grid3x3 className="w-4 h-4" />
      </button>

      {abierta && (
        <div
          role="menu"
          aria-label="Abrir portales"
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-72 rounded-flesan border border-border bg-surface shadow-lg p-1.5 animate-fade-in"
        >
          <div className="flex items-center px-2.5 pt-1.5 pb-1">
            <span className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint">Abrir portales</span>
            <button type="button" onClick={() => setAbierta(false)} aria-label="Cerrar" className="ml-auto text-faint hover:text-text cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {SAP_WORKZONE_URL && (
            <Portal href={SAP_WORKZONE_URL} nombre="SAP Workzone" detalle="RR.HH. y trámites del grupo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sap-logo.svg" alt="" className="h-4 w-auto" />
            </Portal>
          )}
          {PORTAL_CIA_URL && (
            <Portal href={PORTAL_CIA_URL} nombre="Portal CIA" detalle="Todas las plataformas de la CIA">
              <CiaLogo className="w-5 h-5 text-flesan-red dark:text-white" />
            </Portal>
          )}
          <button
            type="button"
            onClick={() => {
              setAbierta(false);
              guardar({ ...estado, oculta: true });
            }}
            className="w-full flex items-center gap-2 mt-1 px-2.5 py-2 border-t border-border font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-text cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Ocultar burbuja
          </button>
        </div>
      )}
    </div>
  );
}

function Portal({ href, nombre, detalle, children }: { href: string; nombre: string; detalle: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      className="flex items-center gap-3 px-2.5 py-2 rounded-flesan-sm hover:bg-bg transition-colors"
    >
      <span className="w-9 h-9 rounded-flesan-sm border border-border bg-surface flex items-center justify-center shrink-0">{children}</span>
      <span className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-text">{nombre}</span>
        <span className="text-xs text-muted truncate">{detalle}</span>
      </span>
      <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-faint shrink-0" />
    </a>
  );
}
