"use client";

import { ArrowRight, ChevronRight, Download, Filter, Plus, Search, Settings, Trash2 } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta } from "./comun";

// Ícono como refuerzo del texto, flecha para avanzar y botones de solo ícono (con aria-label y title).
export function ConIcono({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const fila = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const };
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, fontFamily: t.fuente }}>
      <span style={estiloEtiqueta(t)}>Ícono + texto</span>
      <div style={fila}>
        <BotonLab icono={Plus}>Nuevo registro</BotonLab>
        <BotonLab variante="contorno" icono={Download}>
          Descargar
        </BotonLab>
      </div>
      <span style={estiloEtiqueta(t)}>Texto + flecha</span>
      <div style={fila}>
        <BotonLab variante="secundario" iconoDerecha={ArrowRight}>
          Continuar
        </BotonLab>
        <BotonLab variante="texto" iconoDerecha={ChevronRight}>
          Ver detalle
        </BotonLab>
      </div>
      <span style={estiloEtiqueta(t)}>Solo ícono</span>
      <div style={{ ...fila, gap: 6 }}>
        <BotonLab variante="contorno" soloIcono icono={Search} aria-label="Buscar" title="Buscar" />
        <BotonLab variante="contorno" soloIcono icono={Filter} aria-label="Filtrar" title="Filtrar" />
        <BotonLab variante="fantasma" soloIcono icono={Settings} aria-label="Configuración" title="Configuración" />
        <BotonLab variante="fantasma" soloIcono icono={Trash2} aria-label="Eliminar" title="Eliminar" style={{ color: t.estado.malo }} />
        <BotonLab soloIcono icono={Plus} aria-label="Agregar" title="Agregar" />
      </div>
    </div>
  );
}
