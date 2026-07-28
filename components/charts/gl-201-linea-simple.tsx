import { buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// GL-201 · Línea simple con puntos — una sola serie, sin relleno.
const DATA = [
  { label: "Ene", valor: 42 },
  { label: "Feb", valor: 58 },
  { label: "Mar", valor: 51 },
  { label: "Abr", valor: 67 },
  { label: "May", valor: 73 },
  { label: "Jun", valor: 69 },
  { label: "Jul", valor: 82 },
];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;

export function GL201LineaSimple() {
  const valores = DATA.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const step = (W - PAD_X * 2) / (DATA.length - 1);
  const points = DATA.map((d, i) => ({
    x: PAD_X + i * step,
    y: scaleLinear(d.valor, min, max, H - PAD_Y, PAD_Y),
  }));
  const path = buildSmoothPath(points);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de línea simple">
      {[0.25, 0.5, 0.75].map((t) => (
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
      <path d={path} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-chart-1)" />
      ))}
    </svg>
  );
}
