import { scaleLinear } from "@/lib/chart-geometry";

// GB-102 · Barras horizontales — buena para rankings con etiquetas largas.
const DATA = [
  { label: "Obra Vespucio", valor: 92 },
  { label: "Obra Aysén", valor: 78 },
  { label: "Obra Toro", valor: 65 },
  { label: "Obra Dolores", valor: 54 },
  { label: "Obra Colina", valor: 41 },
];

const W = 320;
const PAD_L = 100;
const PAD_R = 34;
const ROW_H = 24;
const GAP = 6;

export function GB102BarrasHorizontales() {
  const max = Math.max(...DATA.map((d) => d.valor));
  const H = DATA.length * (ROW_H + GAP) - GAP;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de barras horizontales">
      {DATA.map((d, i) => {
        const barW = scaleLinear(d.valor, 0, max, 0, W - PAD_L - PAD_R);
        const y = i * (ROW_H + GAP);
        return (
          <g key={d.label}>
            <text x={PAD_L - 8} y={y + ROW_H / 2 + 3} textAnchor="end" fontSize={10} fill="var(--color-muted)" fontFamily="var(--font-label)">
              {d.label}
            </text>
            <rect x={PAD_L} y={y} width={W - PAD_L - PAD_R} height={ROW_H} fill="var(--color-surface-2)" />
            <rect x={PAD_L} y={y} width={barW} height={ROW_H} fill="var(--color-chart-1)" />
            <text
              x={PAD_L + barW + 6}
              y={y + ROW_H / 2 + 3}
              fontSize={10}
              fill="var(--color-text)"
              fontFamily="var(--font-label)"
              fontWeight={600}
            >
              {d.valor}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
