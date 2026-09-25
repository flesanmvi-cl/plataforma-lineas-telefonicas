"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/lab-graficos/echart";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, jerarquia, type NodoJerarquia } from "@/lib/lab-graficos/datos";
import { baseEcharts, rellenoBloqueEcharts } from "@/lib/lab-graficos/estilos";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { mezclar, textoSobre } from "./utilidades";

interface NodoSol {
  name: string;
  value?: number;
  children?: NodoSol[];
  itemStyle: Record<string, unknown>;
  label: { color: string };
}

// Cada línea toma un color de la paleta; región y obra lo aclaran hacia el fondo.
function aSol(t: TokensLab, nodo: NodoJerarquia, color: string, nivel: number): NodoSol {
  const tono = mezclar(color, t.fondoTarjeta, (nivel - 1) * 0.28);
  return {
    name: nodo.nombre,
    value: nodo.valor,
    itemStyle: { borderColor: t.fondoTarjeta, borderWidth: 1.5, ...rellenoBloqueEcharts(t, tono), borderRadius: Math.min(t.radio, 4) },
    label: { color: t.superficie === "contorno" || nivel === 3 ? t.texto : textoSobre(tono) },
    children: nodo.hijos?.map((h) => aSol(t, h, color, nivel + 1)),
  };
}

// Sunburst de tres niveles (línea → región → obra). Clic en un sector para entrar; clic
// al centro para subir un nivel o en «Vista completa» para volver al inicio.
export function SunburstDrilldown({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const raiz = useMemo(() => jerarquia(), []);
  // La ruta se guarda junto a los tokens con que se navegó: si cambia el tema, ECharts
  // redibuja desde la raíz y la ruta vuelve a quedar vacía sin un efecto aparte.
  const [navegacion, setNavegacion] = useState<{ tokens: TokensLab | null; ruta: string[] }>({ tokens: null, ruta: [] });
  const ruta = navegacion.tokens === t ? navegacion.ruta : [];
  // Cambiar la versión entrega una opción nueva y ECharts vuelve a la vista completa.
  const [version, setVersion] = useState(0);

  const option = useMemo<EChartsOption>(() => {
    void version;
    const etiqueta = { fontFamily: t.fuente, fontSize: t.tamano.eje - 1, minAngle: 10 };
    return {
      ...baseEcharts(t),
      tooltip: {
        ...baseEcharts(t).tooltip,
        trigger: "item",
        formatter: (p: unknown) => {
          const { name, value, treePathInfo } = p as { name: string; value: number; treePathInfo: { name: string }[] };
          const camino = treePathInfo.slice(1, -1).map((n) => n.name).join(" › ");
          return `${camino ? `<span style="opacity:.7">${camino}</span><br/>` : ""}<b>${name}</b>: ${formato.millones(value)}`;
        },
      },
      series: [
        {
          type: "sunburst",
          radius: ["0%", "94%"],
          center: ["50%", "52%"],
          nodeClick: "rootToNode",
          emphasis: { focus: "ancestor" },
          data: raiz.hijos?.map((h, i) => aSol(t, h, t.colores[i % t.colores.length], 1)),
          levels: [
            { itemStyle: { color: t.fondoTarjeta, borderColor: t.eje, borderWidth: 1 }, label: { show: false } },
            { r0: "16%", r: "44%", label: { ...etiqueta, rotate: 0, fontWeight: 600 } },
            { r0: "44%", r: "72%", label: { ...etiqueta, rotate: "radial" } },
            { r0: "72%", r: "80%", label: { ...etiqueta, position: "outside", padding: 2, show: t.etiquetas === "directas" } },
          ],
        },
      ],
    };
  }, [t, raiz, version]);

  const eventos = useMemo(
    () => ({
      click: (p: unknown) => {
        const { treePathInfo, data } = p as { treePathInfo?: { name: string }[]; data?: { children?: unknown[] } };
        if (!treePathInfo) return;
        const camino = treePathInfo.slice(1).map((n) => n.name);
        setNavegacion((prev) => {
          const actual = prev.tokens === t ? prev.ruta : [];
          // Clic en el centro (el nodo que ya es raíz): sube un nivel.
          if (camino.join("|") === actual.join("|")) return { tokens: t, ruta: actual.slice(0, -1) };
          // Una obra (hoja) no tiene hijos: ECharts no entra, la ruta tampoco cambia.
          if (!data?.children?.length) return { tokens: t, ruta: actual };
          return { tokens: t, ruta: camino };
        });
      },
    }),
    [t],
  );

  return (
    <div style={{ position: "relative", height: alto }}>
      <EChart option={option} alto={alto} eventos={eventos} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: t.fuente,
          fontSize: t.tamano.eje,
          color: t.textoSuave,
        }}
      >
        {ruta.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setNavegacion({ tokens: t, ruta: [] });
              setVersion((v) => v + 1);
            }}
            style={{
              border: `1px solid ${t.eje}`,
              background: t.fondoTarjeta,
              color: t.texto,
              borderRadius: Math.min(t.radio, 999),
              padding: "2px 10px",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Vista completa
          </button>
        ) : null}
        <span>{ruta.length ? ruta.join(" › ") : "Clic en un sector para entrar"}</span>
      </div>
    </div>
  );
}
