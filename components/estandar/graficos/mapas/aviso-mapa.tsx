"use client";

import { MapPinOff } from "lucide-react";
import { useTokens } from "@/components/estandar/tema-context";
import { conAlfa } from "@/lib/estandar/tema";

// Aviso que reemplaza a un mapa cuando no se pudieron cargar sus datos o su mapa base.
export function AvisoMapa({ alto, texto, detalle }: { alto: number; texto: string; detalle?: string }) {
  const t = useTokens();
  return (
    <div
      role="status"
      style={{
        height: alto,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 16,
        textAlign: "center",
        fontFamily: t.fuente,
        color: t.textoSuave,
        background: conAlfa(t.oscuro ? "#FFFFFF" : "#231F20", 0.03),
        border: `1px dashed ${t.eje}`,
        borderRadius: Math.min(t.radio, 12),
      }}
    >
      <MapPinOff size={22} strokeWidth={1.75} aria-hidden />
      <span style={{ color: t.texto, fontSize: t.tamano.etiqueta, fontWeight: 600 }}>{texto}</span>
      {detalle && <span style={{ fontSize: t.tamano.eje, maxWidth: 420 }}>{detalle}</span>}
    </div>
  );
}
