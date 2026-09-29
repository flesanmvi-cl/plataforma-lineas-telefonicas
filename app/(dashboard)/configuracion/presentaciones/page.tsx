import { EditorPresentaciones } from "@/components/presentaciones/editor";
import { InterruptorPresentaciones } from "@/components/presentaciones/interruptor";

export const metadata = { title: "Presentaciones" };

// Configuración › Presentaciones: abierta a todos los usuarios (cada uno arma las suyas en su
// navegador). Aquí se activa o desactiva el módulo y se administran las presentaciones.
export default function PresentacionesPage() {
  return <EditorPresentaciones encabezadoExtra={<InterruptorPresentaciones />} />;
}
