# Fixades Subsections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce shared **Fixades** / **Sense fixar** subsections across the relevant entry lists, using one common ordering rule and preserving the current **Ahir** behavior in `DailyView`.

**Architecture:** Add a shared frontend utility that turns a flat `Entry[]` into ordered subsections, then reuse a small subsection UI wrapper across `DailyView`, `TasksPage`, `NotesPage`, and `EntryList`. Add a lightweight frontend test harness first, so the shared ordering logic and the new subsection rendering can be verified before wiring the screens.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Lucide icons, Vitest, Testing Library, jsdom

---

## File map

### Create

- `src/main/frontend/src/lib/entry-sections.ts` — shared sorting and grouping logic for **Fixades** / **Sense fixar**
- `src/main/frontend/src/lib/entry-sections.test.ts` — unit tests for the shared grouping and ordering behavior
- `src/main/frontend/src/components/entries/EntrySubsection.tsx` — reusable subsection header + container wrapper
- `src/main/frontend/src/components/entries/EntrySubsection.test.tsx` — rendering tests for subsection labels, counts, and conditional rendering
- `src/main/frontend/src/test/setup.ts` — frontend test setup for jsdom and Testing Library
- `src/main/frontend/src/test/test-utils.tsx` — shared QueryClient wrapper for component tests

### Modify

- `src/main/frontend/package.json` — add `test` script and test dependencies
- `src/main/frontend/vite.config.ts` — add `test` config for Vitest
- `src/main/frontend/tsconfig.app.json` — include Vitest globals if needed
- `src/main/frontend/src/components/entries/EntryCard.tsx` — add optional visual tone for entries rendered inside **Fixades**
- `src/main/frontend/src/components/dashboard/DailyView.tsx` — replace local priority-only sort in **Avui**, split **Avui** and **Pendent** into shared subsections, keep **Ahir** unchanged
- `src/main/frontend/src/pages/TasksPage.tsx` — replace date-first rendering with shared subsections
- `src/main/frontend/src/pages/NotesPage.tsx` — replace date-first rendering with shared subsections while keeping page-specific actions intact
- `src/main/frontend/src/components/entries/EntryList.tsx` — replace date-first rendering with shared subsections in **Registre**

---

## Task 1: Add the frontend test harness

**Files:**
- Modify: `src/main/frontend/package.json`
- Modify: `src/main/frontend/vite.config.ts`
- Modify: `src/main/frontend/tsconfig.app.json`
- Create: `src/main/frontend/src/test/setup.ts`
- Create: `src/main/frontend/src/test/test-utils.tsx`

- [ ] **Step 1: Add the failing test infrastructure dependencies and scripts**

Update `src/main/frontend/package.json`.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@testing-library/jest-dom": "^6.7.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4.2.2",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.0",
    "vite": "^8.0.4",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Add Vitest config to Vite**

Update `src/main/frontend/vite.config.ts`.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../resources/static',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 3: Add test types to the app tsconfig**

Update `src/main/frontend/tsconfig.app.json`.

