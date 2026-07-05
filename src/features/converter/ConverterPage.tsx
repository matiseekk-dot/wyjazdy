import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { getCurrencyOptions } from '../../lib/currencies'
import { fetchNbpRate } from '../../lib/nbp'
import { loadCachedRate, saveCachedRate, type CachedRate } from '../../lib/nbpCache'
import { getTrip } from '../../lib/repo'
import { colors, fontSize, spacing } from '../../tokens'
import type { Trip } from '../../types'

function lastCurrencyKey(tripId: string) {
  return `wyjazdy:converter-currency:${tripId}`
}

export function ConverterPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [currency, setCurrency] = useState('EUR')
  const [cachedRate, setCachedRate] = useState<CachedRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [amountLocal, setAmountLocal] = useState('')
  const [amountBase, setAmountBase] = useState('')

  useEffect(() => {
    if (!tripId) return
    void getTrip(tripId).then((t) => {
      setTrip(t)
      const saved = localStorage.getItem(lastCurrencyKey(tripId))
      setCurrency(saved && getCurrencyOptions().includes(saved) ? saved : 'EUR')
    })
  }, [tripId])

  useEffect(() => {
    if (!tripId || !trip || trip.baseCurrency !== 'PLN') return
    setCachedRate(loadCachedRate(currency))
    localStorage.setItem(lastCurrencyKey(tripId), currency)
    void refresh()
  }, [currency, trip, tripId])

  async function refresh() {
    setLoading(true)
    const result = await fetchNbpRate(currency)
    setLoading(false)
    if (result) {
      saveCachedRate(currency, result)
      setCachedRate(loadCachedRate(currency))
    }
  }

  function handleLocalChange(value: string) {
    setAmountLocal(value)
    const n = parseFloat(value)
    setAmountBase(cachedRate && Number.isFinite(n) ? (n * cachedRate.rate).toFixed(2) : '')
  }

  function handleBaseChange(value: string) {
    setAmountBase(value)
    const n = parseFloat(value)
    setAmountLocal(cachedRate && Number.isFinite(n) && cachedRate.rate > 0 ? (n / cachedRate.rate).toFixed(2) : '')
  }

  if (!trip) {
    return (
      <div style={{ padding: spacing[5] }}>
        <p style={{ color: colors.textMuted }}>Ładowanie…</p>
      </div>
    )
  }

  if (trip.baseCurrency !== 'PLN') {
    return (
      <div style={{ padding: spacing[5] }}>
        <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Szybki przelicznik</h1>
        <p style={{ color: colors.textMuted }}>
          Przelicznik korzysta z kursów NBP (waluta obca → PLN), więc działa tylko dla wyjazdów z walutą bazową PLN.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Szybki przelicznik</h1>

      <div style={formStyles.field}>
        <label style={formStyles.label} htmlFor="currency">
          Waluta lokalna
        </label>
        <select id="currency" style={formStyles.input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {getCurrencyOptions().filter((c) => c !== 'PLN').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={formStyles.row}>
        <div style={{ ...formStyles.field, flex: 1 }}>
          <label style={formStyles.label} htmlFor="amountLocal">
            {currency}
          </label>
          <input
            id="amountLocal"
            type="number"
            style={{ ...formStyles.input, fontSize: fontSize.lg }}
            value={amountLocal}
            onChange={(e) => handleLocalChange(e.target.value)}
            placeholder="0"
          />
        </div>
        <div style={{ ...formStyles.field, flex: 1 }}>
          <label style={formStyles.label} htmlFor="amountBase">
            PLN
          </label>
          <input
            id="amountBase"
            type="number"
            style={{ ...formStyles.input, fontSize: fontSize.lg }}
            value={amountBase}
            onChange={(e) => handleBaseChange(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[3] }}>
        <span style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
          {cachedRate
            ? `Kurs ${currency}: ${cachedRate.rate} (NBP ${cachedRate.effectiveDate}, pobrano ${new Date(cachedRate.fetchedAt).toLocaleString('pl-PL')})`
            : 'Brak zapisanego kursu — odśwież, gdy będziesz online.'}
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          aria-label="Odśwież kurs"
          className="btn btn-ghost"
          style={{ padding: spacing[2] }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : undefined} />
        </button>
      </div>
    </div>
  )
}
