import { scaleLinear } from "@/lib/chart-geometry";

// GB-103 · Barras agrupadas — comparativa de 2 series (ej. meta vs real).
const LABELS = ["T1", "T2", "T3", "T4"];
const SERIES = [
  { nombre: "Meta", color: "var(--color-chart-3)", valores: [60, 65, 70, 75] },
  { nombre: "Real", color: "var(--color-chart-1)", valores: [55, 68, 64, 80] },
];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;
const GROUP_GAP = 14;

export function GB103BarrasAgrupadas() {
  const max = Math.max(...SERIES.flatMap((s) => s.valores));
  const groupW = (W - PAD_X * 2 - GROUP_GAP * (LABELS.length - 1)) / LABELS.length;
  const barW = (groupW - 4) / SERIES.length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de barras agrupadas">
        {LABELS.map((label, gi) => {
          const groupX = PAD_X + gi * (groupW + GROUP_GAP);
          return (
            <g key={label}>
              {SERIES.map((s, si) => {
                const barH = scaleLinear(s.valores[gi], 0, max, 0, H - PAD_Y * 2);
                const x = groupX + si * (barW + 4);
                const y = H - PAD_Y - barH;
                return <rect key={s.nombre} x={x} y={y} width={barW} height={barH} fill={s.color} />;
              })}
              <text x={groupX + groupW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--color-faint)" fontFamily="var(--font-label)">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-3 mt-2">
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
