"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { azar, formato, MESES } from "@/lib/lab-graficos/datos";
import {
  estiloCelda,
  estiloCeldaNum,
  estiloContenedor,
  estiloEncabezado,
  estiloTabla,
  fondoEncabezado,
  fondoFilaOpaco,
  ocultoVisual,
} from "./comun";
import { registrosObras } from "./datos-tablas";

// Encabezado fijo arriba (scroll vertical con 36 filas) y primera columna fija a la izquierda
// (scroll horizontal con 12 meses más totales). La esquina queda fija en ambos ejes.
export function TablaFijaScroll({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [activa, setActiva] = useState<string | null>(null);

  const filas = useMemo(() => {
    const r = azar(311);
    return registrosObras(36, 311).map((o) => {
      const meses = MESES.map(() => Math.round((o.presupuesto / 12) * (0.6 + r() * 0.8)));
      return { ...o, meses, total: meses.reduce((a, b) => a + b, 0) };
    });
  }, []);

  const anchoPrimera = 180;
  // Sombra suave en el borde de la columna fija para que se note que el resto pasa por debajo.
  const sombraFija = `6px 0 8px -6px ${t.oscuro ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.18)"}`;
  const esquina: CSSProperties = {
    ...estiloEncabezado(t),
    left: 0,
    zIndex: 3,
    minWidth: anchoPrimera,
    boxShadow: sombraFija,
    background: fondoEncabezado(t),
  };

  return (
    <div style={{ ...estiloContenedor(t, alto), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto" }} tabIndex={0} aria-label="Tabla con scroll en ambos ejes">
        <table style={{ ...estiloTabla(), width: "max-content", minWidth: "100%" }}>
          <caption style={ocultoVisual}>Gasto mensual por obra, en millones de pesos</caption>
          <thead>
            <tr>
              <th scope="col" style={esquina}>
                Obra
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 1 })}>
                Código
              </th>
              <th scope="col" style={estiloEncabezado(t, { col: 2 })}>
                Región
              </th>
              {MESES.map((m, j) => (
                <th key={m} scope="col" style={{ ...estiloEncabezado(t, { col: j + 3 }), textAlign: "right", minWidth: 64 }}>
                  {m}
                </th>
              ))}
              <th scope="col" style={{ ...estiloEncabezado(t, { col: 15 }), textAlign: "right", minWidth: 80 }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const enFoco = activa === f.id;
              return (
                <tr key={f.id} onMouseEnter={() => setActiva(f.id)} onMouseLeave={() => setActiva(null)}>
                  <th
                    scope="row"
                    style={{
                      ...estiloCelda(t),
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      textAlign: "left",
                      fontWeight: 600,
                      maxWidth: anchoPrimera,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      background: fondoFilaOpaco(t, i, enFoco),
                      boxShadow: sombraFija,
                    }}
                  >
                    {f.obra}
                  </th>
                  <td style={{ ...estiloCelda(t, { col: 1 }), color: t.textoSuave, background: fondoFilaOpaco(t, i, enFoco) }}>
                    {f.codigo}
                  </td>
                  <td style={{ ...estiloCelda(t, { col: 2 }), background: fondoFilaOpaco(t, i, enFoco) }}>{f.region}</td>
                  {f.meses.map((v, j) => (
                    <td key={j} style={{ ...estiloCeldaNum(t, { col: j + 3 }), background: fondoFilaOpaco(t, i, enFoco) }}>
                      {formato.entero(v)}
                    </td>
                  ))}
                  <td style={{ ...estiloCeldaNum(t, { col: 15 }), fontWeight: 700, background: fondoFilaOpaco(t, i, enFoco) }}>
                    {formato.millones(f.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "6px 10px 0", fontSize: t.tamano.eje, color: t.textoSuave }}>
        {filas.length} obras · desplázate en ambos ejes: el encabezado y la columna Obra quedan fijos
      </p>
    </div>
  );
}
