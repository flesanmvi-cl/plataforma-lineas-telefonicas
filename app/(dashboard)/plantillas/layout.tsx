import { LabTemaFijo } from "@/components/estandar/tema-context";
import { ESTANDAR } from "@/lib/estandar/estandar";

// Las plantillas se dibujan solo con el estándar vigente (tema fijo).
export default function PlantillasLayout({ children }: { children: React.ReactNode }) {
  return <LabTemaFijo tema={ESTANDAR.tema}>{children}</LabTemaFijo>;
}
