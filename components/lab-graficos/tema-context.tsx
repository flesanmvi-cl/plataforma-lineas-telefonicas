"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { calcularTokens, resolverFuente, TEMA_INICIAL, type TemaLab, type TokensLab } from "@/lib/lab-graficos/tema";

const CLAVE = "cia-lab-graficos-tema";

interface ValorContexto {
  tema: TemaLab;
  setTema: (cambio: Partial<TemaLab>) => void;
  reiniciar: () => void;
  tokens: TokensLab;
}

const Contexto = createContext<ValorContexto | null>(null);

/** Tema global del laboratorio, recordado en este navegador (conveniencia, no estado crítico). */
export function LabTemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<TemaLab>(TEMA_INICIAL);
  const [fuentesListas, setFuentesListas] = useState(0);
  // Hasta montar se usan valores neutros (letra de respaldo, modo claro), iguales en servidor
  // y cliente; si no, el estilo del laboratorio no calza al hidratar.
  const [montado, setMontado] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
      if (guardado) setTemaState({ ...TEMA_INICIAL, ...guardado });
    } catch {}
    setMontado(true);
    // Al cargar las letras, se recalcula para que canvas (ECharts) tome la familia real.
    document.fonts?.ready.then(() => setFuentesListas((n) => n + 1));
  }, []);

  function setTema(cambio: Partial<TemaLab>) {
    setTemaState((prev) => {
      const siguiente = { ...prev, ...cambio };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      } catch {}
      return siguiente;
    });
  }

  function reiniciar() {
    setTemaState(TEMA_INICIAL);
    try {
      localStorage.removeItem(CLAVE);
    } catch {}
  }

  const oscuro = montado && resolvedTheme === "dark";
  const tokens = useMemo(
    () => calcularTokens(tema, oscuro, montado ? resolverFuente(tema.fuente) : "sans-serif"),
    // fuentesListas fuerza el recálculo cuando terminan de cargar las letras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tema, oscuro, fuentesListas, montado],
  );

  return <Contexto.Provider value={{ tema, setTema, reiniciar, tokens }}>{children}</Contexto.Provider>;
}

/** Sobrescribe parte del tema para un bloque (ej. el comparador muestra cada superficie). */
export function LabTemaOverride({ cambios, children }: { cambios: Partial<TemaLab>; children: ReactNode }) {
  const padre = useLabTema();
  const tema = useMemo(() => ({ ...padre.tema, ...cambios }), [padre.tema, cambios]);
  const tokens = useMemo(
    () => calcularTokens(tema, padre.tokens.oscuro, tema.fuente === padre.tema.fuente ? padre.tokens.fuente : resolverFuente(tema.fuente)),
    [tema, padre.tokens.oscuro, padre.tokens.fuente, padre.tema.fuente],
  );
  return <Contexto.Provider value={{ ...padre, tema, tokens }}>{children}</Contexto.Provider>;
}

export function useLabTema(): ValorContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useLabTema debe usarse dentro de LabTemaProvider");
  return ctx;
}

/** Atajo para los gráficos: solo los tokens. */
export function useTokens(): TokensLab {
  return useLabTema().tokens;
}
