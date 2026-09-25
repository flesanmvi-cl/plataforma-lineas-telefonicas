"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, LINEAS } from "@/lib/lab-graficos/datos";
import { baseEcharts, leyendaEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";

const DATOS = LINEAS.map((nombre, i) => ({ nombre, valor: [4200, 3100, 2650, 1480, 920][i] }));
const TOTAL = DATOS.reduce((s, d) => s + d.valor, 0);

// Dona con el total al centro; al pasar el mouse por un sector, el centro muestra ese sector.
// El valor central es HTML sobre el canvas: así cambiarlo no redibuja la dona.
export function DonaValorCentral({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [activo, setActivo] = useState<number | null>(null);
  const conLeyenda = t.etiquetas === "leyenda";
  const centroX = conLeyenda ? 36 : 50;

  const option = useMemo<EChartsOption>(
    () => ({
      ...baseEcharts(t),
      tooltip: { show: false },
      legend: leyendaEcharts(t, {
        orient: "vertical",
        top: "middle",
        left: "auto",
        right: 4,
        itemGap: 10,
        formatter: (nombre: string) => {
          const d = DATOS.find((x) => x.nombre === nombre);
          return d ? `${nombre}  ${formato.porcentaje((d.valor / TOTAL) * 100)}` : nombre;
        },
      }),
      series: [
        {
          type: "pie",
          radius: conLeyenda ? ["58%", "80%"] : ["50%", "70%"],
          center: [`${centroX}%`, "50%"],
          padAngle: 1.5,
          avoidLabelOverlap: true,
          label: {
            show: !conLeyenda,
            formatter: "{b}",
            color: t.textoSuave,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
          },
          labelLine: { show: !conLeyenda, length: 8, length2: 8, lineStyle: { color: t.eje } },
          emphasis: { scale: true, scaleSize: 6, label: { show: !conLeyenda } },
          data: DATOS.map((d, i) => {
            const color = t.colores[i % t.colores.length];
            return { name: d.nombre, value: d.valor, itemStyle: rellenoBloqueEcharts(t, color) };
          }),
        },
      ],
    }),
    [t, conLeyenda, centroX],
  );

  const eventos = useMemo(
    () => ({
      mouseover: (p: unknown) => setActivo((p as { dataIndex: number }).dataIndex),
      mouseout: () => setActivo(null),
    }),
    [],
  );

  const d = activo !== null ? DATOS[activo] : null;
  const color = activo !== null ? t.colores[activo % t.colores.length] : t.texto;

  return (
    <div style={{ position: "relative", height: alto }}>
      <EChart option={option} alto={alto} eventos={eventos} />
      <div
        aria-live="polite"
        style={{
          position: "absolute",
          left: `${centroX}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
          fontFamily: t.fuente,
          lineHeight: 1.15,
        }}
      >
        <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, whiteSpace: "nowrap" }}>{d ? d.nombre : "Total cartera"}</div>
        <div style={{ fontSize: t.tamano.valor, fontWeight: 700, color, transition: `color ${t.animacion.duracion / 3}ms` }}>
          {formato.millones(d ? d.valor : TOTAL)}
        </div>
        <div style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>
          {d ? formato.porcentaje((d.valor / TOTAL) * 100, 1) : `${DATOS.length} líneas`}
        </div>
      </div>
    </div>
  );
}
