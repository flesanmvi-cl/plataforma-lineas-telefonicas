/**
 * Tema del laboratorio de gráficos (/ui-kit/laboratorio-graficos).
 *
 * Todas las opciones que se pueden elegir en el panel «Tema» y los tokens que salen de
 * ellas. Cada gráfico del laboratorio lee `TokensLab` (vía useLabTema) y NO hardcodea
 * colores, letra, radios ni animación: así una misma combinación se ve en toda la
 * galería, el comparador y el tablero en contexto, y se puede exportar como estándar.
 *
 * Contrato para un gráfico nuevo:
 * - colores de series: tokens.colores[i % n]; escalas: tokens.secuencial / tokens.divergente.
 * - mejora/empeora/alerta (chips de variación, semáforos): tokens.estado.
 * - texto: tokens.texto / tokens.textoSuave; grilla y ejes: tokens.grilla / tokens.eje.
 * - letra: tokens.fuente (string con la familia real, sirve también para canvas).
 * - superficie: tokens.superficie ("plana" | "sombras" | "degradado" | "glass" | "contorno");
 *   cada gráfico decide cómo se nota (sombra bajo la línea, relleno con degradado, etc.).
 * - animación: tokens.animacion.duracion (ms, 0 = sin) y tokens.animacion.easing.
 * - curva: tokens.curva; grilla: tokens.grilla visible según tokens.grillaModo.
 * - etiquetas: tokens.etiquetas ("leyenda" | "directas").
 */

export type PaletaId = "marca" | "marca-extendida" | "grafito" | "equilibrada" | "tableau" | "okabe-ito" | "tierra";
export type FuenteId =
  | "barlow"
  | "barlow-semi"
  | "inter-tight"
  | "ibm-plex"
  | "geist"
  | "manrope"
  | "dm-sans"
  | "source-sans";
export type Superficie = "plana" | "sombras" | "degradado" | "glass" | "contorno";
export type Densidad = "compacta" | "comoda";
export type AnimacionId = "sin" | "suave" | "expresiva";
export type TooltipId = "oscuro" | "claro" | "tarjeta";
export type Curva = "recta" | "suave" | "escalonada";
export type GrillaModo = "completa" | "minima" | "sin";
export type Etiquetas = "leyenda" | "directas";

export interface TemaLab {
  paleta: PaletaId;
  fuente: FuenteId;
  superficie: Superficie;
  radio: number;
  densidad: Densidad;
  animacion: AnimacionId;
  tooltip: TooltipId;
  curva: Curva;
  grillaModo: GrillaModo;
  etiquetas: Etiquetas;
  grosorLinea: number;
}

export const TEMA_INICIAL: TemaLab = {
  paleta: "marca",
  fuente: "inter-tight",
  superficie: "plana",
  radio: 10,
  densidad: "compacta",
  animacion: "suave",
  tooltip: "oscuro",
  curva: "suave",
  grillaModo: "minima",
  etiquetas: "leyenda",
  grosorLinea: 2,
};

interface DefPaleta {
  nombre: string;
  descripcion: string;
  /** Respeta la regla de marca (rojo Flesan como único acento). */
  deMarca: boolean;
  colores: string[];
  secuencial: string[];
  divergente: string[];
}

