export interface NbpRate {
  rate: number
  effectiveDate: string
}

/**
 * NBP Table A (daily) only covers ~30 major currencies — no AZN/GEL, which this app's
 * own trips need. Table B (weekly) covers the long tail, so we fall back to it.
 */
export async function fetchNbpRate(currencyCode: string): Promise<NbpRate | null> {
  if (currencyCode === 'PLN') {
    return { rate: 1, effectiveDate: new Date().toISOString().slice(0, 10) }
  }
  return (await fetchFromTable('A', currencyCode)) ?? (await fetchFromTable('B', currencyCode))
}

async function fetchFromTable(table: 'A' | 'B', currencyCode: string): Promise<NbpRate | null> {
  try {
    const res = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/${table}/${currencyCode.toLowerCase()}/?format=json`,
    )
    if (!res.ok) return null
    const data: { rates: { mid: number; effectiveDate: string }[] } = await res.json()
    const entry = data.rates[0]
    return entry ? { rate: entry.mid, effectiveDate: entry.effectiveDate } : null
  } catch {
    return null
  }
}
