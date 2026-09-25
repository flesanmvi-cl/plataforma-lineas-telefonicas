import { LabTemaFijo } from "@/components/lab-graficos/tema-context";
import { ESTANDAR } from "@/lib/lab-graficos/estandar";

// Las pantallas de prueba se dibujan solo con el estándar vigente, no con lo que se esté
// probando en el laboratorio.
export default function PruebasLayout({ children }: { children: React.ReactNode }) {
  return <LabTemaFijo tema={ESTANDAR.tema}>{children}</LabTemaFijo>;
}