export const PALETAS: Record<PaletaId, DefPaleta> = {
  marca: {
    nombre: "Marca estricta",
    descripcion: "Rojo Flesan como único acento, el resto en negros y grises.",
    deMarca: true,
    colores: ["#E30613", "#231F20", "#58595B", "#8B8C8E", "#A8A9A9", "#D9D9D9", "#7A0309", "#3A3536"],
    secuencial: ["#FDE7E8", "#F8B4B8", "#F06A72", "#E30613", "#A3040E", "#5E0208"],
    divergente: ["#231F20", "#6B6667", "#C9C7C7", "#F4F4F4", "#F4A3A8", "#EC4A54", "#E30613"],
  },
  "marca-extendida": {
    nombre: "Marca extendida",
    descripcion: "Rojo y negro de marca más tres apoyos para más de cuatro series.",
    deMarca: false,
    colores: ["#E30613", "#231F20", "#1F6FB2", "#E8A33D", "#2E8B7A", "#8B8C8E", "#7B4B94", "#D9D9D9"],
    secuencial: ["#FDE7E8", "#F8B4B8", "#F06A72", "#E30613", "#A3040E", "#5E0208"],
    divergente: ["#1F6FB2", "#6FA3CF", "#C4D9EC", "#F4F4F4", "#F4A3A8", "#EC4A54", "#E30613"],
  },
  grafito: {
    nombre: "Grafito con foco",
    descripcion: "Todo en grises; el rojo solo marca lo que importa.",
    deMarca: true,
    colores: ["#E30613", "#3A3536", "#6B6667", "#8B8C8E", "#A8A9A9", "#C4C4C4", "#D9D9D9", "#231F20"],
    secuencial: ["#F4F4F4", "#D9D9D9", "#A8A9A9", "#6B6667", "#3A3536", "#231F20"],
    divergente: ["#231F20", "#6B6667", "#C9C7C7", "#F4F4F4", "#F4A3A8", "#EC4A54", "#E30613"],
  },
  equilibrada: {
    nombre: "Equilibrada",
    descripcion: "Tonos con peso visual parejo (luminosidad similar en OKLCH).",
    deMarca: false,
    colores: ["#D1495B", "#EDAE49", "#00798C", "#30638E", "#66A182", "#8D6A9F", "#003D5B", "#B5B5B5"],
    secuencial: ["#E6F2F4", "#A9D3DA", "#5FAFBC", "#00798C", "#005766", "#003640"],
    divergente: ["#30638E", "#7FA1C2", "#C8D6E4", "#F4F4F4", "#EBB8BF", "#DB7B89", "#D1495B"],
  },
  tableau: {
    nombre: "Tableau 10",
    descripcion: "La paleta por defecto de Tableau: familiar para quien viene de ahí.",
    deMarca: false,
    colores: ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7"],
    secuencial: ["#EAF1F8", "#BCD2E8", "#86ADD3", "#4E79A7", "#355A80", "#1F3A57"],
    divergente: ["#4E79A7", "#8FB0CF", "#CCDAE8", "#F4F4F4", "#F7C39A", "#F2A05C", "#F28E2B"],
  },
  "okabe-ito": {
    nombre: "Okabe-Ito (daltonismo)",
    descripcion: "Distinguible con los tipos comunes de daltonismo.",
    deMarca: false,
    colores: ["#E69F00", "#56B4E9", "#009E73", "#0072B2", "#D55E00", "#CC79A7", "#F0E442", "#000000"],
    secuencial: ["#E8F4FB", "#B3DCF3", "#56B4E9", "#0072B2", "#00508A", "#003158"],
    divergente: ["#0072B2", "#56B4E9", "#BFE0F3", "#F4F4F4", "#F5C896", "#E69F00", "#D55E00"],
  },
  tierra: {
    nombre: "Tierra (construcción)",
    descripcion: "Ocres, óxidos y verdes secos: materiales de obra.",
    deMarca: false,
    colores: ["#8C2D19", "#D98841", "#F2C14E", "#5F7161", "#3A3B3C", "#A3A380", "#C75D3B", "#7D8C8A"],
    secuencial: ["#FBF1E1", "#F2D3A3", "#E3A865", "#C75D3B", "#8C2D19", "#561A0D"],
    divergente: ["#5F7161", "#93A294", "#CDD5CD", "#F4F4F4", "#EFC9A8", "#D98841", "#8C2D19"],
  },
};

interface DefFuente {
  nombre: string;
  /** Variable CSS que define next/font (global o del layout del laboratorio). */
  variable: string;
  respaldo: string;
  nota: string;
}

