import { X } from 'lucide-react'
import { useState } from 'react'
import { createParticipant, deleteParticipant, updateParticipant } from '../../lib/repo'
import { colors, fontSize, fontWeight, radius, spacing } from '../../tokens'
import type { Participant } from '../../types'

export function ParticipantsSection({ tripId, participants }: { tripId: string; participants: Participant[] }) {
  const [name, setName] = useState('')
  const [isMe, setIsMe] = useState(false)
  const [excludeFromBalance, setExcludeFromBalance] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createParticipant(tripId, { name: name.trim(), isMe, excludeFromBalance })
    setName('')
    setIsMe(false)
    setExcludeFromBalance(false)
  }

  function toggleExclude(p: Participant) {
    void updateParticipant(tripId, p.id, { excludeFromBalance: !p.excludeFromBalance })
  }

  return (
    <div style={{ marginTop: spacing[5] }}>
      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginBottom: spacing[2] }}>
        Uczestnicy
      </h2>
      {participants.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] }}>
          {participants.map((p) => (
            <span key={p.id} style={p.isMe ? styles.chipMe : p.excludeFromBalance ? styles.chipExcluded : styles.chip}>
              <button
                type="button"
                onClick={() => toggleExclude(p)}
                disabled={p.isMe}
                style={styles.chipLabelButton}
                title={p.isMe ? undefined : 'Kliknij, żeby przełączyć czy ta osoba mi się rozlicza'}
              >
                {p.name}
                {p.isMe && ' (ja)'}
                {p.excludeFromBalance && ' (bez rozliczeń)'}
              </button>
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
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing[3] }}>
        Kliknij imię uczestnika, żeby oznaczyć, że nie musi mi oddawać pieniędzy (np. dziecko) — jego udział nadal liczy
        się do kosztu wyjazdu, ale nie pojawi się w saldach.
      </p>
      <form onSubmit={(e) => void handleAdd(e)} style={{ display: 'flex', gap: spacing[2], alignItems: 'center', flexWrap: 'wrap' }}>
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: fontSize.xs, whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={excludeFromBalance}
            onChange={(e) => setExcludeFromBalance(e.target.checked)}
          />
          nie rozlicza się
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
    padding: '4px 6px 4px 4px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.border}`,
    fontSize: fontSize.sm,
  },
  chipMe: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px 4px 4px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.accentBorder}`,
    background: colors.accentBg,
    color: colors.accent,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
  },
  chipExcluded: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px 4px 4px',
    borderRadius: radius.pill,
    border: `1px dashed ${colors.border}`,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: fontSize.sm,
  },
  chipLabelButton: {
    border: 'none',
    background: 'none',
    color: 'inherit',
    font: 'inherit',
    fontStyle: 'inherit',
    cursor: 'pointer',
    padding: '0 0 0 6px',
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
