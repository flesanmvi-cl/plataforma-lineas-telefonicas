import type { CSSProperties } from "react";
import { conAlfa, type TokensLab } from "@/lib/estandar/tema";

/** Neutros inevitables: texto sobre un relleno sólido (se elige por contraste). */
export const NEGRO_MARCA = "#231F20";
export const BLANCO = "#FFFFFF";

export type VarianteBoton = "solido" | "secundario" | "contorno" | "fantasma" | "texto" | "peligro" | "exito";
export type TamanoBoton = "sm" | "md" | "lg";

export const VARIANTES_BOTON: { id: VarianteBoton; nombre: string }[] = [
  { id: "solido", nombre: "Primario" },
  { id: "secundario", nombre: "Secundario" },
  { id: "contorno", nombre: "Contorno" },
  { id: "fantasma", nombre: "Fantasma" },
  { id: "texto", nombre: "Texto" },
  { id: "peligro", nombre: "Peligro" },
  { id: "exito", nombre: "Éxito" },
];

function luminancia(hex: string): number {
  const h = hex.replace("#", "");
  const canal = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

/** Blanco o negro de marca, el que tenga más contraste sobre el color dado (#RRGGBB). */
export function colorSobre(hex: string): string {
  const l = luminancia(hex);
  const contraBlanco = 1.05 / (l + 0.05);
  const contraNegro = (l + 0.05) / (luminancia(NEGRO_MARCA) + 0.05);
  return contraBlanco >= contraNegro ? BLANCO : NEGRO_MARCA;
}

/** Transición CSS corta para estados de control (hover, activo), según la animación del tema. */
export function transicionCss(t: TokensLab, propiedades = ["background-color", "color", "border-color", "box-shadow", "transform", "opacity"]) {
  const ms = t.animacion.duracion > 0 ? 160 : 0;
  return propiedades.map((p) => `${p} ${ms}ms ${t.animacion.easingCss}`).join(", ");
}

/** Transición de motion para piezas que se deslizan o aparecen (0 si el tema no anima). */
export function transicionMotion(t: TokensLab) {
  if (t.animacion.duracion === 0) return { duration: 0 };
  if (t.tema.animacion === "expresiva") return { type: "spring" as const, stiffness: 420, damping: 22 };
  return { duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
}

/** Anillo de foco visible, siempre del acento. */
export function anilloFoco(t: TokensLab, visible: boolean): CSSProperties {
  return { outline: visible ? `2px solid ${t.acento}` : "none", outlineOffset: 2 };
}

/** Capa que oscurece (claro) o aclara (oscuro) un relleno para hover y presionado. */
function capa(t: TokensLab, intensidad: number) {
  const c = t.oscuro ? `rgba(255,255,255,${intensidad})` : `rgba(0,0,0,${intensidad})`;
  return `linear-gradient(${c}, ${c})`;
}

/** Color base de las variantes con relleno. */
export function colorVariante(t: TokensLab, v: VarianteBoton): string | null {
  switch (v) {
    case "solido":
      return t.acento;
    case "peligro":
      return t.estado.malo;
    case "exito":
      return t.estado.bueno;
    case "secundario":
      return t.texto;
    default:
      return null;
  }
}

function sombraRelleno(t: TokensLab, color: string) {
  if (t.boton.sombra !== "none") return t.boton.sombra;
  if (t.superficie === "sombras") return `0 6px 14px -6px ${conAlfa(color, 0.55)}`;
  return "none";
}

/**
 * Colores, borde y sombra de una variante en un estado. Devuelve siempre las mismas llaves
 * (backgroundColor, backgroundImage, color, border, boxShadow) para no mezclar atajos CSS.
 */
export function estiloVariante(
  t: TokensLab,
  v: VarianteBoton,
  { hover = false, activo = false }: { hover?: boolean; activo?: boolean } = {},
): CSSProperties {
  const sup = t.superficie;
  const capaEstado = activo ? capa(t, 0.18) : hover ? capa(t, 0.1) : null;
  const base = colorVariante(t, v);

  if (base) {
    // Superficie contorno: todo se dibuja en línea, el color va en borde y texto.
    if (sup === "contorno") {
      return {
        backgroundColor: conAlfa(base, activo ? 0.2 : hover ? 0.12 : 0.04),
        backgroundImage: "none",
        color: base,
        border: `1.5px solid ${base}`,
        boxShadow: t.boton.sombra,
        backdropFilter: "none",
      };
    }
    if (t.boton.relleno === "suave") {
      const a = t.oscuro ? 0.18 : 0.11;
      return {
        backgroundColor: conAlfa(base, activo ? a + 0.14 : hover ? a + 0.07 : a),
        backgroundImage: "none",
        color: base,
        border: "1px solid transparent",
        boxShadow: sup === "sombras" || t.boton.sombra !== "none" ? sombraRelleno(t, base) : "none",
        backdropFilter: sup === "glass" ? "blur(8px)" : "none",
      };
    }
    const texto = colorSobre(base);
    if (sup === "glass") {
      const brillo = "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0) 60%)";
      return {
        backgroundColor: conAlfa(base, 0.78),
        backgroundImage: [capaEstado, brillo].filter(Boolean).join(", "),
        color: texto,
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: [t.boton.sombra !== "none" ? t.boton.sombra : null, "inset 0 1px 0 rgba(255,255,255,0.35)"]
          .filter(Boolean)
          .join(", "),
        backdropFilter: "blur(8px)",
      };
    }
    const capas = [capaEstado, sup === "degradado" ? "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 75%)" : null];
    return {
      backgroundColor: base,
      backgroundImage: capas.filter(Boolean).join(", ") || "none",
      color: texto,
      border: `1px solid ${base}`,
      boxShadow: sombraRelleno(t, base),
      backdropFilter: "none",
    };
  }

  const vidrio = sup === "glass";
  if (v === "contorno") {
    return {
      backgroundColor: activo
        ? conAlfa(t.texto, 0.1)
        : hover
          ? conAlfa(t.texto, 0.05)
          : vidrio
            ? t.oscuro
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.55)"
            : "transparent",
      backgroundImage: "none",
      color: t.texto,
      border: `1px solid ${hover || activo ? t.texto : conAlfa(t.texto, sup === "contorno" ? 0.45 : 0.25)}`,
      boxShadow: sup === "sombras" ? "0 2px 6px -2px rgba(0,0,0,0.15)" : "none",
      backdropFilter: vidrio ? "blur(8px)" : "none",
    };
  }
  if (v === "fantasma") {
    return {
      backgroundColor: activo ? conAlfa(t.texto, 0.12) : hover ? conAlfa(t.texto, 0.07) : "transparent",
      backgroundImage: "none",
      color: t.texto,
      border: "1px solid transparent",
      boxShadow: "none",
      backdropFilter: "none",
    };
  }
  // Texto: sin caja, el acento y un subrayado al pasar el mouse.
  return {
    backgroundColor: "transparent",
    backgroundImage: "none",
    color: t.acento,
    border: "1px solid transparent",
    boxShadow: "none",
    backdropFilter: "none",
    textDecoration: hover || activo ? "underline" : "none",
    textUnderlineOffset: 4,
    textDecorationThickness: 1.5,
  };
}

/** Fondo de las pistas y grupos (segmentado, toolbar, stepper) según la superficie del tema. */
export function estiloPista(t: TokensLab): CSSProperties {
  switch (t.superficie) {
    case "contorno":
      return { background: "transparent", border: `1px solid ${t.eje}` };
    case "glass":
      return {
        background: t.oscuro ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)",
        border: `1px solid ${t.oscuro ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.8)"}`,
        backdropFilter: "blur(10px)",
        boxShadow: `inset 0 1px 0 ${t.oscuro ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)"}`,
      };
    case "sombras":
      return { background: t.fondoTarjeta, border: `1px solid ${t.grilla}`, boxShadow: "0 4px 14px -6px rgba(0,0,0,0.18)" };
    case "degradado":
      return {
        background: `linear-gradient(180deg, ${conAlfa(t.texto, 0.03)}, ${conAlfa(t.texto, 0.08)})`,
        border: "1px solid transparent",
      };
    default:
      return { background: conAlfa(t.texto, 0.06), border: "1px solid transparent" };
  }
}

/** Radio para piezas internas de un grupo (un poco menor que el del botón). */
export function radioInterno(t: TokensLab, hueco = 3) {
  return t.boton.radio >= 999 ? 999 : Math.max(0, t.boton.radio - hueco);
}

/** Leyenda chica bajo o sobre una muestra. */
export function estiloEtiqueta(t: TokensLab): CSSProperties {
  return { fontFamily: t.fuente, fontSize: t.tamano.eje - 1, color: t.textoSuave, lineHeight: 1.3 };
}
