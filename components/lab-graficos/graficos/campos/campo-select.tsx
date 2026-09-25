"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { estiloControl, estiloLista, estiloOpcion, normalizar } from "./comun";
import { CajaCampo, MarcoCampo, useIdsCampo } from "./marco";
import type { PropsCampoComun } from "./campo-texto";

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
  /** Texto secundario (código, región, RUT de empresa ficticia). */
  detalle?: string;
  /** Agrupa las opciones bajo un encabezado (solo el buscable). */
  grupo?: string;
}

export interface PropsCampoSelect
  extends PropsCampoComun,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "value" | "onChange"> {
  opciones: OpcionCampo[];
  value: string;
  onChange: (valor: string) => void;
  /** Texto de la opción vacía («Selecciona…»). Sin él, no hay opción vacía. */
  placeholder?: string;
  icono?: LucideIcon;
}

/** Select nativo estilizado: el más accesible y el mejor en móvil para listas cortas. */
export function CampoSelect({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  opciones,
  value,
  onChange,
  placeholder,
  icono,
  id,
  disabled,
  onFocus,
  onBlur,
  style,
  ...resto
}: PropsCampoSelect) {
  const t = useTokens();
  const [foco, setFoco] = useState(false);
  const ids = useIdsCampo(id, { ayuda, error });
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;
  const arriba = enFoco || value !== "";

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
        error={Boolean(error)}
        deshabilitado={disabled}
        icono={icono}
        flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba, requerido } : null}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <select
          id={ids.id}
          className="lab-campo"
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
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
          style={{
            ...estiloControl(t),
            appearance: "none",
            cursor: "inherit",
            paddingRight: 22,
            color: value === "" ? t.campo.placeholder : "inherit",
            ...style,
          }}
          {...resto}
        >
          {placeholder !== undefined && (
            <option value="">{flota && !arriba ? "" : placeholder}</option>
          )}
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor} style={{ color: t.texto, background: t.fondoTarjeta }}>
              {o.etiqueta}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          style={{ position: "absolute", right: t.campo.estilo === "subrayado" ? 2 : 10, color: t.textoSuave, pointerEvents: "none" }}
        />
      </CajaCampo>
    </MarcoCampo>
  );
}

export interface PropsCampoBuscable extends PropsCampoComun {
  id?: string;
  opciones: OpcionCampo[];
  valor: string | null;
  onCambio: (valor: string | null, opcion?: OpcionCampo) => void;
  placeholder?: string;
  icono?: LucideIcon;
  deshabilitado?: boolean;
  /** Texto cuando no hay coincidencias. */
  sinResultados?: string;
  /** Tras elegir, el campo queda vacío (búsqueda global que abre el resultado). */
  limpiarAlElegir?: boolean;
  /** Máximo de opciones visibles en la lista. */
  limite?: number;
  onBlur?: () => void;
}

/** Resalta la coincidencia dentro de la etiqueta (sin tildes ni mayúsculas). */
function Resaltado({ texto, consulta, color }: { texto: string; consulta: string; color: string }) {
  const q = normalizar(consulta.trim());
  const i = q ? normalizar(texto).indexOf(q) : -1;
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark style={{ background: "transparent", color, fontWeight: 700 }}>{texto.slice(i, i + q.length)}</mark>
      {texto.slice(i + q.length)}
    </>
  );
}

/**
 * Select buscable (combobox ARIA 1.2 con lista): se escribe para filtrar, flechas para moverse,
 * Enter elige, Esc cierra. Sirve para listas largas (obras, proveedores, partidas).
 */
