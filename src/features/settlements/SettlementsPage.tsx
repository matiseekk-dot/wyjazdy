import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { othersBalances } from '../../lib/balances'
import { formatDate, formatMoney } from '../../lib/format'
import { createPayment, deletePayment } from '../../lib/repo'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import { useTripData } from '../trips/useTripData'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function SettlementsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, participants, payments, balances: rawBalances } = useTripData(tripId)
  const balances = othersBalances(participants, rawBalances)

  const [fromParticipantId, setFromParticipantId] = useState('')
  const [toParticipantId, setToParticipantId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (participants.length === 0) return
    const me = participants.find((p) => p.isMe)
    if (me && !toParticipantId) setToParticipantId(me.id)
    if (!fromParticipantId) {
      const firstOther = participants.find((p) => p.id !== me?.id) ?? participants[0]
      setFromParticipantId(firstOther.id)
    }
  }, [participants, toParticipantId, fromParticipantId])

  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? '—'

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId || !fromParticipantId || !toParticipantId || !amount) return
    await createPayment(tripId, {
      fromParticipantId,
      toParticipantId,
      amount: parseFloat(amount) || 0,
      currency: trip?.baseCurrency ?? 'PLN',
      date,
      note: note.trim() || undefined,
    })
    setAmount('')
    setNote('')
    setDate(today())
  }

  if (!trip || !tripId) {
    return (
      <div style={{ padding: spacing[5] }}>
        <p style={{ color: colors.textMuted }}>Ładowanie…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Rozliczenia</h1>

      <div className="card" style={{ padding: spacing[4] }}>
        {balances.length === 0 ? (
          <p style={{ color: colors.textMuted }}>Brak uczestników — dodaj ich na dashboardzie wyjazdu.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {balances.map((b) => (
              <div key={b.participantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{nameOf(b.participantId)}</span>
                <strong style={{ color: b.netBase > 0.005 ? colors.success : b.netBase < -0.005 ? colors.danger : colors.textMuted }}>
                  {b.netBase > 0.005
                    ? `winien(-na) ${formatMoney(b.netBase, trip.baseCurrency)}`
                    : b.netBase < -0.005
                      ? `nadpłata ${formatMoney(-b.netBase, trip.baseCurrency)}`
                      : 'rozliczone'}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: fontSize.lg, marginTop: spacing[6], marginBottom: spacing[3] }}>Dodaj wpłatę</h2>
      <form onSubmit={(e) => void handleAddPayment(e)}>
        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="from">
              Kto
            </label>
            <select id="from" style={formStyles.input} value={fromParticipantId} onChange={(e) => setFromParticipantId(e.target.value)}>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="to">
              Komu
            </label>
            <select id="to" style={formStyles.input} value={toParticipantId} onChange={(e) => setToParticipantId(e.target.value)}>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="amount">
              Kwota ({trip.baseCurrency})
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              style={formStyles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="date">
              Data
            </label>
            <input id="date" type="date" style={formStyles.input} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="note">
            Notatka
          </label>
          <input id="note" style={formStyles.input} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={!fromParticipantId || !toParticipantId || !amount}>
          Dodaj wpłatę
        </button>
      </form>

      <h2 style={{ fontSize: fontSize.lg, marginTop: spacing[6], marginBottom: spacing[3] }}>Historia wpłat</h2>
      {payments.length === 0 ? (
        <p style={{ color: colors.textMuted }}>Brak wpłat.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {[...payments]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((payment) => (
              <div
                key={payment.id}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing[3] }}
              >
                <div>
                  <div style={{ fontWeight: fontWeight.medium }}>
                    {nameOf(payment.fromParticipantId)} → {nameOf(payment.toParticipantId)}
                  </div>
                  <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                    {formatDate(payment.date)}
                    {payment.note ? ` · ${payment.note}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <strong>{formatMoney(payment.amount, payment.currency)}</strong>
                  <button
                    type="button"
                    onClick={() => void deletePayment(tripId, payment.id)}
                    aria-label="Usuń wpłatę"
                    style={{ border: 'none', background: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
