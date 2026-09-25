"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { estiloControl, estiloEtiquetaCampo, estiloMensaje } from "./comun";
import { Asterisco, CajaCampo, MarcoCampo, useIdsCampo } from "./marco";
import type { PropsCampoComun } from "./campo-texto";

export interface PropsCampoFecha
  extends PropsCampoComun,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type" | "value" | "onChange"> {
  /** Fecha ISO aaaa-mm-dd ("" = vacía). */
  value: string;
  onChange: (valor: string) => void;
}

/**
 * Fecha con el selector nativo del navegador (accesible, con teclado y calendario propio).
 * Como el input de fecha siempre muestra su máscara, la etiqueta flotante queda siempre arriba.
 */
export function CampoFecha({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  invalido,
  id,
  value,
  onChange,
  disabled,
  onFocus,
  onBlur,
  style,
  ...resto
}: PropsCampoFecha) {
  const t = useTokens();
  const [foco, setFoco] = useState(false);
  const ids = useIdsCampo(id, { ayuda, error });
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;

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
        deshabilitado={disabled}
        flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba: true, requerido } : null}
      >
        <input
          id={ids.id}
          className="lab-campo"
          type="date"
          value={value}
          disabled={disabled}
          aria-invalid={error || invalido ? true : undefined}
          aria-required={requerido || undefined}
          aria-describedby={ids.describedBy}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
          style={{ ...estiloControl(t), color: value ? "inherit" : t.campo.placeholder, fontVariantNumeric: "tabular-nums", ...style }}
          {...resto}
        />
      </CajaCampo>
    </MarcoCampo>
  );
}

export interface RangoFechas {
  desde: string;
  hasta: string;
}

interface PropsRango {
  etiqueta: string;
  valor: RangoFechas;
  onCambio: (valor: RangoFechas) => void;
  ayuda?: ReactNode;
  /** Error externo (ej. «obligatorio»); el de orden (hasta < desde) lo calcula el campo. */
  error?: string | null;
  requerido?: boolean;
  deshabilitado?: boolean;
  etiquetaDesde?: string;
  etiquetaHasta?: string;
  className?: string;
}

/** Rango desde–hasta como fieldset: dos fechas enlazadas (la segunda no puede ser anterior). */
export function CampoRangoFechas({
  etiqueta,
  valor,
  onCambio,
  ayuda,
  error,
  requerido,
  deshabilitado,
  etiquetaDesde = "Desde",
  etiquetaHasta = "Hasta",
  className,
}: PropsRango) {
  const t = useTokens();
  const base = useId();
  const invertido = Boolean(valor.desde && valor.hasta && valor.hasta < valor.desde);
  const mensaje = error ?? (invertido ? "La fecha de término no puede ser anterior a la de inicio." : null);
  const idMensaje = `${base}-mensaje`;

  return (
    <fieldset className={className} style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }} aria-describedby={mensaje || ayuda ? idMensaje : undefined}>
      <legend style={{ ...estiloEtiquetaCampo(t), padding: 0, marginBottom: 6 }}>
        {etiqueta}
        {requerido && <Asterisco />}
      </legend>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "end", gap: 8 }}>
        <CampoFecha
          etiqueta={etiquetaDesde}
          value={valor.desde}
          max={valor.hasta || undefined}
          disabled={deshabilitado}
          invalido={Boolean(mensaje) && !invertido}
          onChange={(desde) => onCambio({ ...valor, desde })}
        />
        <ArrowRight size={16} aria-hidden style={{ color: t.textoSuave, marginBottom: (t.campo.alto - 16) / 2 }} />
        <CampoFecha
          etiqueta={etiquetaHasta}
          value={valor.hasta}
          min={valor.desde || undefined}
          disabled={deshabilitado}
          invalido={Boolean(mensaje)}
          onChange={(hasta) => onCambio({ ...valor, hasta })}
        />
      </div>
      {(mensaje || ayuda) && (
        <span id={idMensaje} style={{ ...estiloMensaje(t, Boolean(mensaje)), display: "block", marginTop: 5 }}>
          {mensaje || ayuda}
        </span>
      )}
    </fieldset>
  );
}
