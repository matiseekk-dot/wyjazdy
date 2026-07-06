import type { ChecklistItemDraft } from '../types'

/** Matches the checklist structure from the legacy tracker's export — a proven set. */
const TEMPLATE: [string, string[]][] = [
  [
    '✈️ Transport',
    ['Kupione bilety lotnicze', 'Odprawienie online (check-in)', 'Wynajem auta zarezerwowany', 'Transfer z/na lotnisko'],
  ],
  ['🏨 Nocleg', ['Apartament/hotel zarezerwowany', 'Potwierdzenie rezerwacji zapisane', 'Adres i godzina check-in znane']],
  [
    '🛡️ Formalności',
    ['Ubezpieczenie turystyczne wykupione', 'Paszport/dowód ważny', 'Wiza (jeśli wymagana)', 'Karta EKUZ/ubezpieczenie zdrowotne'],
  ],
  ['💳 Finanse', ['Gotówka w lokalnej walucie', 'Karta bankowa odblokowana za granicą', 'Aplikacja bankowa działa za granicą']],
  ['📱 Technikalia', ['Roaming/lokalna karta SIM', 'Mapy offline pobrane (Google Maps)', 'Ładowarki i adapter wtyczki']],
  ['🧳 Bagaż', ['Bagaż podręczny w limicie linii', 'Leki i apteczka', 'Dokumenty ubezpieczenia w telefonie']],
]

export function buildDefaultChecklist(): ChecklistItemDraft[] {
  let order = 0
  return TEMPLATE.flatMap(([group, labels]) => labels.map((label) => ({ group, label, checked: false, order: order++ })))
}
