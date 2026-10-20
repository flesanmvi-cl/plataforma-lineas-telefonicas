"use client";

import { useEffect, useRef, useState } from "react";
import type { ECharts, EChartsOption } from "echarts";

interface EChartProps {
  option: EChartsOption;
  alto?: number | string;
  /** Mapas u otros recursos que hay que registrar antes de dibujar. */
  preparar?: (echarts: typeof import("echarts")) => Promise<void> | void;
  /** Eventos ECharts (click, legendselectchanged, datazoom…). */
  eventos?: Record<string, (params: unknown) => void>;
  className?: string;
  /** Fusiona las actualizaciones en vez de redibujar: la aguja de un gauge o una carrera de
   * barras animan del valor anterior al nuevo. */
  fusionar?: boolean;
}

/**
 * Envoltorio mínimo de ECharts para React: carga la librería en el cliente, redibuja al
 * cambiar la opción (sin fusionar, para que un cambio de tema se note entero) y ajusta el
 * tamaño al contenedor.
 */
export function EChart({ option, alto = 260, preparar, eventos, className, fusionar = false }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const instancia = useRef<ECharts | null>(null);
  const [listo, setListo] = useState(false);
  const optionRef = useRef(option);
  optionRef.current = option;

  useEffect(() => {
    let vivo = true;
    let observador: ResizeObserver | null = null;
    (async () => {
      const echarts = await import("echarts");
      if (preparar) await preparar(echarts);
      if (!vivo || !ref.current) return;
      const chart = echarts.init(ref.current, undefined, { renderer: "canvas" });
      instancia.current = chart;
      chart.setOption(optionRef.current, { notMerge: true });
      observador = new ResizeObserver(() => chart.resize());
      observador.observe(ref.current);
      setListo(true);
    })();
    return () => {
      vivo = false;
      observador?.disconnect();
      instancia.current?.dispose();
      instancia.current = null;
    };
    // preparar se ejecuta una vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    instancia.current?.setOption(option, { notMerge: !fusionar });
  }, [option, fusionar]);

  useEffect(() => {
    const chart = instancia.current;
    if (!chart || !eventos) return;
    for (const [nombre, fn] of Object.entries(eventos)) chart.on(nombre, fn);
    return () => {
      for (const [nombre, fn] of Object.entries(eventos)) chart.off(nombre, fn);
    };
  }, [eventos, listo]);

  return <div ref={ref} className={className} style={{ width: "100%", height: alto }} />;
}
