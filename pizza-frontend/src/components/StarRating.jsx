// Displays a star rating. If `onChange` is passed, stars become clickable (for review input).
export default function StarRating({ value = 0, onChange, size = 14, count }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(s)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={interactive ? `Rate ${s} star${s > 1 ? 's' : ''}` : undefined}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={s <= Math.round(value) ? 'var(--color-gold)' : 'none'}
              stroke="var(--color-gold)"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
          </button>
        ))}
      </div>
      {value > 0 && !interactive && (
        <span className="font-mono text-xs text-cream-dim">
          {value}{count !== undefined ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}