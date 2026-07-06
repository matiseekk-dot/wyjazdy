export interface Participant {
  id: string
  name: string
  /** True for the trip organizer (usually the app owner) — payments flow to this participant. */
  isMe: boolean
  /**
   * Their share still counts toward item costs and cost-per-person, but they're
   * left out of "who owes me" balances — for dependents (e.g. a child) who the
   * organizer pays for as a matter of course and will never actually reimburse.
   */
  excludeFromBalance?: boolean
  contact?: string
}

export type ParticipantDraft = Omit<Participant, 'id'>
