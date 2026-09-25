"use client";

import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta, VARIANTES_BOTON, type VarianteBoton } from "./comun";

const TEXTOS: Record<VarianteBoton, string> = {
  solido: "Guardar",
  secundario: "Revisar",
  contorno: "Exportar",
  fantasma: "Cancelar",
  texto: "Ver más",
  peligro: "Eliminar",
  exito: "Aprobar",
};

// Las siete variantes lado a lado, cada una con su nombre debajo: la jerarquía completa de un vistazo.
export function Variantes({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
        alignContent: "center",
        gap: "14px 10px",
        fontFamily: t.fuente,
      }}
    >
      {VARIANTES_BOTON.map((v) => (
        <div key={v.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <BotonLab variante={v.id}>{TEXTOS[v.id]}</BotonLab>
          <span style={estiloEtiqueta(t)}>{v.nombre}</span>
        </div>
      ))}
    </div>
  );
}
