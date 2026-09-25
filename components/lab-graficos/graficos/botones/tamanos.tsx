"use client";

import { Plus } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta, type TamanoBoton } from "./comun";

const FILAS: { tamano: TamanoBoton; nombre: string }[] = [
  { tamano: "sm", nombre: "Chico" },
  { tamano: "md", nombre: "Mediano" },
  { tamano: "lg", nombre: "Grande" },
];

// Chico, mediano y grande en tres variantes: alto y texto salen de la densidad del tema.
export function Tamanos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, fontFamily: t.fuente }}>
      {FILAS.map((f) => (
        <div key={f.tamano} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...estiloEtiqueta(t), width: 70, flexShrink: 0 }}>
            {f.nombre}
            <br />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{t.boton.alto[f.tamano]} px</span>
          </span>
          <BotonLab tamano={f.tamano} icono={Plus}>
            Nuevo
          </BotonLab>
          <BotonLab tamano={f.tamano} variante="contorno">
            Exportar
          </BotonLab>
          <BotonLab tamano={f.tamano} variante="fantasma">
            Cancelar
          </BotonLab>
        </div>
      ))}
    </div>
  );
}
