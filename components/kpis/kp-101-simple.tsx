import { ArrowUp, ArrowDown } from "lucide-react";

// KP-101 · KPI simple: label + valor grande + variación vs período anterior.
interface KP101Props {
  label?: string;
  valor?: string;
  variacion?: number;
}

export function KP101Simple({ label = "Avance físico", valor = "68%", variacion = 4.2 }: KP101Props) {
  const positivo = variacion >= 0;

  return (
    <div className="card kpi-card dens-card">
      <p className="label-eyebrow">{label}</p>
      <p className="display-title text-4xl text-text">{valor}</p>
      <p className={`font-label text-xs flex items-start gap-1 ${positivo ? "text-status-ok" : "text-status-down"}`}>
        {positivo ? <ArrowUp className="w-3 h-3 shrink-0 mt-0.5" /> : <ArrowDown className="w-3 h-3 shrink-0 mt-0.5" />}
        {Math.abs(variacion)}% vs mes anterior
      </p>
    </div>
  );
}
