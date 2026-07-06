// One-off importer for the pre-Wyjazdy trip tracker's export format
// (wyjazdy-klm-backup-*.json). Idempotent by source id: every trip and item gets
// a deterministic Firestore doc id derived from its source id, so re-running this
// script overwrites the same docs instead of duplicating them.
//
// Usage: node scripts/import-archive.mjs <path-to-backup.json>

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import { initializeFirestore, doc, setDoc, deleteDoc, collection, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

function loadEnv() {
  const envText = fs.readFileSync(`${projectRoot}.env`, 'utf-8')
  for (const line of envText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    process.env[key] ??= value
  }
}
loadEnv()

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
})
const db = initializeFirestore(app, { ignoreUndefinedProperties: true })

const CATEGORY_MAP = {
  flight: 'flight',
  hotel: 'accommodation',
  insurance: 'visa_insurance',
  transfer: 'transport',
  car: 'transport',
  other_est: 'other',
  food_est: 'food',
  shopping_est: 'other',
  activities: 'activity',
}
const DONE_STATUSES = new Set(['paid', 'confirmed'])

function mapCategory(sourceCategory) {
  return CATEGORY_MAP[sourceCategory] ?? 'other'
}

function sanitizeDocId(sourceId) {
  return `import-${String(sourceId).replace(/[/]/g, '_')}`
}

/** Only Estonia/Finlandia (source data) has a real destination-less two-country
 *  name; every other trip has "City, Country" or a bare country in destination. */
function parseCountries(destination, name) {
  const trimmed = (destination ?? '').trim()
  if (trimmed) {
    const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    return [parts[parts.length - 1]]
  }
  return name.trim().split(/\s+/).filter(Boolean)
}

/** Most trips in this export only ever had a placeholder "YYYY-01-01" startDate
 *  and no endDate — a real date range is the exception, not the rule. */
function parseDates(sourceTrip) {
  const endDate = (sourceTrip.endDate ?? '').trim()
  if (endDate) {
    return { startDate: sourceTrip.startDate, endDate, yearOnly: null }
  }
  const year = sourceTrip.startDate ? new Date(sourceTrip.startDate).getFullYear() : null
  return { startDate: null, endDate: null, yearOnly: year }
}

async function clearSubcollection(tripDocId, name) {
  const snap = await getDocs(collection(db, 'trips', tripDocId, name))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

async function importTrip(sourceTrip) {
  const tripDocId = sanitizeDocId(sourceTrip.id)
  const { startDate, endDate, yearOnly } = parseDates(sourceTrip)
  const countries = parseCountries(sourceTrip.destination, sourceTrip.name)

  const items = (sourceTrip.estimates ?? []).map((estimate) => {
    const amountOriginal = parseFloat(estimate.cost) || 0
    // The old tracker had no partial-payment concept — booked meant paid in full.
    const status = estimate.booked ? 'confirmed' : 'idea'
    const paidAmount = status === 'confirmed' ? amountOriginal : 0
    return {
      docId: sanitizeDocId(estimate.id),
      category: mapCategory(estimate.category),
      title: estimate.label || '(bez nazwy)',
      notes: estimate.notes?.trim() || undefined,
      status,
      amountOriginal,
      currency: 'PLN',
      fxRateToBase: 1,
      amountBase: amountOriginal,
      paidAmount,
      paidAmountBase: paidAmount,
    }
  })

  const totalCostBase = items.reduce((sum, i) => sum + i.amountBase, 0)
  const paidCostBase = items.reduce((sum, i) => sum + i.paidAmountBase, 0)
  const itemsDoneCount = items.filter((i) => DONE_STATUSES.has(i.status)).length

  await setDoc(doc(db, 'trips', tripDocId), {
    name: sourceTrip.name,
    startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
    endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
    yearOnly,
    countries,
    baseCurrency: 'PLN',
    phase: 'completed',
    notes: sourceTrip.notes?.trim() || undefined,
    totalCostBase,
    paidCostBase,
    itemsTotalCount: items.length,
    itemsDoneCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Re-importing must not duplicate items if the source estimate list shrank —
  // clear the subcollection first, then write the current set.
  await clearSubcollection(tripDocId, 'items')
  await Promise.all(
    items.map((item) =>
      setDoc(doc(db, 'trips', tripDocId, 'items', item.docId), {
        category: item.category,
        title: item.title,
        notes: item.notes,
        status: item.status,
        amountOriginal: item.amountOriginal,
        currency: item.currency,
        fxRateToBase: item.fxRateToBase,
        amountBase: item.amountBase,
        paidAmount: item.paidAmount,
        paidAmountBase: item.paidAmountBase,
        paidBy: null,
        splitAmong: [],
        splitMode: 'equal',
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
  )

  return { tripDocId, name: sourceTrip.name, itemCount: items.length, totalCostBase, countries }
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: node scripts/import-archive.mjs <path-to-backup.json>')
    process.exit(1)
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`Importing ${data.trips.length} trips from ${filePath}...`)

  let grandTotal = 0
  const allCountries = new Set()
  for (const sourceTrip of data.trips) {
    const result = await importTrip(sourceTrip)
    grandTotal += result.totalCostBase
    result.countries.forEach((c) => allCountries.add(c))
    console.log(`  ${result.name}: ${result.itemCount} pozycji, ${result.totalCostBase.toFixed(2)} zł`)
  }
  console.log(`\nDone. ${data.trips.length} wyjazdów, ${grandTotal.toFixed(2)} zł łącznie, ${allCountries.size} krajów: ${[...allCountries].join(', ')}`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
