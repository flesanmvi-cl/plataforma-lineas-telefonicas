import { notFound } from "next/navigation";
import { Galeria } from "@/components/lab-graficos/galeria";
import { SECCIONES, type Seccion } from "@/components/lab-graficos/tipos";

export default async function LaboratorioSeccionPage({ params }: { params: Promise<{ seccion: string }> }) {
  const { seccion } = await params;
  if (!SECCIONES.some((s) => s.id === seccion)) notFound();
  return <Galeria seccion={seccion as Seccion} />;
}
