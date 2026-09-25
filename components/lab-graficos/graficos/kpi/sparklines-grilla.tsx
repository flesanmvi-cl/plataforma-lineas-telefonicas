"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, OBRAS, serieMensual } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { Sparkline } from "./sparkline";
import { ALTO_FRANJA } from "./tarjeta-kpi";

/** Productividad mensual (HH por unidad) de cada obra. */
function series() {
  return OBRAS.map((obra, i) => ({
    obra: obra.replace("Obra ", ""),
    valores: serieMensual(40 + i * 7, 80 + i * 6, i % 3 === 1 ? -2.2 : 1.8 + i * 0.4, 10),
  }));
}

// Grilla de sparklines (visx): una mini serie por obra con su último valor y variación
// anual. Pasar el mouse sobre una muestra el mes y valor, y sincroniza el mes en todas.
export function SparklinesGrilla({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return <ParentSize>{({ width }) => (width > 0 ? <Grilla ancho={width} alto={alto} t={t} /> : null)}</ParentSize>;
}

function Grilla({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => series(), []);
  const [mes, setMes] = useState<number | null>(null);
  const cols = ancho >= 560 ? 3 : 2;
  const filas = Math.ceil(datos.length / cols);
  const gap = 10;
  const anchoCelda = (ancho - gap * (cols - 1)) / cols;
  const altoCelda = (alto - gap * (filas - 1)) / filas;
  // Cifra de cada celda a escala del tamaño elegido (t.kpi.cifra); la cabecera crece con ella.
  const cifra = Math.round(t.kpi.cifra * 0.55);
  const franja = t.kpi.acento === "franja";
  const altoCabecera = Math.round(t.tamano.eje * 1.4 + cifra * 1.2) + 2;
  const pad = 8;
  const variaciones = datos.map((d) => ((d.valores[d.valores.length - 1] - d.valores[0]) / d.valores[0]) * 100);
  const destacada = variaciones.indexOf(Math.max(...variaciones));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: altoCelda,
        gap,
        height: alto,
        fontFamily: t.fuente,
      }}
    >
      {datos.map((d, i) => {
        const ultimo = d.valores[d.valores.length - 1];
        const variacion = variaciones[i];
        const sube = variacion >= 0;
        // La serie destacada (mayor alza) va con el acento; el resto con el segundo color.
        const color = i === destacada ? t.acento : t.oscuro ? t.textoSuave : t.colores[1 % t.colores.length];
        const colorVar = sube ? t.estado.bueno : t.estado.malo;
        const valorMostrado = mes !== null ? d.valores[mes] : ultimo;
        return (
          <div
            key={d.obra}
            style={{
              position: "relative",
              padding: pad,
              paddingTop: pad + (franja ? ALTO_FRANJA : 0),
              borderRadius: Math.min(t.radio, 12),
              border: t.superficie === "contorno" ? `1px solid ${t.eje}` : "1px solid transparent",
              background:
                t.superficie === "degradado"
                  ? `linear-gradient(180deg, ${conAlfa(color, 0.08)}, transparent)`
                  : t.superficie === "glass"
                    ? t.oscuro
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.6)"
                    : t.superficie === "contorno"
                      ? "transparent"
                      : conAlfa(t.texto, t.oscuro ? 0.04 : 0.025),
              boxShadow: t.superficie === "sombras" || t.superficie === "glass" ? `0 6px 16px -10px ${conAlfa(color, 0.5)}` : undefined,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {franja && <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: ALTO_FRANJA, background: color }} />}
            <div style={{ height: altoCabecera, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: t.tamano.eje, color: t.textoSuave, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                  {t.kpi.acento === "punto" && <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: color }} />}
                  {d.obra}
                  {mes !== null && <span style={{ color: t.texto }}> · {MESES[mes]}</span>}
                </div>
                <div style={{ fontSize: cifra, fontWeight: 600, color: t.texto, lineHeight: 1.2 }}>
                  {formato.entero(valorMostrado)}
                </div>
              </div>
              <span style={{ fontSize: t.tamano.eje, fontWeight: 600, color: colorVar, whiteSpace: "nowrap" }}>
                {sube ? "▲" : "▼"} {formato.decimal(Math.abs(variacion))}%
              </span>
            </div>
            <Sparkline
              valores={d.valores}
              ancho={anchoCelda - pad * 2 - 2}
              alto={Math.max(altoCelda - altoCabecera - pad * 2 - 4 - (franja ? ALTO_FRANJA : 0), 16)}
              color={color}
              t={t}
              onHover={setMes}
              marca={mes}
            />
          </div>
        );
      })}
    </div>
  );
}
