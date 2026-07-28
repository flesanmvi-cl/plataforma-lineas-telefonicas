import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// GA-401 · Área simple, relleno sólido semi-transparente (a diferencia de
// GL-202, que usa gradiente) — buena para volúmenes acumulados.
const DATA = [
  { label: "Sem 1", valor: 12 },
  { label: "Sem 2", valor: 19 },
  { label: "Sem 3", valor: 15 },
  { label: "Sem 4", valor: 27 },
  { label: "Sem 5", valor: 24 },
  { label: "Sem 6", valor: 32 },
  { label: "Sem 7", valor: 29 },
];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;

export function GA401AreaSimple() {
  const max = Math.max(...DATA.map((d) => d.valor));
  const step = (W - PAD_X * 2) / (DATA.length - 1);
  const points = DATA.map((d, i) => ({
    x: PAD_X + i * step,
    y: scaleLinear(d.valor, 0, max, H - PAD_Y, PAD_Y),
  }));
  const line = buildSmoothPath(points);
  const area = buildAreaPath(line, points, H - PAD_Y);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de área simple">
      {[0.33, 0.66].map((t) => (
        <line
          key={t}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={PAD_Y + t * (H - PAD_Y * 2)}
          y2={PAD_Y + t * (H - PAD_Y * 2)}
          stroke="var(--color-chart-grid)"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill="var(--color-chart-1)" opacity={0.18} stroke="none" />
      <path d={line} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
