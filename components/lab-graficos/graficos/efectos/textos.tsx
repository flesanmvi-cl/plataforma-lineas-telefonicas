"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Database, Lightbulb, MessageSquare, Pause, Play, RefreshCw, RotateCcw } from "lucide-react";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { CiaLogo } from "@/components/cia-logo";
import { useMovimiento } from "./comun";

const botonChico = (t: ReturnType<typeof useTokens>): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: t.textoSuave,
  background: "transparent",
  border: `1px solid ${t.grilla}`,
  borderRadius: 999,
  padding: "3px 10px",
  cursor: "pointer",
});

// Título que entra palabra por palabra, de borroso a nítido. Para la portada de una plataforma
// o el inicio de un recorrido; una vez por carga, nunca en cada cambio de filtro.
export function TituloPalabras({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const [vuelta, setVuelta] = useState(0);
  const palabras = "Control de avance de obras".split(" ");
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, fontFamily: t.fuente }}>
      <motion.span
        key={`e${vuelta}`}
        initial={activo ? { opacity: 0, x: -8 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: seg(0.5) }}
        className="label-eyebrow brand-bullet"
      >
        Centro de Inteligencia Analítica
      </motion.span>
      <h4 key={`t${vuelta}`} style={{ margin: 0, fontSize: 30, lineHeight: 1.1, fontWeight: 800, color: t.texto, textWrap: "balance" }}>
        {palabras.map((p, i) => (
          <motion.span
            key={i}
            style={{ display: "inline-block", marginRight: "0.28em" }}
            initial={activo ? { opacity: 0, y: 14, filter: "blur(8px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: seg(0.55), delay: seg(0.15 + i * 0.09), ease: [0.22, 1, 0.36, 1] }}
          >
            {p}
          </motion.span>
        ))}
      </h4>
      <motion.p
        key={`s${vuelta}`}
        initial={activo ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: seg(0.6), delay: seg(0.7) }}
        style={{ margin: 0, fontSize: 14, color: t.textoSuave }}
      >
        Programado versus real por proyecto, negocio y país. Confianza que construye.
      </motion.p>
      <div>
        <button type="button" onClick={() => setVuelta((v) => v + 1)} style={botonChico(t)}>
          <RotateCcw className="w-3.5 h-3.5" /> Repetir
        </button>
      </div>
    </div>
  );
}

// Retícula de fondo donde se encienden celdas al azar (animated grid pattern). Fondo de portada,
// login o encabezado del Portal: da vida sin competir con el texto que va encima.
export function ReticulaAnimada({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const C = 28;
  const cols = Math.ceil(640 / C);
  const filas = Math.ceil(alto / C);
  const [celdas, setCeldas] = useState<{ id: number; x: number; y: number }[]>([]);
  // Contador fuera del efecto: en desarrollo React monta los efectos dos veces y las claves se repetirían.
  const sig = useRef(0);

  useEffect(() => {
    if (!activo) {
      setCeldas([]);
      return;
    }
    const tick = () => {
      setCeldas((prev) => {
        const nuevas = Array.from({ length: 3 }, () => ({ id: sig.current++, x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * filas) }));
        return [...prev, ...nuevas].slice(-14);
      });
    };
    tick();
    const id = window.setInterval(tick, seg(0.7) * 1000);
    return () => window.clearInterval(id);
  }, [activo, cols, filas, seg]);

  return (
    <div style={{ position: "relative", height: alto, overflow: "hidden", borderRadius: t.radio, fontFamily: t.fuente }}>
      <svg width="100%" height="100%" viewBox={`0 0 640 ${alto}`} preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <pattern id={`${uid}-r`} width={C} height={C} patternUnits="userSpaceOnUse">
            <path d={`M ${C} 0 L 0 0 0 ${C}`} fill="none" stroke={t.grilla} strokeWidth={1} />
          </pattern>
          <radialGradient id={`${uid}-v`}>
            <stop offset="0%" stopColor={t.fondoTarjeta} stopOpacity={0} />
            <stop offset="100%" stopColor={t.fondoTarjeta} stopOpacity={1} />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-r)`} />
        <AnimatePresence>
          {celdas.map((c) => (
            <motion.rect
              key={c.id}
              x={c.x * C + 1}
              y={c.y * C + 1}
              width={C - 1}
              height={C - 1}
              fill={t.acento}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0.12] }}
              exit={{ opacity: 0 }}
              transition={{ duration: seg(2.2), ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
        <rect width="100%" height="100%" fill={`url(#${uid}-v)`} />
      </svg>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", padding: 16 }}>
        <CiaLogo className="w-12 h-12 text-flesan-red dark:text-white" />
        <span style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>Centro de Inteligencia Analítica</span>
        <span style={{ fontSize: 13, color: t.textoSuave }}>Confianza que construye</span>
      </div>
    </div>
  );
}

const AVISOS = [
  { icono: AlertTriangle, titulo: "P-2047 pasó a Atrasado", detalle: "Desvío de −6,4 pp en Autopista Rancagua", tono: "malo" },
  { icono: Database, titulo: "Carga de proyecciones completada", detalle: "flesan_procesos · 06:12 · sin errores", tono: "bueno" },
  { icono: Lightbulb, titulo: "Nuevo desafío en Minería", detalle: "Reducir tiempos de chancado en Calama", tono: "neutro" },
  { icono: MessageSquare, titulo: "Te mencionaron en P-2014", detalle: "Control de proyectos pide revisar moldajes", tono: "neutro" },
  { icono: CheckCircle2, titulo: "Auditoría de bodega cerrada", detalle: "3 hallazgos con plan de acción", tono: "bueno" },
] as const;