export const FUENTES: Record<FuenteId, DefFuente> = {
  barlow: { nombre: "Barlow", variable: "--font-barlow", respaldo: "sans-serif", nota: "Cuerpo de marca" },
  "barlow-semi": {
    nombre: "Barlow Semi Condensed",
    variable: "--font-barlow-semi",
    respaldo: "sans-serif",
    nota: "La que pide la guía para datos",
  },
  "inter-tight": {
    nombre: "Inter Tight",
    variable: "--font-inter-tight",
    respaldo: "sans-serif",
    nota: "Estilo reporte aprobado",
  },
  "ibm-plex": { nombre: "IBM Plex Sans", variable: "--font-lab-plex", respaldo: "sans-serif", nota: "Técnica, sobria" },
  geist: { nombre: "Geist", variable: "--font-lab-geist", respaldo: "sans-serif", nota: "Moderna, de producto" },
  manrope: { nombre: "Manrope", variable: "--font-lab-manrope", respaldo: "sans-serif", nota: "Redondeada, cálida" },
  "dm-sans": { nombre: "DM Sans", variable: "--font-lab-dm", respaldo: "sans-serif", nota: "Geométrica, limpia" },
  "source-sans": {
    nombre: "Source Sans 3",
    variable: "--font-lab-source",
    respaldo: "sans-serif",
    nota: "Muy legible en tablas",
  },
};

export const SUPERFICIES: Record<Superficie, { nombre: string; deMarca: boolean }> = {
  plana: { nombre: "Plana", deMarca: true },
  contorno: { nombre: "Contorno", deMarca: true },
  sombras: { nombre: "Sombras", deMarca: false },
  degradado: { nombre: "Degradado", deMarca: false },
  glass: { nombre: "Glass", deMarca: false },
};

export const ANIMACIONES: Record<AnimacionId, { nombre: string; duracion: number; easing: string }> = {
  sin: { nombre: "Sin", duracion: 0, easing: "linear" },
  suave: { nombre: "Suave", duracion: 600, easing: "cubicOut" },
  expresiva: { nombre: "Expresiva", duracion: 1200, easing: "elasticOut" },
};

export interface TokensLab {
  tema: TemaLab;
  oscuro: boolean;
  colores: string[];
  secuencial: string[];
  divergente: string[];
  /** Acento principal (primer color de la paleta). */
  acento: string;
  /** Colores semánticos de estado (no dependen de la paleta): mejora, empeora, alerta. */
  estado: { bueno: string; malo: string; alerta: string };
  texto: string;
  textoSuave: string;
  grilla: string;
  eje: string;
  fondo: string;
  fondoTarjeta: string;
  /** Familia real de la letra (resuelta desde la variable CSS), usable en canvas. */
  fuente: string;
  superficie: Superficie;
  radio: number;
  animacion: { duracion: number; easing: string; /** Equivalente CSS/motion. */ easingCss: string };
  tooltip: { fondo: string; texto: string; borde: string; sombra: string };
  curva: Curva;
  grillaModo: GrillaModo;
  etiquetas: Etiquetas;
  grosorLinea: number;
  /** Tamaños de letra en px para ejes, etiquetas y títulos internos del gráfico. */
  tamano: { eje: number; etiqueta: number; valor: number };
}

/** Lee la familia real que next/font puso en la variable CSS (para canvas y SVG). */
export function resolverFuente(id: FuenteId): string {
  const def = FUENTES[id];
  if (typeof window === "undefined") return def.respaldo;
  // Las letras propias del laboratorio definen su variable en su contenedor, no en <html>.
  const raiz = document.querySelector("[data-lab-raiz]") ?? document.documentElement;
  const valor = getComputedStyle(raiz).getPropertyValue(def.variable).trim();
  return valor ? `${valor}, ${def.respaldo}` : def.respaldo;
}

