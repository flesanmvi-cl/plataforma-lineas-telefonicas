import { arcSlicePath, toSlices, CHART_COLORS } from "@/lib/chart-geometry";

// GT-301 · Torta básica con leyenda lateral.
const DATA = [
  { label: "Construcción", valor: 45 },
  { label: "Minería", valor: 25 },
  { label: "Vialidad", valor: 18 },
  { label: "Otros", valor: 12 },
];

export function GT301TortaBasica() {
  const slices = toSlices(DATA);
  const cx = 80;
  const cy = 80;
  const r = 70;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0" role="img" aria-label="Gráfico de torta">
        {slices.map((s, i) => (
          <path
            key={s.label}
            d={arcSlicePath(cx, cy, r, 0, s.startAngle, s.endAngle)}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke="var(--color-surface)"
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <ul className="flex flex-col gap-1.5">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 font-label text-[11px] text-muted">
            <span className="w-2 h-2 shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            {s.label} <span className="text-faint">· {Math.round(s.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
