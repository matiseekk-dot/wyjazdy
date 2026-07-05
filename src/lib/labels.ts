import type { ItemCategory, ItemStatus } from '../types'

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  idea: 'Pomysł',
  to_book: 'Do rezerwacji',
  booked: 'Zarezerwowane',
  paid: 'Opłacone',
  confirmed: 'Potwierdzone',
}

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  flight: 'Lot',
  accommodation: 'Nocleg',
  transport: 'Transport',
  activity: 'Atrakcja',
  visa_insurance: 'Wiza / ubezpieczenie',
  food: 'Jedzenie',
  other: 'Inne',
}
