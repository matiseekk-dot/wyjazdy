import {
  type DocumentData,
  type QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ChecklistItem, ChecklistItemDraft } from '../../types'

function checklistCol(tripId: string) {
  return collection(db, 'trips', tripId, 'checklist')
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): ChecklistItem {
  const data = snap.data()
  return { id: snap.id, group: data.group, label: data.label, checked: data.checked ?? false, order: data.order ?? 0 }
}

export function subscribeChecklist(tripId: string, callback: (items: ChecklistItem[]) => void) {
  return onSnapshot(checklistCol(tripId), (snap) => callback(snap.docs.map(fromDoc)))
}

export async function createChecklistItem(tripId: string, draft: ChecklistItemDraft): Promise<string> {
  const docRef = await addDoc(checklistCol(tripId), draft)
  return docRef.id
}

export async function updateChecklistItem(tripId: string, itemId: string, patch: Partial<ChecklistItemDraft>) {
  await updateDoc(doc(checklistCol(tripId), itemId), patch)
}

export async function deleteChecklistItem(tripId: string, itemId: string) {
  await deleteDoc(doc(checklistCol(tripId), itemId))
}

export async function seedDefaultChecklist(tripId: string, drafts: ChecklistItemDraft[]) {
  const batch = writeBatch(db)
  for (const draft of drafts) {
    batch.set(doc(checklistCol(tripId)), draft)
  }
  await batch.commit()
}
