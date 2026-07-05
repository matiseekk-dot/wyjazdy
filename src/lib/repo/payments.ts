import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Payment, PaymentDraft } from '../../types'
import { isoToTs, tsToIso } from './timestamps'

function paymentsCol(tripId: string) {
  return collection(db, 'trips', tripId, 'payments')
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Payment {
  const data = snap.data()
  return {
    id: snap.id,
    fromParticipantId: data.fromParticipantId,
    toParticipantId: data.toParticipantId,
    amount: data.amount,
    currency: data.currency,
    date: tsToIso(data.date) ?? new Date(0).toISOString(),
    note: data.note,
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
  }
}

export function subscribePayments(tripId: string, callback: (payments: Payment[]) => void) {
  return onSnapshot(paymentsCol(tripId), (snap) => callback(snap.docs.map(fromDoc)))
}

export async function createPayment(tripId: string, draft: PaymentDraft): Promise<string> {
  const docRef = await addDoc(paymentsCol(tripId), {
    ...draft,
    date: isoToTs(draft.date),
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deletePayment(tripId: string, paymentId: string) {
  await deleteDoc(doc(paymentsCol(tripId), paymentId))
}
