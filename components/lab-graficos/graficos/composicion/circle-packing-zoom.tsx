"use client";

import { useId, useMemo, useState } from "react";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, jerarquia, type NodoJerarquia } from "@/lib/lab-graficos/datos";
import { movimientoNivo, temaNivo } from "@/lib/lab-graficos/estilos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { mezclar, superficieNivo, textoSobre } from "./utilidades";

interface Burbuja {
  id: string;
  nombre: string;
  linea: number;
  valor?: number;
  children?: Burbuja[];
}

const SEP = " / ";

// Los nombres de región se repiten entre líneas: el id es la ruta completa.
function aBurbuja(nodo: NodoJerarquia, padre: string | null, linea: number): Burbuja {
  const id = padre ? `${padre}${SEP}${nodo.nombre}` : nodo.nombre;
  return { id, nombre: nodo.nombre, linea, valor: nodo.valor, children: nodo.hijos?.map((h) => aBurbuja(h, id, linea)) };
}

function profundidad(id: string, raiz: string) {
  return id === raiz ? 0 : id.split(SEP).length;
}

// Círculos anidados línea → región → obra. Clic en un círculo para acercarse; clic en el
// círculo ya ampliado o en «Subir» para volver un nivel.
export function CirclePackingZoom({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const uid = useId().replace(/:/g, "");
  const datos = useMemo<Burbuja>(() => {
    const r = jerarquia();
    // La raíz no entra en la ruta: cada línea parte con id = su nombre.
    return { id: "Grupo", nombre: r.nombre, linea: 0, children: r.hijos?.map((h, i) => aBurbuja(h, null, i)) };
  }, []);
  const [zoom, setZoom] = useState<string | null>(null);
  const sup = superficieNivo(t, uid);
  const { animate, motionConfig } = movimientoNivo(t);
  const nivelVisible = zoom ? profundidad(zoom, datos.id) + 1 : 1;

  function subir() {
    if (!zoom) return;
    const partes = zoom.split(SEP);
    setZoom(partes.length > 1 ? partes.slice(0, -1).join(SEP) : null);
  }

  const colorDe = (depth: number, linea: number) => {
    if (depth === 0) return t.oscuro ? mezclar(t.fondoTarjeta, "#FFFFFF", 0.04) : mezclar(t.fondoTarjeta, "#000000", 0.03);
    const base = t.colores[linea % t.colores.length];
    return mezclar(base, t.fondoTarjeta, (depth - 1) * 0.3);
  };

  return (
    <div style={{ position: "relative", height: alto, ...sup.estilo }}>
      <ResponsiveCirclePacking<Burbuja>
        data={datos}
        id="id"
        value="valor"
        valueFormat={(v) => formato.millones(v)}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        padding={3}
        theme={temaNivo(t)}
        colors={(n) => {
          const c = colorDe(n.depth, n.data.linea);
          if (n.depth === 0) return c;
          if (t.superficie === "contorno") return conAlfa(c, 0.16);
          return t.superficie === "glass" ? conAlfa(c, 0.78) : c;
        }}
        borderWidth={sup.borderWidth}
        borderColor={sup.borderColor}
        defs={sup.defs}
        fill={sup.fill}
        zoomedId={zoom}
        enableLabels
        label={(n) => n.data.nombre}
        labelsFilter={(l) => l.node.depth === nivelVisible}
        labelsSkipRadius={16}
        labelTextColor={(n) => (t.superficie === "contorno" ? t.texto : textoSobre(colorDe(n.depth, n.data.linea)))}
        animate={animate}
        motionConfig={motionConfig}
        onClick={(n) => {
          if (n.id === zoom) subir();
          else if (n.data.children?.length) setZoom(n.depth === 0 ? null : n.id);
        }}
        tooltip={(n) => (
          <div style={temaNivo(t).tooltip.container}>
            <span style={{ opacity: 0.7 }}>{n.id.split(SEP).slice(0, -1).join(" › ")}</span>
            {n.depth > 1 ? <br /> : null}
            <b>{n.data.nombre}</b>: {n.formattedValue} · {formato.porcentaje(n.percentage, 1)}
          </div>
        )}
      />
      <div style={{ position: "absolute", top: 0, left: 0, display: "flex", gap: 8, alignItems: "center", fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave }}>
        {zoom ? (
          <button
            type="button"
            onClick={subir}
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
            Subir
          </button>
        ) : null}
        <span>{zoom ? zoom.split(SEP).join(" › ") : "Clic para acercarse"}</span>
      </div>
    </div>
  );
}
