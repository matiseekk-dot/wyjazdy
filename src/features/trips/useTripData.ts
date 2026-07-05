import { useEffect, useMemo, useState } from 'react'
import { computeBalances } from '../../lib/balances'
import { getTrip, subscribeItems, subscribeParticipants, subscribePayments } from '../../lib/repo'
import type { Item, Participant, Payment, Trip } from '../../types'

export function useTripData(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (!tripId) return
    void getTrip(tripId).then(setTrip)
    const unsubs = [
      subscribeParticipants(tripId, setParticipants),
      subscribeItems(tripId, setItems),
      subscribePayments(tripId, setPayments),
    ]
    return () => unsubs.forEach((u) => u())
  }, [tripId])

  const balances = useMemo(() => computeBalances(participants, items, payments), [participants, items, payments])

  return { trip, participants, items, payments, balances }
}
