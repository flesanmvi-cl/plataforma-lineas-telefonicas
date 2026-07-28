import { arcSlicePath } from "@/lib/chart-geometry";

// KP-103 · KPI tipo gauge/odómetro — arco semicircular de progreso, color
// según umbral (ok/warn/down, mismos tokens de estado del resto del sistema).
interface KP103Props {
  label?: string;
  pct?: number;
}

export function KP103Gauge({ label = "Cumplimiento de plazo", pct = 74 }: KP103Props) {
  const cx = 90;
  const cy = 88;
  const outerR = 78;
  const innerR = 58;
  const clamped = Math.min(100, Math.max(0, pct));
  const color = clamped >= 80 ? "var(--color-status-ok)" : clamped >= 50 ? "var(--color-status-warn)" : "var(--color-status-down)";

  return (
    <div className="card p-5 flex flex-col items-center">
      <svg viewBox="0 0 180 96" className="w-full max-w-[220px]" role="img" aria-label="Gráfico de gauge">
        <path d={arcSlicePath(cx, cy, outerR, innerR, -90, 90)} fill="var(--color-surface-2)" />
        <path d={arcSlicePath(cx, cy, outerR, innerR, -90, -90 + (clamped / 100) * 180)} fill={color} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={28} fontWeight={800} fontStyle="italic" fill="var(--color-text)" fontFamily="var(--font-display)">
          {clamped}%
        </text>
      </svg>
      <p className="label-eyebrow mt-1 text-center">{label}</p>
    </div>
  );
}
