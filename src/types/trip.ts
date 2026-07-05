import type { CurrencyCode, IsoDate } from './common'

export type TripPhase = 'planning' | 'active' | 'completed'

export interface Trip {
  id: string
  name: string
  /** null when only a placeholder year is known (e.g. archive imports without real dates) */
  startDate: IsoDate | null
  endDate: IsoDate | null
  /** placeholder year shown in UI when startDate/endDate are unknown */
  yearOnly: number | null
  countries: string[]
  baseCurrency: CurrencyCode
  phase: TripPhase
  notes?: string
  rating?: number

  /** Denormalized aggregates, recomputed whenever an item or payment is written. */
  totalCostBase: number
  paidCostBase: number
  itemsTotalCount: number
  itemsDoneCount: number

  createdAt: IsoDate
  updatedAt: IsoDate
}

export type TripDraft = Omit<
  Trip,
  'id' | 'totalCostBase' | 'paidCostBase' | 'itemsTotalCount' | 'itemsDoneCount' | 'createdAt' | 'updatedAt'
>
