// KP-104 · KPI comparativo (actual vs meta) con barra de progreso lineal.
interface KP104Props {
  label?: string;
  actual?: number;
  meta?: number;
  unidad?: string;
}

export function KP104Comparativo({
  label = "Ejecución presupuestaria",
  actual = 842,
  meta = 1000,
  unidad = "M CLP",
}: KP104Props) {
  const pct = Math.min(100, Math.round((actual / meta) * 100));

  return (
    <div className="card p-5">
      <p className="label-eyebrow mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="display-title text-3xl text-text">{actual}</p>
        <p className="font-label text-xs text-faint">
          / {meta} {unidad}
        </p>
      </div>
      <div className="h-2 bg-surface-2 border border-border">
        <div className="h-full bg-flesan-red" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 font-label text-[10px] text-faint tabular">{pct}% de la meta</p>
    </div>
  );
}
