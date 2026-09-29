import { PageHeader } from "@/components/page-header";
import { FuentesDatos } from "@/components/configuracion/fuentes-datos";

export const metadata = { title: "Fuentes de datos" };

// Configuración › Fuentes de datos (solo administradores; gate en ../layout.tsx). Maqueta con datos de ejemplo.
export default function Pagina() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader title="Fuentes de datos" className="mb-0" />
      <FuentesDatos />
    </div>
  );
}
