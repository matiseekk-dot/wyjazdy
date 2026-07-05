export interface Participant {
  id: string
  name: string
  /** True for the trip organizer (usually the app owner) — payments flow to this participant. */
  isMe: boolean
  contact?: string
}

export type ParticipantDraft = Omit<Participant, 'id'>
