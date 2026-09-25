"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, LINEAS, OBRAS_MAPA } from "@/lib/lab-graficos/datos";
import { baseEcharts, leyendaEcharts, sombraEcharts } from "@/lib/lab-graficos/estilos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { AvisoMapa } from "./aviso-mapa";
import { aHorizontal, registrarChile } from "./chile-geo";

type Orientacion = "horizontal" | "vertical";
type Obra = (typeof OBRAS_MAPA)[number];

/** Estilo de la burbuja según la superficie del tema. */
function estiloBurbuja(t: TokensLab, color: string) {
  const sombra = sombraEcharts(t, color);
  switch (t.superficie) {
    case "contorno":
      return { color: conAlfa(color, 0.15), borderColor: color, borderWidth: 1.5 };
    case "degradado":
      return {
        color: {
          type: "radial" as const,
          x: 0.35,
          y: 0.35,
          r: 0.75,
          colorStops: [
            { offset: 0, color: conAlfa(color, 0.55) },
            { offset: 1, color },
          ],
        },
        borderColor: t.fondoTarjeta,
        borderWidth: 1,
      };
    case "glass":
      return { color: conAlfa(color, 0.6), borderColor: "rgba(255,255,255,0.5)", borderWidth: 1, ...sombra };
    default:
      return { color: conAlfa(color, 0.85), borderColor: t.fondoTarjeta, borderWidth: 1, ...sombra };
  }
}

// Burbujas de obras sobre Chile: tamaño por monto y color por línea de negocio. En tarjetas
// anchas el país se gira (norte a la izquierda) para aprovechar el espacio.
export function BurbujasObras({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [orientacion, setOrientacion] = useState<Orientacion>("horizontal");
  const [error, setError] = useState(false);
  const horizontal = orientacion === "horizontal";

  const option = useMemo<EChartsOption>(() => {
    const base = baseEcharts(t);
    const lineas = LINEAS.filter((l) => OBRAS_MAPA.some((o) => o.linea === l));
    const maxMonto = Math.max(...OBRAS_MAPA.map((o) => o.monto));
    const destacada = OBRAS_MAPA.find((o) => o.monto === maxMonto);
    const tamano = (monto: number) => 8 + Math.sqrt(monto / maxMonto) * Math.min(42, alto * 0.13);
    const punto = (o: Obra) => ({
      name: o.nombre,
      value: [...(horizontal ? aHorizontal(o.lon, o.lat) : [o.lon, o.lat]), o.monto],
      ciudad: o.ciudad,
      linea: o.linea,
    });
    const conLeyenda = t.etiquetas === "leyenda";
    const colorLinea = (l: string) => t.colores[LINEAS.indexOf(l) % t.colores.length];
    const etiqueta = {
      show: t.etiquetas === "directas",
      formatter: "{b}",
      position: "right" as const,
      color: t.texto,
      fontFamily: t.fuente,
      fontSize: t.tamano.eje,
    };

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { data, color } = p as { data: ReturnType<typeof punto>; color: string };
          return `<b>${data.name}</b><br/><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${data.linea} · ${data.ciudad}<br/>Monto <b>${formato.millones(data.value[2])}</b>`;
        },
      },
      legend: leyendaEcharts(t, { data: lineas }),
      geo: {
        map: horizontal ? "chile-horizontal" : "chile",
        roam: true,
        scaleLimit: { min: 0.8, max: 10 },
        aspectScale: horizontal ? 1.25 : 0.8,
        top: conLeyenda ? 30 : 8,
        bottom: 8,
        left: 8,
        right: 8,
        silent: true,
        itemStyle: {
          areaColor: t.oscuro ? conAlfa("#FFFFFF", 0.06) : conAlfa("#231F20", 0.05),
          borderColor: t.eje,
          borderWidth: 0.6,
        },
      },
      series: [
        ...lineas.map((linea) => {
          const color = colorLinea(linea);
          return {
            name: linea,
            type: "scatter" as const,
            coordinateSystem: "geo" as const,
            data: OBRAS_MAPA.filter((o) => o.linea === linea && o !== destacada).map(punto),
            symbolSize: (v: number[]) => tamano(v[2]),
            itemStyle: estiloBurbuja(t, color),
            label: etiqueta,
            emphasis: { scale: 1.15, itemStyle: { borderColor: t.texto, borderWidth: 1.5 } },
          };
        }),
        // La obra de mayor monto late (effectScatter) para marcar el foco; comparte nombre de
        // serie con su línea para que la leyenda la filtre junto a las demás.
        ...(destacada
          ? [
              {
                name: destacada.linea,
                type: "effectScatter" as const,
                coordinateSystem: "geo" as const,
                data: [punto(destacada)],
                symbolSize: (v: number[]) => tamano(v[2]),
                showEffectOn: t.animacion.duracion > 0 ? ("render" as const) : ("emphasis" as const),
                rippleEffect: { scale: 2.2, brushType: "stroke" as const, period: 4 },
                itemStyle: estiloBurbuja(t, colorLinea(destacada.linea)),
                label: etiqueta,
                zlevel: 1,
              },
            ]
          : []),
      ],
    };
  }, [t, horizontal, alto]);

  if (error) return <AvisoMapa alto={alto} texto="No se pudo cargar el mapa de regiones." />;

  return (
    <div style={{ position: "relative" }}>
      <EChart
        option={option}
        alto={alto}
        preparar={async (echarts) => {
          try {
            await registrarChile(echarts);
          } catch {
            setError(true);
          }
        }}
      />
      <div
        role="group"
        aria-label="Orientación del mapa"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          display: "flex",
          gap: 2,
          padding: 2,
          borderRadius: 999,
          background: conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", 0.06),
          fontFamily: t.fuente,
          fontSize: t.tamano.eje,
        }}
      >
        {(["horizontal", "vertical"] as const).map((o) => {
          const activo = o === orientacion;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={activo}
              onClick={() => setOrientacion(o)}
              style={{
                padding: "2px 10px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: activo ? t.fondoTarjeta : "transparent",
                color: activo ? t.texto : t.textoSuave,
                fontWeight: activo ? 600 : 500,
                boxShadow: activo ? "0 1px 2px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {o === "horizontal" ? "Horizontal" : "Vertical"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
