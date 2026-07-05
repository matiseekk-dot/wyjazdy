import { Compass } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { daysBetween, formatMoney, formatTripDates, getTripYear } from '../../lib/format'
import { subscribeTrips } from '../../lib/repo'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import type { Trip } from '../../types'

export function ArchivePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [yearFilter, setYearFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')

  useEffect(() => subscribeTrips((all) => setTrips(all.filter((t) => t.phase === 'completed'))), [])

  const uniqueCountries = useMemo(() => [...new Set(trips.flatMap((t) => t.countries))].sort(), [trips])
  const uniqueYears = useMemo(
    () => [...new Set(trips.map((t) => getTripYear(t)).filter((y): y is number => y !== null))].sort((a, b) => b - a),
    [trips],
  )

  const totalDays = trips.reduce((sum, t) => sum + (daysBetween(t.startDate, t.endDate) ?? 0), 0)
  // Assumes baseCurrency is PLN for every trip (the app's practical default) — a lifetime
  // total across mixed currencies wouldn't be meaningful to sum otherwise.
  const totalCost = trips.reduce((sum, t) => sum + t.totalCostBase, 0)

  const filtered = trips.filter((t) => {
    const year = getTripYear(t)
    return (yearFilter === 'all' || String(year) === yearFilter) && (countryFilter === 'all' || t.countries.includes(countryFilter))
  })

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Archiwum</h1>

      <div className="card" style={{ padding: spacing[4], display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
        <Stat label="Odwiedzone kraje" value={String(uniqueCountries.length)} />
        <Stat label="Liczba wyjazdów" value={String(trips.length)} />
        <Stat label="Łączny koszt" value={formatMoney(totalCost, 'PLN')} />
        <Stat label="Dni w podróży" value={totalDays > 0 ? String(totalDays) : '—'} />
      </div>

      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: `${spacing[8]} ${spacing[4]}`, color: colors.textMuted }}>
          <Compass size={40} strokeWidth={1.5} style={{ marginBottom: spacing[3], opacity: 0.6 }} />
          <p>Brak zakończonych wyjazdów.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[5], marginBottom: spacing[4] }}>
            <select style={styles.filter} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">Wszystkie lata</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select style={styles.filter} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="all">Wszystkie kraje</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {filtered.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="card" style={{ padding: spacing[4] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>{trip.name}</strong>
                  <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
                    {formatTripDates(trip.startDate, trip.endDate, trip.yearOnly)}
                  </span>
                </div>
                <div style={{ marginTop: spacing[1], fontSize: fontSize.sm, color: colors.textMuted }}>
                  {trip.countries.join(', ')}
                </div>
                <div style={{ marginTop: spacing[2], fontWeight: fontWeight.semibold, color: colors.accent }}>
                  {formatMoney(trip.totalCostBase, trip.baseCurrency)}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{label}</div>
      <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{value}</div>
    </div>
  )
}

const styles = {
  filter: {
    flex: 1,
    fontSize: fontSize.sm,
    padding: spacing[2],
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
  },
} as const satisfies Record<string, React.CSSProperties>
