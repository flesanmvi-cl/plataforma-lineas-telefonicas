import { Suspense } from "react";
import { Comparador } from "@/components/lab-graficos/comparador";

export default function LaboratorioComparadorPage() {
  // useSearchParams (el gráfico elegido va en ?g=) necesita un límite de Suspense.
  return (
    <Suspense>
      <Comparador />
    </Suspense>
  );
}
