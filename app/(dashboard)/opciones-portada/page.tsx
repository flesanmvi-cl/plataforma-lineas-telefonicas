"use client";

import { useEffect, useState } from "react";
import { Pildoras } from "@/components/reporte/tarjeta";
import { InicioA, PlantillasA } from "@/components/portada/opcion-a";
import { InicioB, PlantillasB } from "@/components/portada/opcion-b";
import { InicioC, PlantillasC } from "@/components/portada/opcion-c";

// TEMPORAL · opciones de diseño para las portadas de Inicio y Plantillas (2026-10-20). Se borra
// cuando Sebastián elija: la elegida pasa a app/(dashboard)/page.tsx y a la portada de /pruebas.
type Opcion = "a" | "b" | "c";
type Vista = "inicio" | "plantillas";

const PANTALLAS: Record<Opcion, Record<Vista, () => React.ReactNode>> = {
  a: { inicio: InicioA, plantillas: PlantillasA },
  b: { inicio: InicioB, plantillas: PlantillasB },
  c: { inicio: InicioC, plantillas: PlantillasC },
};

export default function OpcionesPortadaPage() {
  const [opcion, setOpcion] = useState<Opcion>("a");
  const [vista, setVista] = useState<Vista>("inicio");
  const Pantalla = PANTALLAS[opcion][vista];

  // ?opcion=b&vista=plantillas abre esa combinación directo (para enlazarla).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const o = q.get("opcion");
    const v = q.get("vista");
    if (o === "a" || o === "b" || o === "c") setOpcion(o);
    if (v === "inicio" || v === "plantillas") setVista(v);
  }, []);
  useEffect(() => {
    window.history.replaceState(null, "", `?opcion=${opcion}&vista=${vista}`);
  }, [opcion, vista]);
  return (
    <div>
      <div className="sticky top-0 z-20 bg-bg border-b border-border">
        <div className="page-shell py-2 flex flex-wrap items-center gap-3">
          <span className="label-meta text-faint">Opciones de portada</span>
          <Pildoras
            etiqueta="Opción"
            opciones={[
              { id: "a", texto: "A · Tarjetas" },
              { id: "b", texto: "B · Índice por tarea" },
              { id: "c", texto: "C · Maestro-detalle" },
            ]}
            valor={opcion}
            onCambio={setOpcion}
          />
          <Pildoras
            etiqueta="Pantalla"
            opciones={[
              { id: "inicio", texto: "Inicio" },
              { id: "plantillas", texto: "Plantillas" },
            ]}
            valor={vista}
            onCambio={setVista}
          />
        </div>
      </div>
      <Pantalla />
    </div>
  );
}
