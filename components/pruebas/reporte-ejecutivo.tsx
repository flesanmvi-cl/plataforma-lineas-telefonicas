"use client";

import { useFiltrosUrl } from "@/components/presentaciones/use-filtros-url";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import { Download, Share2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { BotonLab } from "@/components/lab-graficos/graficos/botones/boton-lab";
import { KpiStrip } from "@/components/lab-graficos/graficos/kpi/kpi-strip";
import { LineaMultiserie } from "@/components/lab-graficos/graficos/tiempo/linea-multiserie";
import { DonaValorCentral } from "@/components/lab-graficos/graficos/composicion/dona-valor-central";
import { Bullet } from "@/components/lab-graficos/graficos/comparacion/bullet";
import { BarrasDivergentes } from "@/components/lab-graficos/graficos/comparacion/barras-divergentes";
import { TablaTotalesCondicional } from "@/components/lab-graficos/graficos/tablas/tabla-totales-condicional";
import { AvisoEjemplo, Bloque, Segmentado, type OpcionSegmentado } from "./piezas";

type Periodo = "mes" | "trimestre" | "anio";

const PERIODOS: OpcionSegmentado<Periodo>[] = [
  { id: "mes", texto: "Mes" },
  { id: "trimestre", texto: "Trimestre" },
  { id: "anio", texto: "Año" },
];

/** Rótulo del corte según el período elegido. */
const CORTE: Record<Periodo, string> = {
  mes: "Septiembre 2026",
  trimestre: "T3 2026 (jul-sep)",
  anio: "Acumulado 2026 (ene-sep)",
};

// Reporte Tipo 1 · tablero ejecutivo: franja de KPIs, evolución, composición, avance contra meta
// y tabla resumen, todo con muestras del laboratorio. El período solo cambia los rótulos: las
// muestras traen datos fijos.
export function ReporteEjecutivo() {
  const t = useTokens();
  // El período vive en la URL para que «Agregar a presentación» lo guarde con la vista.
  const [filtros, setFiltros] = useFiltrosUrl({ periodo: "mes" });
  const periodo = filtros.periodo as Periodo;
  const setPeriodo = (v: Periodo) => setFiltros({ periodo: v });
  const corte = CORTE[periodo];
  usePublicarVista("Resumen de gestión", [corte]);

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Resumen de gestión"
        description="Tablero ejecutivo del grupo: ventas, margen, avance de obras y cumplimiento contra meta del período. Las cifras son de ejemplo."
        actions={
          <>
            <BotonLab variante="fantasma" icono={Share2}>
              Compartir
            </BotonLab>
            <BotonLab variante="contorno" icono={Download}>
              Exportar
            </BotonLab>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmentado etiqueta="Período" opciones={PERIODOS} valor={periodo} onCambio={setPeriodo} />
        <span style={{ fontFamily: t.fuente, fontSize: t.tamano.etiqueta, color: t.textoSuave }}>
          Corte: <b style={{ color: t.texto, fontWeight: 600 }}>{corte}</b>
        </span>
        <div className="ml-auto">
          <AvisoEjemplo />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-12 min-w-0">
          <KpiStrip alto={100} />
        </div>

        <Bloque titulo="Venta mensual por línea de negocio" detalle="Millones de pesos" className="xl:col-span-8">
          <LineaMultiserie alto={320} />
        </Bloque>
        <Bloque titulo="Mix de venta" detalle={corte} className="xl:col-span-4">
          <DonaValorCentral alto={320} />
        </Bloque>

        <Bloque titulo="Avance real contra meta" detalle="% de avance físico por obra" className="xl:col-span-6">
          <Bullet alto={280} />
        </Bloque>
        <Bloque titulo="Variación de la venta por región" detalle="Contra el período anterior" className="xl:col-span-6">
          <BarrasDivergentes alto={280} />
        </Bloque>

        <Bloque titulo="Producción contra meta por obra" detalle={corte} className="xl:col-span-12">
          <TablaTotalesCondicional alto={380} />
        </Bloque>
      </div>
    </div>
  );
}
