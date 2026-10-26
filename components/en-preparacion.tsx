import { Construction } from "lucide-react";
import { PageHeader } from "@/components/page-header";

/** Vista de una sección que aún no se construye (módulos de docs/PLAN.md §4): su título y lo que
 * traerá. Se reemplaza por la pantalla real al construir el módulo. */
export function EnPreparacion({ titulo, descripcion, contenido }: { titulo: string; descripcion: string; contenido: string[] }) {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-4">
      <PageHeader title={titulo} description={descripcion} className="mb-0" />
      <div className="card dens-card flex flex-col gap-3 max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center bg-surface-2 text-muted">
            <Construction className="w-5 h-5" />
          </span>
          <p className="font-label font-600 text-text">Sección en preparación</p>
        </div>
        <p className="text-sm text-muted">Mientras tanto, esta información se gestiona en el aplicativo actual. Aquí estará:</p>
        <ul className="flex flex-col gap-1">
          {contenido.map((c) => (
            <li key={c} className="brand-bullet text-sm text-text">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
