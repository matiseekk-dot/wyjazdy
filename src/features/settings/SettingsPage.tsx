import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formStyles } from '../../components/formStyles'
import {
  COMMON_CURRENCIES,
  addCustomCurrency,
  getCustomCurrencies,
  getDefaultBaseCurrency,
  removeCustomCurrency,
  setDefaultBaseCurrency,
} from '../../lib/currencies'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'

export function SettingsPage() {
  const [defaultCurrency, setDefaultCurrency] = useState(getDefaultBaseCurrency())
  const [customCurrencies, setCustomCurrencies] = useState(getCustomCurrencies())
  const [newCurrency, setNewCurrency] = useState('')

  function handleDefaultCurrencyChange(code: string) {
    setDefaultCurrency(code)
    setDefaultBaseCurrency(code)
  }

  function handleAddCurrency(e: React.FormEvent) {
    e.preventDefault()
    if (!newCurrency.trim()) return
    addCustomCurrency(newCurrency)
    setCustomCurrencies(getCustomCurrencies())
    setNewCurrency('')
  }

  function handleRemoveCurrency(code: string) {
    removeCustomCurrency(code)
    setCustomCurrencies(getCustomCurrencies())
  }

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[5] }}>Ustawienia</h1>

      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginBottom: spacing[2] }}>
        Domyślna waluta bazowa
      </h2>
      <p style={{ color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing[2] }}>
        Podpowiadana przy tworzeniu nowego wyjazdu. Każdy wyjazd może mieć własną.
      </p>
      <select
        style={{ ...formStyles.input, marginBottom: spacing[6] }}
        value={defaultCurrency}
        onChange={(e) => handleDefaultCurrencyChange(e.target.value)}
      >
        {[...COMMON_CURRENCIES, ...customCurrencies].map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginBottom: spacing[2] }}>
        Lista walut
      </h2>
      <p style={{ color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing[3] }}>
        Startowy zestaw ({COMMON_CURRENCIES.join(', ')}) jest zawsze dostępny. Tu dodajesz kolejne kody walut do selektorów.
      </p>

      {customCurrencies.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
          {customCurrencies.map((code) => (
            <span
              key={code}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 6px 4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${colors.border}`,
                fontSize: fontSize.sm,
              }}
            >
              {code}
              <button
                type="button"
                onClick={() => handleRemoveCurrency(code)}
                aria-label={`Usuń ${code}`}
                style={{ border: 'none', background: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={handleAddCurrency} style={{ display: 'flex', gap: spacing[2] }}>
        <input
          style={{ ...formStyles.input, flex: 1, textTransform: 'uppercase' }}
          value={newCurrency}
          onChange={(e) => setNewCurrency(e.target.value)}
          placeholder="np. THB"
          maxLength={3}
        />
        <button type="submit" className="btn btn-primary" style={{ fontSize: fontSize.sm, padding: `${spacing[2]} ${spacing[4]}` }}>
          Dodaj
        </button>
      </form>
    </div>
  )
}
