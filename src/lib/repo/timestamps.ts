import { Timestamp } from 'firebase/firestore'
import type { IsoDate } from '../../types'

export function tsToIso(value: unknown): IsoDate | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return null
}

export function isoToTs(value: IsoDate | null | undefined): Timestamp | null {
  return value ? Timestamp.fromDate(new Date(value)) : null
}
