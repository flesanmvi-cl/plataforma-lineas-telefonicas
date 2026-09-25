"use client";

import { useMemo } from "react";
import { ResponsiveChord } from "@nivo/chord";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, LINEAS } from "@/lib/lab-graficos/datos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";

// Matriz de servicios entre líneas de negocio (MM$): fila = quien presta, columna = quien recibe.
function intercambios() {
  const r = azar(101);
  return LINEAS.map((_, i) => LINEAS.map((__, j) => (i === j ? 0 : Math.round(5 + r() * (i === 0 || j === 0 ? 60 : 30)))));
}

// Chord (Nivo): intercambio de servicios entre líneas de negocio. Pasar el mouse por un arco
// resalta sus cintas; por una cinta, el par que intercambia.
export function ChordLineas({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const matriz = useMemo(intercambios, []);
  const { animate, motionConfig } = movimientoNivo(t);
  const conLeyenda = t.etiquetas === "leyenda";
  const sombra = t.superficie === "sombras" || t.superficie === "glass";
  const contorno = t.superficie === "contorno";
  const degradado = t.superficie === "degradado";

  return (
    <div
      style={{
        height: alto,
        filter: sombra ? `drop-shadow(0 ${t.superficie === "glass" ? 0 : 5}px 8px ${conAlfa(t.acento, 0.3)})` : undefined,
      }}
    >
      <ResponsiveChord
        data={matriz}
        keys={LINEAS}
        margin={{ top: 28, right: conLeyenda ? 120 : 28, bottom: 28, left: 28 }}
        valueFormat={(v) => formato.millones(v * 10)}
        padAngle={0.04}
        innerRadiusRatio={0.9}
        innerRadiusOffset={0.02}
        colors={t.colores}
        arcOpacity={contorno ? 0.35 : 1}
        activeArcOpacity={1}
        inactiveArcOpacity={0.25}
        arcBorderWidth={contorno ? 1.5 : 0}
        arcBorderColor={{ from: "color" }}
        ribbonBlendMode={degradado ? (t.oscuro ? "screen" : "multiply") : "normal"}
        ribbonOpacity={contorno ? 0.12 : degradado ? 0.55 : 0.4}
        activeRibbonOpacity={0.85}
        inactiveRibbonOpacity={0.06}
        ribbonBorderWidth={contorno ? 1 : 0}
        ribbonBorderColor={{ from: "color" }}
        enableLabel={!conLeyenda}
        label={(d) => (d.id.length > 10 ? `${d.id.slice(0, 9)}.` : d.id)}
        labelOffset={10}
        labelRotation={-90}
        labelTextColor={t.texto}
        theme={temaNivo(t)}
        animate={animate}
        motionConfig={motionConfig}
        legends={
          conLeyenda
            ? [
                {
                  anchor: "right",
                  direction: "column",
                  justify: false,
                  translateX: 112,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemsSpacing: 4,
                  symbolSize: 10,
                  symbolShape: "square",
                  itemTextColor: t.textoSuave,
                },
              ]
            : []
        }
      />
    </div>
  );
}
