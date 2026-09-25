import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Comparador } from "@/components/lab-graficos/comparador";
import { SECCIONES, type Seccion } from "@/components/lab-graficos/tipos";

export default async function LaboratorioComparadorPage({ params }: { params: Promise<{ seccion: string }> }) {
  const { seccion } = await params;
  if (!SECCIONES.some((s) => s.id === seccion)) notFound();
  // useSearchParams (la muestra elegida va en ?g=) necesita un límite de Suspense.
  return (
    <Suspense>
      <Comparador seccion={seccion as Seccion} />
    </Suspense>
  );
}
