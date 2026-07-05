/** Computed client-side, never persisted — derived from items + payments on read. */
export interface ParticipantBalance {
  participantId: string
  /** Sum of this participant's share across all items, in the trip's base currency. */
  owedBase: number
  /** Sum of this participant's payments to "me", in the trip's base currency. */
  paidBase: number
  /** owedBase - paidBase. Positive = still owes; negative = overpaid. */
  netBase: number
}
