import { scaleLinear } from "@/lib/chart-geometry";

// GB-101 · Barras verticales simples.
const DATA = [
  { label: "Ene", valor: 45 },
  { label: "Feb", valor: 62 },
  { label: "Mar", valor: 38 },
  { label: "Abr", valor: 71 },
  { label: "May", valor: 55 },
  { label: "Jun", valor: 80 },
];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;
const GAP = 10;

export function GB101BarrasVerticales() {
  const max = Math.max(...DATA.map((d) => d.valor));
  const barW = (W - PAD_X * 2 - GAP * (DATA.length - 1)) / DATA.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de barras verticales">
      {DATA.map((d, i) => {
        const barH = scaleLinear(d.valor, 0, max, 0, H - PAD_Y * 2);
        const x = PAD_X + i * (barW + GAP);
        const y = H - PAD_Y - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} fill="var(--color-chart-1)" />
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--color-faint)" fontFamily="var(--font-label)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
