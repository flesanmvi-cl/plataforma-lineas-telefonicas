"use client";

import { useMemo, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, MESES, serieMensual } from "@/lib/lab-graficos/datos";
import { Sparkline } from "./sparkline";
import { ChipVariacion, CifraKpi, TarjetaKpi } from "./tarjeta-kpi";

const MESES_CERRADOS = 9;
const META_ANUAL = 12000;
const ANIO_ANTERIOR = 8190;

const millones = (v: number) => `$ ${formato.entero(v)} M`;

// KPI «hero» para portadas de reporte (HTML + sparkline visx): una cifra protagonista del doble
// del tamaño elegido, su variación, el contexto contra la meta y la tendencia mensual debajo.
// Pasar el mouse por la tendencia muestra las ventas de ese mes.
export function KpiHero({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [mes, setMes] = useState<number | null>(null);
  const valores = useMemo(() => serieMensual(5, 960, 22, 90).slice(0, MESES_CERRADOS), []);
  const total = valores.reduce((s, v) => s + v, 0);
  const variacion = ((total - ANIO_ANTERIOR) / ANIO_ANTERIOR) * 100;
  const proyeccion = Math.round((total / MESES_CERRADOS) * 12);

  return (
    <div style={{ height: alto, display: "flex" }}>
      <TarjetaKpi
        t={t}
        pad={20}
        titulo="Ventas acumuladas 2026"
        estilo={{ flex: 1 }}
        extra={
          <span style={{ color: mes !== null ? t.texto : t.textoSuave, fontVariantNumeric: "tabular-nums" }}>
            {mes !== null ? `${MESES[mes]}: ${millones(valores[mes])}` : `Ene–${MESES[MESES_CERRADOS - 1]}`}
          </span>
        }
      >
        <div style={{ marginTop: 6 }}>
          <CifraKpi t={t} valor={total} formatear={millones} escala={1.9} />
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 4, marginTop: 8 }}>
          <ChipVariacion
            t={t}
            texto={`+${formato.decimal(variacion)}%`}
            direccion="sube"
            bueno
            sufijo="vs mismo período 2025"
          />
          <span style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>
            {formato.porcentaje((total / META_ANUAL) * 100, 1)} de la meta anual · cierre proyectado{" "}
            <strong style={{ color: t.texto, fontWeight: 600 }}>{millones(proyeccion)}</strong>
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 24, marginTop: 12 }}>
          <ParentSize>
            {({ width, height }) =>
              width > 0 && height > 0 ? (
                <Sparkline valores={valores} ancho={width} alto={height} color={t.acento} t={t} onHover={setMes} />
              ) : null
            }
          </ParentSize>
        </div>
      </TarjetaKpi>
    </div>
  );
}
