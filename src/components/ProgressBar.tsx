import { colors, fontWeight } from '../tokens'

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 'var(--radius-pill)',
          background: colors.border,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: colors.accent,
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: fontWeight.medium,
          color: colors.textMuted,
          whiteSpace: 'nowrap',
        }}
      >
        {done}/{total}
      </span>
    </div>
  )
}
