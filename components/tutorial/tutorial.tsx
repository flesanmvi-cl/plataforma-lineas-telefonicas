"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePreferencias } from "@/components/preferencias";

// SHELL · tutorial guiado (origen: eerr_gestion, Propuesta C). Recorre la pantalla paso a paso,
// como los tutoriales de los bancos: cada paso ilumina una zona y deja el resto bajo un velo, con
// un globo al lado que dice qué hacer.
//
// Una pantalla declara su recorrido con useTutorial(pasos). Con eso aparece el botón «Tutorial»
// en el pie del sidebar (solo en esa pantalla); sin pasos, no hay botón. El usuario puede
// apagarlo en Mi personalización. Las zonas se marcan con `data-tutorial="…"`, o se reutiliza el
// `data-bloque` que ya llevan las tarjetas de reporte y el `data-grupo` de los grupos de campos.

export interface PasoTutorial {
  /** Selector CSS de la zona a iluminar. Si no está en la pantalla, el paso se salta. */
  selector: string;
  /** Con varios elementos que calzan, cuál iluminar (por defecto el primero). */
  indice?: number;
  titulo: string;
  texto: string;
}

interface ValorTutorial {
  pasos: PasoTutorial[] | null;
  registrar: (pasos: PasoTutorial[] | null) => void;
  abierto: boolean;
  iniciar: () => void;
}

const Contexto = createContext<ValorTutorial | null>(null);

/** Va alrededor del dashboard (AppShell): une los pasos de la pantalla con el botón del sidebar. */
export function TutorialProvider({ children }: { children: ReactNode }) {
  const [pasos, setPasos] = useState<PasoTutorial[] | null>(null);
  const [activos, setActivos] = useState<PasoTutorial[] | null>(null);
  const [i, setI] = useState(0);

  const iniciar = useCallback(() => {
    // Solo los pasos cuya zona existe ahora (ej. sin datos de backlog no hay botón Backlog).
    const presentes = (pasos ?? []).filter((p) => buscar(p));
    if (!presentes.length) return;
    setActivos(presentes);
    setI(0);
  }, [pasos]);

  return (
    <Contexto.Provider value={{ pasos, registrar: setPasos, abierto: activos !== null, iniciar }}>
      {children}
      {activos && <Recorrido pasos={activos} i={i} onIr={setI} onCerrar={() => setActivos(null)} />}
    </Contexto.Provider>
  );
}

/**
 * Declara el recorrido de la pantalla. Los pasos deben ser estables (una constante del módulo):
 * se registran al montar y se quitan al salir de la pantalla.
 */
export function useTutorial(pasos: PasoTutorial[]) {
  const ctx = useContext(Contexto);
  const registrar = ctx?.registrar;
  useEffect(() => {
    if (!registrar) return;
    registrar(pasos);
    if (process.env.NODE_ENV !== "production") {
      // Aviso en desarrollo: un paso cuya zona no existe se salta sin decir nada al usuario.
      const t = setTimeout(() => {
        const faltan = pasos.filter((p) => !buscar(p)).map((p) => `«${p.titulo}» (${p.selector})`);
        if (faltan.length) console.warn(`[tutorial] Pasos sin zona en esta pantalla: ${faltan.join(", ")}`);
      }, 1500);
      return () => {
        clearTimeout(t);
        registrar(null);
      };
    }
    return () => registrar(null);
  }, [pasos, registrar]);
}

/** Botón «Tutorial» del pie del sidebar: solo si la pantalla tiene recorrido y el usuario no lo apagó. */
export function BotonTutorial({ colapsado, className }: { colapsado: boolean; className?: string }) {
  const ctx = useContext(Contexto);
  const [pref] = usePreferencias();
  if (!ctx?.pasos?.length || !pref.tutoriales) return null;
  return (
    <button
      type="button"
      onClick={ctx.iniciar}
      title={colapsado ? "Tutorial" : "Recorrido guiado por esta pantalla"}
      aria-label="Abrir el tutorial de esta pantalla"
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 font-label text-xs tracking-[0.08em] uppercase transition-colors border-l-2 whitespace-nowrap cursor-pointer",
        colapsado && "justify-center px-0 w-8",
        ctx.abierto ? "border-flesan-red bg-bg text-text" : "border-transparent text-muted hover:text-text hover:bg-bg",
        className,
      )}
    >
      <GraduationCap className={cn("w-4 h-4 shrink-0", ctx.abierto && "text-flesan-red")} />
      {!colapsado && "Tutorial"}
    </button>
  );
}

