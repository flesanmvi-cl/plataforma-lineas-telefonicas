"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { Building2, ClipboardCheck, Lightbulb } from "lucide-react";
import { cn } from "@/lib/cn";
import { conAlfa } from "@/lib/lab-graficos/tema";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { pct, useMovimiento } from "./comun";

const KPIS = [
  { label: "Avance físico", valor: "68,4 %", sub: "programado 71,0 %", alerta: false },
  { label: "Desvío de plazo", valor: "−2,6 pp", sub: "pasó a «En riesgo» hoy", alerta: true },
  { label: "Cartera", valor: "1.284,6 MUF", sub: "36 proyectos", alerta: false },
];

// Borde con un haz de luz que recorre la tarjeta (border beam). Se usa en una sola tarjeta para
// marcar lo que pide atención; en todas a la vez pierde el sentido.
export function BordeHaz({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        alignContent: "center",
        fontFamily: t.fuente,
      }}
    >
      {KPIS.map((k) => (
        <div
          key={k.label}
          className={cn("mv-haz", k.alerta && (activo ? "is-activo" : "is-fijo"))}
          style={
            {
              "--mv-acento": t.acento,
              "--mv-haz-s": `${seg(3.6)}s`,
              borderRadius: t.radio,
              background: t.fondoTarjeta,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            } as CSSProperties
          }
        >
          <span style={{ fontSize: 12, color: t.textoSuave }}>{k.label}</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: k.alerta ? t.acento : t.texto, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {k.valor}
          </span>
          <span style={{ fontSize: 12, color: t.textoSuave }}>{k.sub}</span>
        </div>
      ))}
    </div>
  );
}

const MODULOS = [
  { icono: Building2, nombre: "Control de obras", texto: "Avance programado y real de 36 proyectos." },
  { icono: Lightbulb, nombre: "Desafíos", texto: "Ideas de mejora en evaluación y en curso." },
  { icono: ClipboardCheck, nombre: "Auditorías", texto: "Hallazgos abiertos y planes de acción." },
];

// Foco que sigue al mouse dentro de cada tarjeta (spotlight). Pensado para la portada del Portal
// o el inicio de una plataforma, donde las tarjetas son puertas de entrada a módulos.
export function FocoMouse({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo } = useMovimiento(t);
  const mover = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        alignContent: "center",
        fontFamily: t.fuente,
      }}
    >
      {MODULOS.map(({ icono: Icono, nombre, texto }) => (
        <a
          key={nombre}
          href="#"
          onClick={(e) => e.preventDefault()}
          onPointerMove={activo ? mover : undefined}
          className={cn("mv-foco", activo && "is-activo")}
          style={
            {
              "--mv-foco": conAlfa(t.acento, t.oscuro ? 0.22 : 0.12),
              "--mv-foco-borde": conAlfa(t.acento, 0.7),
              borderRadius: t.radio,
              background: t.fondoTarjeta,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              color: t.texto,
              textDecoration: "none",
            } as CSSProperties
          }
        >
          <Icono className="w-5 h-5" style={{ color: t.acento }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{nombre}</span>
          <span style={{ fontSize: 12.5, color: t.textoSuave, lineHeight: 1.4 }}>{texto}</span>
        </a>
      ))}
    </div>
  );
}

// Tarjeta que se inclina hacia el mouse con capas a distinta profundidad (tilt). Para una ficha
// destacada o la tarjeta de un proyecto en una portada; no para grillas densas.
export function Inclinacion3D({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo } = useMovimiento(t);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 180, damping: 18 });
  const sy = useSpring(my, { stiffness: 180, damping: 18 });
  const rotY = useTransform(sx, [0, 1], [-14, 14]);
  const rotX = useTransform(sy, [0, 1], [10, -10]);
  const brilloX = useTransform(sx, (v) => `${v * 100}%`);
  const brilloY = useTransform(sy, (v) => `${v * 100}%`);
  const brillo = useMotionTemplate`radial-gradient(circle at ${brilloX} ${brilloY}, ${conAlfa("#FFFFFF", t.oscuro ? 0.55 : 0.16)}, transparent 55%)`;
  const obra = { codigo: "P-2014", nombre: "Hospital Antofagasta", avance: 68.4, programado: 71 };

  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const salir = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div style={{ minHeight: alto, display: "grid", placeItems: "center", perspective: 900, fontFamily: t.fuente }}>
      <motion.div
        ref={ref}
        onPointerMove={activo ? mover : undefined}
        onPointerLeave={salir}
        style={{
          rotateX: activo ? rotX : 0,
          rotateY: activo ? rotY : 0,
          transformStyle: "preserve-3d",
          width: "min(320px, 100%)",
          borderRadius: t.radio,
          background: t.texto,
          color: t.fondoTarjeta,
          padding: 20,
          position: "relative",
          boxShadow: "0 24px 50px -24px rgba(0,0,0,.55)",
        }}
      >
        <motion.div style={{ position: "absolute", inset: 0, borderRadius: t.radio, background: brillo, pointerEvents: "none" }} />
        <div style={{ transform: "translateZ(20px)", display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>
          <span>{obra.codigo} · Edificación</span>
          <span>Ficha de obra</span>
        </div>
        <div style={{ transform: "translateZ(45px)", fontSize: 20, fontWeight: 700, marginTop: 10 }}>{obra.nombre}</div>
        <div style={{ transform: "translateZ(60px)", fontSize: 34, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{pct(obra.avance)}</div>
        <div style={{ transform: "translateZ(30px)", height: 6, background: conAlfa(t.fondoTarjeta, 0.2), marginTop: 10, position: "relative" }}>
          <div style={{ width: `${obra.avance}%`, height: "100%", background: t.acento }} />
          <div style={{ position: "absolute", left: `${obra.programado}%`, top: -3, width: 2, height: 12, background: t.fondoTarjeta }} />
        </div>
        <div style={{ transform: "translateZ(20px)", fontSize: 12, opacity: 0.7, marginTop: 8 }}>Programado {pct(obra.programado)} · desvío −2,6 pp</div>
      </motion.div>
    </div>
  );
}
