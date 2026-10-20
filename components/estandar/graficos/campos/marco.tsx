"use client";

import { useId, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { AlertCircle, type LucideIcon } from "lucide-react";
import { useTokens } from "@/components/estandar/tema-context";
import type { TokensLab } from "@/lib/estandar/tema";
import { CSS_CAMPOS, estiloAfijo, estiloCaja, estiloEtiquetaCampo, estiloMensaje } from "./comun";

/** Ids de un campo y de sus textos de apoyo, para htmlFor y aria-describedby. */
export interface IdsCampo {
  id: string;
  idAyuda: string;
  idError: string;
  idContador: string;
  /** Lo que va en aria-describedby (el error reemplaza a la ayuda). */
  describedBy: string | undefined;
}

export function useIdsCampo(
  idPropio: string | undefined,
  { ayuda, error, contador }: { ayuda?: ReactNode; error?: string | null; contador?: boolean },
): IdsCampo {
  const base = useId();
  const id = idPropio ?? `campo${base}`;
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const idContador = `${id}-contador`;
  const partes = [error ? idError : ayuda ? idAyuda : null, contador ? idContador : null].filter(Boolean);
  return { id, idAyuda, idError, idContador, describedBy: partes.length ? partes.join(" ") : undefined };
}

/** Regla de placeholder, una sola vez en el documento (React 19 deduplica por href). */
export function EstilosCampos() {
  return (
    <style href="lab-campos" precedence="medium">
      {CSS_CAMPOS}
    </style>
  );
}

/** Asterisco de obligatorio: se ve, pero el lector de pantalla usa aria-required. */
export function Asterisco() {
  const t = useTokens();
  return (
    <span aria-hidden style={{ color: t.campo.error, marginLeft: 2 }}>
      *
    </span>
  );
}

interface PropsMarco {
  etiqueta: string;
  ids: IdsCampo;
  ayuda?: ReactNode;
  error?: string | null;
  requerido?: boolean;
  contador?: { actual: number; max: number };
  /** El campo dibuja su propia etiqueta flotante dentro de la caja. */
  flotanteDentro?: boolean;
  /** Etiqueta solo para lectores de pantalla (ej. celdas de una tabla editable). */
  etiquetaOculta?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const OCULTO: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/**
 * Marco de un campo: etiqueta (arriba, a la izquierda o flotante según t.campo.etiqueta),
 * la caja, y bajo ella la ayuda o el error más el contador de caracteres.
 */
export function MarcoCampo({
  etiqueta,
  ids,
  ayuda,
  error,
  requerido,
  contador,
  flotanteDentro,
  etiquetaOculta,
  className,
  style,
  children,
}: PropsMarco) {
  const t = useTokens();
  const modo = t.campo.etiqueta;
  const izquierda = modo === "izquierda" && !etiquetaOculta;
  const sinEtiquetaFuera = etiquetaOculta || (modo === "flotante" && flotanteDentro);
  const cerca = contador && contador.actual >= contador.max * 0.9;

  const label = (
    <label
      htmlFor={ids.id}
      style={
        etiquetaOculta
          ? OCULTO
          : {
              ...estiloEtiquetaCampo(t),
              display: "block",
              // A la izquierda, alineada con el centro de la caja.
              ...(izquierda ? { paddingTop: (t.campo.alto - t.tamano.etiqueta * 1.3) / 2 } : { marginBottom: 6 }),
            }
      }
    >
      {etiqueta}
      {requerido && !etiquetaOculta && <Asterisco />}
    </label>
  );

  const pie =
    error || ayuda || contador ? (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 5 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {error ? (
            <motion.span
              key={error}
              id={ids.idError}
              initial={t.animacion.duracion > 0 ? { opacity: 0, y: -3 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              style={{ ...estiloMensaje(t, true), display: "flex", alignItems: "flex-start", gap: 5 }}
            >
              <AlertCircle size={13} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </motion.span>
          ) : ayuda ? (
            <span id={ids.idAyuda} style={{ ...estiloMensaje(t), display: "block" }}>
              {ayuda}
            </span>
          ) : null}
        </div>
        {contador && (
          <span
            id={ids.idContador}
            aria-live="polite"
            style={{
              ...estiloMensaje(t),
              color: contador.actual >= contador.max ? t.campo.error : cerca ? t.estado.alerta : t.textoSuave,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {contador.actual}/{contador.max}
            <span style={OCULTO}> caracteres</span>
          </span>
        )}
      </div>
    ) : null;

  if (izquierda) {
    return (
      <div
        className={className}
        style={{ display: "grid", gridTemplateColumns: "minmax(96px, 32%) minmax(0, 1fr)", columnGap: 12, ...style }}
      >
        {label}
        <div style={{ minWidth: 0 }}>
          {children}
          {pie}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ minWidth: 0, ...style }}>
      {!sinEtiquetaFuera && label}
      {sinEtiquetaFuera && etiquetaOculta && label}
      {children}
      {pie}
    </div>
  );
}

export interface EtiquetaFlotante {
  texto: string;
  htmlFor: string;
  /** Arriba (foco o con valor) o en reposo dentro de la caja. */
  arriba: boolean;
  requerido?: boolean;
}

interface PropsCaja {
  foco?: boolean;
  error?: boolean;
  deshabilitado?: boolean;
  multilinea?: boolean;
  icono?: LucideIcon;
  prefijo?: ReactNode;
  sufijo?: ReactNode;
  /** Solo si el tema pide etiqueta flotante y el campo la admite. */
  flotante?: EtiquetaFlotante | null;
  style?: CSSProperties;
  children: ReactNode;
}

/** Posición de la etiqueta flotante según estilo de caja y estado. */
function estiloFlotante(t: TokensLab, f: EtiquetaFlotante, izquierda: number, e: PropsCaja): CSSProperties {
  const contorno = t.campo.estilo === "contorno";
  const color = e.error ? t.campo.error : f.arriba && e.foco ? t.campo.bordeFoco : t.textoSuave;
  const ms = t.animacion.duracion > 0 ? 150 : 0;
  const trans = ["top", "transform", "font-size", "color", "left"].map((p) => `${p} ${ms}ms ${t.animacion.easingCss}`).join(", ");
  const base: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    fontFamily: t.fuente,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: `calc(100% - ${izquierda + 12}px)`,
    color,
    transition: trans,
  };
  const fondoCaja = e.deshabilitado ? t.campo.deshabilitado : t.campo.fondo;
  if (f.arriba) {
    if (contorno) {
      return {
        ...base,
        top: 0,
        left: izquierda - 4,
        transform: "translateY(-50%)",
        padding: "0 4px",
        fontSize: t.tamano.eje,
        fontWeight: 600,
        // Media arriba del color de la tarjeta, media abajo del de la caja: corta el borde limpio.
        background: `linear-gradient(to bottom, ${t.fondoTarjeta} 50%, ${fondoCaja} 50%)`,
      };
    }
    return { ...base, top: 5, left: izquierda, transform: "none", fontSize: t.tamano.eje - 1, fontWeight: 600 };
  }
  const desplazo = contorno ? 0 : 6;
  if (e.multilinea) {
    return { ...base, top: (contorno ? 9 : 21) - 1, left: izquierda, fontSize: t.tamano.etiqueta + 1 };
  }
  return {
    ...base,
    top: `calc(50% + ${desplazo}px)`,
    left: izquierda,
    transform: "translateY(-50%)",
    fontSize: t.tamano.etiqueta + 1,
  };
}

/** Caja de un campo con ícono, prefijo y sufijo; enfoca el control al hacer clic en cualquier parte. */
export function CajaCampo(props: PropsCaja) {
  const { foco, error, deshabilitado, multilinea, icono: Icono, prefijo, sufijo, flotante, style, children } = props;
  const t = useTokens();
  const conFlotante = Boolean(flotante);
  const caja = estiloCaja(t, { foco, error, deshabilitado, multilinea, conFlotante });
  const relleno = t.campo.estilo === "subrayado" ? 2 : 10;
  const izquierda = relleno + (Icono ? 16 + 8 : 0);
  // En relleno y subrayado la etiqueta flotante ocupa la parte alta: el contenido baja.
  const bajar = conFlotante && t.campo.estilo !== "contorno";

  function alClic(e: MouseEvent<HTMLDivElement>) {
    if (deshabilitado || e.target !== e.currentTarget) return;
    e.currentTarget.querySelector<HTMLElement>("input, textarea, select")?.focus();
  }

  return (
    <div
      onClick={alClic}
      style={{
        ...caja,
        ...(bajar ? (multilinea ? { paddingTop: 21 } : { paddingTop: 12 }) : null),
        ...style,
      }}
    >
      <EstilosCampos />
      {Icono && (
        <span style={{ ...estiloAfijo(t), color: foco ? t.campo.bordeFoco : t.textoSuave }} aria-hidden>
          <Icono size={16} />
        </span>
      )}
      {/* Con etiqueta flotante en reposo, el prefijo se esconde para no taparla. */}
      {prefijo && (!flotante || flotante.arriba) && <span style={estiloAfijo(t)}>{prefijo}</span>}
      {children}
      {sufijo && <span style={estiloAfijo(t)}>{sufijo}</span>}
      {flotante && (
        <label htmlFor={flotante.htmlFor} style={estiloFlotante(t, flotante, izquierda, props)}>
          {flotante.texto}
          {flotante.requerido && <Asterisco />}
        </label>
      )}
    </div>
  );
}
