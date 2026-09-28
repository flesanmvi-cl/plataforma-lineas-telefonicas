"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Valor = string | string[];

/**
 * Estado de filtros de una vista que vive en la URL (?clave=valor, listas separadas por coma).
 * Así «Agregar a presentación» guarda la vista con sus filtros, y abrir esa URL la reconstruye.
 *
 * Se lee de la URL al montar (el primer render usa los valores por defecto, igual en servidor y
 * cliente) y cada cambio se escribe con history.replaceState, sin recargar ni sumar historial.
 * Los valores iguales al defecto no se escriben, para que la URL quede limpia.
 */
export function useFiltrosUrl<T extends Record<string, Valor>>(
  porDefecto: T,
): [T, (cambios: Partial<T> | ((prev: T) => Partial<T>)) => void] {
  const defecto = useRef(porDefecto).current;
  const [filtros, setFiltros] = useState<T>(defecto);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const leidos = { ...defecto };
    for (const clave of Object.keys(defecto) as (keyof T & string)[]) {
      const crudo = q.get(clave);
      if (crudo === null) continue;
      leidos[clave] = (Array.isArray(defecto[clave]) ? crudo.split(",").filter(Boolean) : crudo) as T[typeof clave];
    }
    setFiltros(leidos);
  }, [defecto]);

  const cambiar = useCallback(
    (cambios: Partial<T> | ((prev: T) => Partial<T>)) => {
      setFiltros((prev) => {
        const siguiente = { ...prev, ...(typeof cambios === "function" ? cambios(prev) : cambios) };
        const q = new URLSearchParams(window.location.search);
        for (const clave of Object.keys(defecto)) {
          const v = siguiente[clave];
          const d = defecto[clave];
          const igual = Array.isArray(v) ? v.join(",") === (d as string[]).join(",") : v === d;
          if (igual) q.delete(clave);
          else q.set(clave, Array.isArray(v) ? v.join(",") : v);
        }
        const texto = q.toString();
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${texto ? `?${texto}` : ""}`);
        return siguiente;
      });
    },
    [defecto],
  );

  return [filtros, cambiar];
}
