import { EnPreparacion } from "@/components/en-preparacion";

// Dispositivos: se construye en el módulo M6 (docs/PLAN.md).
export default function DispositivosPage() {
  return (
    <EnPreparacion
      titulo="Dispositivos"
      descripcion="Celulares y equipos BAM asignados a colaboradores."
      contenido={[
        "Listado con marca, modelo, IMEI, titular y estado",
        "Alta y edición, con su historial de cambios",
        "Descarga a Excel",
      ]}
    />
  );
}
