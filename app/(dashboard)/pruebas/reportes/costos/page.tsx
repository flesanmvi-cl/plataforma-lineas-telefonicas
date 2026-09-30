import { ReporteCostos } from "@/components/pruebas/reporte-costos";

// Antes era el Reporte Tipo 2: queda como referencia del patrón de drilldown (Línea → Obra → Partida).
export const metadata = { title: "Costos por obra · drilldown" };

export default function ReporteCostosPage() {
  return <ReporteCostos />;
}
