"use client";

import { useId, useState } from "react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";

const ANCHO = 120;

// Sparkline SVG escalable (ancho de la celda) con punto final y lectura al pasar el mouse.
export function Sparkline({
  t,
  valores,
  etiquetas,
  alto,
  color,
  formatear,
}: {
  t: TokensLab;
  valores: number[];
  etiquetas: string[];
  alto: number;
  color: string;
  formatear: (n: number) => string;
}) {
  const [indice, setIndice] = useState<number | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const pad = 3;
  const x = (i: number) => (i / (valores.length - 1)) * ANCHO;
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (alto - pad * 2);
  const puntos = valores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const linea = `M${puntos.join("L")}`;
  const area = `${linea}L${ANCHO},${alto}L0,${alto}Z`;
  const relleno =
    t.superficie === "degradado" || t.superficie === "glass"
      ? `url(#${uid}-g)`
      : t.superficie === "contorno"
        ? "none"
        : conAlfa(color, t.superficie === "sombras" ? 0.12 : 0.08);
  const ultimo = valores.length - 1;
  const activo = indice ?? ultimo;
  // Posición en % para los elementos HTML superpuestos (el SVG se estira en X).
  const izq = (i: number) => `${(x(i) / ANCHO) * 100}%`;

  return (
    <div
      style={{ position: "relative", width: "100%", minWidth: 96, height: alto }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const f = (e.clientX - r.left) / r.width;
        setIndice(Math.max(0, Math.min(ultimo, Math.round(f * ultimo))));
      }}
      onMouseLeave={() => setIndice(null)}
    >
      <svg width="100%" height={alto} viewBox={`0 0 ${ANCHO} ${alto}`} preserveAspectRatio="none" aria-hidden style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={t.superficie === "glass" ? 0.3 : 0.4} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={`${uid}-s`} x="-5%" y="-40%" width="110%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor={color} floodOpacity="0.45" />
          </filter>
        </defs>
        <path d={area} fill={relleno} />
        <path
          d={linea}
          fill="none"
          stroke={color}
          strokeWidth={Math.max(1.25, t.grosorLinea * 0.75)}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={t.superficie === "sombras" || t.superficie === "glass" ? `url(#${uid}-s)` : undefined}
        />
        {indice !== null && (
          <line x1={x(indice)} x2={x(indice)} y1={0} y2={alto} stroke={t.eje} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {/* Punto como HTML para que no se deforme con el estiramiento del SVG */}
      <span
        style={{
          position: "absolute",
          left: izq(activo),
          top: y(valores[activo]),
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 0 2px ${t.fondoTarjeta}`,
          pointerEvents: "none",
        }}
      />
      {indice !== null && (
        <span
          style={{
            position: "absolute",
            left: izq(indice),
            bottom: alto + 2,
            transform: `translateX(${indice > ultimo * 0.7 ? "-100%" : indice < ultimo * 0.3 ? "0" : "-50%"})`,
            padding: "2px 6px",
            borderRadius: Math.min(t.radio, 6),
            background: t.tooltip.fondo,
            color: t.tooltip.texto,
            border: `1px solid ${t.tooltip.borde}`,
            fontSize: 11,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {etiquetas[indice]} · {formatear(valores[indice])}
        </span>
      )}
    </div>
  );
}