// Lista donde los avisos nuevos entran arriba y empujan al resto (animated list). Para la
// campana de notificaciones o un panel de actividad reciente.
export function ListaAnimada({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const [items, setItems] = useState(() => [0, 1, 2].map((i) => ({ id: i, ...AVISOS[i] })));
  const [pausa, setPausa] = useState(false);
  const sig = useRef(3);

  useEffect(() => {
    if (pausa) return;
    const id = window.setInterval(() => {
      const n = sig.current++;
      setItems((prev) => [{ id: n, ...AVISOS[n % AVISOS.length] }, ...prev].slice(0, 4));
    }, (activo ? seg(2.4) : 2.4) * 1000);
    return () => window.clearInterval(id);
  }, [pausa, activo, seg]);

  const color = (tono: string) => (tono === "malo" ? t.estado.malo : tono === "bueno" ? t.estado.bueno : t.textoSuave);

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 8, fontFamily: t.fuente }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: t.textoSuave }}>Actividad reciente</span>
        <button type="button" onClick={() => setPausa((p) => !p)} style={botonChico(t)}>
          {pausa ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {pausa ? "Seguir" : "Pausar"}
        </button>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence initial={false}>
          {items.map(({ id, icono: Icono, titulo, detalle, tono }) => (
            <motion.li
              key={id}
              layout={activo}
              initial={activo ? { opacity: 0, y: -16, scale: 0.97 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={activo ? { opacity: 0, scale: 0.97 } : { opacity: 0, transition: { duration: 0 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                background: t.fondoTarjeta,
                border: `1px solid ${t.grilla}`,
                borderRadius: t.radio,
                padding: "9px 12px",
              }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", background: conAlfa(color(tono), 0.12), flexShrink: 0 }}>
                <Icono className="w-4 h-4" style={{ color: color(tono) }} />
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: t.texto }}>{titulo}</span>
                <span style={{ fontSize: 12, color: t.textoSuave, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detalle}</span>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

// Botones con brillo: un destello que cruza el principal (shimmer) y un contorno con haz que
// gira. Solo para la acción principal de una portada o un llamado único, nunca en barras de
// herramientas.
export function BotonBrillo({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const b = t.boton;
  const base: CSSProperties = {
    height: b.alto.lg,
    padding: "0 22px",
    borderRadius: b.radio,
    fontSize: b.tamanoTexto.lg,
    fontWeight: b.fontWeight,
    textTransform: b.textTransform,
    letterSpacing: b.letterSpacing,
    fontFamily: t.fuente,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
  return (
    <div style={{ minHeight: alto, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <button
        type="button"
        className={activo ? "mv-brillo is-activo" : "mv-brillo"}
        style={{ ...base, background: t.acento, color: "#FFFFFF", border: 0, boxShadow: b.sombra, ["--mv-brillo-s" as string]: `${seg(3)}s` }}
      >
        Ingresar al Portal
      </button>
      <button
        type="button"
        className={activo ? "mv-haz is-activo" : "mv-haz"}
        style={{ ...base, background: t.fondoTarjeta, color: t.texto, ["--mv-acento" as string]: t.acento, ["--mv-haz-s" as string]: `${seg(3)}s` }}
      >
        Ver novedades
      </button>
    </div>
  );
}

// Cifras que ruedan dígito a dígito al cambiar (odómetro). Para un KPI que se actualiza en vivo;
// a diferencia de «Cifra animada» (KPIs), solo se mueven los dígitos que cambian.
export function CifrasRodillo({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const [cartera, setCartera] = useState(1284.6);
  const [avance, setAvance] = useState(68.4);
  const actualizar = () => {
    setCartera((v) => Math.round((v + (Math.random() * 40 - 12)) * 10) / 10);
    setAvance((v) => Math.min(100, Math.round((v + Math.random() * 3) * 10) / 10));
  };
  const fmt = (v: number) => v.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, fontFamily: t.fuente }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px" }}>
        {[
          { label: "Cartera", texto: fmt(cartera), unidad: "MUF" },
          { label: "Avance ponderado", texto: fmt(avance), unidad: "%" },
        ].map((k) => (
          <div key={k.label} style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, color: t.textoSuave }}>{k.label}</span>
            <span style={{ fontSize: 34, fontWeight: 800, color: t.texto, lineHeight: 1.15, display: "inline-flex", alignItems: "baseline", gap: 6 }}>
              <Rodillo texto={k.texto} ms={activo ? seg(0.7) * 1000 : 0} />
              <span style={{ fontSize: 16, fontWeight: 600, color: t.textoSuave }}>{k.unidad}</span>
            </span>
          </div>
        ))}
      </div>
      <div>
        <button type="button" onClick={actualizar} style={botonChico(t)}>
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar datos
        </button>
      </div>
    </div>
  );
}

function Rodillo({ texto, ms }: { texto: string; ms: number }) {
  return (
    <span style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums" }} aria-label={texto}>
      {texto.split("").map((c, i) =>
        /\d/.test(c) ? (
          <span key={`${texto.length - i}`} aria-hidden style={{ display: "inline-block", height: "1.15em", overflow: "hidden" }}>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${-Number(c) * 1.15}em)`,
                transition: `transform ${ms}ms cubic-bezier(.22,1,.36,1)`,
              }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} style={{ height: "1.15em", lineHeight: "1.15em" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${texto.length - i}`} aria-hidden>
            {c}
          </span>
        ),
      )}
    </span>
  );
}
