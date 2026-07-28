import { arcSlicePath, toSlices } from "@/lib/chart-geometry";

// GT-303 · Dona multi-categoría con leyenda + porcentajes al lado (ej.
// estado de avance de un portafolio de proyectos).
const DATA = [
  { label: "En plazo", valor: 52 },
  { label: "En riesgo", valor: 28 },
  { label: "Atrasado", valor: 20 },
];
const COLORS = ["var(--color-status-ok)", "var(--color-status-warn)", "var(--color-status-down)"];

export function GT303DonaLeyenda() {
  const slices = toSlices(DATA);
  const cx = 70;
  const cy = 70;
  const outerR = 62;
  const innerR = 40;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0" role="img" aria-label="Gráfico de dona con leyenda">
        {slices.map((s, i) => (
          <path key={s.label} d={arcSlicePath(cx, cy, outerR, innerR, s.startAngle, s.endAngle)} fill={COLORS[i % COLORS.length]} />
        ))}
      </svg>
      <ul className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="font-label text-xs text-text">{s.label}</span>
            <span className="font-label text-xs text-faint ml-auto tabular">{Math.round(s.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
