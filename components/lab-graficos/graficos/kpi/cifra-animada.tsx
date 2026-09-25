"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { TokensLab } from "@/lib/lab-graficos/tema";

// Cifra que cuenta desde cero hasta su valor (motion). Con animación «Sin» muestra el valor
// final de inmediato. Parte en 0 tanto en servidor como en cliente para no romper la hidratación.
export function CifraAnimada({
  valor,
  formatear,
  t,
  retraso = 0,
}: {
  valor: number;
  formatear: (v: number) => string;
  t: TokensLab;
  retraso?: number;
}) {
  const mv = useMotionValue(0);
  const texto = useTransform(mv, (v) => formatear(v));
  const duracion = t.animacion.duracion;

  useEffect(() => {
    if (duracion === 0) {
      mv.set(valor);
      return;
    }
    mv.set(0);
    const control = animate(mv, valor, { duration: (duracion / 1000) * 1.6, delay: retraso, ease: [0.22, 1, 0.36, 1] });
    return () => control.stop();
  }, [valor, duracion, retraso, mv]);

  return <motion.span style={{ fontVariantNumeric: "tabular-nums" }}>{texto}</motion.span>;
}