```json
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create the global test setup**

Create `src/main/frontend/src/test/setup.ts`.

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 5: Create a shared React Query test wrapper**

Create `src/main/frontend/src/test/test-utils.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement, PropsWithChildren } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function renderWithQueryClient(ui: ReactElement) {
  const client = createTestQueryClient()

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

  return render(ui, { wrapper: Wrapper })
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: install completes and writes the updated lockfile if present.

- [ ] **Step 7: Verify the test runner boots**

Run: `npm run test`

Expected: the command exits successfully with `No test files found`, or starts the runner cleanly without config errors.

---

## Task 2: Add the shared entry subsection model with TDD

**Files:**
- Create: `src/main/frontend/src/lib/entry-sections.ts`
- Create: `src/main/frontend/src/lib/entry-sections.test.ts`
- Reference: `src/main/frontend/src/types/index.ts`

- [ ] **Step 1: Write the failing unit tests for grouping and sorting**

Create `src/main/frontend/src/lib/entry-sections.test.ts`.

```ts
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

  it('returns only Sense fixar when there are no fixed entries', () => {
    const result = buildEntrySubsections([
      makeEntry({ id: 1, pinned: false }),
    ])

    expect(result.map(section => section.key)).toEqual(['regular'])
  })
})
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run: `npm run test -- src/lib/entry-sections.test.ts`

Expected: FAIL with `Cannot find module './entry-sections'` or `buildEntrySubsections is not defined`.

- [ ] **Step 3: Write the minimal shared subsection implementation**

Create `src/main/frontend/src/lib/entry-sections.ts`.

```ts
import type { Entry } from '@/types'

export interface EntrySubsection {
  key: 'fixed' | 'regular'
  title: 'Fixades' | 'Sense fixar'
  count: number
  entries: Entry[]
}

function compareNullablePriority(a: number | null, b: number | null) {
  return (a ?? 99) - (b ?? 99)
}

function compareDueDatePresence(a: Entry, b: Entry) {
  if (a.due_date && !b.due_date) return -1
  if (!a.due_date && b.due_date) return 1
  return 0
}

function compareDueDateValue(a: Entry, b: Entry) {
  if (!a.due_date || !b.due_date) return 0
  return a.due_date.localeCompare(b.due_date)
}

function compareCreatedAtDesc(a: Entry, b: Entry) {
  return b.created_at.localeCompare(a.created_at)
}

export function sortEntriesForPinnedSections(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const byPriority = compareNullablePriority(a.priority, b.priority)
    if (byPriority !== 0) return byPriority

    const byDuePresence = compareDueDatePresence(a, b)
    if (byDuePresence !== 0) return byDuePresence

    const byDueValue = compareDueDateValue(a, b)
    if (byDueValue !== 0) return byDueValue

    return compareCreatedAtDesc(a, b)
  })
}

export function buildEntrySubsections(entries: Entry[]): EntrySubsection[] {
  const fixedEntries = sortEntriesForPinnedSections(entries.filter(entry => entry.pinned))
  const regularEntries = sortEntriesForPinnedSections(entries.filter(entry => !entry.pinned))

  const result: EntrySubsection[] = []

  if (fixedEntries.length > 0) {
    result.push({
      key: 'fixed',
      title: 'Fixades',
      count: fixedEntries.length,
      entries: fixedEntries,
    })
  }

  if (regularEntries.length > 0) {
    result.push({
      key: 'regular',
      title: 'Sense fixar',
      count: regularEntries.length,
      entries: regularEntries,
    })
  }

  return result
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npm run test -- src/lib/entry-sections.test.ts`

Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit the shared subsection model**

```bash
git add src/main/frontend/package.json src/main/frontend/vite.config.ts src/main/frontend/tsconfig.app.json src/main/frontend/src/test/setup.ts src/main/frontend/src/test/test-utils.tsx src/main/frontend/src/lib/entry-sections.ts src/main/frontend/src/lib/entry-sections.test.ts
git commit -m "feat(frontend): add shared fixades subsection model"
```

---

## Task 3: Add the reusable subsection UI wrapper

**Files:**
- Create: `src/main/frontend/src/components/entries/EntrySubsection.tsx`
- Create: `src/main/frontend/src/components/entries/EntrySubsection.test.tsx`
- Reference: `src/main/frontend/src/components/dashboard/DailyView.tsx:23-41`

- [ ] **Step 1: Write the failing rendering tests**

Create `src/main/frontend/src/components/entries/EntrySubsection.test.tsx`.

```tsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EntrySubsection } from './EntrySubsection'
import { renderWithQueryClient } from '@/test/test-utils'

