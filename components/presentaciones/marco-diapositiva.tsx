"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

export const ANCHO_DIAPOSITIVA = 1600;
export const ALTO_DIAPOSITIVA = 900;
const PADDING_X = 64;
const ALTO_ENCABEZADO = 150;
const ALTO_PIE = 56;

export interface ParametrosDiapositiva {
  titulo: string;
  presentacion: string;
  numero: number;
  total: number;
  filtros: string[];
  /** Id del bloque (data-bloque) si la diapositiva muestra solo uno. */
  bloque: string | null;
}

/** Lee los parámetros del modo diapositiva desde la URL (?diapositiva=1&t=…&p=…&n=…&de=…&f=…&b=…). */
export function leerParametrosDiapositiva(search: string): ParametrosDiapositiva | null {
  const q = new URLSearchParams(search);
  if (!q.has("diapositiva")) return null;
  return {
    titulo: q.get("t") ?? "",
    presentacion: q.get("p") ?? "",
    numero: Number(q.get("n") ?? 1),
    total: Number(q.get("de") ?? 1),
    filtros: (q.get("f") ?? "").split("|").filter(Boolean),
    bloque: q.get("b"),
  };
}

declare global {
  interface Window {
    __diapositivaLista?: boolean;
  }
}

/**
 * Marco 16:9 (1600×900) de una diapositiva: encabezado con el título, la presentación y los
 * filtros; la vista al centro, escalada para caber; pie de marca. Sin sidebar ni barra superior.
 * Cuando todo terminó de dibujarse marca window.__diapositivaLista = true (lo espera la captura).
 */
export function MarcoDiapositiva({ p, children }: { p: ParametrosDiapositiva; children: ReactNode }) {
  const contenido = useRef<HTMLDivElement>(null);
  const escala = useRef<HTMLDivElement>(null);
  const anchoUtil = ANCHO_DIAPOSITIVA - PADDING_X * 2;
  const altoUtil = ALTO_DIAPOSITIVA - ALTO_ENCABEZADO - ALTO_PIE - 24;

  // Solo un bloque: se marca el objetivo y su camino, y el CSS oculta todo lo demás.
  useLayoutEffect(() => {
    const raiz = contenido.current;
    if (!raiz || !p.bloque) return;
    const objetivo = raiz.querySelector<HTMLElement>(`[data-bloque="${CSS.escape(p.bloque)}"]`);
    if (!objetivo) return;
    objetivo.setAttribute("data-bloque-objetivo", "");
    let n: HTMLElement | null = objetivo.parentElement;
    while (n && n !== raiz) {
      n.setAttribute("data-camino-bloque", "");
      n = n.parentElement;
    }
  }, [p.bloque]);

  // Escala para que la vista quepa en el área útil: se mide, se ensancha el lienzo en la misma
  // proporción (así el contenido se reacomoda a más ancho) y se vuelve a medir.
  useEffect(() => {
    const caja = escala.current;
    if (!caja) return;
    let vivo = true;
    // Parte de la última escala aplicada y solo escribe si cambia: si no, cada ajuste dispara
    // el ResizeObserver de nuevo y el ciclo no termina (la página se congela).
    let actual = 1;
    const aplicar = (s: number) => {
      caja.style.width = `${anchoUtil / s}px`;
      caja.style.transform = `scale(${s})`;
    };
    aplicar(actual);
    const ajustar = () => {
      if (!vivo) return;
      let s = actual;
      for (let i = 0; i < 4; i++) {
        const nuevo = Math.min(1, altoUtil / Math.max(caja.scrollHeight, 1));
        if (Math.abs(nuevo - s) < 0.01) break;
        s = nuevo;
        aplicar(s);
      }
      actual = s;
    };
    const observador = new ResizeObserver(ajustar);
    observador.observe(caja);
    // Listo: letras cargadas, gráficos iniciados y la escala ajustada.
    const marcarLista = async () => {
      await document.fonts?.ready;
      await new Promise((r) => setTimeout(r, 1800));
      ajustar();
      // Con temporizador y no con requestAnimationFrame: en pestañas o iframes en segundo plano
      // el navegador pausa los cuadros y la captura esperaría para siempre.
      setTimeout(() => (window.__diapositivaLista = true), 150);
    };
    marcarLista();
    return () => {
      vivo = false;
      observador.disconnect();
    };
  }, [anchoUtil, altoUtil]);

  const corte = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div
      data-diapositiva-marco
      data-modo-bloque={p.bloque ? "" : undefined}
      style={{
        width: ANCHO_DIAPOSITIVA,
        height: ALTO_DIAPOSITIVA,
        background: "var(--color-bg)",
        borderTop: "8px solid var(--color-flesan-red)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <header style={{ height: ALTO_ENCABEZADO, padding: `36px ${PADDING_X}px 0`, display: "flex", alignItems: "flex-end", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <span className="label-meta text-muted" style={{ fontSize: 13 }}>
            {p.presentacion} · {p.numero} / {p.total}
          </span>
          <span className="display-title text-text" style={{ fontSize: 50, lineHeight: 1 }}>
            {p.titulo}
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, textAlign: "right" }}>
          <span className="text-muted" style={{ fontSize: 15 }}>
            Corte al {corte}
          </span>
          {p.filtros.length > 0 && (
            <span className="text-faint" style={{ fontSize: 13, maxWidth: 620 }}>
              {p.filtros.join(" · ")}
            </span>
          )}
        </div>
      </header>

      <div ref={contenido} style={{ flex: 1, padding: `12px ${PADDING_X}px`, overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <div ref={escala} data-diapositiva-contenido style={{ transformOrigin: "top center", width: anchoUtil }}>
          {children}
        </div>
      </div>

      <footer
        className="text-muted"
        style={{ height: ALTO_PIE, padding: `0 ${PADDING_X}px`, display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}
      >
        <span style={{ width: 10, height: 10, background: "var(--color-flesan-red)" }} />
        <span className="text-text" style={{ fontWeight: 600 }}>
          Grupo Flesan
        </span>
        <span>Confianza que construye</span>
        <span style={{ marginLeft: "auto" }}>Uso interno · generado el {corte}</span>
        <span className="text-text tabular" style={{ fontWeight: 600 }}>
          {p.numero} / {p.total}
        </span>
      </footer>
    </div>
  );
}
