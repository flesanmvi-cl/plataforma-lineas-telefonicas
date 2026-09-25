"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "../botones/boton-lab";
import { estiloEtiqueta } from "../botones/comun";

const TOTAL_PAGINAS = 12;
const POR_PAGINA = 10;
const REGISTROS = 118;

/** Páginas a mostrar: primera, última, vecinas de la actual y «…» donde hay salto. */
function paginasVisibles(actual: number, total: number): (number | "…")[] {
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((p) => p >= 1 && p <= total));
  const orden = [...set].sort((a, b) => a - b);
  const salida: (number | "…")[] = [];
  orden.forEach((p, i) => {
    if (i > 0 && p - orden[i - 1] > 1) salida.push("…");
    salida.push(p);
  });
  return salida;
}

// Paginación completa (anterior/siguiente, números y «…») y una versión compacta para tarjetas.
export function Paginacion({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [pagina, setPagina] = useState(5);
  const desde = (pagina - 1) * POR_PAGINA + 1;
  const hasta = Math.min(pagina * POR_PAGINA, REGISTROS);

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, fontFamily: t.fuente }}>
      <nav aria-label="Paginación" style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <BotonLab variante="fantasma" tamano="sm" icono={ChevronLeft} disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
          Anterior
        </BotonLab>
        {paginasVisibles(pagina, TOTAL_PAGINAS).map((p, i) =>
          p === "…" ? (
            <span key={`salto-${i}`} aria-hidden style={{ ...estiloEtiqueta(t), width: 20, textAlign: "center" }}>
              …
            </span>
          ) : (
            <BotonLab
              key={p}
              tamano="sm"
              variante={p === pagina ? "solido" : "fantasma"}
              aria-current={p === pagina ? "page" : undefined}
              aria-label={`Página ${p}`}
              onClick={() => setPagina(p)}
              style={{ minWidth: t.boton.alto.sm, padding: "0 6px", fontVariantNumeric: "tabular-nums", letterSpacing: 0 }}
            >
              {p}
            </BotonLab>
          ),
        )}
        <BotonLab
          variante="fantasma"
          tamano="sm"
          iconoDerecha={ChevronRight}
          disabled={pagina === TOTAL_PAGINAS}
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente
        </BotonLab>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ ...estiloEtiqueta(t), fontVariantNumeric: "tabular-nums", marginRight: "auto" }} aria-live="polite">
          {desde}–{hasta} de {REGISTROS} registros
        </span>
        <nav aria-label="Paginación compacta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BotonLab
            variante="contorno"
            tamano="sm"
            soloIcono
            icono={ChevronLeft}
            aria-label="Página anterior"
            title="Página anterior"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
          />
          <span style={{ fontSize: t.tamano.etiqueta, color: t.texto, fontVariantNumeric: "tabular-nums", minWidth: 84, textAlign: "center" }}>
            Página {pagina} de {TOTAL_PAGINAS}
          </span>
          <BotonLab
            variante="contorno"
            tamano="sm"
            soloIcono
            icono={ChevronRight}
            aria-label="Página siguiente"
            title="Página siguiente"
            disabled={pagina === TOTAL_PAGINAS}
            onClick={() => setPagina((p) => p + 1)}
          />
        </nav>
      </div>
    </div>
  );
}
