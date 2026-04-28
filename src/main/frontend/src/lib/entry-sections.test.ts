import { describe, expect, it } from 'vitest'
import { buildEntrySubsections } from './entry-sections'
import type { Entry } from '@/types'

function makeEntry(overrides: Partial<Entry>): Entry {
  return {
    id: overrides.id ?? 1,
    type: overrides.type ?? 'TASK',
    title: overrides.title ?? 'Entry',
    body: overrides.body ?? null,
    status: overrides.status ?? 'OPEN',
    date: overrides.date ?? '2026-04-28',
    due_date: overrides.due_date ?? null,
    scheduled_today: overrides.scheduled_today ?? false,
    external_ref: overrides.external_ref ?? null,
    pinned: overrides.pinned ?? false,
    priority: overrides.priority ?? null,
    tags: overrides.tags ?? [],
    created_at: overrides.created_at ?? '2026-04-28T09:00:00Z',
    updated_at: overrides.updated_at ?? '2026-04-28T09:00:00Z',
  }
}

describe('buildEntrySubsections', () => {
  it('returns Fixades before Sense fixar and hides empty sections', () => {
    const result = buildEntrySubsections([
      makeEntry({ id: 1, title: 'Fixada', pinned: true }),
      makeEntry({ id: 2, title: 'No fixada', pinned: false }),
    ])

    expect(result.map(section => section.key)).toEqual(['fixed', 'regular'])
    expect(result[0].title).toBe('Fixades')
    expect(result[0].count).toBe(1)
    expect(result[1].title).toBe('Sense fixar')
    expect(result[1].count).toBe(1)
  })

  it('orders entries by priority, due-date presence, due date, and createdAt desc', () => {
    const result = buildEntrySubsections([
      makeEntry({ id: 1, title: 'Sense data', pinned: true, priority: 2, due_date: null, created_at: '2026-04-28T08:00:00Z' }),
      makeEntry({ id: 2, title: 'Data llunyana', pinned: true, priority: 2, due_date: '2026-05-03', created_at: '2026-04-28T07:00:00Z' }),
      makeEntry({ id: 3, title: 'Data propera', pinned: true, priority: 2, due_date: '2026-04-29', created_at: '2026-04-28T06:00:00Z' }),
      makeEntry({ id: 4, title: 'Prioritat alta', pinned: true, priority: 1, due_date: null, created_at: '2026-04-28T05:00:00Z' }),
      makeEntry({ id: 5, title: 'Desempat recent', pinned: true, priority: 3, due_date: null, created_at: '2026-04-28T10:00:00Z' }),
      makeEntry({ id: 6, title: 'Desempat antic', pinned: true, priority: 3, due_date: null, created_at: '2026-04-28T04:00:00Z' }),
    ])

    expect(result[0].entries.map(entry => entry.id)).toEqual([4, 3, 2, 1, 5, 6])
  })

  it('uses createdAt desc as the final tie-break when priority and due-date shape are equal', () => {
    const result = buildEntrySubsections([
      makeEntry({ id: 1, title: 'Més recent', pinned: true, priority: 2, due_date: '2026-05-01', created_at: '2026-04-28T10:00:00Z' }),
      makeEntry({ id: 2, title: 'Més antic', pinned: true, priority: 2, due_date: '2026-05-01', created_at: '2026-04-28T09:00:00Z' }),
    ])

    expect(result[0].entries.map(entry => entry.id)).toEqual([1, 2])
  })

  it('returns only Sense fixar when there are no fixed entries', () => {
    const result = buildEntrySubsections([
      makeEntry({ id: 1, pinned: false }),
    ])

    expect(result.map(section => section.key)).toEqual(['regular'])
  })
})
