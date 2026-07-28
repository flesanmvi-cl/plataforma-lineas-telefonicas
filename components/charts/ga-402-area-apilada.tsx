import { buildAreaPath, buildSmoothPath, scaleLinear } from "@/lib/chart-geometry";

// GA-402 · Área apilada — 2 series acumuladas (ej. mano de obra + materiales).
const LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const SERIE_A = [20, 25, 22, 30, 28, 35];
const SERIE_B = [15, 18, 20, 17, 24, 22];

const W = 320;
const H = 160;
const PAD_X = 16;
const PAD_Y = 16;

export function GA402AreaApilada() {
  const total = LABELS.map((_, i) => SERIE_A[i] + SERIE_B[i]);
  const max = Math.max(...total);
  const step = (W - PAD_X * 2) / (LABELS.length - 1);

  const baseA = SERIE_A.map((v, i) => ({ x: PAD_X + i * step, y: scaleLinear(v, 0, max, H - PAD_Y, PAD_Y) }));
  const topB = SERIE_A.map((v, i) => ({ x: PAD_X + i * step, y: scaleLinear(v + SERIE_B[i], 0, max, H - PAD_Y, PAD_Y) }));

  const lineA = buildSmoothPath(baseA);
  const areaA = buildAreaPath(lineA, baseA, H - PAD_Y);
  const lineB = buildSmoothPath(topB);
  // área de la serie B: entre su propia curva y la curva de A (no la línea base)
  const areaB = `${lineB} L${baseA[baseA.length - 1].x},${baseA[baseA.length - 1].y} ${baseA
    .slice()
    .reverse()
    .map((p) => `L${p.x},${p.y}`)
    .join(" ")} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de área apilada">
        <path d={areaB} fill="var(--color-chart-3)" opacity={0.35} stroke="none" />
        <path d={areaA} fill="var(--color-chart-1)" opacity={0.35} stroke="none" />
        <path d={lineA} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} />
        <path d={lineB} fill="none" stroke="var(--color-chart-3)" strokeWidth={2} />
      </svg>
      <div className="flex gap-3 mt-2">
        <span className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-muted">
          <span className="w-2 h-2 shrink-0" style={{ background: "var(--color-chart-1)" }} /> Mano de obra
        </span>
        <span className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-muted">
          <span className="w-2 h-2 shrink-0" style={{ background: "var(--color-chart-3)" }} /> Materiales
        </span>
      </div>
    </div>
  );
}
