"use client";

import { useMemo, useState } from "react";
import { ResponsiveStream, type StreamCustomLayerProps } from "@nivo/stream";
import { linearGradientDef, type AreaCurve } from "@nivo/core";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, LINEAS, SEMANAS } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";

const CLAVES = LINEAS.slice(0, 4);

// Horas-hombre semanales por línea de negocio, con ondas desfasadas.
function horasPorSemana() {
  const r = azar(71);
  return SEMANAS.map((_, i) => {
    const fila: Record<string, number> = {};
    CLAVES.forEach((c, k) => {
      fila[c] = Math.round(30 + k * 6 + 22 * Math.sin((i + k * 3) / 3) ** 2 + r() * 12);
    });
    return fila;
  });
}

function curvaNivo(t: TokensLab): AreaCurve {
  return t.curva === "suave" ? "basis" : t.curva === "escalonada" ? "step" : "linear";
}

// Streamgraph: capas apiladas alrededor de un eje central; se lee la forma, no el valor.
// La leyenda es propia (botones) para poder encender y apagar líneas.
export function Streamgraph({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const datos = useMemo(horasPorSemana, []);
  const [ocultas, setOcultas] = useState<string[]>([]);
  const { animate, motionConfig } = movimientoNivo(t);
  const visibles = CLAVES.filter((c) => !ocultas.includes(c));
  const color = (c: string) => t.colores[CLAVES.indexOf(c) % t.colores.length];
  const conLeyenda = t.etiquetas === "leyenda";
  const altoGrafico = conLeyenda ? alto - 30 : alto;
  const sombra = t.superficie === "sombras" || t.superficie === "glass";

  // Rótulos directos: nombre de la capa en su punto más ancho.
  const CapaRotulos = ({ layers }: StreamCustomLayerProps) => (
    <g pointerEvents="none">
      {layers.map((capa) => {
        const mejor = capa.data.reduce((a, b) => (Math.abs(b.y1 - b.y2) > Math.abs(a.y1 - a.y2) ? b : a));
        if (Math.abs(mejor.y1 - mejor.y2) < 16) return null;
        return (
          <text
            key={capa.id}
            x={mejor.x}
            y={(mejor.y1 + mejor.y2) / 2}
            dy="0.35em"
            textAnchor="middle"
            fill={t.texto}
            fontFamily={t.fuente}
            fontSize={t.tamano.eje}
            fontWeight={600}
            style={{ paintOrder: "stroke", stroke: conAlfa(t.fondoTarjeta, 0.85), strokeWidth: 3 }}
          >
            {capa.label}
          </text>
        );
      })}
    </g>
  );

  return (
    <div style={{ height: alto }}>
      {conLeyenda && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, height: 30, alignItems: "flex-start" }}>
          {CLAVES.map((c) => {
            const activa = !ocultas.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={activa}
                onClick={() => setOcultas((o) => (activa ? (visibles.length > 1 ? [...o, c] : o) : o.filter((x) => x !== c)))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: `1px solid ${activa ? conAlfa(color(c), 0.5) : t.eje}`,
                  background: activa ? conAlfa(color(c), 0.1) : "transparent",
                  color: activa ? t.texto : t.textoSuave,
                  fontFamily: t.fuente,
                  fontSize: t.tamano.eje,
                  cursor: "pointer",
                  opacity: activa ? 1 : 0.6,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color(c) }} />
                {c}
              </button>
            );
          })}
        </div>
      )}
      <div
        style={{
          height: altoGrafico,
          filter: sombra ? `drop-shadow(0 ${t.superficie === "glass" ? 0 : 6}px 8px ${conAlfa(t.acento, 0.35)})` : undefined,
        }}
      >
        <ResponsiveStream
          data={datos}
          keys={visibles}
          offsetType="silhouette"
          order="insideOut"
          curve={curvaNivo(t)}
          margin={{ top: 6, right: 8, bottom: 22, left: 8 }}
          axisLeft={null}
          axisBottom={{ tickSize: 0, tickPadding: 6, format: (i: number) => (i % 2 === 0 ? SEMANAS[i] : "") }}
          enableGridX={t.grillaModo === "completa"}
          enableGridY={false}
          colors={(capa) => color(String(capa.id))}
          fillOpacity={t.superficie === "contorno" ? 0.15 : t.superficie === "glass" ? 0.75 : 0.92}
          borderWidth={t.superficie === "contorno" ? 1.5 : 0}
          borderColor={{ from: "color" }}
          defs={[
            linearGradientDef("grad-stream", [
              { offset: 0, color: "inherit" },
              { offset: 100, color: "inherit", opacity: 0.35 },
            ]),
          ]}
          fill={t.superficie === "degradado" ? [{ match: "*", id: "grad-stream" }] : []}
          enableStackTooltip
          valueFormat={(v) => `${formato.entero(v)} HH`}
          theme={temaNivo(t)}
          animate={animate}
          motionConfig={motionConfig}
          layers={t.etiquetas === "directas" ? ["grid", "axes", "layers", "slices", CapaRotulos] : ["grid", "axes", "layers", "slices"]}
        />
      </div>
    </div>
  );
}
