"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Diapositiva, EstadoPresentaciones, Presentacion } from "@/lib/presentaciones/tipos";
import { borrarImagen } from "@/lib/presentaciones/imagenes";

const CLAVE = "cia-presentaciones-v1";
const CLAVE_ACTIVAS = "cia-presentaciones-activas";
const VACIO: EstadoPresentaciones = { presentaciones: [], activaId: null };

function nuevoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function leer(): EstadoPresentaciones {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? { ...VACIO, ...JSON.parse(crudo) } : VACIO;
  } catch {
    return VACIO;
  }
}

function escribir(estado: EstadoPresentaciones) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    // Lleno (miniaturas): se sigue en memoria y se avisa en consola.
    console.warn("[presentaciones] no se pudo guardar en este navegador", e);
  }
}

interface ValorPresentaciones {
  listo: boolean;
  presentaciones: Presentacion[];
  activa: Presentacion | null;
  panelAbierto: boolean;
  setPanelAbierto: (v: boolean) => void;
  /** Interruptor del menú de usuario: apagado, no aparece «Agregar a presentación». */
  habilitadas: boolean;
  setHabilitadas: (v: boolean) => void;
  activar: (id: string) => void;
  crear: (nombre: string) => string;
  renombrar: (id: string, nombre: string) => void;
  eliminar: (id: string) => void;
  agregar: (presentacionId: string, d: Omit<Diapositiva, "id" | "agregada">) => string;
  actualizar: (presentacionId: string, diapositivaId: string, cambios: Partial<Diapositiva>) => void;
  quitar: (presentacionId: string, diapositivaId: string) => void;
  mover: (presentacionId: string, desde: number, hasta: number) => void;
}

const Contexto = createContext<ValorPresentaciones | null>(null);

/** Presentaciones del usuario, guardadas en este navegador y sincronizadas entre pestañas. */
export function PresentacionesProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPresentaciones>(VACIO);
  const [listo, setListo] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [habilitadas, setHabilitadasState] = useState(true);

  useEffect(() => {
    setEstado(leer());
    try {
      setHabilitadasState(localStorage.getItem(CLAVE_ACTIVAS) !== "0");
    } catch {}
    setListo(true);
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE) setEstado(leer());
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  const cambiar = useCallback((fn: (e: EstadoPresentaciones) => EstadoPresentaciones) => {
    setEstado((prev) => {
      const siguiente = fn(prev);
      escribir(siguiente);
      return siguiente;
    });
  }, []);

  const tocar = (p: Presentacion): Presentacion => ({ ...p, editada: new Date().toISOString() });

  const conPresentacion = useCallback(
    (id: string, fn: (p: Presentacion) => Presentacion) =>
      cambiar((e) => ({ ...e, presentaciones: e.presentaciones.map((p) => (p.id === id ? tocar(fn(p)) : p)) })),
    [cambiar],
  );

  const valor = useMemo<ValorPresentaciones>(() => {
    const activa = estado.presentaciones.find((p) => p.id === estado.activaId) ?? estado.presentaciones[0] ?? null;
    return {
      listo,
      presentaciones: estado.presentaciones,
      activa,
      panelAbierto,
      setPanelAbierto,
      habilitadas,
      setHabilitadas: (v) => {
        setHabilitadasState(v);
        if (!v) setPanelAbierto(false);
        try {
          localStorage.setItem(CLAVE_ACTIVAS, v ? "1" : "0");
        } catch {}
      },
      activar: (id) => cambiar((e) => ({ ...e, activaId: id })),
      crear: (nombre) => {
        const id = nuevoId();
        const ahora = new Date().toISOString();
        cambiar((e) => ({
          presentaciones: [...e.presentaciones, { id, nombre, creada: ahora, editada: ahora, diapositivas: [] }],
          activaId: id,
        }));
        return id;
      },
      renombrar: (id, nombre) => conPresentacion(id, (p) => ({ ...p, nombre })),
      eliminar: (id) => {
        estado.presentaciones.find((p) => p.id === id)?.diapositivas.forEach((d) => borrarImagen(d.id));
        cambiar((e) => {
          const resto = e.presentaciones.filter((p) => p.id !== id);
          return { presentaciones: resto, activaId: e.activaId === id ? (resto[0]?.id ?? null) : e.activaId };
        });
      },
      agregar: (presentacionId, d) => {
        const id = nuevoId();
        conPresentacion(presentacionId, (p) => ({
          ...p,
          diapositivas: [...p.diapositivas, { ...d, id, agregada: new Date().toISOString() }],
        }));
        return id;
      },
      actualizar: (presentacionId, diapositivaId, cambios) =>
        conPresentacion(presentacionId, (p) => ({
          ...p,
          diapositivas: p.diapositivas.map((d) => (d.id === diapositivaId ? { ...d, ...cambios } : d)),
        })),
      quitar: (presentacionId, diapositivaId) => {
        borrarImagen(diapositivaId);
        conPresentacion(presentacionId, (p) => ({ ...p, diapositivas: p.diapositivas.filter((d) => d.id !== diapositivaId) }));
      },
      mover: (presentacionId, desde, hasta) =>
        conPresentacion(presentacionId, (p) => {
          const lista = [...p.diapositivas];
          const [d] = lista.splice(desde, 1);
          if (!d) return p;
          lista.splice(Math.max(0, Math.min(hasta, lista.length)), 0, d);
          return { ...p, diapositivas: lista };
        }),
    };
  }, [estado, listo, panelAbierto, habilitadas, cambiar, conPresentacion]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePresentaciones(): ValorPresentaciones {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePresentaciones debe usarse dentro de PresentacionesProvider");
  return ctx;
}
