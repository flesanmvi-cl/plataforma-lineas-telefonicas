import { exigirAdministrador } from "@/lib/acceso-paginas";

/**
 * Gate por rol de las secciones de administración de Configuración (grupo de rutas «(admin)»: las
 * URL no cambian). Vive fuera del middleware porque necesita el acceso resuelto en la sesión. Toda
 * sección nueva solo para administradores va dentro de esta carpeta y su página llama también a
 * `exigirAdministrador()` (lib/acceso-paginas.ts); las APIs validan el rol por su cuenta.
 */
export default async function AdministracionLayout({ children }: { children: React.ReactNode }) {
  await exigirAdministrador();
  return <>{children}</>;
}
