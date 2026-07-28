import { arcSlicePath, toSlices } from "@/lib/chart-geometry";

// GT-302 · Dona con valor central — típico "avance %" de un solo indicador.
const DATA = [
  { label: "Completado", valor: 68 },
  { label: "Restante", valor: 32 },
];

export function GT302DonaValorCentral() {
  const slices = toSlices(DATA);
  const cx = 80;
  const cy = 80;
  const outerR = 70;
  const innerR = 48;
  const principal = DATA[0];

  return (
    <svg viewBox="0 0 160 160" className="w-40 h-40" role="img" aria-label="Gráfico de dona con valor central">
      {slices.map((s, i) => (
        <path
          key={s.label}
          d={arcSlicePath(cx, cy, outerR, innerR, s.startAngle, s.endAngle)}
          fill={i === 0 ? "var(--color-chart-1)" : "var(--color-surface-2)"}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={800} fontStyle="italic" fill="var(--color-text)" fontFamily="var(--font-display)">
        {principal.valor}%
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={9} fill="var(--color-faint)" fontFamily="var(--font-label)" letterSpacing={1}>
        {principal.label.toUpperCase()}
      </text>
    </svg>
  );
}
