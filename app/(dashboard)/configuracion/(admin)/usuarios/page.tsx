import { PageHeader } from "@/components/page-header";
import { UsuariosRoles } from "@/components/configuracion/usuarios";

// Configuración › Usuarios y roles (solo administradores; gate en ../layout.tsx). En el mockup es
// maqueta con datos de ejemplo; la versión conectada a la base es ./usuarios-client.tsx.
export default function UsuariosPage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader
        title="Usuarios y roles"
        className="mb-0"
        description="Quién tiene acceso a la plataforma y con qué rol. Cambia el rol en la misma fila; «Agregar usuario» busca en el maestro de colaboradores. Siempre debe quedar al menos un administrador."
      />
      <UsuariosRoles />
    </div>
  );
}
