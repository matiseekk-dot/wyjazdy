import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formStyles } from '../../components/formStyles'
import { ProgressBar } from '../../components/ProgressBar'
import { buildDefaultChecklist } from '../../lib/checklistTemplate'
import { createChecklistItem, deleteChecklistItem, seedDefaultChecklist, subscribeChecklist, updateChecklistItem } from '../../lib/repo'
import { colors, fontSize, fontWeight, spacing } from '../../tokens'
import type { ChecklistItem } from '../../types'

export function ChecklistPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [group, setGroup] = useState('')
  const [label, setLabel] = useState('')
  const [seeding, setSeeding] = useState(false)

  const groups = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>()
    for (const item of checklist) {
      if (!map.has(item.group)) map.set(item.group, [])
      map.get(item.group)?.push(item)
    }
    for (const items of map.values()) items.sort((a, b) => a.order - b.order)
    return [...map.entries()].sort((a, b) => (a[1][0]?.order ?? 0) - (b[1][0]?.order ?? 0))
  }, [checklist])

  const existingGroups = useMemo(() => [...new Set(checklist.map((i) => i.group))], [checklist])
  const doneCount = checklist.filter((i) => i.checked).length

  useEffect(() => {
    if (!tripId) return
    return subscribeChecklist(tripId, setChecklist)
  }, [tripId])

  async function handleSeed() {
    if (!tripId) return
    setSeeding(true)
    await seedDefaultChecklist(tripId, buildDefaultChecklist())
    setSeeding(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId || !group.trim() || !label.trim()) return
    await createChecklistItem(tripId, { group: group.trim(), label: label.trim(), checked: false, order: checklist.length })
    setLabel('')
  }

  if (!tripId) return null

  return (
    <div style={{ padding: spacing[5] }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>Checklista</h1>

      {checklist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: `${spacing[6]} ${spacing[4]}` }}>
          <p style={{ color: colors.textMuted, marginBottom: spacing[4] }}>
            Brak jeszcze żadnych punktów. Zacznij od sprawdzonego zestawu (transport, nocleg, formalności, finanse,
            technikalia, bagaż) albo dodaj własne punkty poniżej.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => void handleSeed()} disabled={seeding}>
            Dodaj domyślną checklistę
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: spacing[2] }}>
          <ProgressBar done={doneCount} total={checklist.length} />
        </div>
      )}

      {groups.map(([groupName, items]) => (
        <div key={groupName} style={{ marginTop: spacing[5] }}>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginBottom: spacing[2] }}>
            {groupName}
          </h2>
          <div className="card" style={{ padding: spacing[2] }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[2]}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => void updateChecklistItem(tripId, item.id, { checked: !item.checked })}
                />
                <span
                  style={{
                    flex: 1,
                    textDecoration: item.checked ? 'line-through' : 'none',
                    color: item.checked ? colors.textMuted : colors.text,
                  }}
                >
                  {item.label}
                </span>
                <button
                  type="button"
                  onClick={() => void deleteChecklistItem(tripId, item.id)}
                  aria-label={`Usuń ${item.label}`}
                  style={{ border: 'none', background: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: spacing[6], marginBottom: spacing[2] }}>
        Dodaj punkt
      </h2>
      <form onSubmit={(e) => void handleAdd(e)} style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
        <input
          list="checklist-groups"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Grupa (np. 🏨 Nocleg)"
          style={{ ...formStyles.input, flex: 1, minWidth: 140 }}
        />
        <datalist id="checklist-groups">
          {existingGroups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Co trzeba zrobić"
          style={{ ...formStyles.input, flex: 2, minWidth: 180 }}
        />
        <button type="submit" className="btn btn-primary" style={{ fontSize: fontSize.sm }}>
          Dodaj
        </button>
      </form>
    </div>
  )
}
