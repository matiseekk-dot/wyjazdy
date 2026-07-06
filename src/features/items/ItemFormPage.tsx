import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { getCurrencyOptions } from '../../lib/currencies'
import { ITEM_CATEGORY_LABELS, ITEM_STATUS_LABELS } from '../../lib/labels'
import { fetchNbpRate } from '../../lib/nbp'
import { COMMON_PROVIDERS } from '../../lib/providers'
import { createItem, deleteItem, getItem, getTrip, subscribeParticipants, updateItem } from '../../lib/repo'
import { colors, fontSize, spacing } from '../../tokens'
import { ITEM_CATEGORIES, ITEM_STATUSES } from '../../types'
import type { ItemCategory, ItemStatus, Participant, SplitMode, Trip } from '../../types'

export function ItemFormPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(itemId)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loaded, setLoaded] = useState(!isEdit)

  const [category, setCategory] = useState<ItemCategory>('other')
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [confirmationNo, setConfirmationNo] = useState('')
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<ItemStatus>('idea')
  const [amountOriginal, setAmountOriginal] = useState('')
  const [paidAmount, setPaidAmount] = useState('0')
  const [currency, setCurrency] = useState('PLN')
  const [fxRateToBase, setFxRateToBase] = useState('1')
  const [nbpLoading, setNbpLoading] = useState(false)
  const [nbpNote, setNbpNote] = useState<string | null>(null)
  const [paidBy, setPaidBy] = useState('')
  const [splitAmong, setSplitAmong] = useState<string[]>([])
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [splitShares, setSplitShares] = useState<Record<string, string>>({})
  const [splitCustom, setSplitCustom] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripId) return
    void getTrip(tripId).then((t) => {
      setTrip(t)
      if (!isEdit && t) setCurrency(t.baseCurrency)
    })
    return subscribeParticipants(tripId, setParticipants)
  }, [tripId, isEdit])

  useEffect(() => {
    if (!isEdit || !tripId || !itemId) return
    void getItem(tripId, itemId).then((item) => {
      if (!item) return
      setCategory(item.category)
      setTitle(item.title)
      setProvider(item.provider ?? '')
      setConfirmationNo(item.confirmationNo ?? '')
      setLink(item.link ?? '')
      setNotes(item.notes ?? '')
      setDateStart(item.dateStart?.slice(0, 10) ?? '')
      setDateEnd(item.dateEnd?.slice(0, 10) ?? '')
      setLocation(item.location ?? '')
      setStatus(item.status)
      setAmountOriginal(String(item.amountOriginal))
      setPaidAmount(String(item.paidAmount))
      setCurrency(item.currency)
      setFxRateToBase(String(item.fxRateToBase))
      setPaidBy(item.paidBy ?? '')
      setSplitAmong(item.splitAmong)
      setSplitMode(item.splitMode)
      setSplitShares(
        Object.fromEntries(Object.entries(item.splitShares ?? {}).map(([k, v]) => [k, String(v)])),
      )
      setSplitCustom(
        Object.fromEntries(Object.entries(item.splitCustom ?? {}).map(([k, v]) => [k, String(v)])),
      )
      setLoaded(true)
    })
  }, [isEdit, tripId, itemId])

  // New items default to "everyone" and "me pays" — the common case for shared trip costs.
  useEffect(() => {
    if (isEdit || participants.length === 0 || splitAmong.length > 0) return
    setSplitAmong(participants.map((p) => p.id))
    const me = participants.find((p) => p.isMe)
    if (me) setPaidBy(me.id)
  }, [isEdit, participants, splitAmong.length])

  const amountBasePreview = useMemo(() => {
    const a = parseFloat(amountOriginal)
    const r = parseFloat(fxRateToBase)
    return Number.isFinite(a) && Number.isFinite(r) ? a * r : 0
  }, [amountOriginal, fxRateToBase])

  const customSum = useMemo(
    () => splitAmong.reduce((sum, id) => sum + (parseFloat(splitCustom[id]) || 0), 0),
    [splitAmong, splitCustom],
  )
  const customSumValid =
    splitMode !== 'custom' || Math.abs(customSum - (parseFloat(amountOriginal) || 0)) < 0.01

  async function handleFetchNbpRate() {
    setNbpLoading(true)
    setNbpNote(null)
    const result = await fetchNbpRate(currency)
    setNbpLoading(false)
    if (result) {
      setFxRateToBase(String(result.rate))
      setNbpNote(`Kurs NBP z ${result.effectiveDate}`)
    } else {
      setNbpNote('Nie udało się pobrać kursu NBP dla tej waluty — wpisz ręcznie.')
    }
  }

  function toggleSplitAmong(participantId: string) {
    setSplitAmong((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId || !title.trim() || splitAmong.length === 0 || !customSumValid) return
    setSaving(true)
    setSaveError(null)

    const draft = {
      category,
      title: title.trim(),
      provider: provider.trim() || undefined,
      confirmationNo: confirmationNo.trim() || undefined,
      link: link.trim() || undefined,
      notes: notes.trim() || undefined,
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      location: location.trim() || undefined,
      status,
      amountOriginal: parseFloat(amountOriginal) || 0,
      paidAmount: parseFloat(paidAmount) || 0,
      currency,
      fxRateToBase: parseFloat(fxRateToBase) || 1,
      paidBy: paidBy || null,
      splitAmong,
      splitMode,
      splitShares:
        splitMode === 'shares'
          ? Object.fromEntries(splitAmong.map((id) => [id, parseFloat(splitShares[id]) || 1]))
          : undefined,
      splitCustom:
        splitMode === 'custom'
          ? Object.fromEntries(splitAmong.map((id) => [id, parseFloat(splitCustom[id]) || 0]))
          : undefined,
    }

    try {
      if (isEdit && itemId) {
        await updateItem(tripId, itemId, draft)
      } else {
        await createItem(tripId, draft)
      }
      navigate(`/trips/${tripId}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Nie udało się zapisać pozycji.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!tripId || !itemId) return
    if (!window.confirm('Usunąć tę pozycję?')) return
    try {
      await deleteItem(tripId, itemId)
      navigate(`/trips/${tripId}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Nie udało się usunąć pozycji.')
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
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>
        {isEdit ? 'Edytuj pozycję' : 'Nowa pozycja'}
      </h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="category">
            Kategoria
          </label>
          <select
            id="category"
            style={formStyles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
          >
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {ITEM_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="title">
            Tytuł
          </label>
          <input id="title" style={formStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="provider">
              Dostawca
            </label>
            <input
              id="provider"
              list="provider-options"
              style={formStyles.input}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Wizz, LOT, Airbnb…"
            />
            <datalist id="provider-options">
              {COMMON_PROVIDERS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="confirmationNo">
              Nr potwierdzenia / PNR
            </label>
            <input
              id="confirmationNo"
              style={formStyles.input}
              value={confirmationNo}
              onChange={(e) => setConfirmationNo(e.target.value)}
            />
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="link">
            Link do rezerwacji
          </label>
          <input id="link" type="url" style={formStyles.input} value={link} onChange={(e) => setLink(e.target.value)} />
        </div>

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="dateStart">
              Data od
            </label>
            <input
              id="dateStart"
              type="date"
              style={formStyles.input}
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="dateEnd">
              Data do
            </label>
            <input
              id="dateEnd"
              type="date"
              style={formStyles.input}
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="location">
            Miejsce
          </label>
          <input id="location" style={formStyles.input} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>Status</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {ITEM_STATUSES.map((s) => (
              <label
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${status === s ? colors.accent : colors.border}`,
                  fontSize: fontSize.sm,
                  cursor: 'pointer',
                }}
              >
                <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} style={{ margin: 0 }} />
                {ITEM_STATUS_LABELS[s]}
              </label>
            ))}
          </div>
        </div>

        <div style={formStyles.row}>
          <div style={{ ...formStyles.field, flex: 1 }}>
            <label style={formStyles.label} htmlFor="amountOriginal">
              Kwota
            </label>
            <input
              id="amountOriginal"
              type="number"
              step="0.01"
              style={formStyles.input}
              value={amountOriginal}
              onChange={(e) => setAmountOriginal(e.target.value)}
              required
            />
          </div>
          <div style={{ ...formStyles.field, width: 110 }}>
            <label style={formStyles.label} htmlFor="currency">
              Waluta
            </label>
            <select id="currency" style={formStyles.input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {getCurrencyOptions().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="paidAmount">
            Zapłacono dotychczas
          </label>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <input
              id="paidAmount"
              type="number"
              step="0.01"
              style={{ ...formStyles.input, flex: 1 }}
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPaidAmount(amountOriginal)}
              style={{ fontSize: fontSize.sm, whiteSpace: 'nowrap' }}
            >
              Cała kwota
            </button>
          </div>
          {(parseFloat(amountOriginal) || 0) - (parseFloat(paidAmount) || 0) > 0.005 && (
            <span style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing[1] }}>
              Zostało do zapłaty: {((parseFloat(amountOriginal) || 0) - (parseFloat(paidAmount) || 0)).toFixed(2)} {currency}
            </span>
          )}
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="fxRateToBase">
            Kurs do {trip?.baseCurrency ?? 'waluty bazowej'} (zamrożony na moment wpisania)
          </label>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <input
              id="fxRateToBase"
              type="number"
              step="0.0001"
              style={{ ...formStyles.input, flex: 1 }}
              value={fxRateToBase}
              onChange={(e) => setFxRateToBase(e.target.value)}
              required
            />
            {trip?.baseCurrency === 'PLN' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void handleFetchNbpRate()}
                disabled={nbpLoading}
                style={{ padding: `0 ${spacing[3]}`, fontSize: fontSize.sm, whiteSpace: 'nowrap' }}
              >
                {nbpLoading ? '…' : 'Pobierz z NBP'}
              </button>
            )}
          </div>
          {nbpNote && <span style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{nbpNote}</span>}
          <span style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing[1] }}>
            = {amountBasePreview.toFixed(2)} {trip?.baseCurrency}
          </span>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="paidBy">
            Zapłacił(a)
          </label>
          <select id="paidBy" style={formStyles.input} value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            <option value="">— nie ustalono —</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>Dotyczy (podział kosztu)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {participants.map((p) => (
              <label
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: spacing[1], fontSize: fontSize.sm }}
              >
                <input type="checkbox" checked={splitAmong.includes(p.id)} onChange={() => toggleSplitAmong(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>Sposób podziału</label>
          <div style={{ display: 'flex', gap: spacing[3] }}>
            {(['equal', 'shares', 'custom'] as SplitMode[]).map((mode) => (
              <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: spacing[1], fontSize: fontSize.sm }}>
                <input type="radio" name="splitMode" checked={splitMode === mode} onChange={() => setSplitMode(mode)} />
                {mode === 'equal' ? 'Po równo' : mode === 'shares' ? 'Udziały' : 'Kwoty ręcznie'}
              </label>
            ))}
          </div>

          {splitMode === 'shares' && splitAmong.length > 0 && (
            <div style={{ marginTop: spacing[3], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {splitAmong.map((id) => {
                const p = participants.find((x) => x.id === id)
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <span style={{ flex: 1, fontSize: fontSize.sm }}>{p?.name}</span>
                    <input
                      type="number"
                      step="0.1"
                      style={{ ...formStyles.input, width: 90 }}
                      value={splitShares[id] ?? '1'}
                      onChange={(e) => setSplitShares((prev) => ({ ...prev, [id]: e.target.value }))}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {splitMode === 'custom' && splitAmong.length > 0 && (
            <div style={{ marginTop: spacing[3], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {splitAmong.map((id) => {
                const p = participants.find((x) => x.id === id)
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <span style={{ flex: 1, fontSize: fontSize.sm }}>{p?.name}</span>
                    <input
                      type="number"
                      step="0.01"
                      style={{ ...formStyles.input, width: 90 }}
                      value={splitCustom[id] ?? ''}
                      onChange={(e) => setSplitCustom((prev) => ({ ...prev, [id]: e.target.value }))}
                    />
                  </div>
                )
              })}
              {!customSumValid && (
                <span style={{ fontSize: fontSize.xs, color: colors.danger }}>
                  Suma ({customSum.toFixed(2)}) musi się zgadzać z kwotą ({(parseFloat(amountOriginal) || 0).toFixed(2)}
                  ).
                </span>
              )}
            </div>
          )}
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label} htmlFor="notes">
            Notatki
          </label>
          <textarea id="notes" style={{ ...formStyles.input, minHeight: 80 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {saveError && (
          <p style={{ color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing[3] }}>{saveError}</p>
        )}
        <div style={{ display: 'flex', gap: spacing[3] }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || splitAmong.length === 0 || !customSumValid}
          >
            Zapisz
          </button>
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={() => void handleDelete()}>
              Usuń
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
