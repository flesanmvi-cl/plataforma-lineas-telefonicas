"use client";

import { useId, useMemo, useState } from "react";
import { ResponsiveSwarmPlot, type SwarmPlotCustomLayerProps } from "@nivo/swarmplot";
import { motion } from "motion/react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, muestras, OBRAS } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { filtroSombraCss } from "../composicion/utilidades";
import { resumen } from "./estadistica";

const GRUPOS = OBRAS.slice(0, 4);

interface Punto {
  id: string;
  grupo: string;
  valor: number;
  horas: number;
}

// Beeswarm: cada punto es una semana-obra; el tamaño son las horas-hombre. Muestra la forma
// de la distribución sin perder los casos individuales. Los círculos se dibujan en una capa
// propia para aplicar la superficie (degradado, contorno, sombra) y la animación del tema.
// El eje nombra cada obra: no lleva leyenda; con etiquetas directas se rotula la mediana.
export function Beeswarm({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const uid = useId().replace(/:/g, "");
  const [activo, setActivo] = useState<string | null>(null);
  const { animate, motionConfig } = movimientoNivo(t);
  const datos = useMemo<Punto[]>(() => {
    const r = azar(71);
    return muestras(GRUPOS, 36, 61).map((m) => ({ ...m, horas: Math.round(200 + r() * 1400) }));
  }, []);
  const directas = t.etiquetas === "directas";
  const colorDe = (grupo: string) => t.colores[GRUPOS.indexOf(grupo) % t.colores.length];

  const medianas = useMemo(
    () => GRUPOS.map((g) => resumen(datos.filter((d) => d.grupo === g).map((d) => d.valor)).mediana),
    [datos],
  );

  const capaCirculos = ({ nodes, innerWidth }: Pick<SwarmPlotCustomLayerProps<Punto>, "nodes" | "innerWidth">) => (
    <g>
      <defs>
        {GRUPOS.map((g, i) => {
          const c = colorDe(g);
          return (
            <radialGradient key={g} id={`${uid}-r${i}`} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor={conAlfa(c, 0.45)} />
              <stop offset="1" stopColor={c} />
            </radialGradient>
          );
        })}
      </defs>
      {nodes.map((n, k) => {
        const c = colorDe(n.group);
        const i = GRUPOS.indexOf(n.group);
        const relleno =
          t.superficie === "degradado"
            ? `url(#${uid}-r${i})`
            : t.superficie === "contorno"
              ? conAlfa(c, 0.15)
              : t.superficie === "glass"
                ? conAlfa(c, 0.72)
                : c;
        return (
          <motion.circle
            key={n.id}
            initial={{ cx: n.x, cy: n.y, r: 0 }}
            animate={{ cx: n.x, cy: n.y, r: n.size / 2 }}
            transition={{ duration: t.animacion.duracion / 1000, delay: t.animacion.duracion > 0 ? (k % 36) * 0.01 : 0 }}
            fill={relleno}
            stroke={t.superficie === "contorno" ? c : t.superficie === "glass" ? "rgba(255,255,255,0.5)" : t.fondoTarjeta}
            strokeWidth={t.superficie === "contorno" ? 1.2 : 0.8}
            opacity={activo && activo !== n.group ? 0.2 : 1}
            style={{ transition: "opacity 150ms" }}
          />
        );
      })}
      {/* Con etiquetas directas, la mediana de cada obra va al final de su fila. */}
      {directas
        ? GRUPOS.map((g, i) => {
            const fila = nodes.filter((n) => n.group === g);
            const yc = fila.reduce((s, n) => s + n.y, 0) / Math.max(1, fila.length);
            return (
              <text key={g} x={innerWidth + 6} y={yc} dy="0.35em" fill={t.texto} fontFamily={t.fuente} fontSize={t.tamano.eje - 1} fontWeight={600}>
                {formato.decimal(medianas[i])}
              </text>
            );
          })
        : null}
    </g>
  );

  return (
    <div style={{ height: alto, ...filtroSombraCss(t) }}>
      <ResponsiveSwarmPlot<Punto>
        data={datos}
        groups={GRUPOS}
        id="id"
        value="valor"
        groupBy="grupo"
        layout="horizontal"
        valueScale={{ type: "linear", min: "auto", max: "auto" }}
        size={{ key: "horas", values: [200, 1600], sizes: [5, 14] }}
        spacing={1.5}
        forceStrength={4}
        simulationIterations={100}
        margin={{ top: 6, right: directas ? 44 : 10, bottom: 24, left: 88 }}
        colors={t.colores}
        theme={temaNivo(t)}
        animate={animate}
        motionConfig={motionConfig}
        enableGridX={t.grillaModo !== "sin"}
        enableGridY={t.grillaModo === "completa"}
        axisTop={null}
        axisRight={null}
        axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: 6 }}
        axisLeft={{ tickSize: 0, tickPadding: 8 }}
        useMesh
        layers={["grid", "axes", capaCirculos, "mesh"]}
        onMouseEnter={(n) => setActivo(n.group)}
        onMouseLeave={() => setActivo(null)}
        tooltip={(n) => (
          <div style={temaNivo(t).tooltip.container}>
            <span style={{ opacity: 0.7 }}>{n.group}</span>
            <br />
            <b>{formato.decimal(n.data.valor)}</b> de rendimiento · {formato.entero(n.data.horas)} HH
          </div>
        )}
      />
    </div>
  );
}
