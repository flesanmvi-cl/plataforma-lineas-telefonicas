"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, serieMensual } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { CifraAnimada } from "./cifra-animada";
import { Sparkline } from "./sparkline";

interface Kpi {
  nombre: string;
  valores: number[];
  formatear: (v: number) => string;
  delta: string;
  sube: boolean;
  /** Si el cambio es favorable (define el color del chip, no la dirección de la flecha). */
  bueno: boolean;
}

function kpis(): Kpi[] {
  const ventas = serieMensual(3, 820, 38, 60);
  const margen = serieMensual(8, 196, -1.5, 8).map((v) => v / 10);
  const avance = serieMensual(12, 18, 5, 2).map((v) => Math.min(v, 100));
  return [
    { nombre: "Ventas del mes", valores: ventas, formatear: (v) => `$ ${formato.entero(v)} M`, delta: "+8,4%", sube: true, bueno: true },
    { nombre: "Margen bruto", valores: margen, formatear: (v) => formato.porcentaje(v, 1), delta: "−1,2 pp", sube: false, bueno: false },
    { nombre: "Avance físico", valores: avance, formatear: (v) => formato.porcentaje(v), delta: "+6 pp", sube: true, bueno: true },
  ];
}

// Tarjeta de KPI (HTML + motion + sparkline visx): cifra que cuenta desde cero, chip de
// variación y sparkline. Pasar el mouse por la sparkline muestra el valor de ese mes.
export function KpiCifras({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ height: alto }}>
      <ParentSize>{({ width }) => (width > 0 ? <Contenido ancho={width} alto={alto} t={t} /> : null)}</ParentSize>
    </div>
  );
}

function Contenido({ ancho, alto, t }: { ancho: number; alto: number; t: TokensLab }) {
  const datos = useMemo(() => kpis(), []);
  const columnas = ancho >= 480;
  const gap = 12;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columnas ? `repeat(${datos.length}, 1fr)` : "1fr",
        gridTemplateRows: columnas ? "1fr" : `repeat(${datos.length}, 1fr)`,
        gap,
        height: alto,
        fontFamily: t.fuente,
      }}
    >
      {datos.map((k, i) => (
        <Celda
          key={k.nombre}
          k={k}
          i={i}
          t={t}
          columnas={columnas}
          ancho={columnas ? (ancho - gap * (datos.length - 1)) / datos.length : ancho}
          alto={columnas ? alto : (alto - gap * (datos.length - 1)) / datos.length}
        />
      ))}
    </div>
  );
}

function estiloCelda(t: TokensLab, color: string) {
  const radio = Math.min(t.radio, 16);
  switch (t.superficie) {
    case "contorno":
      return { border: `1px solid ${t.eje}`, borderRadius: radio };
    case "sombras":
      return { background: t.fondoTarjeta, borderRadius: radio, boxShadow: `0 8px 20px -10px ${conAlfa(color, 0.45)}, 0 1px 3px rgba(0,0,0,0.06)` };
    case "degradado":
      return { borderRadius: radio, background: `linear-gradient(160deg, ${conAlfa(color, 0.12)}, ${conAlfa(color, 0)} 70%)` };
    case "glass":
      return {
        borderRadius: radio,
        background: t.oscuro ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
        border: `1px solid ${t.oscuro ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)"}`,
        boxShadow: `0 10px 30px -14px ${conAlfa(color, 0.5)}`,
        backdropFilter: "blur(8px)",
      };
    default:
      return { borderRadius: radio, background: conAlfa(t.texto, t.oscuro ? 0.04 : 0.025) };
  }
}

function Celda({ k, i, t, columnas, ancho, alto }: { k: Kpi; i: number; t: TokensLab; columnas: boolean; ancho: number; alto: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const color = t.colores[i % t.colores.length];
  const colorChip = k.bueno ? t.estado.bueno : t.estado.malo;
  const Flecha = k.sube ? ArrowUpRight : ArrowDownRight;
  const pad = columnas ? 12 : 10;
  const ultimo = k.valores[k.valores.length - 1];
  const anchoTexto = columnas ? ancho - pad * 2 : Math.max(ancho * 0.5, 150);
  const anchoSpark = columnas ? ancho - pad * 2 : ancho - anchoTexto - pad * 3;
  const altoSpark = columnas ? Math.max(alto - 118, 30) : alto - pad * 2;

  return (
    <div
      style={{
        ...estiloCelda(t, color),
        padding: pad,
        display: "flex",
        flexDirection: columnas ? "column" : "row",
        alignItems: columnas ? "stretch" : "center",
        gap: pad,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ width: columnas ? "auto" : anchoTexto, minWidth: 0 }}>
        <div style={{ color: t.textoSuave, fontSize: t.tamano.eje, display: "flex", justifyContent: "space-between", gap: 6 }}>
          <span>{k.nombre}</span>
          {hover !== null && (
            <span style={{ color: t.texto }}>
              {MESES[hover]}: {k.formatear(k.valores[hover])}
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: columnas ? "column" : "row",
            alignItems: columnas ? "flex-start" : "center",
            columnGap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: t.texto, fontSize: t.tamano.valor, fontWeight: 600, lineHeight: 1.15, marginTop: 2, whiteSpace: "nowrap" }}>
            <CifraAnimada valor={ultimo} formatear={k.formatear} t={t} retraso={i * 0.08} />
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              marginTop: columnas ? 6 : 2,
              padding: "1px 7px 1px 4px",
              borderRadius: 999,
              fontSize: t.tamano.eje,
              fontWeight: 600,
              color: colorChip,
              background: conAlfa(colorChip, t.oscuro ? 0.2 : 0.1),
              border: t.superficie === "contorno" ? `1px solid ${conAlfa(colorChip, 0.5)}` : "1px solid transparent",
            }}
          >
            <Flecha size={13} strokeWidth={2.4} aria-hidden />
            {k.delta}
            {columnas && <span style={{ fontWeight: 400, color: t.textoSuave, marginLeft: 4 }}>vs mes anterior</span>}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-end" }}>
        <Sparkline valores={k.valores} ancho={anchoSpark} alto={altoSpark} color={color} t={t} onHover={setHover} />
      </div>
    </div>
  );
}
