import type { ReactNode } from "react";

// Envoltorio estándar de cada objeto en la vitrina de /ui-kit: título +
// código de catálogo (ver docs/UI-KIT-CATALOG.md) para poder referenciarlo
// en sesiones futuras ("usa GL-201"). `bordered` agrega el marco .card —
// desactívalo cuando el componente ya trae su propia card (KPIs, tablas).
interface GalleryItemProps {
  code: string;
  title: string;
  description?: string;
  bordered?: boolean;
  children: ReactNode;
}

export function GalleryItem({ code, title, description, bordered = true, children }: GalleryItemProps) {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label text-xs text-text">{title}</p>
          {description && <p className="font-body text-xs text-faint mt-0.5">{description}</p>}
        </div>
        <span className="shrink-0 font-label text-[10px] tracking-wider text-faint border border-border px-1.5 py-0.5">{code}</span>
      </div>
      {bordered ? (
        <div className="card p-5 flex-1 flex flex-col justify-center">{children}</div>
      ) : (
        // El hijo (KP-1xx/TB-1xx) ya trae su propia .card — [&>*]:h-full la
        // fuerza a llenar la celda estirada por el grid, para que todas las
        // cards de la fila terminen a la misma altura.
        <div className="flex-1 [&>*]:h-full">{children}</div>
      )}
    </div>
  );
}
