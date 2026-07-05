import type { CSSProperties } from 'react'

export const formStyles = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    marginBottom: 'var(--space-4)',
  },
  label: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    fontWeight: 'var(--font-weight-medium)',
  },
  input: {
    fontSize: 'var(--font-size-md)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  row: {
    display: 'flex',
    gap: 'var(--space-3)',
  },
} as const satisfies Record<string, CSSProperties>

// Buttons use the .btn / .btn-primary / .btn-danger classes in index.css (hover/active
// states need real CSS, not inline styles) — nothing to export here.
