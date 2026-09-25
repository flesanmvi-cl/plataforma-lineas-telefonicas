"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Archive, ChevronDown, Copy, Download, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "../botones/boton-lab";
import { estiloEtiqueta } from "../botones/comun";
import { MenuLab, type OpcionMenu } from "../botones/menu-lab";

const ACCIONES_FILA: OpcionMenu[] = [
  { id: "editar", etiqueta: "Editar", icono: Pencil, detalle: "E" },
  { id: "duplicar", etiqueta: "Duplicar", icono: Copy },
  { id: "descargar", etiqueta: "Descargar ficha", icono: Download },
  { id: "eliminar", etiqueta: "Eliminar obra", icono: Trash2, peligro: true },
];

const ACCIONES_LOTE: OpcionMenu[] = [
  { id: "exportar", etiqueta: "Exportar selección", icono: Download },
  { id: "archivar", etiqueta: "Archivar", icono: Archive },
  { id: "eliminar", etiqueta: "Eliminar selección", icono: Trash2, peligro: true },
];

interface PropsDesplegable {
  opciones: OpcionMenu[];
  etiqueta: string;
  kebab?: boolean;
  onElegir: (op: OpcionMenu) => void;
}

/** Disparador (botón «Acciones» o kebab de tres puntos) con su menú. */
function Desplegable({ opciones, etiqueta, kebab, onElegir }: PropsDesplegable) {
  const idMenu = useId();
  const contenedor = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  const aria = { "aria-haspopup": "menu" as const, "aria-expanded": abierto, "aria-controls": abierto ? idMenu : undefined };

  return (
    <div ref={contenedor} style={{ position: "relative", display: "inline-flex" }}>
      {kebab ? (
        <BotonLab
          ref={disparador}
          variante="fantasma"
          tamano="sm"
          soloIcono
          icono={MoreVertical}
          aria-label={etiqueta}
          title={etiqueta}
          forzar={abierto ? "activo" : undefined}
          onClick={() => setAbierto((a) => !a)}
          {...aria}
        />
      ) : (
        <BotonLab ref={disparador} variante="contorno" tamano="sm" iconoDerecha={ChevronDown} onClick={() => setAbierto((a) => !a)} {...aria}>
          {etiqueta}
        </BotonLab>
      )}
      <MenuLab
        id={idMenu}
        etiqueta={etiqueta}
        abierto={abierto}
        onCerrar={cerrar}
        onElegir={onElegir}
        opciones={opciones}
        contenedorRef={contenedor}
        disparadorRef={disparador}
        alinear={kebab ? "derecha" : "izquierda"}
      />
    </div>
  );
}

// Menú de acciones desde un botón «Acciones» o un kebab por fila; lo destructivo va al final y en rojo.
export function MenuAcciones({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [ultima, setUltima] = useState<OpcionMenu | null>(null);

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 10, paddingTop: 4, fontFamily: t.fuente }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 8px 8px 12px",
          border: `1px solid ${t.grilla}`,
          borderRadius: Math.min(t.radio, 10),
        }}
      >
        <Desplegable opciones={ACCIONES_LOTE} etiqueta="Acciones" onElegir={setUltima} />
        <span style={{ ...estiloEtiqueta(t), marginRight: "auto" }}>3 obras seleccionadas</span>
        <span style={{ fontSize: t.tamano.etiqueta, color: t.texto }}>Obra Costa</span>
        <Desplegable opciones={ACCIONES_FILA} etiqueta="Acciones de Obra Costa" kebab onElegir={setUltima} />
      </div>
      <span
        aria-live="polite"
        style={{ ...estiloEtiqueta(t), marginTop: "auto", color: ultima?.peligro ? t.estado.malo : t.textoSuave }}
      >
        {ultima
          ? ultima.peligro
            ? `${ultima.etiqueta}: pediría confirmación antes de borrar.`
            : `Elegiste: ${ultima.etiqueta}`
          : "Abre el menú con clic o Enter; flechas para moverse, Esc para cerrar."}
      </span>
    </div>
  );
}
