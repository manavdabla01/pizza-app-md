// Signature element: pizza cut into slices, one slice per available size.
// Built with real SVG pie geometry (not clip-path hacks) so wedges are accurate at any count.

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const wedgePath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

export default function SizeDial({ sizes, value, onChange }) {
  const n = sizes.length;
  const slice = 360 / n;
  const size = 96;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 3;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="var(--color-bg)" stroke="rgba(245,239,230,0.08)" strokeWidth="2" />
          {sizes.map((s, i) => {
            const startAngle = i * slice;
            const endAngle = startAngle + slice;
            const active = value === s;
            return (
              <path
                key={s}
                d={wedgePath(cx, cy, r, startAngle, endAngle)}
                fill={active ? 'var(--color-flame)' : i % 2 === 0 ? 'var(--color-crust)' : 'var(--color-surface-raised)'}
                stroke="var(--color-bg)"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-150 hover:brightness-125"
                onClick={() => onChange(s)}
                role="button"
                aria-label={`Select ${s} size`}
                aria-pressed={active}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={r * 0.32} fill="var(--color-bg)" />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-[0.6rem] tracking-wide text-cream-dim pointer-events-none">
          {value || 'Pick'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`text-xs font-mono px-2 py-1 rounded-md text-left transition-colors ${
              value === s ? 'bg-flame text-cream' : 'text-cream-dim hover:text-cream'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
