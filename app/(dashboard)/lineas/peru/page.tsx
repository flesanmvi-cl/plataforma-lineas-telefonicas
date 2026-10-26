import { EnPreparacion } from "@/components/en-preparacion";

// Líneas de Perú, solo consulta: se construye en el módulo M5 (docs/PLAN.md, P1).
export default function LineasPeruPage() {
  return (
    <EnPreparacion
      titulo="Líneas Perú"
      descripcion="Consulta de las líneas telefónicas corporativas de Perú. El alta y la edición siguen en el aplicativo actual hasta que se conecte la base de Perú."
      contenido={["Listado y ficha de cada línea, con su historial", "Descarga a Excel"]}
    />
  );
}
