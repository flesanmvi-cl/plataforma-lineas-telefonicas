"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as EventoPuntero } from "react";
import { ArrowUpRight, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CiaLogo } from "@/components/cia-logo";
import { PORTAL_CIA_URL, SAP_WORKZONE_URL } from "@/lib/nav";

const CLAVE = "cia-burbuja-portales";
// Círculo centrado en el sidebar: cabe también en el sidebar colapsado (w-16).
const ANCHO = 48;
const ALTO = 48;
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
  const panel = useRef<HTMLDivElement>(null);
  // Desplazamiento vertical del desplegable respecto de la burbuja: centrado, pero sin salirse de la
  // ventana cuando la burbuja está cerca del borde superior o inferior.
  const [desfase, setDesfase] = useState(0);
  const arrastre = useRef<{ inicioY: number; yInicial: number; movio: boolean } | null>(null);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
      if (guardado) setEstado((e) => ({ ...e, ...guardado, y: acotar(guardado.y ?? e.y) }));
    } catch {}
    // Si cambia el alto de la ventana o el pie del sidebar (al colapsarlo crece), la burbuja no
    // debe quedar encima de configuración ni del usuario.
    const reacomodar = () => setEstado((e) => ({ ...e, y: acotar(e.y) }));
    const observador = new ResizeObserver(reacomodar);
    const pie = document.querySelector("[data-sidebar-pie]");
    const lateral = pie?.parentElement;
    if (pie) observador.observe(pie);
    if (lateral) observador.observe(lateral);
    return () => observador.disconnect();
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

  useLayoutEffect(() => {
    if (!abierta || !raiz.current || !panel.current) return;
    const burbuja = raiz.current.getBoundingClientRect();
    const alto = panel.current.offsetHeight;
    const centrado = burbuja.top + ALTO / 2 - alto / 2;
    const acotado = Math.max(8, Math.min(centrado, window.innerHeight - alto - 8));
    setDesfase(acotado - burbuja.top);
  }, [abierta, estado.y]);

  // Límite vertical: entre el encabezado y el pie del sidebar (configuración y usuario), para que
  // la burbuja nunca tape esos controles.
  function acotar(y: number) {
    const encabezado = document.querySelector<HTMLElement>("[data-sidebar-encabezado]");
    const pie = document.querySelector<HTMLElement>("[data-sidebar-pie]");
    const min = (encabezado ? encabezado.offsetTop + encabezado.offsetHeight : 0) + 16;
    const max = (pie ? pie.offsetTop : window.innerHeight) - ALTO - 16;
    return Math.max(min, Math.min(y, max));
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
        className="absolute right-0 z-50 w-1.5 h-9 rounded-l-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        style={{ top: estado.y, background: "linear-gradient(180deg, var(--color-flesan-red), #00aeef)" }}
      />
    );
  }

  return (
    // Franja del ancho del sidebar: centra la píldora y deja que el desplegable abra justo afuera.
    <div ref={raiz} className="absolute inset-x-0 z-50 flex justify-center pointer-events-none" style={{ top: estado.y }}>
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
        aria-label="Portales del grupo: Portal CIA y SAP (arrastra para mover)"
        title="Portales · arrastra para mover"
        className={cn(
          // «Latido»: borde rojo→azul y halo que respira (estilos en globals.css).
          "burbuja-portales pointer-events-auto relative rounded-full overflow-hidden touch-none select-none",
          arrastrando ? "cursor-grabbing" : "cursor-pointer",
        )}
        style={{ width: ANCHO, height: ALTO }}
      >
        <Monograma />
      </button>

      {abierta && (
        <div
          ref={panel}
          role="menu"
          aria-label="Abrir portales"
          className="panel-portales pointer-events-auto absolute left-full ml-3 w-80 rounded-2xl overflow-hidden text-white"
          style={{ top: desfase }}
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
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/10 text-xs text-white/55">
            Arrastra la burbuja para moverla
            <button
              type="button"
              onClick={() => {
                setAbierta(false);
                guardar({ ...estado, oculta: true });
              }}
              className="ml-auto flex items-center gap-1.5 font-label text-[0.6875rem] tracking-[0.08em] uppercase text-white/70 hover:text-white cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Ocultar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Símbolo CIA / SAP: cada logo en su mitad de color, separados por el corte diagonal.
function Monograma() {
  return (
    <>
      <CiaLogo className="absolute left-[9px] top-[9px] w-4 h-4 text-white" />
      {/* Logo SAP en blanco sobre su mitad azul */}
      <svg width="22" height="11" viewBox="0 0 400 198" aria-hidden className="absolute right-[6px] bottom-[11px]">
        <path d="M0 198V0h400L202 198z" fill="#fff" />
        <text x="32" y="142" fill="#0a6ed1" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="128" letterSpacing="-4">
          SAP
        </text>
      </svg>
      {/* Barra del corte: la misma diagonal del fondo */}
      <span className="absolute -inset-y-1 left-1/2 w-[1.5px] -translate-x-1/2 rotate-[40deg] bg-white/85" aria-hidden />
    </>
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
