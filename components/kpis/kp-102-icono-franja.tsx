import { Building2, type LucideIcon } from "lucide-react";

// KP-102 · KPI con ícono + franja de color superior (jerarquía por color, ej.
// para distinguir categorías de indicadores en un mismo dashboard).
interface KP102Props {
  label?: string;
  valor?: string;
  icon?: LucideIcon;
  color?: string;
}

export function KP102IconoFranja({
  label = "Obras activas",
  valor = "24",
  icon: Icon = Building2,
  color = "var(--color-flesan-red)",
}: KP102Props) {
  return (
    <div className="card overflow-hidden">
      <div className="h-1" style={{ background: color }} />
      <div className="dens-card flex items-start gap-4">
        <div className="w-10 h-10 flex items-center justify-center border border-border shrink-0" style={{ color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="label-eyebrow mb-1">{label}</p>
          <p className="display-title text-3xl text-text">{valor}</p>
        </div>
      </div>
    </div>
  );
}
