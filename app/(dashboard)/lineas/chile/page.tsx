import { EnPreparacion } from "@/components/en-preparacion";

// Líneas de Chile: se construye en el módulo M4 (docs/PLAN.md).
export default function LineasChilePage() {
  return (
    <EnPreparacion
      titulo="Líneas Chile"
      descripcion="Líneas telefónicas corporativas de Chile."
      contenido={[
        "Listado con búsqueda, orden y estado del colaborador (vigente o desvinculado)",
        "Alta y edición de líneas, con su historial de cambios",
        "Descarga a Excel",
      ]}
    />
  );
}
