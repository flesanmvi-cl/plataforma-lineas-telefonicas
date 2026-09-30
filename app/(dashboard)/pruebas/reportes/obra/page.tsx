import { ReporteObra } from "@/components/pruebas/reporte-obra";

// Antes era el Reporte Tipo 3: queda como referencia de la ficha de una entidad (una obra).
export const metadata = { title: "Ficha de obra" };

export default function FichaObraPage() {
  return <ReporteObra />;
}
