"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { estiloControl, formatoNumero, parsearNumero } from "./comun";
import { CajaCampo, MarcoCampo, useIdsCampo } from "./marco";
import type { PropsCampoComun } from "./campo-texto";

export interface PropsCampoMonto extends PropsCampoComun {
  id?: string;
  valor: number | null;
  onCambio: (valor: number | null) => void;
  /** Unidad al final: «M$», «UF», «%», «m²». Con «$» va como prefijo. */
  unidad?: string;
  /** Decimales al formatear (por defecto 2 para UF y 0 para el resto). */
  decimales?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  deshabilitado?: boolean;
  icono?: LucideIcon;
  /** Se llama al salir del campo, ya con el valor formateado (validación al salir). */
  onBlur?: () => void;
}

/**
 * Monto o número: mientras se escribe acepta «1234,5» o «1.234,5»; al salir se formatea
 * a la chilena (miles con punto, decimales con coma) y se acota a min/max.
 */
export function CampoMonto({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  invalido,
  id,
  valor,
  onCambio,
  unidad,
  decimales,
  min,
  max,
  placeholder,
  deshabilitado,
  icono,
  onBlur,
}: PropsCampoMonto) {
  const t = useTokens();
  const dec = decimales ?? (unidad === "UF" ? 2 : 0);
  const [foco, setFoco] = useState(false);
  const [borrador, setBorrador] = useState<string | null>(null);
  const ids = useIdsCampo(id, { ayuda, error });
  const texto = borrador ?? (valor == null ? "" : formatoNumero(valor, dec));
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;
  const arriba = enFoco || texto.length > 0;
  const esPeso = unidad === "$";

  function confirmar() {
    let n = borrador === null ? valor : parsearNumero(borrador);
    if (n != null) {
      const f = 10 ** dec;
      n = Math.round(n * f) / f;
      if (min != null) n = Math.max(min, n);
      if (max != null) n = Math.min(max, n);
    }
    setBorrador(null);
    if (n !== valor) onCambio(n);
  }

  return (
    <MarcoCampo
      etiqueta={etiqueta}
      ids={ids}
      ayuda={ayuda}
      error={error}
      requerido={requerido}
      etiquetaOculta={etiquetaOculta}
      flotanteDentro={flota}
      className={className}
    >
      <CajaCampo
        foco={enFoco}
        error={Boolean(error) || invalido}
        deshabilitado={deshabilitado}
        icono={icono}
        prefijo={esPeso ? "$" : undefined}
        sufijo={!esPeso && unidad ? unidad : undefined}
        flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba, requerido } : null}
      >
        <input
          id={ids.id}
          className="lab-campo"
          type="text"
          inputMode={dec > 0 ? "decimal" : "numeric"}
          autoComplete="off"
          disabled={deshabilitado}
          value={texto}
          placeholder={flota && !arriba ? undefined : placeholder}
          aria-invalid={error || invalido ? true : undefined}
          aria-required={requerido || undefined}
          aria-describedby={ids.describedBy}
          onChange={(e) => {
            const limpio = e.target.value.replace(/[^\d.,-]/g, "");
            setBorrador(limpio);
            // El valor se informa en vivo para que totales y validación respondan al escribir.
            onCambio(parsearNumero(limpio));
          }}
          onFocus={() => {
            setFoco(true);
            setBorrador(valor == null ? "" : formatoNumero(valor, dec));
          }}
          onBlur={() => {
            setFoco(false);
            confirmar();
            onBlur?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmar();
          }}
          style={{ ...estiloControl(t), textAlign: "right", fontVariantNumeric: "tabular-nums" }}
        />
      </CajaCampo>
    </MarcoCampo>
  );
}
