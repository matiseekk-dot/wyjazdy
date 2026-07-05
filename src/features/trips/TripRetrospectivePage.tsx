import { Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORY_ICONS } from '../../lib/categoryIcons'
import { othersBalances } from '../../lib/balances'
import { daysBetween, formatMoney, formatTripDates } from '../../lib/format'
import { ITEM_CATEGORY_LABELS } from '../../lib/labels'
import { updateTrip } from '../../lib/repo'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import type { Item, ItemCategory, Participant, ParticipantBalance, Trip } from '../../types'
import { ITEM_CATEGORIES } from '../../types'

interface Props {
  tripId: string
  trip: Trip
  participants: Participant[]
  items: Item[]
  balances: ParticipantBalance[]
}

export function TripRetrospectivePage({ tripId, trip, participants, items, balances: rawBalances }: Props) {
  const balances = othersBalances(participants, rawBalances)
  const [notes, setNotes] = useState(trip.notes ?? '')
  const [rating, setRating] = useState(trip.rating ?? 0)
  const [saving, setSaving] = useState(false)

  const days = daysBetween(trip.startDate, trip.endDate)
  const costPerDay = days ? trip.totalCostBase / days : null
  const costPerPerson = participants.length > 0 ? trip.totalCostBase / participants.length : null

  const byCurrency = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.currency, (map.get(item.currency) ?? 0) + item.amountOriginal)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  const byCategory = useMemo(() => {
    const map = new Map<ItemCategory, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + item.amountBase)
    return ITEM_CATEGORIES.map((c) => [c, map.get(c) ?? 0] as const).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1])
  }, [items])

  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? '—'

  async function handleSaveNotes() {
    setSaving(true)
    await updateTrip(tripId, { notes: notes.trim() || undefined, rating: rating || undefined })
    setSaving(false)
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <span style={{ fontSize: fontSize.xs, color: colors.textMuted, fontWeight: fontWeight.semibold }}>ZAKOŃCZONY WYJAZD</span>
      <h1 style={{ fontSize: fontSize.xl, marginTop: spacing[1] }}>{trip.name}</h1>
      <p style={{ color: colors.textMuted, marginTop: spacing[1] }}>
        {formatTripDates(trip.startDate, trip.endDate, trip.yearOnly)}
        {trip.countries.length > 0 ? ` · ${trip.countries.join(', ')}` : ''}
      </p>

      <div className="card" style={{ marginTop: spacing[4], padding: spacing[4] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Koszt całkowity</span>
          <strong style={{ fontSize: fontSize.lg, color: colors.accent }}>
            {formatMoney(trip.totalCostBase, trip.baseCurrency)}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Koszt na dzień</span>
          <span>{costPerDay ? formatMoney(costPerDay, trip.baseCurrency) : '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Koszt na osobę</span>
          <span>{costPerPerson ? formatMoney(costPerPerson, trip.baseCurrency) : '—'}</span>
        </div>
      </div>

      {byCurrency.length > 0 && (
        <>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: spacing[5], marginBottom: spacing[2] }}>
            Rozbicie po walutach
          </h2>
          <div className="card" style={{ padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {byCurrency.map(([currency, amount]) => (
              <div key={currency} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{currency}</span>
                <strong>{formatMoney(amount, currency)}</strong>
              </div>
            ))}
          </div>
        </>
      )}

      {byCategory.length > 0 && (
        <>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: spacing[5], marginBottom: spacing[2] }}>
            Rozbicie po kategoriach
          </h2>
          <div className="card" style={{ padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {byCategory.map(([category, amount]) => {
              const Icon = CATEGORY_ICONS[category]
              const pct = trip.totalCostBase > 0 ? Math.round((amount / trip.totalCostBase) * 100) : 0
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <Icon size={15} /> {ITEM_CATEGORY_LABELS[category]}
                    </span>
                    <strong>{formatMoney(amount, trip.baseCurrency)}</strong>
                  </div>
                  <div style={{ height: 4, borderRadius: 'var(--radius-pill)', background: colors.border, marginTop: spacing[1] }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: colors.accent }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {balances.length > 0 && (
        <>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: spacing[5], marginBottom: spacing[2] }}>
            Finalny stan rozliczeń
          </h2>
          <div className="card" style={{ padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {balances.map((b) => (
              <div key={b.participantId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{nameOf(b.participantId)}</span>
                <span style={{ color: Math.abs(b.netBase) < 0.005 ? colors.textMuted : b.netBase > 0 ? colors.danger : colors.success }}>
                  {Math.abs(b.netBase) < 0.005
                    ? 'rozliczone'
                    : b.netBase > 0
                      ? `pozostał winien ${formatMoney(b.netBase, trip.baseCurrency)}`
                      : `nadpłacił ${formatMoney(-b.netBase, trip.baseCurrency)}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: spacing[5], marginBottom: spacing[2] }}>
        Notatki i ocena
      </h2>
      <div className="card" style={{ padding: spacing[4] }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: spacing[3] }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`Ocena ${n}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: n <= rating ? '#f59e0b' : colors.border }}
            >
              <Star size={22} fill={n <= rating ? '#f59e0b' : 'none'} />
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jak wspominasz ten wyjazd?"
          style={{
            width: '100%',
            minHeight: 100,
            fontSize: fontSize.md,
            padding: spacing[3],
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.text,
            marginBottom: spacing[3],
          }}
        />
        <button type="button" className="btn btn-primary" onClick={() => void handleSaveNotes()} disabled={saving}>
          Zapisz
        </button>
      </div>
    </div>
  )
}
