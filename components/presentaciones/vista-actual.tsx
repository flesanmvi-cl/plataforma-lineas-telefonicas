"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Lo que una vista publica para «Agregar a presentación»: título sugerido y filtros legibles. */
export interface InfoVista {
  titulo: string;
  filtros: string[];
}

interface ValorVista {
  info: InfoVista | null;
  setInfo: (i: InfoVista | null) => void;
}

const Contexto = createContext<ValorVista | null>(null);

export function VistaActualProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<InfoVista | null>(null);
  return <Contexto.Provider value={{ info, setInfo }}>{children}</Contexto.Provider>;
}

export function useVistaActual(): InfoVista | null {
  return useContext(Contexto)?.info ?? null;
}

/**
 * Una vista con filtros los publica para que la diapositiva se titule sola y guarde qué se
 * estaba mirando (ej. ["2026", "Minería", "Antofagasta"]). Se limpia al salir de la vista.
 * La receta real son los filtros en la URL (useFiltrosUrl); esto es solo el texto legible.
 */
export function usePublicarVista(titulo: string, filtros: string[]) {
  // setInfo es el setter de useState: estable entre renders (el objeto del contexto no).
  const setInfo = useContext(Contexto)?.setInfo;
  const clave = `${titulo}¦${filtros.join("|")}`;
  useEffect(() => {
    setInfo?.({ titulo, filtros });
    // clave resume titulo y filtros.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, setInfo]);
  useEffect(() => () => setInfo?.(null), [setInfo]);
}
