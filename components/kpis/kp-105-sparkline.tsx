import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// KP-105 · KPI con mini-sparkline embebida (tendencia sin ejes ni etiquetas).
const SPARK = [40, 55, 48, 62, 58, 70, 66, 78];
const SPARK_W = 100;
const SPARK_H = 32;

interface KP105Props {
  label?: string;
  valor?: string;
}

export function KP105Sparkline({ label = "Ingresos semanales", valor = "$78,4M" }: KP105Props) {
  const min = Math.min(...SPARK);
  const max = Math.max(...SPARK);
  const step = SPARK_W / (SPARK.length - 1);
  const points = SPARK.map((v, i) => ({ x: i * step, y: scaleLinear(v, min, max, SPARK_H - 2, 2) }));
  const path = buildSmoothPath(points);

  return (
    <div className="card dens-card flex items-center justify-between gap-4">
      <div>
        <p className="label-eyebrow mb-1">{label}</p>
        <p className="display-title text-3xl text-text">{valor}</p>
      </div>
      <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="w-24 h-8 shrink-0" role="img" aria-label="Mini gráfico de tendencia">
        <path d={path} fill="none" stroke="var(--color-status-ok)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
