"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { estiloControl } from "./comun";
import { CajaCampo, MarcoCampo, useIdsCampo } from "./marco";

/** Lo que comparten todos los campos: etiqueta, ayuda, error, obligatorio y ubicación. */
export interface PropsCampoComun {
  etiqueta: string;
  ayuda?: ReactNode;
  /** Mensaje de error (si hay, el campo queda en rojo y se anuncia). */
  error?: string | null;
  requerido?: boolean;
  /** Etiqueta solo para lectores de pantalla (celdas de tabla editable). */
  etiquetaOculta?: boolean;
  /** Clase del contenedor externo (ej. sm:col-span-2 dentro de un GrupoCampos). */
  className?: string;
  /** Muestra el estado de foco sin tenerlo (solo para la vitrina). */
  forzarFoco?: boolean;
  /** En rojo sin mensaje propio (el mensaje va en otro lado: rango, fila de tabla). */
  invalido?: boolean;
}

export interface PropsCampoTexto
  extends PropsCampoComun,
    Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size" | "className"> {
  icono?: LucideIcon;
  prefijo?: ReactNode;
  sufijo?: ReactNode;
  /** Muestra n/máximo (requiere maxLength). */
  contador?: boolean;
}

/**
 * Campo de texto de una línea. Etiqueta arriba, a la izquierda o flotante según el tema;
 * la flotante sube al enfocar o cuando hay valor.
 */
export function CampoTexto({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  invalido,
  icono,
  prefijo,
  sufijo,
  contador,
  id,
  disabled,
  value,
  defaultValue,
  placeholder,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  style,
  ...resto
}: PropsCampoTexto) {
  const t = useTokens();
  const [foco, setFoco] = useState(false);
  const [interno, setInterno] = useState(String(defaultValue ?? ""));
  const texto = value !== undefined ? String(value ?? "") : interno;
  const ids = useIdsCampo(id, { ayuda, error, contador: contador && Boolean(maxLength) });
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;
  const arriba = enFoco || texto.length > 0;

  return (
    <MarcoCampo
      etiqueta={etiqueta}
      ids={ids}
      ayuda={ayuda}
      error={error}
      requerido={requerido}
      etiquetaOculta={etiquetaOculta}
      flotanteDentro={flota}
      contador={contador && maxLength ? { actual: texto.length, max: maxLength } : undefined}
      className={className}
    >
      <CajaCampo
        foco={enFoco}
        error={Boolean(error) || invalido}
        deshabilitado={disabled}
        icono={icono}
        prefijo={prefijo}
        sufijo={sufijo}
        flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba, requerido } : null}
      >
        <input
          id={ids.id}
          className="lab-campo"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          // Con etiqueta flotante en reposo, el placeholder se calla para no chocar con ella.
          placeholder={flota && !arriba ? undefined : placeholder}
          maxLength={maxLength}
          aria-invalid={error || invalido ? true : undefined}
          aria-required={requerido || undefined}
          aria-describedby={ids.describedBy}
          onChange={(e) => {
            if (value === undefined) setInterno(e.target.value);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
          style={{ ...estiloControl(t), ...style }}
          {...resto}
        />
      </CajaCampo>
    </MarcoCampo>
  );
}

export interface PropsCampoArea
  extends PropsCampoComun,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  /** Muestra n/máximo (requiere maxLength). */
  contador?: boolean;
}

/** Área de texto con contador de caracteres; crece con el contenido hasta un tope. */
export function CampoArea({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  invalido,
  contador,
  id,
  disabled,
  value,
  defaultValue,
  placeholder,
  maxLength,
  rows = 3,
  onChange,
  onFocus,
  onBlur,
  style,
  ...resto
}: PropsCampoArea) {
  const t = useTokens();
  const [foco, setFoco] = useState(false);
  const [interno, setInterno] = useState(String(defaultValue ?? ""));
  const texto = value !== undefined ? String(value ?? "") : interno;
  const ids = useIdsCampo(id, { ayuda, error, contador: contador && Boolean(maxLength) });
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;
  const arriba = enFoco || texto.length > 0;

  return (
    <MarcoCampo
      etiqueta={etiqueta}
      ids={ids}
      ayuda={ayuda}
      error={error}
      requerido={requerido}
      etiquetaOculta={etiquetaOculta}
      flotanteDentro={flota}
      contador={contador && maxLength ? { actual: texto.length, max: maxLength } : undefined}
      className={className}
    >
      <CajaCampo
        multilinea
        foco={enFoco}
        error={Boolean(error) || invalido}
        deshabilitado={disabled}
        flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba, requerido } : null}
      >
        <textarea
          id={ids.id}
          className="lab-campo"
          rows={rows}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          placeholder={flota && !arriba ? undefined : placeholder}
          maxLength={maxLength}
          aria-invalid={error || invalido ? true : undefined}
          aria-required={requerido || undefined}
          aria-describedby={ids.describedBy}
          onChange={(e) => {
            if (value === undefined) setInterno(e.target.value);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
          style={{
            ...estiloControl(t),
            height: "auto",
            resize: "vertical",
            lineHeight: 1.45,
            minHeight: rows * 20,
            maxHeight: 320,
            ...style,
          }}
          {...resto}
        />
      </CajaCampo>
    </MarcoCampo>
  );
}
