"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Save } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "./boton-lab";
import { estiloEtiqueta } from "./comun";

type Fase = "normal" | "cargando" | "listo";

// Los estados de un mismo botón: normal, hover y foco simulados, cargando, deshabilitado y el
// ciclo real de confirmación (clic → cargando → confirmado → vuelve a normal a los 1,5 s).
export function Estados({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [fase, setFase] = useState<Fase>("normal");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function guardar() {
    if (fase !== "normal") return;
    setFase("cargando");
    temporizador.current = setTimeout(() => {
      setFase("listo");
      temporizador.current = setTimeout(() => setFase("normal"), 1500);
    }, 900);
  }

  const celdas = [
    { nombre: "Normal", boton: <BotonLab>Guardar</BotonLab> },
    { nombre: "Hover", boton: <BotonLab forzar="hover">Guardar</BotonLab> },
    { nombre: "Foco (teclado)", boton: <BotonLab forzar="foco">Guardar</BotonLab> },
    { nombre: "Cargando", boton: <BotonLab cargando>Guardando</BotonLab> },
    { nombre: "Deshabilitado", boton: <BotonLab disabled>Guardar</BotonLab> },
    {
      nombre: "Confirmación (haz clic)",
      boton: (
        <BotonLab
          variante={fase === "listo" ? "exito" : "solido"}
          icono={fase === "listo" ? Check : Save}
          cargando={fase === "cargando"}
          onClick={guardar}
          aria-live="polite"
          style={{ minWidth: 128 }}
        >
          {fase === "normal" ? "Guardar" : fase === "cargando" ? "Guardando" : "Guardado"}
        </BotonLab>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
        alignContent: "center",
        gap: "16px 12px",
        fontFamily: t.fuente,
      }}
    >
      {celdas.map((c) => (
        <div key={c.nombre} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          {c.boton}
          <span style={estiloEtiqueta(t)}>{c.nombre}</span>
        </div>
      ))}
    </div>
  );
}
