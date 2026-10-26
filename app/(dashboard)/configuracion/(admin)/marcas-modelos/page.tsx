import { EnPreparacion } from "@/components/en-preparacion";
import { exigirAdministrador } from "@/lib/acceso-paginas";

// Configuración › Marcas y modelos (solo administradores). Se construye en el módulo M7
// (docs/PLAN.md). El control va en la página además del layout: ver lib/acceso-paginas.ts.
export default async function MarcasModelosPage() {
  await exigirAdministrador();
  return (
    <EnPreparacion
      titulo="Marcas y modelos"
      descripcion="Catálogo de marcas y modelos de celulares y equipos BAM que se ofrecen al registrar un dispositivo."
      contenido={["Marcas y modelos vigentes por tipo de dispositivo", "Agregar marcas y modelos, sin duplicados"]}
    />
  );
}
