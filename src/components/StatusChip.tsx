import type { ItemStatus } from '../types'
import { statusColors } from '../tokens'
import { ITEM_STATUS_LABELS } from '../lib/labels'

export function StatusChip({ status }: { status: ItemStatus }) {
  const { fg, bg } = statusColors[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 11px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        color: fg,
        background: bg,
        whiteSpace: 'nowrap',
      }}
    >
      {ITEM_STATUS_LABELS[status]}
    </span>
  )
}
