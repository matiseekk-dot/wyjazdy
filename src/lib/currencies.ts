/** Starter list — extendable from Ustawienia via custom currencies below. */
export const COMMON_CURRENCIES = ['PLN', 'EUR', 'USD', 'AZN', 'GEL', 'TRY', 'GBP', 'CZK'] as const

const CUSTOM_CURRENCIES_KEY = 'wyjazdy:custom-currencies'

export function getCustomCurrencies(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CURRENCIES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addCustomCurrency(code: string): void {
  const normalized = code.trim().toUpperCase()
  if (!normalized || COMMON_CURRENCIES.includes(normalized as (typeof COMMON_CURRENCIES)[number])) return
  const list = getCustomCurrencies()
  if (!list.includes(normalized)) {
    localStorage.setItem(CUSTOM_CURRENCIES_KEY, JSON.stringify([...list, normalized]))
  }
}

export function removeCustomCurrency(code: string): void {
  localStorage.setItem(CUSTOM_CURRENCIES_KEY, JSON.stringify(getCustomCurrencies().filter((c) => c !== code)))
}

/** All selectable currency codes: the starter list plus anything added in Ustawienia. */
export function getCurrencyOptions(): string[] {
  return [...COMMON_CURRENCIES, ...getCustomCurrencies()]
}

const DEFAULT_BASE_CURRENCY_KEY = 'wyjazdy:default-base-currency'

export function getDefaultBaseCurrency(): string {
  return localStorage.getItem(DEFAULT_BASE_CURRENCY_KEY) ?? 'PLN'
}

export function setDefaultBaseCurrency(code: string): void {
  localStorage.setItem(DEFAULT_BASE_CURRENCY_KEY, code)
}
