import { ReporteCostos } from "@/components/pruebas/reporte-costos";

// Reporte Tipo 4: patrón de drilldown (Línea → Obra → Partida).
export const metadata = { title: "Reporte Tipo 4 · Costos por obra" };

export default function ReporteTipo4Page() {
  return <ReporteCostos />;
}
