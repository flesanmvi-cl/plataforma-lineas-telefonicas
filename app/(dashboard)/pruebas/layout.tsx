import { LabTemaFijo } from "@/components/estandar/tema-context";
import { ESTANDAR } from "@/lib/estandar/estandar";

// Las pantallas de prueba se dibujan solo con el estándar vigente, no con lo que se esté
// probando en el laboratorio.
export default function PruebasLayout({ children }: { children: React.ReactNode }) {
  return <LabTemaFijo tema={ESTANDAR.tema}>{children}</LabTemaFijo>;
}
