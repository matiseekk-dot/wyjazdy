import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { getCurrencyOptions, getDefaultBaseCurrency } from '../../lib/currencies'
import { createTrip } from '../../lib/repo'
import { fontSize, spacing } from '../../tokens'

export function NewTripPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [countries, setCountries] = useState('')
  const [baseCurrency, setBaseCurrency] = useState<string>(getDefaultBaseCurrency())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const id = await createTrip({
      name: name.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      yearOnly: null,
      countries: countries
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      baseCurrency,
      phase: 'planning',
    })
    navigate(`/trips/${id}`)
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Nowy wyjazd</h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="name">
            Nazwa
          </label>
          <input
            id="name"
            style={formStyles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="startDate">
              Data od
            </label>
            <input
              id="startDate"
              type="date"
              style={formStyles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="endDate">
              Data do
            </label>
            <input
              id="endDate"
              type="date"
              style={formStyles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="countries">
            Kraje (oddzielone przecinkiem)
          </label>
          <input
            id="countries"
            style={formStyles.input}
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="Azerbejdżan, Gruzja"
          />
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="baseCurrency">
            Waluta bazowa
          </label>
          <select
            id="baseCurrency"
            style={formStyles.input}
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
          >
            {getCurrencyOptions().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          Utwórz wyjazd
        </button>
      </form>
    </div>
  )
}
