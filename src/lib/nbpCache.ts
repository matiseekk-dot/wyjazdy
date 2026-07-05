export interface CachedRate {
  rate: number
  effectiveDate: string
  fetchedAt: string
}

function cacheKey(currency: string): string {
  return `wyjazdy:nbp-rate:${currency}`
}

export function loadCachedRate(currency: string): CachedRate | null {
  try {
    const raw = localStorage.getItem(cacheKey(currency))
    return raw ? (JSON.parse(raw) as CachedRate) : null
  } catch {
    return null
  }
}

export function saveCachedRate(currency: string, rate: Omit<CachedRate, 'fetchedAt'>): void {
  try {
    const entry: CachedRate = { ...rate, fetchedAt: new Date().toISOString() }
    localStorage.setItem(cacheKey(currency), JSON.stringify(entry))
  } catch {
    // localStorage unavailable (private mode, quota) — the converter just won't cache offline.
  }
}
