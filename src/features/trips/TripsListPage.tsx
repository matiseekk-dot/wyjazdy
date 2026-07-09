import { Compass, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '../../components/ProgressBar'
import { formatMoney, formatTripDates } from '../../lib/format'
import { subscribeTrips } from '../../lib/repo'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import type { Trip } from '../../types'

export function TripsListPage() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => subscribeTrips((all) => setTrips(all.filter((t) => t.phase !== 'completed'))), [])

  return (
    <div style={{ padding: spacing[5] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[5] }}>
        <h1 style={{ fontSize: fontSize.xl }}>Wyjazdy</h1>
        <Link to="/trips/new" className="btn btn-primary" style={{ fontSize: fontSize.sm, padding: `${spacing[2]} ${spacing[4]}` }}>
          <Plus size={16} /> Nowy
        </Link>
      </div>

      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: `${spacing[8]} ${spacing[4]}`, color: colors.textMuted }}>
          <Compass size={40} strokeWidth={1.5} style={{ marginBottom: spacing[3], opacity: 0.6 }} />
          <p>Brak zaplanowanych wyjazdów.</p>
          <p>Dodaj pierwszy, żeby zacząć planować.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`} className="card" style={{ padding: spacing[4] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: spacing[1] }}>
                <strong style={{ fontSize: fontSize.lg }}>{trip.name}</strong>
                <span style={{ fontSize: fontSize.sm, color: colors.textMuted, whiteSpace: 'nowrap' }}>
                  {formatTripDates(trip.startDate, trip.endDate, trip.yearOnly)}
                </span>
              </div>
              <div style={{ marginTop: spacing[3] }}>
                <ProgressBar done={trip.itemsDoneCount} total={trip.itemsTotalCount} />
              </div>
              <div
                style={{
                  marginTop: spacing[3],
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.semibold,
                  color: colors.accent,
                }}
              >
                {formatMoney(trip.totalCostBase, trip.baseCurrency)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
