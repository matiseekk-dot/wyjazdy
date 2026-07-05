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
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { ITEM_STATUSES_DONE, type Item, type ItemDraft } from '../../types'
import { isoToTs, tsToIso } from './timestamps'
import { tripsCol } from './trips-ref'

function itemsCol(tripId: string) {
  return collection(db, 'trips', tripId, 'items')
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Item {
  const data = snap.data()
  return {
    id: snap.id,
    category: data.category,
    title: data.title,
    provider: data.provider,
    confirmationNo: data.confirmationNo,
    link: data.link,
    notes: data.notes,
    dateStart: tsToIso(data.dateStart) ?? undefined,
    dateEnd: tsToIso(data.dateEnd) ?? undefined,
    location: data.location,
    status: data.status,
    amountOriginal: data.amountOriginal,
    currency: data.currency,
    fxRateToBase: data.fxRateToBase,
    amountBase: data.amountBase,
    paidBy: data.paidBy ?? null,
    splitAmong: data.splitAmong ?? [],
    splitMode: data.splitMode,
    splitShares: data.splitShares,
    splitCustom: data.splitCustom,
    attachments: data.attachments ?? [],
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: tsToIso(data.updatedAt) ?? new Date(0).toISOString(),
  }
}

export function subscribeItems(tripId: string, callback: (items: Item[]) => void) {
  return onSnapshot(itemsCol(tripId), (snap) => callback(snap.docs.map(fromDoc)))
}

export async function getItem(tripId: string, itemId: string): Promise<Item | null> {
  const snap = await getDoc(doc(itemsCol(tripId), itemId))
  return snap.exists() ? fromDoc(snap as QueryDocumentSnapshot<DocumentData>) : null
}

export async function createItem(tripId: string, draft: ItemDraft): Promise<string> {
  const docRef = await addDoc(itemsCol(tripId), {
    ...draft,
    dateStart: isoToTs(draft.dateStart),
    dateEnd: isoToTs(draft.dateEnd),
    amountBase: draft.amountOriginal * draft.fxRateToBase,
    attachments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await recomputeTripAggregates(tripId)
  return docRef.id
}

export async function updateItem(tripId: string, itemId: string, patch: Partial<ItemDraft>) {
  const { dateStart, dateEnd, ...rest } = patch
  const amountBasePatch =
    patch.amountOriginal !== undefined || patch.fxRateToBase !== undefined
      ? { amountBase: await computeAmountBase(tripId, itemId, patch) }
      : {}
  await updateDoc(doc(itemsCol(tripId), itemId), {
    ...rest,
    ...amountBasePatch,
    ...(dateStart !== undefined ? { dateStart: isoToTs(dateStart) } : {}),
    ...(dateEnd !== undefined ? { dateEnd: isoToTs(dateEnd) } : {}),
    updatedAt: serverTimestamp(),
  })
  await recomputeTripAggregates(tripId)
}

async function computeAmountBase(tripId: string, itemId: string, patch: Partial<ItemDraft>) {
  const current = await getItem(tripId, itemId)
  const amountOriginal = patch.amountOriginal ?? current?.amountOriginal ?? 0
  const fxRateToBase = patch.fxRateToBase ?? current?.fxRateToBase ?? 1
  return amountOriginal * fxRateToBase
}

export async function deleteItem(tripId: string, itemId: string) {
  await deleteDoc(doc(itemsCol(tripId), itemId))
  await recomputeTripAggregates(tripId)
}

async function recomputeTripAggregates(tripId: string) {
  const snap = await getDocs(itemsCol(tripId))
  let totalCostBase = 0
  let paidCostBase = 0
  let itemsDoneCount = 0
  snap.docs.forEach((d) => {
    const data = d.data()
    const amountBase = (data.amountBase as number) ?? 0
    totalCostBase += amountBase
    if (ITEM_STATUSES_DONE.includes(data.status)) {
      paidCostBase += amountBase
      itemsDoneCount += 1
    }
  })
  await updateDoc(doc(tripsCol, tripId), {
    totalCostBase,
    paidCostBase,
    itemsTotalCount: snap.size,
    itemsDoneCount,
    updatedAt: serverTimestamp(),
  })
}
