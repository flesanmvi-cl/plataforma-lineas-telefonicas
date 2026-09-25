"use client";

import { cn } from "@/lib/cn";
import { graficoPorId } from "@/components/lab-graficos/catalogo";
import { LabCard } from "@/components/lab-graficos/lab-card";

// Tablero de ejemplo armado con gráficos del catálogo: sirve para ver si la combinación
// del panel «Tema» funciona con varios gráficos juntos, que es donde se nota lo recargado.
const BLOQUES: { id: string; titulo: string; span: string; alto: number }[] = [
  { id: "kpi-cifras", titulo: "Indicadores del período", span: "xl:col-span-12", alto: 150 },
  { id: "area-brush", titulo: "Evolución de la venta", span: "xl:col-span-8", alto: 320 },
  { id: "dona-valor-central", titulo: "Mix por línea de negocio", span: "xl:col-span-4", alto: 320 },
  { id: "pipeline-chevrones", titulo: "Pipeline comercial", span: "xl:col-span-4", alto: 240 },
  { id: "heatmap-obras", titulo: "Actividad por obra y semana", span: "xl:col-span-4", alto: 240 },
  { id: "bullet", titulo: "Avance real contra meta", span: "xl:col-span-4", alto: 240 },
  { id: "coropleta-chile", titulo: "Venta por región", span: "xl:col-span-7", alto: 360 },
  { id: "tabla-barras-celda", titulo: "Detalle por obra", span: "xl:col-span-5", alto: 360 },
  { id: "gantt-obra", titulo: "Programa de la obra principal", span: "xl:col-span-12", alto: 320 },
];

export function Contexto() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="display-title text-2xl text-text">Ventas · Gerencia</h2>
        <p className="text-sm text-muted">Tablero de ejemplo: cambia el tema a la derecha y mira cómo conviven los gráficos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {BLOQUES.map((b) => {
          const g = graficoPorId(b.id);
          if (!g) return null;
          return (
            <LabCard
              key={b.id}
              grafico={g}
              alto={b.alto}
              titulo={b.titulo}
              limpia
              sinEnlace
              className={cn("md:col-span-2", b.span)}
            />
          );
        })}
      </div>
    </div>
  );
}
