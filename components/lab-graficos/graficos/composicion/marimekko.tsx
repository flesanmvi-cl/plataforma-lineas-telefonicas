"use client";

import { useId } from "react";
import { ResponsiveMarimekko, type CustomLayerProps } from "@nivo/marimekko";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { superficieNivo, textoSobre } from "./utilidades";

interface Fila {
  linea: string;
  total: number;
  manoObra: number;
  materiales: number;
  equipos: number;
  subcontratos: number;
}

// Ancho de cada columna = costo total de la línea; alto de cada bloque = peso del ítem.
const DATOS: Fila[] = [
  { linea: "Edificación", total: 4200, manoObra: 38, materiales: 34, equipos: 10, subcontratos: 18 },
  { linea: "Obras civiles", total: 3100, manoObra: 24, materiales: 30, equipos: 32, subcontratos: 14 },
  { linea: "Minería", total: 2650, manoObra: 18, materiales: 22, equipos: 40, subcontratos: 20 },
  { linea: "Vialidad", total: 1480, manoObra: 22, materiales: 40, equipos: 28, subcontratos: 10 },
];

const DIMENSIONES = [
  { id: "Mano de obra", value: "manoObra" },
  { id: "Materiales", value: "materiales" },
  { id: "Equipos", value: "equipos" },
  { id: "Subcontratos", value: "subcontratos" },
];

export function Marimekko({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const uid = useId().replace(/:/g, "");
  const sup = superficieNivo(t, uid);
  const { animate, motionConfig } = movimientoNivo(t);
  const conLeyenda = t.etiquetas === "leyenda";
  const margen = { top: conLeyenda ? 26 : 6, right: 6, bottom: 22, left: 36 };
  const altoInterior = alto - margen.top - margen.bottom;

  // Nombre de la línea bajo cada columna (Marimekko no trae eje de categorías).
  const capaNombres = ({ data }: CustomLayerProps<Fila>) => (
    <g>
      {data.map((d) => (
        <text
          key={d.id}
          x={d.x + d.width / 2}
          y={altoInterior + 15}
          textAnchor="middle"
          fill={t.textoSuave}
          fontFamily={t.fuente}
          fontSize={t.tamano.eje}
        >
          {d.width > 60 ? d.data.linea : d.data.linea.slice(0, 4) + "."}
        </text>
      ))}
    </g>
  );

  // Con etiquetas directas, el ítem y su peso se rotulan dentro del bloque si cabe.
  const capaRotulos = ({ bars }: CustomLayerProps<Fila>) => (
    <g pointerEvents="none">
      {bars
        .filter((b) => b.width > 54 && b.height > 26)
        .map((b) => (
          <text
            key={b.key}
            x={b.x + 6}
            y={b.y + 15}
            fill={t.superficie === "contorno" ? t.texto : textoSobre(b.color.startsWith("#") ? b.color : t.fondoTarjeta)}
            fontFamily={t.fuente}
            fontSize={t.tamano.eje - 1}
          >
            {b.id} {formato.porcentaje(b.value)}
          </text>
        ))}
    </g>
  );

  return (
    <div style={{ height: alto, ...sup.estilo }}>
      <ResponsiveMarimekko<Fila>
        data={DATOS}
        id="linea"
        value="total"
        dimensions={DIMENSIONES}
        layout="vertical"
        offset="expand"
        innerPadding={2}
        outerPadding={3}
        margin={margen}
        colors={sup.colores}
        borderWidth={sup.borderWidth}
        borderColor={sup.borderColor}
        defs={sup.defs}
        fill={sup.fill}
        theme={temaNivo(t)}
        animate={animate}
        motionConfig={motionConfig}
        enableGridY={t.grillaModo !== "sin"}
        axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: [0, 0.25, 0.5, 0.75, 1], format: (v) => formato.porcentaje(Number(v) * 100) }}
        axisBottom={null}
        layers={["grid", "axes", "bars", capaNombres, ...(conLeyenda ? (["legends"] as const) : [capaRotulos])]}
        tooltip={({ bar }) => (
          <div style={temaNivo(t).tooltip.container}>
            <span style={{ opacity: 0.7 }}>{bar.datum.data.linea}</span>
            <br />
            <b>{bar.id}</b>: {formato.porcentaje(bar.value)} · {formato.millones((bar.datum.data.total * bar.value) / 100)}
          </div>
        )}
        legends={[
          {
            anchor: "top-left",
            direction: "row",
            translateY: -24,
            itemWidth: 92,
            itemHeight: 14,
            itemsSpacing: 4,
            symbolSize: 10,
            symbolShape: "square",
            itemTextColor: t.textoSuave,
          },
        ]}
      />
    </div>
  );
}