export function CampoBuscable({
  etiqueta,
  ayuda,
  error,
  requerido,
  etiquetaOculta,
  className,
  forzarFoco,
  id,
  opciones,
  valor,
  onCambio,
  placeholder = "Escribe para buscar",
  icono,
  deshabilitado,
  sinResultados = "Sin coincidencias",
  limpiarAlElegir,
  limite = 50,
  onBlur,
}: PropsCampoBuscable) {
  const t = useTokens();
  const idLista = useId();
  const ids = useIdsCampo(id, { ayuda, error });
  const [foco, setFoco] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [editando, setEditando] = useState(false);
  const [activa, setActiva] = useState(0);
  const lista = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const elegida = opciones.find((o) => o.valor === valor) ?? null;
  const filtradas = useMemo(() => {
    const q = normalizar(consulta.trim());
    const res = q
      ? opciones.filter((o) => normalizar(`${o.etiqueta} ${o.detalle ?? ""} ${o.grupo ?? ""}`).includes(q))
      : opciones;
    return res.slice(0, limite);
  }, [opciones, consulta, limite]);

  const texto = editando ? consulta : (elegida?.etiqueta ?? "");
  const enFoco = foco || Boolean(forzarFoco);
  const flota = t.campo.etiqueta === "flotante" && !etiquetaOculta;
  const arriba = enFoco || texto.length > 0;
  const idOpcion = (i: number) => `${idLista}-op-${i}`;

  // Mantiene visible la opción activa al moverse con flechas.
  useEffect(() => {
    if (!abierto) return;
    lista.current?.querySelector(`[data-indice="${activa}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activa, abierto]);

  function elegir(o: OpcionCampo) {
    onCambio(o.valor, o);
    setAbierto(false);
    setEditando(false);
    setConsulta("");
  }

  function alTecla(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierto) {
        setAbierto(true);
        return;
      }
      const paso = e.key === "ArrowDown" ? 1 : -1;
      setActiva((a) => (filtradas.length ? (a + paso + filtradas.length) % filtradas.length : 0));
    } else if (e.key === "Enter") {
      if (abierto && filtradas[activa]) {
        e.preventDefault();
        elegir(filtradas[activa]);
      }
    } else if (e.key === "Escape") {
      if (abierto) {
        e.preventDefault();
        setAbierto(false);
      } else if (editando) {
        setEditando(false);
        setConsulta("");
      }
    } else if (e.key === "Home" && abierto) {
      setActiva(0);
    } else if (e.key === "End" && abierto) {
      setActiva(Math.max(0, filtradas.length - 1));
    }
  }

  const dur = t.animacion.duracion > 0 ? 0.14 : 0;
  let grupoAnterior: string | undefined;

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
      <div style={{ position: "relative" }}>
        <CajaCampo
          foco={enFoco}
          error={Boolean(error)}
          deshabilitado={deshabilitado}
          icono={icono}
          flotante={flota ? { texto: etiqueta, htmlFor: ids.id, arriba, requerido } : null}
        >
          <input
            ref={input}
            id={ids.id}
            className="lab-campo"
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={abierto}
            aria-controls={idLista}
            aria-activedescendant={abierto && filtradas[activa] ? idOpcion(activa) : undefined}
            aria-invalid={error ? true : undefined}
            aria-required={requerido || undefined}
            aria-describedby={ids.describedBy}
            disabled={deshabilitado}
            value={texto}
            placeholder={flota && !arriba ? undefined : placeholder}
            onChange={(e) => {
              setConsulta(e.target.value);
              setEditando(true);
              setAbierto(true);
              setActiva(0);
            }}
            onClick={() => setAbierto(true)}
            onKeyDown={alTecla}
            onFocus={(e) => {
              setFoco(true);
              // Con algo elegido, el texto queda seleccionado: escribir reemplaza en vez de sumar.
              e.currentTarget.select();
            }}
            onBlur={() => {
              setFoco(false);
              setAbierto(false);
              setEditando(false);
              setConsulta("");
              onBlur?.();
            }}
            style={{ ...estiloControl(t), paddingRight: elegida && !limpiarAlElegir ? 44 : 22 }}
          />
          {elegida && !limpiarAlElegir && !deshabilitado && (
            <button
              type="button"
              aria-label={`Quitar ${elegida.etiqueta}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onCambio(null);
                input.current?.focus();
              }}
              style={{
                position: "absolute",
                right: t.campo.estilo === "subrayado" ? 22 : 30,
                display: "inline-flex",
                padding: 2,
                border: "none",
                borderRadius: 4,
                background: "transparent",
                color: t.textoSuave,
                cursor: "pointer",
              }}
            >
              <X size={14} aria-hidden />
            </button>
          )}
          <ChevronDown
            size={16}
            aria-hidden
            onMouseDown={(e) => {
              e.preventDefault();
              if (deshabilitado) return;
              input.current?.focus();
              setAbierto((a) => !a);
            }}
            style={{
              position: "absolute",
              right: t.campo.estilo === "subrayado" ? 2 : 10,
              color: t.textoSuave,
              cursor: deshabilitado ? "not-allowed" : "pointer",
              transform: abierto ? "rotate(180deg)" : "none",
              transition: `transform ${dur * 1000}ms`,
            }}
          />
        </CajaCampo>

        <AnimatePresence>
          {abierto && (
            <motion.ul
              ref={lista}
              id={idLista}
              role="listbox"
              aria-label={etiqueta}
              initial={dur ? { opacity: 0, y: -4 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={dur ? { opacity: 0, y: -4 } : undefined}
              transition={{ duration: dur }}
              style={estiloLista(t)}
            >
              {filtradas.length === 0 && (
                <li role="presentation" style={{ padding: "8px", color: t.textoSuave }}>
                  {sinResultados}
                </li>
              )}
              {filtradas.map((o, i) => {
                const nuevoGrupo = o.grupo && o.grupo !== grupoAnterior;
                grupoAnterior = o.grupo;
                const esElegida = o.valor === valor;
                return (
                  <Fragment key={o.valor}>
                    {nuevoGrupo && (
                      <li
                        role="presentation"
                        style={{
                          padding: "8px 8px 4px",
                          fontSize: t.tamano.eje - 1,
                          fontWeight: 600,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: t.textoSuave,
                        }}
                      >
                        {o.grupo}
                      </li>
                    )}
                    <li
                      id={idOpcion(i)}
                      data-indice={i}
                      role="option"
                      aria-selected={esElegida}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => elegir(o)}
                      onPointerMove={() => setActiva(i)}
                      style={estiloOpcion(t, i === activa, esElegida)}
                    >
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Resaltado texto={o.etiqueta} consulta={consulta} color={t.acento} />
                        </span>
                        {o.detalle && (
                          <span style={{ display: "block", fontSize: t.tamano.eje, color: t.textoSuave }}>{o.detalle}</span>
                        )}
                      </span>
                      {esElegida && <Check size={14} aria-hidden style={{ color: t.acento, flexShrink: 0 }} />}
                    </li>
                  </Fragment>
                );
              })}
              {opciones.length > limite && filtradas.length === limite && (
                <li role="presentation" style={{ padding: "6px 8px", fontSize: t.tamano.eje, color: t.textoSuave, borderTop: `1px solid ${conAlfa(t.texto, 0.08)}` }}>
                  Escribe para acotar la lista
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </MarcoCampo>
  );
}
