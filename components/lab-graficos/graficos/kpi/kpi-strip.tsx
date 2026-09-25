"use client";

import { useState } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato } from "@/lib/lab-graficos/datos";
import { ALTO_FRANJA, estiloTarjeta, PuntoAcento } from "./tarjeta-kpi";
import { CifraAnimada } from "./cifra-animada";

interface Cifra {
  nombre: string;
  valor: number;
  formatear: (v: number) => string;
  /** Variación contra el mes anterior, ya formateada. */
  delta: string;
  /** true favorable, false desfavorable, null neutro. */
  bueno: boolean | null;
  detalle: string;
}

const CIFRAS: Cifra[] = [
  { nombre: "Obras activas", valor: 24, formatear: (v) => formato.entero(v), delta: "+2", bueno: null, detalle: "3 inicios y 1 cierre en el mes" },
  { nombre: "Ventas del mes", valor: 1284, formatear: (v) => `$ ${formato.entero(v)} M`, delta: "+7,9%", bueno: true, detalle: "Ago: $ 1.190 M" },
  { nombre: "Margen bruto", valor: 18.4, formatear: (v) => formato.porcentaje(v, 1), delta: "−1,1 pp", bueno: false, detalle: "Ago: 19,5%" },
  { nombre: "Avance físico", valor: 68, formatear: (v) => formato.porcentaje(v), delta: "+4 pp", bueno: true, detalle: "Programado: 71%" },
  { nombre: "Dotación", valor: 3412, formatear: (v) => formato.entero(v), delta: "−2,3%", bueno: null, detalle: "Ago: 3.492 personas" },
  { nombre: "Días sin accidentes", valor: 158, formatear: (v) => formato.entero(v), delta: "Meta 180", bueno: null, detalle: "Récord del año: 171" },
];

// Fila de KPIs compacta tipo «strip» (HTML): seis cifras en una banda con separadores finos, para
// el encabezado de un tablero. Pasar el mouse por una cifra cambia la variación por su detalle.
export function KpiStrip({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [foco, setFoco] = useState<number | null>(null);
  const franja = t.kpi.acento === "franja";
  const cifra = Math.round(t.kpi.cifra * 0.72);

  return (
    <div style={{ height: alto, display: "flex", alignItems: "center", fontFamily: t.fuente }}>
      <div
        style={{
          ...estiloTarjeta(t),
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxHeight: alto,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
          paddingTop: franja ? ALTO_FRANJA : 0,
        }}
      >
        {franja && <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: ALTO_FRANJA, background: t.acento }} />}
        {CIFRAS.map((c, i) => {
          const colorDelta = c.bueno === null ? t.textoSuave : c.bueno ? t.estado.bueno : t.estado.malo;
          return (
            <div
              key={c.nombre}
              onMouseEnter={() => setFoco(i)}
              onMouseLeave={() => setFoco(null)}
              style={{
                padding: "10px 14px",
                minWidth: 0,
                // Separador fino a la izquierda (el primero de cada fila queda pegado al borde).
                boxShadow: i === 0 ? undefined : `inset 1px 0 0 ${t.grilla}`,
                background: foco === i ? (t.oscuro ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : undefined,
                transition: "background 150ms",
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontSize: t.tamano.eje - 1,
                  color: t.textoSuave,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <PuntoAcento t={t} color={t.colores[i % t.colores.length]} />
                {c.nombre}
              </div>
              <div
                style={{
                  fontSize: cifra,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: t.texto,
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                <CifraAnimada valor={c.valor} formatear={c.formatear} t={t} retraso={i * 0.05} />
              </div>
              <div
                style={{
                  fontSize: t.tamano.eje - 1,
                  fontWeight: foco === i ? 400 : 600,
                  color: foco === i ? t.texto : colorDelta,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 2,
                }}
              >
                {foco === i ? c.detalle : c.delta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
