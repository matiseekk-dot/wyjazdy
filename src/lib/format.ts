import type { CurrencyCode, IsoDate, Trip } from '../types'

export function formatMoney(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatDate(iso: IsoDate): string {
  return new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  )
}

/** Trips have real dates, a placeholder year only, or nothing at all — render each case explicitly. */
export function formatTripDates(startDate: IsoDate | null, endDate: IsoDate | null, yearOnly: number | null): string {
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`
  if (yearOnly) return String(yearOnly)
  return '—'
}

/** Cost-per-day only makes sense with two real calendar dates — never derived from a placeholder year. */
export function daysBetween(startDate: IsoDate | null, endDate: IsoDate | null): number | null {
  if (!startDate || !endDate) return null
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
  const days = Math.round(ms / 86_400_000) + 1
  return days > 0 ? days : null
}

export function getTripYear(trip: Pick<Trip, 'startDate' | 'yearOnly'>): number | null {
  if (trip.startDate) return new Date(trip.startDate).getFullYear()
  return trip.yearOnly
}
