"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { calcularTokens, resolverFuente, type TemaLab, type TokensLab } from "@/lib/estandar/tema";

// Tokens de las piezas del estándar. En la plantilla el tema es fijo (ESTANDAR.tema): no se
// edita en pantalla. Los proveedores editables (panel «Tema») viven en el laboratorio de diseño.

interface ValorContexto {
  tema: TemaLab;
  tokens: TokensLab;
}

const Contexto = createContext<ValorContexto | null>(null);

export function useLabTema(): ValorContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useLabTema debe usarse dentro de LabTemaFijo");
  return ctx;
}

/** Atajo para los gráficos: solo los tokens. */
export function useTokens(): TokensLab {
  return useLabTema().tokens;
}

/**
 * Tema fijo (no se guarda ni se edita): envuelve la Guía de estilo, las Plantillas y el
 * constructor de maquetas.
 */
export function LabTemaFijo({ tema, children }: { tema: TemaLab; children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  const [fuentesListas, setFuentesListas] = useState(0);

  useEffect(() => {
    setMontado(true);
    document.fonts?.ready.then(() => setFuentesListas((n) => n + 1));
  }, []);

  const oscuro = montado && resolvedTheme === "dark";
  // Al capturar una diapositiva (?diapositiva=1) no hay animaciones: se ve el estado final.
  const temaEfectivo = useMemo(
    () => (montado && window.location.search.includes("diapositiva=") ? { ...tema, animacion: "sin" as const } : tema),
    [tema, montado],
  );
  const tokens = useMemo(
    () => calcularTokens(temaEfectivo, oscuro, montado ? resolverFuente(temaEfectivo.fuente) : "sans-serif"),
    // fuentesListas fuerza el recálculo cuando terminan de cargar las letras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [temaEfectivo, oscuro, fuentesListas, montado],
  );
  return <Contexto.Provider value={{ tema, tokens }}>{children}</Contexto.Provider>;
}
