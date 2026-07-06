import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Participant, ParticipantDraft } from '../../types'

function participantsCol(tripId: string) {
  return collection(db, 'trips', tripId, 'participants')
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Participant {
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    isMe: data.isMe ?? false,
    excludeFromBalance: data.excludeFromBalance ?? false,
    contact: data.contact,
  }
}

export function subscribeParticipants(tripId: string, callback: (participants: Participant[]) => void) {
  return onSnapshot(participantsCol(tripId), (snap) => callback(snap.docs.map(fromDoc)))
}

export async function createParticipant(tripId: string, draft: ParticipantDraft): Promise<string> {
  const docRef = await addDoc(participantsCol(tripId), draft)
  return docRef.id
}

export async function updateParticipant(tripId: string, participantId: string, patch: Partial<ParticipantDraft>) {
  await updateDoc(doc(participantsCol(tripId), participantId), patch)
}

export async function deleteParticipant(tripId: string, participantId: string) {
  await deleteDoc(doc(participantsCol(tripId), participantId))
}
