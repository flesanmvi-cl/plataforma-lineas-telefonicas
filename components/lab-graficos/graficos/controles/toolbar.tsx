"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  LayoutGrid,
  List,
  Map as IconoMapa,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { anilloFoco, estiloEtiqueta, estiloPista, radioInterno, transicionCss } from "../botones/comun";
import { useInteraccion } from "../botones/use-interaccion";

/** Botón de ícono dentro de un grupo; «activo» se comunica con aria-pressed. */
function BotonGrupo({ icono: Icono, etiqueta, activo, onClick }: { icono: LucideIcon; etiqueta: string; activo: boolean; onClick: () => void }) {
  const t = useTokens();
  const { hover, foco, manejadores } = useInteraccion();
  const lado = t.boton.alto.sm;
  return (
    <button
      type="button"
      aria-pressed={activo}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      {...manejadores}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: lado,
        height: lado,
        padding: 0,
        border: "0 solid transparent",
        borderRadius: radioInterno(t),
        backgroundColor: activo ? conAlfa(t.acento, t.oscuro ? 0.22 : 0.12) : hover ? conAlfa(t.texto, 0.07) : "transparent",
        color: activo ? t.acento : hover ? t.texto : t.textoSuave,
        cursor: "pointer",
        transition: transicionCss(t),
        ...anilloFoco(t, foco),
      }}
    >
      <Icono size={15} strokeWidth={activo ? 2.4 : 2} aria-hidden />
    </button>
  );
}

function Divisor() {
  const t = useTokens();
  return <span aria-hidden style={{ width: 1, alignSelf: "stretch", margin: "4px 3px", background: conAlfa(t.texto, 0.14) }} />;
}

const ALINEAR = [
  { id: "left" as const, icono: AlignLeft, etiqueta: "Alinear a la izquierda" },
  { id: "center" as const, icono: AlignCenter, etiqueta: "Centrar" },
  { id: "right" as const, icono: AlignRight, etiqueta: "Alinear a la derecha" },
];
const VISTAS = [
  { id: "lista", icono: List, etiqueta: "Vista lista" },
  { id: "grilla", icono: LayoutGrid, etiqueta: "Vista grilla" },
  { id: "mapa", icono: IconoMapa, etiqueta: "Vista mapa" },
];

// Grupos de íconos en barra: formato (alternables e independientes), alineación y vista (exclusivos).
export function Toolbar({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [negrita, setNegrita] = useState(true);
  const [cursiva, setCursiva] = useState(false);
  const [subrayado, setSubrayado] = useState(false);
  const [alinear, setAlinear] = useState<"left" | "center" | "right">("left");
  const [vista, setVista] = useState("grilla");
  const barra = { ...estiloPista(t), display: "inline-flex", alignItems: "center", gap: 2, padding: 3, borderRadius: t.boton.radio };

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, fontFamily: t.fuente }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div role="toolbar" aria-label="Formato de texto" style={barra}>
          <BotonGrupo icono={Bold} etiqueta="Negrita" activo={negrita} onClick={() => setNegrita((v) => !v)} />
          <BotonGrupo icono={Italic} etiqueta="Cursiva" activo={cursiva} onClick={() => setCursiva((v) => !v)} />
          <BotonGrupo icono={Underline} etiqueta="Subrayado" activo={subrayado} onClick={() => setSubrayado((v) => !v)} />
          <Divisor />
          {ALINEAR.map((a) => (
            <BotonGrupo key={a.id} icono={a.icono} etiqueta={a.etiqueta} activo={alinear === a.id} onClick={() => setAlinear(a.id)} />
          ))}
        </div>
        <div role="toolbar" aria-label="Vista" style={barra}>
          {VISTAS.map((v) => (
            <BotonGrupo key={v.id} icono={v.icono} etiqueta={v.etiqueta} activo={vista === v.id} onClick={() => setVista(v.id)} />
          ))}
        </div>
      </div>
      <p
        style={{
          margin: 0,
          padding: "8px 10px",
          borderRadius: Math.min(t.radio, 8),
          border: `1px dashed ${t.eje}`,
          fontSize: t.tamano.etiqueta,
          color: t.texto,
          textAlign: alinear,
          fontWeight: negrita ? 700 : 400,
          fontStyle: cursiva ? "italic" : "normal",
          textDecoration: subrayado ? "underline" : "none",
        }}
      >
        Informe semanal de avance de obra
      </p>
      <span style={estiloEtiqueta(t)}>Vista elegida: {VISTAS.find((v) => v.id === vista)?.etiqueta.replace("Vista ", "")}</span>
    </div>
  );
}
