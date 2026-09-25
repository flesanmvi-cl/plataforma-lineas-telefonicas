"use client";

import { Download, MoreHorizontal, Plus, Send, Share2 } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta } from "./comun";

// Cómo conviven las jerarquías: un solo primario por zona, el resto contorno, fantasma o texto.
export function BarraAcciones({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, fontFamily: t.fuente }}>
      {/* Encabezado de página */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingBottom: 14, borderBottom: `1px solid ${t.grilla}` }}>
        <div style={{ minWidth: 0, marginRight: "auto" }}>
          <div style={{ fontSize: t.tamano.etiqueta + 4, fontWeight: 600, color: t.texto }}>Obras en ejecución</div>
          <div style={estiloEtiqueta(t)}>24 registros · actualizado hoy 08:30</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <BotonLab variante="fantasma" soloIcono icono={MoreHorizontal} aria-label="Más acciones" title="Más acciones" />
          <BotonLab variante="fantasma" icono={Share2}>
            Compartir
          </BotonLab>
          <BotonLab variante="contorno" icono={Download}>
            Exportar
          </BotonLab>
          <BotonLab icono={Plus}>Nuevo registro</BotonLab>
        </div>
      </div>

      {/* Pie de formulario */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <BotonLab variante="texto" style={{ color: t.estado.malo, marginRight: "auto" }}>
          Eliminar borrador
        </BotonLab>
        <BotonLab variante="fantasma">Cancelar</BotonLab>
        <BotonLab variante="contorno">Guardar borrador</BotonLab>
        <BotonLab iconoDerecha={Send}>Enviar a revisión</BotonLab>
      </div>
    </div>
  );
}
