"use client";

import { useMemo, useState } from "react";
import { linearGradientDef } from "@nivo/core";
import { ResponsiveRadar, type RadarCustomLayerProps } from "@nivo/radar";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { useUidSvg } from "./superficie-svg";

const DIMENSIONES = ["Plazo", "Costo", "Seguridad", "Calidad", "Productividad", "Satisfacción"];
const OBRAS_RADAR = ["Obra Norte", "Obra Costa", "Obra Sur"];

type Fila = Record<string, string | number>;

/** Puntaje 0-100 de cada obra en cada dimensión de desempeño. */
function puntajes(): Fila[] {
  const r = azar(701);
  const sesgo = OBRAS_RADAR.map(() => DIMENSIONES.map(() => r()));
  return DIMENSIONES.map((dimension, k) => {
    const fila: Fila = { dimension };
    OBRAS_RADAR.forEach((obra, i) => (fila[obra] = Math.round(48 + sesgo[i][k] * 48)));
    return fila;
  });
}

/** Rótulos directos: cada obra se nombra junto al eje donde más se despega de las demás. */
function capaRotulos(t: TokensLab) {
  return function CapaRotulos({ data, keys, colorByKey, centerX, centerY, radiusScale, angleStep }: RadarCustomLayerProps<Fila>) {
    return (
      <g transform={`translate(${centerX}, ${centerY})`} pointerEvents="none">
        {keys.map((k) => {
          let mejor = 0;
          let ventaja = -Infinity;
          data.forEach((fila, i) => {
            const otros = keys.filter((o) => o !== k).map((o) => Number(fila[o]));
            const v = Number(fila[k]) - (otros.length ? Math.max(...otros) : 0);
            if (v > ventaja) {
              ventaja = v;
              mejor = i;
            }
          });
          const angulo = mejor * angleStep - Math.PI / 2;
          const radio = radiusScale(Number(data[mejor][k])) + 12;
          const x = Math.cos(angulo) * radio;
          const y = Math.sin(angulo) * radio;
          return (
            <text
              key={k}
              x={x}
              y={y}
              dy="0.35em"
              textAnchor={Math.abs(x) < 8 ? "middle" : x > 0 ? "start" : "end"}
              fill={colorByKey[k]}
              fontFamily={t.fuente}
              fontSize={t.tamano.eje}
              fontWeight={700}
              stroke={t.fondoTarjeta}
              strokeWidth={3}
              paintOrder="stroke"
            >
              {k.replace("Obra ", "")}
            </text>
          );
        })}
      </g>
    );
  };
}

// Radar (Nivo): tres obras en seis dimensiones de desempeño. Los chips de arriba muestran u
// ocultan cada obra; pasar el mouse por un eje muestra los puntajes de esa dimensión.
export function Radar({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(() => puntajes(), []);
  const [visibles, setVisibles] = useState<string[]>(OBRAS_RADAR);
  const { animate, motionConfig } = movimientoNivo(t);
  const leyenda = t.etiquetas === "leyenda";
  const colorDe = (obra: string) => t.colores[OBRAS_RADAR.indexOf(obra) % t.colores.length];
  const sombra = t.superficie === "sombras" || t.superficie === "glass";
  const degradado = t.superficie === "degradado";
  const contorno = t.superficie === "contorno";
  const Rotulos = useMemo(() => capaRotulos(t), [t]);
  const altoChips = leyenda ? 28 : 0;
  const uid = useUidSvg();

  function alternar(obra: string) {
    setVisibles((prev) => {
      if (prev.includes(obra)) return prev.length > 1 ? prev.filter((o) => o !== obra) : prev;
      return OBRAS_RADAR.filter((o) => o === obra || prev.includes(o));
    });
  }

  return (
    <div style={{ height: alto, display: "flex", flexDirection: "column" }}>
      {leyenda && (
        <div role="group" aria-label="Obras visibles" style={{ display: "flex", gap: 6, flexWrap: "wrap", height: altoChips }}>
          {OBRAS_RADAR.map((obra) => {
            const on = visibles.includes(obra);
            const c = colorDe(obra);
            return (
              <button
                key={obra}
                type="button"
                aria-pressed={on}
                onClick={() => alternar(obra)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "2px 10px",
                  height: 22,
                  cursor: "pointer",
                  borderRadius: 999,
                  border: `1px solid ${on ? conAlfa(c, 0.5) : t.eje}`,
                  background: on ? conAlfa(c, 0.1) : "transparent",
                  color: on ? t.texto : t.textoSuave,
                  fontFamily: t.fuente,
                  fontSize: t.tamano.eje,
                  opacity: on ? 1 : 0.6,
                  transition: `all ${Math.min(t.animacion.duracion, 200)}ms`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: on ? c : t.eje }} />
                {obra}
              </button>
            );
          })}
        </div>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          filter: sombra ? `drop-shadow(0 ${t.superficie === "glass" ? 0 : 6}px 8px ${conAlfa(t.acento, 0.35)})` : undefined,
        }}
      >
        <ResponsiveRadar<Fila>
          data={datos}
          keys={visibles}
          indexBy="dimension"
          maxValue={100}
          colors={({ key }) => colorDe(key)}
          theme={temaNivo(t)}
          animate={animate}
          motionConfig={motionConfig}
          curve={t.curva === "suave" ? "catmullRomClosed" : "linearClosed"}
          gridShape={t.radio >= 12 ? "circular" : "linear"}
          gridLevels={t.grillaModo === "completa" ? 5 : t.grillaModo === "minima" ? 3 : 1}
          gridLabelOffset={12}
          borderWidth={contorno ? 2 : Math.max(t.grosorLinea, 1.5)}
          fillOpacity={contorno ? 0.04 : degradado ? 1 : t.superficie === "glass" ? 0.28 : 0.16}
          dotSize={contorno ? 7 : 5}
          dotColor={contorno ? t.fondoTarjeta : { from: "color" }}
          dotBorderWidth={contorno ? 2 : 0}
          dotBorderColor={{ from: "color" }}
          defs={
            degradado
              ? OBRAS_RADAR.map((obra, i) =>
                  linearGradientDef(`${uid}-rg${i}`, [
                    { offset: 0, color: colorDe(obra), opacity: 0.45 },
                    { offset: 100, color: colorDe(obra), opacity: 0.02 },
                  ]),
                )
              : []
          }
          fill={degradado ? OBRAS_RADAR.map((obra, i) => ({ id: `${uid}-rg${i}`, match: { key: obra } })) : []}
          layers={leyenda ? ["grid", "layers", "slices", "dots"] : ["grid", "layers", "slices", "dots", Rotulos]}
          margin={{ top: 22, right: 64, bottom: 18, left: 64 }}
        />
      </div>
    </div>
  );
}
