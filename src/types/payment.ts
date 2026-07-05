import type { CurrencyCode, IsoDate } from './common'

export interface Payment {
  id: string
  fromParticipantId: string
  /** Usually the "me" participant. */
  toParticipantId: string
  amount: number
  currency: CurrencyCode
  date: IsoDate
  note?: string
  createdAt: IsoDate
}

export type PaymentDraft = Omit<Payment, 'id' | 'createdAt'>
