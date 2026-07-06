export interface ChecklistItem {
  id: string
  group: string
  label: string
  checked: boolean
  /** Preserves insertion/template order — Firestore has no natural array ordering. */
  order: number
}

export type ChecklistItemDraft = Omit<ChecklistItem, 'id'>
