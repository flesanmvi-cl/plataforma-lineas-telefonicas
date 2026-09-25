"use client";

import { useCallback, useId, useRef, useState } from "react";
import { CalendarClock, ChevronDown, Download, FileSpreadsheet, FileText, Send, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { BotonLab } from "./boton-lab";
import { colorSobre, colorVariante, estiloEtiqueta, type VarianteBoton } from "./comun";
import { MenuLab, type OpcionMenu } from "./menu-lab";

const PUBLICAR: OpcionMenu[] = [
  { id: "ahora", etiqueta: "Publicar ahora", icono: Send },
  { id: "programar", etiqueta: "Programar publicación", icono: CalendarClock },
  { id: "borrador", etiqueta: "Guardar como borrador", icono: FileText },
];

const EXPORTAR: OpcionMenu[] = [
  { id: "xlsx", etiqueta: "Excel", icono: FileSpreadsheet, detalle: ".xlsx" },
  { id: "pdf", etiqueta: "PDF", icono: FileText, detalle: ".pdf" },
  { id: "csv", etiqueta: "Texto separado", icono: FileText, detalle: ".csv" },
];

// Acción principal + flecha que abre las alternativas. Esc o un clic fuera cierran el menú.
export function BotonDividido({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [ultima, setUltima] = useState<string | null>(null);

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 12, paddingTop: 8, fontFamily: t.fuente }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Dividido variante="solido" texto="Publicar" icono={Send} opciones={PUBLICAR} etiquetaMenu="Opciones de publicación" onAccion={setUltima} />
        <Dividido
          variante="contorno"
          texto="Exportar"
          icono={Download}
          opciones={EXPORTAR}
          etiquetaMenu="Formatos de exportación"
          onAccion={setUltima}
          alinear="derecha"
        />
      </div>
      <span style={{ ...estiloEtiqueta(t), marginTop: "auto" }} aria-live="polite">
        {ultima ? `Elegiste: ${ultima}` : "El cuerpo ejecuta la acción habitual; la flecha abre las alternativas."}
      </span>
    </div>
  );
}

interface PropsDividido {
  variante: VarianteBoton;
  texto: string;
  icono: LucideIcon;
  opciones: OpcionMenu[];
  etiquetaMenu: string;
  onAccion: (texto: string) => void;
  alinear?: "izquierda" | "derecha";
}

function Dividido({ variante, texto, icono, opciones, etiquetaMenu, onAccion, alinear }: PropsDividido) {
  const t = useTokens();
  const idMenu = useId();
  const contenedor = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  const r = t.boton.radio;

  const base = colorVariante(t, variante);
  const conRelleno = base !== null && t.boton.relleno === "solido" && t.superficie !== "contorno";
  // La línea entre mitades usa el color del texto sobre el relleno, con poca opacidad.
  const divisor = conRelleno ? conAlfa(colorSobre(base), 0.35) : conAlfa(t.texto, 0.25);

  return (
    <div ref={contenedor} style={{ position: "relative", display: "inline-flex" }}>
      <BotonLab variante={variante} icono={icono} style={{ borderRadius: `${r}px 0 0 ${r}px` }} onClick={() => onAccion(`${texto} (acción habitual)`)}>
        {texto}
      </BotonLab>
      <span style={{ position: "relative", display: "inline-flex", marginLeft: variante === "contorno" ? -1 : 0 }}>
        <BotonLab
          ref={disparador}
          variante={variante}
          soloIcono
          icono={ChevronDown}
          aria-label={etiquetaMenu}
          title={etiquetaMenu}
          aria-haspopup="menu"
          aria-expanded={abierto}
          aria-controls={abierto ? idMenu : undefined}
          onClick={() => setAbierto((a) => !a)}
          style={{ borderRadius: `0 ${r}px ${r}px 0`, width: t.boton.alto.md - 4 }}
        />
        {/* Divisor entre mitades, encima del borde para no mezclar atajos de border */}
        <span aria-hidden style={{ position: "absolute", left: 0, top: "22%", bottom: "22%", width: 1, background: divisor, pointerEvents: "none" }} />
      </span>
      <MenuLab
        id={idMenu}
        etiqueta={etiquetaMenu}
        abierto={abierto}
        onCerrar={cerrar}
        onElegir={(op) => onAccion(`${texto} · ${op.etiqueta}`)}
        opciones={opciones}
        contenedorRef={contenedor}
        disparadorRef={disparador}
        alinear={alinear}
      />
    </div>
  );
}
