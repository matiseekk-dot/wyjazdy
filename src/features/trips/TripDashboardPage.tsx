import { ArrowLeftRight, Pencil, Plus, Scale } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusChip } from '../../components/StatusChip'
import { CATEGORY_ICONS } from '../../lib/categoryIcons'
import { othersBalances } from '../../lib/balances'
import { formatMoney, formatTripDates } from '../../lib/format'
import { ITEM_CATEGORY_LABELS } from '../../lib/labels'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import type { Item, ItemCategory } from '../../types'
import { ITEM_CATEGORIES } from '../../types'
import { ParticipantsSection } from './ParticipantsSection'
import { TripRetrospectivePage } from './TripRetrospectivePage'
import { useTripData } from './useTripData'

export function TripDashboardPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, participants, items, balances } = useTripData(tripId)

  const totalOwed = othersBalances(participants, balances).reduce((sum, b) => sum + Math.max(b.netBase, 0), 0)

  const itemsByCategory = useMemo(() => {
    const groups = new Map<ItemCategory, Item[]>()
    for (const category of ITEM_CATEGORIES) groups.set(category, [])
    for (const item of items) groups.get(item.category)?.push(item)
    return groups
  }, [items])

  if (!trip || !tripId) {
    return (
      <div style={{ padding: spacing[5] }}>
        <p style={{ color: colors.textMuted }}>Ładowanie…</p>
      </div>
    )
  }

  if (trip.phase === 'completed') {
    return <TripRetrospectivePage tripId={tripId} trip={trip} participants={participants} items={items} balances={balances} />
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: fontSize.xl }}>{trip.name}</h1>
        <Link to={`/trips/${tripId}/edit`} className="btn btn-ghost" style={{ fontSize: fontSize.sm, padding: `${spacing[2]} ${spacing[3]}` }}>
          <Pencil size={15} /> Edytuj
        </Link>
      </div>
      <p style={{ color: colors.textMuted, marginTop: spacing[1] }}>
        {formatTripDates(trip.startDate, trip.endDate, trip.yearOnly)}
        {trip.countries.length > 0 ? ` · ${trip.countries.join(', ')}` : ''}
      </p>

      <div className="card" style={{ marginTop: spacing[4], padding: spacing[4] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Łączny koszt</span>
          <strong style={{ fontSize: fontSize.lg, color: colors.accent }}>
            {formatMoney(trip.totalCostBase, trip.baseCurrency)}
          </strong>
        </div>
        <div style={{ marginTop: spacing[3] }}>
          <ProgressBar done={trip.itemsDoneCount} total={trip.itemsTotalCount} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing[3] }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Zapłacone / do zapłaty</span>
          <span style={{ fontSize: fontSize.sm }}>
            {formatMoney(trip.paidCostBase, trip.baseCurrency)} /{' '}
            {formatMoney(trip.totalCostBase - trip.paidCostBase, trip.baseCurrency)}
          </span>
        </div>
        {totalOwed > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing[2] }}>
            <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Winni mi łącznie</span>
            <strong style={{ color: colors.success }}>{formatMoney(totalOwed, trip.baseCurrency)}</strong>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[4] }}>
        <Link to={`/trips/${tripId}/settlements`} className="btn btn-ghost" style={{ fontSize: fontSize.sm }}>
          <Scale size={16} /> Rozliczenia
        </Link>
        <Link to={`/trips/${tripId}/converter`} className="btn btn-ghost" style={{ fontSize: fontSize.sm }}>
          <ArrowLeftRight size={16} /> Przelicznik
        </Link>
      </div>

      <ParticipantsSection tripId={tripId} participants={participants} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[6] }}>
        <h2 style={{ fontSize: fontSize.lg }}>Pozycje</h2>
        <Link
          to={`/trips/${tripId}/items/new`}
          className="btn btn-primary"
          style={{ fontSize: fontSize.sm, padding: `${spacing[2]} ${spacing[4]}` }}
        >
          <Plus size={16} /> Dodaj
        </Link>
      </div>

      {items.length === 0 ? (
        <p style={{ color: colors.textMuted, marginTop: spacing[3] }}>Brak pozycji. Dodaj pierwszą.</p>
      ) : (
        ITEM_CATEGORIES.map((category) => {
          const categoryItems = itemsByCategory.get(category) ?? []
          if (categoryItems.length === 0) return null
          const Icon = CATEGORY_ICONS[category]
          return (
            <div key={category} style={{ marginTop: spacing[5] }}>
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: colors.textMuted,
                  marginBottom: spacing[2],
                }}
              >
                <Icon size={15} /> {ITEM_CATEGORY_LABELS[category]}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {categoryItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/trips/${tripId}/items/${item.id}`}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing[3],
                    }}
                  >
                    <div>
                      <div>{item.title}</div>
                      <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                        {formatMoney(item.amountOriginal, item.currency)}
                        {item.currency !== trip.baseCurrency && ` (${formatMoney(item.amountBase, trip.baseCurrency)})`}
                      </div>
                    </div>
                    <StatusChip status={item.status} />
                  </Link>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
