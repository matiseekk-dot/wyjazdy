import type { Item, ParticipantBalance, Participant, Payment } from '../types'

/**
 * owedBase ignores paidBy on purpose: the model is "everyone settles with me",
 * not a multi-payer graph, per the app's household-treasurer accounting style.
 * paidBase assumes payment.amount is already in the trip's base currency —
 * Payment has no fxRateToBase field, since settlements are expected to happen in PLN.
 */
export function computeBalances(
  participants: Participant[],
  items: Item[],
  payments: Payment[],
): ParticipantBalance[] {
  const owedBase = new Map<string, number>()
  const paidBase = new Map<string, number>()
  for (const p of participants) {
    owedBase.set(p.id, 0)
    paidBase.set(p.id, 0)
  }

  for (const item of items) {
    for (const participantId of item.splitAmong) {
      const share = shareOf(item, participantId)
      owedBase.set(participantId, (owedBase.get(participantId) ?? 0) + share)
    }
  }

  for (const payment of payments) {
    paidBase.set(payment.fromParticipantId, (paidBase.get(payment.fromParticipantId) ?? 0) + payment.amount)
  }

  return participants.map((p) => {
    const owed = owedBase.get(p.id) ?? 0
    const paid = paidBase.get(p.id) ?? 0
    return { participantId: p.id, owedBase: owed, paidBase: paid, netBase: owed - paid }
  })
}

/**
 * Balances for display: excludes "me" (their share nets against themself, not a real
 * debt) and anyone flagged excludeFromBalance (e.g. a dependent child the organizer
 * pays for as a matter of course and will never actually reimburse) — their share
 * still counts in totalCostBase/cost-per-person, just not in "who owes me" UI.
 * computeBalances doesn't know about either flag, so callers filter here.
 */
export function othersBalances(participants: Participant[], balances: ParticipantBalance[]): ParticipantBalance[] {
  const excludedIds = new Set(participants.filter((p) => p.isMe || p.excludeFromBalance).map((p) => p.id))
  return balances.filter((b) => !excludedIds.has(b.participantId))
}

function shareOf(item: Item, participantId: string): number {
  const n = item.splitAmong.length
  if (n === 0) return 0

  if (item.splitMode === 'equal') {
    return item.amountBase / n
  }

  if (item.splitMode === 'shares') {
    const weights = item.splitShares ?? {}
    const totalWeight = item.splitAmong.reduce((sum, id) => sum + (weights[id] ?? 0), 0)
    if (totalWeight === 0) return 0
    return (item.amountBase * (weights[participantId] ?? 0)) / totalWeight
  }

  // custom: amounts are in the item's original currency, convert with the same frozen rate
  const custom = item.splitCustom ?? {}
  return (custom[participantId] ?? 0) * item.fxRateToBase
}
