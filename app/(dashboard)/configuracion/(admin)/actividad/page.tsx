import { PageHeader } from "@/components/page-header";
import { RegistroActividad } from "@/components/configuracion/registro-actividad";

export const metadata = { title: "Registro de actividad" };

// Configuración › Registro de actividad (solo administradores; gate en ../layout.tsx). Maqueta con datos de ejemplo.
export default function Pagina() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader title="Registro de actividad" className="mb-0" />
      <RegistroActividad />
    </div>
  );
}
