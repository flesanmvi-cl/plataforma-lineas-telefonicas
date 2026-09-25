/**
 * Registros sintéticos y deterministas para las tablas del laboratorio (misma semilla, mismos
 * datos en servidor y cliente). Nombres de obra y de responsables inventados.
 */
import { azar, LINEAS, MESES, REGIONES_CORTAS } from "@/lib/lab-graficos/datos";
import type { Estado } from "./comun";

const TIPOS = ["Edificio", "Torre", "Puente", "Planta", "Ruta", "Hospital", "Condominio", "Embalse", "Colegio", "Centro"];
const LUGARES = ["Norte", "Costa", "Valle", "Mirador", "Cordillera", "Puerto", "Oriente", "Poniente", "Alto", "Río", "Parque", "Sur"];

/** Responsables inventados (no son personas reales). */
export const RESPONSABLES = [
  "Camila Rojas",
  "Diego Fuentes",
  "Valentina Soto",
  "Matías Pérez",
  "Fernanda Muñoz",
  "Tomás Contreras",
  "Josefa Araya",
  "Benjamín Silva",
];

export interface Registro {
  id: string;
  codigo: string;
  obra: string;
  linea: string;
  region: string;
  responsable: string;
  /** Índice del responsable (para el color del avatar). */
  resp: number;
  estado: Estado;
  /** Montos en millones de pesos. */
  presupuesto: number;
  costo: number;
  /** Avance y meta en %. */
  avance: number;
  meta: number;
  /** Fecha de término comprometida (ISO). */
  termino: string;
  /** Avance mensual acumulado (12 meses) para mini gráficos. */
  mensual: number[];
}

/** n obras sintéticas con estado coherente con su avance contra meta. */
export function registrosObras(n = 24, semilla = 101): Registro[] {
  const r = azar(semilla);
  return Array.from({ length: n }, (_, i) => {
    const tipo = TIPOS[Math.floor(r() * TIPOS.length)];
    const lugar = LUGARES[(i * 7 + Math.floor(r() * 5)) % LUGARES.length];
    const meta = Math.round(40 + r() * 55);
    const avance = Math.max(3, Math.min(100, Math.round(meta * (0.72 + r() * 0.4))));
    const brecha = avance - meta;
    const estado: Estado = brecha >= -3 ? "En plazo" : brecha >= -10 ? "En riesgo" : "Atrasado";
    const presupuesto = Math.round(80 + r() * 1400);
    const resp = Math.floor(r() * RESPONSABLES.length);
    const mes = 1 + Math.floor(r() * 12);
    const dia = 1 + Math.floor(r() * 28);
    let acumulado = 0;
    const mensual = MESES.map((_, k) => {
      acumulado = Math.min(avance, acumulado + (avance / 12) * (0.5 + r()));
      return Math.round(k === 11 ? avance : acumulado);
    });
    return {
      id: `o${i + 1}`,
      codigo: `OB-${String(1040 + i * 3).padStart(4, "0")}`,
      obra: `${tipo} ${lugar}${i >= LUGARES.length ? ` ${Math.floor(i / LUGARES.length) + 1}` : ""}`,
      linea: LINEAS[Math.floor(r() * LINEAS.length)],
      region: REGIONES_CORTAS[Math.floor(r() * REGIONES_CORTAS.length)],
      responsable: RESPONSABLES[resp],
      resp,
      estado,
      presupuesto,
      costo: Math.round(presupuesto * (0.86 + r() * 0.24)),
      avance,
      meta,
      termino: `2027-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      mensual,
    };
  });
}

/** Fecha ISO a formato corto es-CL (dd-mm-aaaa), sin depender de la zona horaria. */
export function fechaCorta(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}-${m}-${a}`;
}