// ---------------------------------------------------------------- recorrido

const MARGEN = 6; // aire entre la zona y el borde iluminado
const SEPARACION = 14; // distancia entre la zona y el globo
const ANCHO_GLOBO = 368;
const BORDE_PANTALLA = 16;

// Botones del globo con esquina suave (no los angulares de .btn-flesan, que se cortaban acá).
const BOTON =
  "inline-flex items-center justify-center gap-1 h-8 px-3.5 rounded-flesan border text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer";

type Lado = "abajo" | "arriba" | "derecha" | "izquierda" | "centro";
interface Caja {
  top: number;
  left: number;
  width: number;
  height: number;
}

function buscar(paso: PasoTutorial): HTMLElement | null {
  const todos = document.querySelectorAll<HTMLElement>(paso.selector);
  return todos[paso.indice ?? 0] ?? todos[0] ?? null;
}

function Recorrido({ pasos, i, onIr, onCerrar }: { pasos: PasoTutorial[]; i: number; onIr: (i: number) => void; onCerrar: () => void }) {
  const paso = pasos[i];
  const ultimo = i === pasos.length - 1;
  const [zona, setZona] = useState<Caja | null>(null);
  const [globo, setGlobo] = useState<{ top: number; left: number; lado: Lado; flecha: number } | null>(null);
  const globoRef = useRef<HTMLDivElement>(null);

  // Al cambiar de paso, la zona se trae al centro de la pantalla.
  useEffect(() => {
    buscar(paso)?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }, [paso]);

  // Sigue la zona en cada cuadro (scroll suave, cambios de tamaño, filtros que mueven el layout).
  useLayoutEffect(() => {
    let raf = 0;
    let previa = "";
    const medir = () => {
      const el = buscar(paso);
      if (el) {
        const r = el.getBoundingClientRect();
        const caja = { top: r.top - MARGEN, left: r.left - MARGEN, width: r.width + MARGEN * 2, height: r.height + MARGEN * 2 };
        const clave = `${Math.round(caja.top)},${Math.round(caja.left)},${Math.round(caja.width)},${Math.round(caja.height)}`;
        if (clave !== previa) {
          previa = clave;
          setZona(caja);
        }
      }
      raf = requestAnimationFrame(medir);
    };
    medir();
    return () => cancelAnimationFrame(raf);
  }, [paso]);

  // Ubica el globo: abajo, arriba, a la derecha o a la izquierda de la zona, el primero que quepa.
  useLayoutEffect(() => {
    if (!zona || !globoRef.current) return;
    const g = globoRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = zona.left + zona.width / 2;
    const cy = zona.top + zona.height / 2;
    const fijarX = (x: number) => Math.min(Math.max(x, BORDE_PANTALLA), vw - g.width - BORDE_PANTALLA);
    const fijarY = (y: number) => Math.min(Math.max(y, BORDE_PANTALLA), vh - g.height - BORDE_PANTALLA);
    const abajo = zona.top + zona.height + SEPARACION;
    const arriba = zona.top - SEPARACION - g.height;
    const derecha = zona.left + zona.width + SEPARACION;
    const izquierda = zona.left - SEPARACION - g.width;

    let pos: { top: number; left: number; lado: Lado; flecha: number };
    if (abajo + g.height <= vh - BORDE_PANTALLA) {
      const left = fijarX(cx - g.width / 2);
      pos = { top: abajo, left, lado: "abajo", flecha: cx - left };
    } else if (arriba >= BORDE_PANTALLA) {
      const left = fijarX(cx - g.width / 2);
      pos = { top: arriba, left, lado: "arriba", flecha: cx - left };
    } else if (derecha + g.width <= vw - BORDE_PANTALLA) {
      const top = fijarY(cy - g.height / 2);
      pos = { top, left: derecha, lado: "derecha", flecha: cy - top };
    } else if (izquierda >= BORDE_PANTALLA) {
      const top = fijarY(cy - g.height / 2);
      pos = { top, left: izquierda, lado: "izquierda", flecha: cy - top };
    } else {
      // La zona ocupa casi toda la pantalla: el globo va abajo al centro, encima de ella.
      pos = { top: vh - g.height - BORDE_PANTALLA * 2, left: (vw - g.width) / 2, lado: "centro", flecha: 0 };
    }
    const largo = pos.lado === "abajo" || pos.lado === "arriba" ? g.width : g.height;
    pos.flecha = Math.min(Math.max(pos.flecha, 20), largo - 20);
    setGlobo(pos);
  }, [zona, i]);

  // Teclado: flechas para moverse, Esc para salir. El foco pasa al globo.
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowRight") {
        if (ultimo) onCerrar();
        else onIr(i + 1);
      } else if (e.key === "ArrowLeft" && i > 0) onIr(i - 1);
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [i, ultimo, onIr, onCerrar]);

  useEffect(() => {
    globoRef.current?.focus({ preventScroll: true });
  }, [i]);

  return createPortal(
    <div className="fixed inset-0 z-[70]" aria-live="polite">
      {/* Capa que bloquea la pantalla mientras dura el recorrido (también la zona iluminada). */}
      <div className="absolute inset-0" />

      {/* Zona iluminada: su sombra gigante es el velo sobre el resto de la pantalla. */}
      {zona && (
        <div
          aria-hidden
          className="absolute rounded-flesan outline-2 outline-flesan-red pointer-events-none transition-all duration-300 ease-out"
          style={{ top: zona.top, left: zona.left, width: zona.width, height: zona.height, boxShadow: "0 0 0 200vmax var(--color-tutorial-velo)" }}
        />
      )}

      <div
        ref={globoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-titulo"
        aria-describedby="tutorial-texto"
        tabIndex={-1}
        className={cn("absolute card shadow-lg p-4 flex flex-col gap-3 outline-none transition-[top,left,opacity] duration-300 ease-out", !globo && "opacity-0")}
        style={{ outline: "none", width: ANCHO_GLOBO, maxWidth: `calc(100vw - ${BORDE_PANTALLA * 2}px)`, top: globo?.top ?? 0, left: globo?.left ?? 0 }}
      >
        {globo && globo.lado !== "centro" && <Flecha lado={globo.lado} posicion={globo.flecha} />}

        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-faint">
            Paso {i + 1} de {pasos.length}
          </p>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el tutorial"
            title="Cerrar (Esc)"
            className="-mt-1 -mr-1 w-7 h-7 flex items-center justify-center rounded-md text-faint hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 id="tutorial-titulo" className="text-[0.9375rem] font-semibold text-text leading-tight">
            {paso.titulo}
          </h2>
          <p id="tutorial-texto" className="text-sm text-muted leading-relaxed">
            {paso.texto}
          </p>
        </div>

        {/* Con flex-wrap, si no caben los puntos y los botones en una línea, los botones bajan. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
          {/* Puntos de avance (cuadrados, como el bullet de marca): el actual en rojo. */}
          <div className="flex items-center gap-1 shrink-0">
            {pasos.map((p, j) => (
              <button
                key={p.selector + j}
                type="button"
                onClick={() => onIr(j)}
                aria-label={`Ir al paso ${j + 1}: ${p.titulo}`}
                className={cn("w-2 h-2 transition-colors cursor-pointer", j === i ? "bg-flesan-red" : j < i ? "bg-muted" : "bg-border-strong")}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {i > 0 && (
              <button type="button" onClick={() => onIr(i - 1)} className={cn(BOTON, "border-border-strong text-muted hover:text-text hover:border-text")}>
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={() => (ultimo ? onCerrar() : onIr(i + 1))}
              className={cn(BOTON, "border-flesan-red bg-flesan-red text-white hover:bg-flesan-red-dark hover:border-flesan-red-dark")}
            >
              {ultimo ? "Terminar" : "Siguiente"}
              {!ultimo && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Flecha del globo hacia la zona iluminada. */
function Flecha({ lado, posicion }: { lado: Exclude<Lado, "centro">; posicion: number }) {
  const estilo: CSSProperties =
    lado === "abajo"
      ? { top: -6, left: posicion - 6 }
      : lado === "arriba"
        ? { bottom: -6, left: posicion - 6 }
        : lado === "derecha"
          ? { left: -6, top: posicion - 6 }
          : { right: -6, top: posicion - 6 };
  const bordes = { abajo: "border-l border-t", arriba: "border-r border-b", derecha: "border-l border-b", izquierda: "border-r border-t" }[lado];
  return <span aria-hidden className={cn("absolute w-3 h-3 rotate-45 bg-surface border-border", bordes)} style={estilo} />;
}
