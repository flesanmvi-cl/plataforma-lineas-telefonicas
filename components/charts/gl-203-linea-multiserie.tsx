import { buildSmoothPath, scaleLinear, CHART_COLORS } from "@/lib/chart-geometry";

// GL-203 · Línea multi-serie comparativa, con leyenda inline.
const LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const SERIES = [
  { nombre: "Obra A", color: CHART_COLORS[0], valores: [30, 45, 40, 55, 62, 58] },
  { nombre: "Obra B", color: CHART_COLORS[2], valores: [50, 48, 60, 57, 70, 75] },
  { nombre: "Obra C", color: CHART_COLORS[4], valores: [20, 28, 35, 30, 45, 52] },
];

const W = 320;
const H = 150;
const PAD_X = 16;
const PAD_Y = 12;

export function GL203LineaMultiserie() {
  const all = SERIES.flatMap((s) => s.valores);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const step = (W - PAD_X * 2) / (LABELS.length - 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de línea multi-serie">
        {SERIES.map((s) => {
          const points = s.valores.map((v, i) => ({
            x: PAD_X + i * step,
            y: scaleLinear(v, min, max, H - PAD_Y, PAD_Y),
          }));
          return (
            <path
              key={s.nombre}
              d={buildSmoothPath(points)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {SERIES.map((s) => (
          <span key={s.nombre} className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-muted">
            <span className="w-2 h-2 shrink-0" style={{ background: s.color }} />
            {s.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}
