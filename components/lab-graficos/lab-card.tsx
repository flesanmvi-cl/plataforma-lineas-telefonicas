"use client";

import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { FAMILIAS, seccionDe, type GraficoLab } from "@/components/lab-graficos/tipos";

interface LabCardProps {
  grafico: GraficoLab;
  alto?: number;
  /** Oculta el enlace al comparador (dentro del comparador mismo). */
  sinEnlace?: boolean;
  /** Título alternativo (ej. el nombre de la superficie en el comparador). */
  titulo?: ReactNode;
  /** Sin familia, librería ni pie: la tarjeta como iría en un tablero real. */
  limpia?: boolean;
  className?: string;
}

/**
 * Tarjeta del laboratorio: monta el gráfico recién cuando entra en pantalla (la galería
 * tiene decenas) y aísla errores para que un gráfico roto no bote la página.
 */
export function LabCard({ grafico, alto = 280, sinEnlace, titulo, limpia, className }: LabCardProps) {
  const t = useTokens();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const familia = FAMILIAS.find((f) => f.id === grafico.familia)?.nombre;
  const { Componente } = grafico;
  const crece = ["botones", "formularios"].includes(seccionDe(grafico.familia));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <article ref={ref} data-superficie={t.superficie} className={cn("lab-card flex flex-col gap-3 p-4 min-w-0", className)}>
      <header className="flex items-start gap-2 min-w-0">
        <div className="min-w-0">
          {!limpia && <p className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint">{familia}</p>}
          <h3 className="text-[0.9375rem] font-semibold text-text leading-snug" style={{ fontFamily: t.fuente }}>
            {titulo ?? grafico.nombre}
          </h3>
        </div>
        {grafico.plantilla && !limpia && (
          <span className="ml-auto shrink-0 font-label text-[0.625rem] font-semibold tracking-[0.08em] uppercase bg-text text-bg px-1.5 py-0.5 rounded-flesan-sm">
            Plantilla actual
          </span>
        )}
        <span
          hidden={limpia}
          className={cn(
            "shrink-0 font-label text-[0.625rem] font-semibold tracking-[0.08em] uppercase border border-border-strong text-muted px-1.5 py-0.5 rounded-flesan-sm",
            !grafico.plantilla && "ml-auto",
          )}
        >
          {grafico.libreria}
        </span>
      </header>

      {/* Los gráficos necesitan alto fijo (ECharts, visx); botones y controles crecen con su
          contenido para no montarse sobre el título cuando la tarjeta es angosta. */}
      <div style={crece ? { minHeight: alto } : { height: alto }} className="min-w-0">
        {visible ? (
          <LimiteError nombre={grafico.nombre}>
            <Componente alto={alto} />
          </LimiteError>
        ) : (
          <div className="skeleton w-full h-full" />
        )}
      </div>

      <footer hidden={limpia} className="flex flex-wrap items-center gap-1.5 pt-1">
        {grafico.interacciones.slice(0, 3).map((i) => (
          <span key={i} className="text-[0.6875rem] text-muted bg-bg px-2 py-0.5 rounded-full">
            {i}
          </span>
        ))}
        {!sinEnlace && (
          <Link
            href={`/ui-kit/laboratorio/${seccionDe(grafico.familia)}/comparador?g=${grafico.id}`}
            className="ml-auto flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-flesan-red"
          >
            Comparar estilos
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </footer>
    </article>
  );
}

export class LimiteError extends Component<{ nombre: string; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }

  componentDidCatch(e: Error, info: ErrorInfo) {
    console.error(`[lab-graficos] ${this.props.nombre}`, e, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center text-center text-xs text-muted border border-dashed border-border-strong rounded-flesan-sm p-4">
          No se pudo dibujar este gráfico: {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}
