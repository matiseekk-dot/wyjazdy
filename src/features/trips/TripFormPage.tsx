import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { getCurrencyOptions, getDefaultBaseCurrency } from '../../lib/currencies'
import { createTrip, deleteTrip, getTrip, updateTrip } from '../../lib/repo'
import { colors, fontSize, spacing } from '../../tokens'
import type { TripPhase } from '../../types'

const PHASE_LABELS: Record<TripPhase, string> = {
  planning: 'Planowanie',
  active: 'W trakcie',
  completed: 'Zakończony',
}

export function TripFormPage() {
  const { tripId } = useParams<{ tripId?: string }>()
  const isEdit = Boolean(tripId)
  const navigate = useNavigate()

  const [loaded, setLoaded] = useState(!isEdit)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [yearOnly, setYearOnly] = useState('')
  const [countries, setCountries] = useState('')
  const [baseCurrency, setBaseCurrency] = useState<string>(getDefaultBaseCurrency())
  const [phase, setPhase] = useState<TripPhase>('planning')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !tripId) return
    void getTrip(tripId).then((t) => {
      if (!t) return
      setName(t.name)
      setStartDate(t.startDate?.slice(0, 10) ?? '')
      setEndDate(t.endDate?.slice(0, 10) ?? '')
      setYearOnly(t.yearOnly ? String(t.yearOnly) : '')
      setCountries(t.countries.join(', '))
      setBaseCurrency(t.baseCurrency)
      setPhase(t.phase)
      setNotes(t.notes ?? '')
      setLoaded(true)
    })
  }, [isEdit, tripId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setSaveError(null)
    const draft = {
      name: name.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      yearOnly: !startDate && yearOnly ? parseInt(yearOnly, 10) : null,
      countries: countries
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      baseCurrency,
      phase,
      notes: notes.trim() || undefined,
    }
    try {
      if (isEdit && tripId) {
        await updateTrip(tripId, draft)
        navigate(`/trips/${tripId}`)
      } else {
        const id = await createTrip(draft)
        navigate(`/trips/${id}`)
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Nie udało się zapisać wyjazdu.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!tripId) return
    if (!window.confirm(`Usunąć wyjazd „${name}” razem ze wszystkimi pozycjami, uczestnikami i wpłatami? Tej operacji nie da się cofnąć.`)) {
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await deleteTrip(tripId)
      navigate('/')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Nie udało się usunąć wyjazdu.')
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <div style={{ padding: spacing[5] }}>
        <p style={{ color: colors.textMuted }}>Ładowanie…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>{isEdit ? 'Edytuj wyjazd' : 'Nowy wyjazd'}</h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="name">
            Nazwa
          </label>
          <input id="name" style={formStyles.input} value={name} onChange={(e) => setName(e.target.value)} required />
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
            <input id="endDate" type="date" style={formStyles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {!startDate && (
          <div style={formStyles.field}>
            <label style={formStyles.label} htmlFor="yearOnly">
              Rok (jeśli nie znasz dokładnych dat)
            </label>
            <input
              id="yearOnly"
              type="number"
              style={{ ...formStyles.input, maxWidth: 120 }}
              value={yearOnly}
              onChange={(e) => setYearOnly(e.target.value)}
              placeholder="2025"
            />
          </div>
        )}

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

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="baseCurrency">
              Waluta bazowa
            </label>
            <select id="baseCurrency" style={formStyles.input} value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
              {getCurrencyOptions().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="phase">
              Status
            </label>
            <select id="phase" style={formStyles.input} value={phase} onChange={(e) => setPhase(e.target.value as TripPhase)}>
              {(Object.keys(PHASE_LABELS) as TripPhase[]).map((p) => (
                <option key={p} value={p}>
                  {PHASE_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="notes">
            Notatki
          </label>
          <textarea
            id="notes"
            style={{ ...formStyles.input, minHeight: 80 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {saveError && <p style={{ color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing[3] }}>{saveError}</p>}
        <div style={{ display: 'flex', gap: spacing[3], flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {isEdit ? 'Zapisz' : 'Utwórz wyjazd'}
          </button>
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={() => void handleDelete()} disabled={saving}>
              Usuń wyjazd
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