export function calcularTokens(tema: TemaLab, oscuro: boolean, fuente: string): TokensLab {
  const paleta = PALETAS[tema.paleta];
  // En oscuro, el negro de marca no se ve: se cambia por un gris claro.
  const colores = oscuro ? paleta.colores.map((c) => (c === "#231F20" || c === "#000000" ? "#F4F4F4" : c)) : paleta.colores;
  const anim = ANIMACIONES[tema.animacion];
  const compacta = tema.densidad === "compacta";

  const tooltips = {
    oscuro: { fondo: "#231F20", texto: "#F4F4F4", borde: "#231F20", sombra: "0 8px 24px rgba(0,0,0,0.25)" },
    claro: {
      fondo: oscuro ? "#232323" : "#FFFFFF",
      texto: oscuro ? "#F4F4F4" : "#231F20",
      borde: oscuro ? "#3A3A3A" : "#E2E2E2",
      sombra: "0 8px 24px rgba(0,0,0,0.12)",
    },
    tarjeta: {
      fondo: oscuro ? "rgba(35,35,35,0.85)" : "rgba(255,255,255,0.85)",
      texto: oscuro ? "#F4F4F4" : "#231F20",
      borde: oscuro ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
      sombra: "0 18px 40px -12px rgba(20,20,40,0.35)",
    },
  } as const;

  return {
    tema,
    oscuro,
    colores,
    secuencial: paleta.secuencial,
    divergente: paleta.divergente,
    acento: colores[0],
    // Mismos que --color-status-* de la plantilla; en oscuro, un tono más claro para contraste.
    estado: oscuro
      ? { bueno: "#4ADE80", malo: "#FF5A63", alerta: "#FBBF24" }
      : { bueno: "#15803D", malo: "#E30613", alerta: "#B45309" },
    texto: oscuro ? "#F4F4F4" : "#231F20",
    textoSuave: oscuro ? "#A8A9A9" : "#6B6C6E",
    grilla: oscuro ? "#2C2C2C" : "#ECECEC",
    eje: oscuro ? "#3A3A3A" : "#D9D9D9",
    fondo: oscuro ? "#0F0F0F" : "#F4F4F4",
    fondoTarjeta: oscuro ? "#1A1A1A" : "#FFFFFF",
    fuente,
    superficie: tema.superficie,
    radio: tema.radio,
    animacion: {
      duracion: anim.duracion,
      easing: anim.easing,
      easingCss: tema.animacion === "expresiva" ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    tooltip: tooltips[tema.tooltip],
    curva: tema.curva,
    grillaModo: tema.grillaModo,
    etiquetas: tema.etiquetas,
    grosorLinea: tema.grosorLinea,
    tamano: compacta ? { eje: 11, etiqueta: 12, valor: 22 } : { eje: 12, etiqueta: 13, valor: 26 },
  };
}

/** Color con alfa (acepta #RRGGBB). */
export function conAlfa(hex: string, alfa: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

/** Tema elegido como tokens CSS para llevar al @theme de la plantilla. */
export function exportarCss(tokens: TokensLab): string {
  const { tema } = tokens;
  const lineas = [
    `/* Estándar de gráficos elegido en el laboratorio */`,
    `/* paleta: ${PALETAS[tema.paleta].nombre} · letra: ${FUENTES[tema.fuente].nombre} · superficie: ${SUPERFICIES[tema.superficie].nombre} */`,
    ...PALETAS[tema.paleta].colores.map((c, i) => `--color-chart-${i + 1}: ${c};`),
    ...PALETAS[tema.paleta].secuencial.map((c, i) => `--color-chart-seq-${i + 1}: ${c};`),
    ...PALETAS[tema.paleta].divergente.map((c, i) => `--color-chart-div-${i + 1}: ${c};`),
    `--font-chart: var(${FUENTES[tema.fuente].variable});`,
    `--radius-chart: ${tema.radio}px;`,
    `--chart-superficie: ${tema.superficie};`,
    `--chart-animacion-ms: ${ANIMACIONES[tema.animacion].duracion};`,
    `--chart-tooltip: ${tema.tooltip};`,
    `--chart-curva: ${tema.curva};`,
    `--chart-grilla: ${tema.grillaModo};`,
    `--chart-etiquetas: ${tema.etiquetas};`,
    `--chart-linea: ${tema.grosorLinea}px;`,
    `--chart-densidad: ${tema.densidad};`,
  ];
  return lineas.join("\n");
}