describe('EntrySubsection', () => {
  it('renders the subsection title and count', () => {
    renderWithQueryClient(
      <EntrySubsection title="Fixades" count={3} tone="fixed">
        <div>content</div>
      </EntrySubsection>
    )

    expect(screen.getByText('Fixades')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('uses the fixed subsection visual container', () => {
    const { container } = renderWithQueryClient(
      <EntrySubsection title="Fixades" count={1} tone="fixed">
        <div>fixed item</div>
      </EntrySubsection>
    )

    expect(container.firstChild).toHaveClass('border-accent-primary/30')
  })
})
```

- [ ] **Step 2: Run the subsection test to verify it fails**

Run: `npm run test -- src/components/entries/EntrySubsection.test.tsx`

Expected: FAIL with `Cannot find module './EntrySubsection'`.

- [ ] **Step 3: Implement the shared subsection component**

Create `src/main/frontend/src/components/entries/EntrySubsection.tsx`.

```tsx
import type { PropsWithChildren } from 'react'
import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntrySubsectionProps extends PropsWithChildren {
  title: string
  count: number
  tone: 'fixed' | 'regular'
  className?: string
}

export function EntrySubsection({ title, count, tone, className, children }: EntrySubsectionProps) {
  return (
    <section
      className={cn(
        'space-y-3 rounded-xl border p-3',
        tone === 'fixed'
          ? 'border-accent-primary/30 bg-accent-primary/5'
          : 'border-border/60 bg-transparent',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {tone === 'fixed' ? <Pin size={13} className="text-accent-primary fill-accent-primary" /> : null}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px] font-semibold border-border bg-muted text-muted-foreground">
          {count}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {children}
    </section>
  )
}
```

- [ ] **Step 4: Run the subsection test to verify it passes**

Run: `npm run test -- src/components/entries/EntrySubsection.test.tsx`

Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit the subsection UI wrapper**

```bash
git add src/main/frontend/src/components/entries/EntrySubsection.tsx src/main/frontend/src/components/entries/EntrySubsection.test.tsx
git commit -m "feat(frontend): add reusable fixades subsection wrapper"
```

---

## Task 4: Add the visual tone hook to `EntryCard`

**Files:**
- Modify: `src/main/frontend/src/components/entries/EntryCard.tsx`

- [ ] **Step 1: Add the optional subsection tone prop**

Update the prop types in `src/main/frontend/src/components/entries/EntryCard.tsx`.

```tsx
type EntrySectionTone = 'fixed' | 'regular'

interface EntryCardProps {
  entry: Entry
  hideType?: boolean
  columnContext?: ColumnContext
  sectionTone?: EntrySectionTone
}
```

- [ ] **Step 2: Thread the tone into the component signature**

Update the component signature.

```tsx
export function EntryCard({
  entry,
  hideType,
  columnContext = 'default',
  sectionTone = 'regular',
}: EntryCardProps) {
```

- [ ] **Step 3: Apply the fixed visual treatment to the card root**

Update the root `<Card>` class list.

```tsx
<Card
  className={cn(
    'group cursor-pointer bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden',
    typeConfig.color,
    sectionTone === 'fixed' && 'ring-1 ring-accent-primary/25 border-accent-primary/30 bg-accent-primary/5',
  )}
>
```

- [ ] **Step 4: Keep the existing pin button behavior unchanged**

Do not change `togglePin`, button copy, or current tooltip text in this task. The goal here is only to expose a visual hook so the subsection container and the card can reinforce each other.

- [ ] **Step 5: Run the typecheck before moving to screen integrations**

Run: `npm run build`

Expected: PASS. If it fails because call sites do not yet know `sectionTone`, continue with the next task before re-running the build.

- [ ] **Step 6: Commit the card visual hook**

```bash
git add src/main/frontend/src/components/entries/EntryCard.tsx
git commit -m "feat(frontend): add fixades visual tone to entry cards"
```

---

## Task 5: Integrate shared subsections into `DailyView`

**Files:**
- Modify: `src/main/frontend/src/components/dashboard/DailyView.tsx`
- Reference: `src/main/frontend/src/lib/entry-sections.ts`
- Reference: `src/main/frontend/src/components/entries/EntrySubsection.tsx`

- [ ] **Step 1: Import the shared subsection helpers**

Add these imports at the top of `src/main/frontend/src/components/dashboard/DailyView.tsx`.

```tsx
import { EntrySubsection } from '@/components/entries/EntrySubsection'
import { buildEntrySubsections } from '@/lib/entry-sections'
```

- [ ] **Step 2: Replace the local priority-only sort in `todayTasks`**

Update the `todayTasks` definition so it no longer calls `.sort(...)` locally.

```tsx
const todayTasks = (dashboard?.entries || []).filter(e => {
  if (e.type === 'TASK') {
    return e.scheduled_today && (e.status === 'OPEN' || e.status === 'IN_PROGRESS' || e.status === 'PAUSED')
  }
  return false
})

const todaySections = buildEntrySubsections(todayTasks)
const backlogSections = buildEntrySubsections(backlog)
```

- [ ] **Step 3: Keep `Ahir` unchanged**

Do not touch the rendering block that starts with:

```tsx
<SectionHeader icon={History} title="Ahir" count={yesterdayDone.length} ... />
```

The `yesterdayDone` rendering stays exactly as it is.

- [ ] **Step 4: Render `Avui` with `Fixades` / `Sense fixar` subsections**

Replace the flat `todayTasks.map(...)` block with subsection rendering.

```tsx
<DroppableColumn id="today-column">
  {todayTasks.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
      <CheckSquare size={24} className="text-accent-primary opacity-80" />
      <p className="text-xs">Arrossega tasques aquí</p>
    </div>
  ) : (
    <div className="space-y-3">
      {todaySections.map(section => (
        <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
          <div className="space-y-1.5">
            {section.entries.map(entry => (
              <DraggableEntry key={entry.id} entry={entry} sectionTone={section.key} />
            ))}
          </div>
        </EntrySubsection>
      ))}
    </div>
  )}
</DroppableColumn>
```

- [ ] **Step 5: Extend `DraggableEntry` to accept the section tone**

Update `DraggableEntry`.

```tsx
function DraggableEntry({ entry, sectionTone = 'regular' }: { entry: Entry; sectionTone?: 'fixed' | 'regular' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `entry-${entry.id}`,
    data: { entry },
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : ''}>
      <EntryCard
        entry={entry}
        hideType
        columnContext={entry.scheduled_today ? 'today' : 'backlog'}
        sectionTone={sectionTone}
      />
    </div>
  )
}
```

- [ ] **Step 6: Render `Pendent` with the same subsection pattern**

Replace the flat `backlog.map(...)` block with subsection rendering.

```tsx
<DroppableColumn id="backlog-column">
  {backlog.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
      <AlertTriangle size={24} className="text-data-warning opacity-80" />
      <p className="text-xs">Tot al dia!</p>
    </div>
  ) : (
    <div className="space-y-3">
      {backlogSections.map(section => (
        <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
          <div className="space-y-1.5">
            {section.entries.map(entry => (
              <DraggableEntry key={entry.id} entry={entry} sectionTone={section.key} />
            ))}
          </div>
        </EntrySubsection>
      ))}
    </div>
  )}
</DroppableColumn>
```

- [ ] **Step 7: Run the focused tests and build**

Run:

```bash
npm run test -- src/lib/entry-sections.test.ts src/components/entries/EntrySubsection.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit the `DailyView` integration**

```bash
git add src/main/frontend/src/components/dashboard/DailyView.tsx
git commit -m "feat(dashboard): group avui i pendent by fixades"
```

---

## Task 6: Integrate shared subsections into `TasksPage`

**Files:**
- Modify: `src/main/frontend/src/pages/TasksPage.tsx`
- Reference: `src/main/frontend/src/lib/entry-sections.ts`
- Reference: `src/main/frontend/src/components/entries/EntrySubsection.tsx`

- [ ] **Step 1: Remove the page-local date grouping helpers**

Delete these local helpers from `src/main/frontend/src/pages/TasksPage.tsx`:

```tsx
function groupByDate(entries: Entry[]): [string, Entry[]][] { ... }
function formatGroupDate(dateStr: string): string { ... }
```

- [ ] **Step 2: Import the shared subsection logic**

Add these imports.

```tsx
import { EntrySubsection } from '@/components/entries/EntrySubsection'
import { buildEntrySubsections } from '@/lib/entry-sections'
```

- [ ] **Step 3: Build the subsections after filtering active vs closed**

Add:

```tsx
const sections = buildEntrySubsections(filteredEntries)
```

- [ ] **Step 4: Replace the date-group rendering with subsection rendering**

Replace the `grouped.map(...)` block with:

```tsx
<div className="space-y-4">
  {sections.map(section => (
    <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
      <div className="space-y-2">
        {section.entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <EntryCard entry={entry} columnContext="default" sectionTone={section.key} />
            </div>
          </div>
        ))}
      </div>
    </EntrySubsection>
  ))}
</div>
```

- [ ] **Step 5: Run the build after the tasks page refactor**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit the tasks page integration**

```bash
git add src/main/frontend/src/pages/TasksPage.tsx
git commit -m "feat(tasks): show fixades sections in task list"
```

---

## Task 7: Integrate shared subsections into `NotesPage`

**Files:**
- Modify: `src/main/frontend/src/pages/NotesPage.tsx`

- [ ] **Step 1: Remove the page-local date grouping helpers**

Delete these local helpers from `src/main/frontend/src/pages/NotesPage.tsx`:

```tsx
function groupByDate(entries: Entry[]): [string, Entry[]][] { ... }
function formatGroupDate(dateStr: string): string { ... }
```

- [ ] **Step 2: Import the shared subsection logic**

Add:

```tsx
import { EntrySubsection } from '@/components/entries/EntrySubsection'
import { buildEntrySubsections } from '@/lib/entry-sections'
```

- [ ] **Step 3: Build the subsections after filtering archived vs active**

Add:

```tsx
const sections = buildEntrySubsections(filteredEntries)
```

- [ ] **Step 4: Replace the date-first rendering while keeping note actions intact**

Replace the `grouped.map(...)` block with:

```tsx
<div className="space-y-4">
  {sections.map(section => (
    <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
      <div className="space-y-2">
        {section.entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <EntryCard entry={entry} columnContext="yesterday" hideType sectionTone={section.key} />
            </div>
            {!showArchived && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                title="Convertir a Tasca"
                onClick={() => {
                  updateEntry.mutate({ id: entry.id, body: { type: 'TASK' as EntryType, status: 'OPEN' as EntryStatus } }, {
                    onSuccess: () => toast.success('Convertida a tasca')
                  })
                }}
              >
                <RefreshCw size={14} className="mr-1.5" />
                Convertir
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => updateEntry.mutate({ id: entry.id, body: { status: showArchived ? 'OPEN' : 'DONE' } })}
            >
              {showArchived ? (
                <><Inbox size={14} className="mr-1.5" /> Activar</>
              ) : (
                <><Archive size={14} className="mr-1.5" /> Arxivar</>
              )}
            </Button>
          </div>
        ))}
      </div>
    </EntrySubsection>
  ))}
</div>
```

- [ ] **Step 5: Run the build after the notes page refactor**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit the notes page integration**

```bash
git add src/main/frontend/src/pages/NotesPage.tsx
git commit -m "feat(notes): show fixades sections in notes list"
```

---

## Task 8: Integrate shared subsections into `EntryList`

**Files:**
- Modify: `src/main/frontend/src/components/entries/EntryList.tsx`

- [ ] **Step 1: Remove the component-local date grouping helpers**

Delete these local helpers from `src/main/frontend/src/components/entries/EntryList.tsx`:

```tsx
function formatGroupDate(dateStr: string): string { ... }
function groupByDate(entries: Entry[]): [string, Entry[]][] { ... }
```

- [ ] **Step 2: Import the shared subsection logic**

Add:

```tsx
import { EntrySubsection } from './EntrySubsection'
import { buildEntrySubsections } from '@/lib/entry-sections'
```

- [ ] **Step 3: Build the subsections from the paginated result list**

Add:

```tsx
const sections = buildEntrySubsections(entries)
```

- [ ] **Step 4: Replace the date-group grid with subsection-first rendering**

Replace the `dateGroups.map(...)` block with:

```tsx
<div className="space-y-6">
  {sections.map(section => (
    <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} sectionTone={section.key} />
        ))}
      </div>
    </EntrySubsection>
  ))}

  {totalPages > 1 && (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        onClick={() => setPage(p => Math.max(0, p - 1))}
        disabled={currentPage === 0}
      >
        Anterior
      </Button>
      <div className="text-sm text-muted-foreground">
        Pàgina {currentPage + 1} de {totalPages}
      </div>
      <Button
        variant="outline"
        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        disabled={currentPage >= totalPages - 1}
      >
        Següent
      </Button>
    </div>
  )}
</div>
```

- [ ] **Step 5: Verify the register integration**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit the register integration**

```bash
git add src/main/frontend/src/components/entries/EntryList.tsx
git commit -m "feat(entries): group register list by fixades"
```

---

## Task 9: Final verification

**Files:**
- Verify all modified frontend files

- [ ] **Step 1: Run the full frontend test suite**

Run: `npm run test`

Expected: PASS with the new unit and component tests green.

- [ ] **Step 2: Run the frontend production build**

Run: `npm run build`

Expected: PASS and output written to `../resources/static`.

- [ ] **Step 3: Manually verify the approved product behaviors**

Check these screens in the browser:

- **El meu dia / Avui** with one urgent unpinned task and one normal fixed task
- **El meu dia / Pendent** with mixed fixed and regular tasks
- **Tasques** active view with mixed fixed and regular tasks
- **Notes** active view with mixed fixed and regular entries
- **Registre** with mixed fixed and regular entries and active filters
- **El meu dia / Ahir** still unchanged

Expected:

- fixed entries appear first inside **Fixades**
- regular entries appear under **Sense fixar**
- each subsection shows its own counter
- the fixed subsection has a distinct bordered container
- fixed entry cards keep the visible pin affordance
- **Ahir** still renders exactly as before

- [ ] **Step 4: Commit the final verification checkpoint**

```bash
git status
```

Expected: clean working tree.

---

## Self-review

### Spec coverage

- Shared ordering rule — covered in **Task 2**
- Shared subsection wrapper — covered in **Task 3**
- `EntryCard` visual reinforcement for **Fixades** — covered in **Task 4**
- `DailyView` **Avui** and **Pendent** integration — covered in **Task 5**
- `DailyView` **Ahir** exclusion — covered in **Task 5**
- `TasksPage` integration — covered in **Task 6**
- `NotesPage` integration — covered in **Task 7**
- `EntryList` / **Registre** integration — covered in **Task 8**
- Validation scenarios — covered in **Task 9**

### Placeholder scan

- No `TODO` / `TBD` markers remain.
- Each task names exact files.
- Each code step includes concrete code.
- Each validation step includes explicit commands and expected results.

### Type consistency

- Shared subsection tone uses `fixed | regular` consistently across utility, subsection wrapper, and `EntryCard` call sites.
- User-facing labels stay `Fixades` and `Sense fixar` consistently across utility and rendering tasks.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-28-fixades-subsections-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
