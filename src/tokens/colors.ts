import type { ItemStatus } from '../types/item'

export const colors = {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  surfaceRaised: 'var(--color-surface-raised)',
  border: 'var(--color-border)',

  text: 'var(--color-text)',
  textMuted: 'var(--color-text-muted)',
  textInverse: 'var(--color-text-inverse)',

  accent: 'var(--color-accent)',
  accentHover: 'var(--color-accent-hover)',
  accentBg: 'var(--color-accent-bg)',
  accentBorder: 'var(--color-accent-border)',

  danger: 'var(--color-danger)',
  dangerBg: 'var(--color-danger-bg)',
  dangerHover: 'var(--color-danger-hover)',
  success: 'var(--color-success)',
  successBg: 'var(--color-success-bg)',
  warning: 'var(--color-warning)',
  warningBg: 'var(--color-warning-bg)',
} as const

export const statusColors: Record<ItemStatus, { fg: string; bg: string }> = {
  idea: { fg: 'var(--color-status-idea)', bg: 'var(--color-status-idea-bg)' },
  to_book: { fg: 'var(--color-status-to_book)', bg: 'var(--color-status-to_book-bg)' },
  booked: { fg: 'var(--color-status-booked)', bg: 'var(--color-status-booked-bg)' },
  paid: { fg: 'var(--color-status-paid)', bg: 'var(--color-status-paid-bg)' },
  confirmed: { fg: 'var(--color-status-confirmed)', bg: 'var(--color-status-confirmed-bg)' },
}
