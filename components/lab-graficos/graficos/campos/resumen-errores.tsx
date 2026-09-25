"use client";

import { forwardRef } from "react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { Aviso } from "../base/componentes";

export interface ErrorResumen {
  /** id del control con error (el enlace lo enfoca). */
  id: string;
  etiqueta: string;
  mensaje: string;
}

/**
 * Resumen de errores al enviar un formulario: aviso de error con un enlace por campo que lleva
 * el foco al control. Recibe el foco al aparecer (ref + tabIndex -1) para que se anuncie.
 */
export const ResumenErrores = forwardRef<HTMLDivElement, { errores: ErrorResumen[]; titulo?: string }>(function ResumenErrores(
  { errores, titulo },
  ref,
) {
  const t = useTokens();
  if (errores.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} style={{ outline: "none" }}>
      <Aviso tipo="error" titulo={titulo ?? `Revisa ${errores.length === 1 ? "1 campo" : `${errores.length} campos`} antes de continuar`}>
        <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
          {errores.map((e) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={(ev) => {
                  ev.preventDefault();
                  const el = document.getElementById(e.id);
                  el?.scrollIntoView({ block: "center", behavior: "smooth" });
                  el?.focus({ preventScroll: true });
                }}
                style={{ color: t.texto, textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                {e.etiqueta}
              </a>
              : {e.mensaje}
            </li>
          ))}
        </ul>
      </Aviso>
    </div>
  );
});
