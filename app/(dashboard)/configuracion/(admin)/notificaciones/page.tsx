import { PageHeader } from "@/components/page-header";
import { Notificaciones } from "@/components/configuracion/notificaciones";

// Configuración › Notificaciones y correos (solo administradores; gate en ../layout.tsx). Maqueta con datos de ejemplo.
export default function Pagina() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader title="Notificaciones y correos" className="mb-0" />
      <Notificaciones />
    </div>
  );
}
