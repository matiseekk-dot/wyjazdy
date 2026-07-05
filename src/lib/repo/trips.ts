import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Trip, TripDraft } from '../../types'
import { isoToTs, tsToIso } from './timestamps'
import { tripsCol } from './trips-ref'

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Trip {
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    startDate: tsToIso(data.startDate),
    endDate: tsToIso(data.endDate),
    yearOnly: data.yearOnly ?? null,
    countries: data.countries ?? [],
    baseCurrency: data.baseCurrency,
    phase: data.phase,
    notes: data.notes,
    rating: data.rating,
    totalCostBase: data.totalCostBase ?? 0,
    paidCostBase: data.paidCostBase ?? 0,
    itemsTotalCount: data.itemsTotalCount ?? 0,
    itemsDoneCount: data.itemsDoneCount ?? 0,
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: tsToIso(data.updatedAt) ?? new Date(0).toISOString(),
  }
}

export function subscribeTrips(callback: (trips: Trip[]) => void) {
  const q = query(tripsCol, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => callback(snap.docs.map(fromDoc)))
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const snap = await getDoc(doc(tripsCol, tripId))
  return snap.exists() ? fromDoc(snap as QueryDocumentSnapshot<DocumentData>) : null
}

export async function createTrip(draft: TripDraft): Promise<string> {
  const docRef = await addDoc(tripsCol, {
    ...draft,
    startDate: isoToTs(draft.startDate),
    endDate: isoToTs(draft.endDate),
    totalCostBase: 0,
    paidCostBase: 0,
    itemsTotalCount: 0,
    itemsDoneCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateTrip(tripId: string, patch: Partial<TripDraft>) {
  const { startDate, endDate, ...rest } = patch
  await updateDoc(doc(tripsCol, tripId), {
    ...rest,
    ...(startDate !== undefined ? { startDate: isoToTs(startDate) } : {}),
    ...(endDate !== undefined ? { endDate: isoToTs(endDate) } : {}),
    updatedAt: serverTimestamp(),
  })
}

/** Deletes the trip and every document in its subcollections (participants, items, payments). */
export async function deleteTrip(tripId: string) {
  const subcollections = ['participants', 'items', 'payments']
  for (const name of subcollections) {
    const snap = await getDocs(collection(db, 'trips', tripId, name))
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    if (!snap.empty) await batch.commit()
  }
  await deleteDoc(doc(tripsCol, tripId))
}
