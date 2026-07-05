import { X } from 'lucide-react'
import { useState } from 'react'
import { createParticipant, deleteParticipant } from '../../lib/repo'
import { colors, fontSize, fontWeight, radius, spacing } from '../../tokens'
import type { Participant } from '../../types'

export function ParticipantsSection({ tripId, participants }: { tripId: string; participants: Participant[] }) {
  const [name, setName] = useState('')
  const [isMe, setIsMe] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createParticipant(tripId, { name: name.trim(), isMe })
    setName('')
    setIsMe(false)
  }

  return (
    <div style={{ marginTop: spacing[5] }}>
      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginBottom: spacing[2] }}>
        Uczestnicy
      </h2>
      {participants.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
          {participants.map((p) => (
            <span key={p.id} style={p.isMe ? styles.chipMe : styles.chip}>
              {p.name}
              {p.isMe && ' (ja)'}
              <button
                type="button"
                onClick={() => void deleteParticipant(tripId, p.id)}
                style={styles.chipRemove}
                aria-label={`Usuń ${p.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <form onSubmit={(e) => void handleAdd(e)} style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Imię uczestnika"
          style={styles.input}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: fontSize.xs, whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={isMe} onChange={(e) => setIsMe(e.target.checked)} />
          to ja
        </label>
        <button type="submit" className="btn btn-primary" style={{ fontSize: fontSize.sm, padding: `${spacing[2]} ${spacing[3]}` }}>
          Dodaj
        </button>
      </form>
    </div>
  )
}

const styles = {
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px 4px 10px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.border}`,
    fontSize: fontSize.sm,
  },
  chipMe: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px 4px 10px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.accentBorder}`,
    background: colors.accentBg,
    color: colors.accent,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
  },
  chipRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'none',
    color: 'inherit',
    opacity: 0.7,
    cursor: 'pointer',
    padding: 2,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    padding: spacing[2],
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
  },
} as const satisfies Record<string, React.CSSProperties>
