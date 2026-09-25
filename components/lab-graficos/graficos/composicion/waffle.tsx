"use client";

import { ResponsiveWaffle } from "@nivo/waffle";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";

const DATOS = [
  { id: "Edificación", label: "Edificación", value: 38 },
  { id: "Obras civiles", label: "Obras civiles", value: 27 },
  { id: "Minería", label: "Minería", value: 21 },
  { id: "Otras", label: "Otras", value: 14 },
];

// Gráfico de referencia (Nivo): el tema se pasa con temaNivo(t) y los colores con t.colores.
export function Waffle({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { animate, motionConfig } = movimientoNivo(t);
  return (
    <div style={{ height: alto }}>
      <ResponsiveWaffle
        data={DATOS}
        total={100}
        rows={10}
        columns={20}
        padding={2}
        colors={t.colores}
        emptyColor={t.grilla}
        borderRadius={Math.min(t.radio / 3, 4)}
        theme={temaNivo(t)}
        animate={animate}
        motionConfig={motionConfig}
        motionStagger={t.animacion.duracion > 0 ? 2 : 0}
        margin={{ top: 4, right: t.etiquetas === "leyenda" ? 120 : 4, bottom: 4, left: 4 }}
        legends={
          t.etiquetas === "leyenda"
            ? [
                {
                  anchor: "right",
                  direction: "column",
                  justify: false,
                  translateX: 116,
                  itemsSpacing: 6,
                  itemWidth: 100,
                  itemHeight: 16,
                  symbolSize: 10,
                  itemTextColor: t.textoSuave,
                },
              ]
            : []
        }
      />
    </div>
  );
}
