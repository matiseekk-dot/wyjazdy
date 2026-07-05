import type { CurrencyCode, IsoDate } from './common'

export type ItemCategory =
  | 'flight'
  | 'accommodation'
  | 'transport'
  | 'activity'
  | 'visa_insurance'
  | 'food'
  | 'other'

export type ItemStatus = 'idea' | 'to_book' | 'booked' | 'paid' | 'confirmed'

export type SplitMode = 'equal' | 'shares' | 'custom'

export interface ItemAttachment {
  fileName: string
  contentType: string
  storagePath: string
  downloadURL: string
  /** set once the file has been cached to local storage for offline viewing */
  cachedAt?: IsoDate
}

export interface Item {
  id: string
  category: ItemCategory
  title: string
  provider?: string
  confirmationNo?: string
  link?: string
  notes?: string
  dateStart?: IsoDate
  dateEnd?: IsoDate
  location?: string
  status: ItemStatus

  amountOriginal: number
  currency: CurrencyCode
  /** Rate to the trip's base currency at entry time — frozen, never recalculated retroactively. */
  fxRateToBase: number
  /** amountOriginal * fxRateToBase, computed once at write time. */
  amountBase: number

  /** Participant id who paid, usually "me". Null while still an idea/to_book. */
  paidBy: string | null
  /** Participant ids this cost applies to. */
  splitAmong: string[]
  splitMode: SplitMode
  /** participantId -> weight. Only present when splitMode === 'shares'. Must cover every id in splitAmong. */
  splitShares?: Record<string, number>
  /** participantId -> amount in amountOriginal's currency. Only when splitMode === 'custom'. Must sum to amountOriginal. */
  splitCustom?: Record<string, number>

  attachments: ItemAttachment[]

  createdAt: IsoDate
  updatedAt: IsoDate
}

export type ItemDraft = Omit<Item, 'id' | 'amountBase' | 'attachments' | 'createdAt' | 'updatedAt'>

export const ITEM_CATEGORIES: ItemCategory[] = [
  'flight',
  'accommodation',
  'transport',
  'activity',
  'visa_insurance',
  'food',
  'other',
]

export const ITEM_STATUSES: ItemStatus[] = ['idea', 'to_book', 'booked', 'paid', 'confirmed']

/** Statuses counted toward a trip's "done" progress (dashboard progress bar). */
export const ITEM_STATUSES_DONE: ItemStatus[] = ['paid', 'confirmed']
