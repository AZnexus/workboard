# Paginated Entry Lists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce shared URL-backed list infrastructure and migrate the entry listing pages to table-first paginated views while preserving card view as an option.

**Architecture:** Build a small shared layer for list state, toolbar, view toggle, and pagination, then migrate pages incrementally starting with `Registre`. Reuse the current entry cards and time-log table instead of rewriting page internals from scratch.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Vitest, Testing Library, shadcn/ui primitives, Tailwind CSS 4

---

## File Map

- `src/main/frontend/src/lib/list-state/listState.ts` — generic parse/serialize/reset helpers for URL-backed list state
- `src/main/frontend/src/lib/list-state/entryListState.ts` — entry-specific URL state contract for search, filters, sort, page, and view
- `src/main/frontend/src/components/list/ListToolbar.tsx` — shared compact listing toolbar
- `src/main/frontend/src/components/list/ListViewToggle.tsx` — shared table/cards selector
- `src/main/frontend/src/components/list/ListPagination.tsx` — shared footer pagination controls
- `src/main/frontend/src/components/entries/EntryListTable.tsx` — table renderer for `Registre`
- `src/main/frontend/src/components/entries/EntryList.tsx` — first page migrated to shared table-first listing shell
- `src/main/frontend/src/components/entries/EntryFilters.tsx` — adapted to work as shared filter panel for the new shell
- `src/main/frontend/src/components/entries/EntryList.test.tsx` — integration coverage for Registre default view, URL sync, and cards fallback
- `src/main/frontend/src/lib/list-state/*.test.ts` — codec and reset-behavior coverage

## Task 1: Add shared URL list-state primitives

**Files:**
- Create: `src/main/frontend/src/lib/list-state/listState.ts`
- Create: `src/main/frontend/src/lib/list-state/entryListState.ts`
- Create: `src/main/frontend/src/lib/list-state/listState.test.ts`
- Create: `src/main/frontend/src/lib/list-state/entryListState.test.ts`

- [ ] **Step 1: Write the failing generic list-state tests**

```ts
import { describe, expect, it } from "vitest"
import { cleanSearchParams, updatePageOnListStateChange } from "./listState"

describe("listState helpers", () => {
  it("removes empty and default values from URL params", () => {
    const params = cleanSearchParams({
      view: "table",
      q: "",
      page: 1,
      sort: "date-desc",
      status: "all",
    }, {
      defaults: { view: "table", page: 1, sort: "date-desc", status: "all" },
    })

    expect(params.toString()).toBe("")
  })

  it("resets page to 1 when non-page filters change", () => {
    expect(updatePageOnListStateChange({ page: 4, q: "abc" }, { page: 4, q: "xyz" })).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/list-state/listState.test.ts src/lib/list-state/entryListState.test.ts`
Expected: FAIL because the new modules do not exist yet.

- [ ] **Step 3: Write the minimal generic list-state helper implementation**

```ts
export type PrimitiveListValue = string | number | boolean | undefined | null

export interface CleanSearchParamsOptions {
  defaults?: Record<string, PrimitiveListValue>
}

export function cleanSearchParams(
  values: Record<string, PrimitiveListValue>,
  options: CleanSearchParamsOptions = {},
): URLSearchParams {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(values)) {
    const defaultValue = options.defaults?.[key]
    if (value == null || value === "" || value === defaultValue) continue
    params.set(key, String(value))
  }

  return params
}

export function updatePageOnListStateChange<T extends { page?: number }>(
  previousState: T,
  nextState: T,
): number {
  const { page: _previousPage, ...previousWithoutPage } = previousState
  const { page: _nextPage, ...nextWithoutPage } = nextState

  return JSON.stringify(previousWithoutPage) === JSON.stringify(nextWithoutPage)
    ? (nextState.page ?? 1)
    : 1
}
```

- [ ] **Step 4: Add the entry-specific URL state contract**

```ts
import type { EntryStatus, EntryType } from "@/types"
import { cleanSearchParams } from "./listState"

export type EntryListView = "table" | "cards"
export type EntryListSort = "date-desc" | "date-asc" | "priority-asc" | "priority-desc" | "title-asc" | "title-desc"

export interface EntryListUrlState {
  view: EntryListView
  q: string
  page: number
  sort: EntryListSort
  status: EntryStatus | "all"
  type: EntryType | "all"
  dateFrom: string
  dateTo: string
  tag: string
  pinned: boolean
  priority: string
}

export const DEFAULT_ENTRY_LIST_STATE: EntryListUrlState = {
  view: "table",
  q: "",
  page: 1,
  sort: "date-desc",
  status: "all",
  type: "all",
  dateFrom: "",
  dateTo: "",
  tag: "",
  pinned: false,
  priority: "all",
}

export function parseEntryListState(searchParams: URLSearchParams): EntryListUrlState {
  const page = Number(searchParams.get("page") ?? DEFAULT_ENTRY_LIST_STATE.page)
  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: (searchParams.get("sort") as EntryListSort) || DEFAULT_ENTRY_LIST_STATE.sort,
    status: (searchParams.get("status") as EntryStatus | "all") || "all",
    type: (searchParams.get("type") as EntryType | "all") || "all",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    tag: searchParams.get("tag") ?? "",
    pinned: searchParams.get("pinned") === "true",
    priority: searchParams.get("priority") ?? "all",
  }
}

export function stringifyEntryListState(state: EntryListUrlState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_ENTRY_LIST_STATE })
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/lib/list-state/listState.test.ts src/lib/list-state/entryListState.test.ts`
Expected: PASS

## Task 2: Add shared listing toolbar primitives

**Files:**
- Create: `src/main/frontend/src/components/list/ListViewToggle.tsx`
- Create: `src/main/frontend/src/components/list/ListToolbar.tsx`
- Create: `src/main/frontend/src/components/list/ListPagination.tsx`
- Create: `src/main/frontend/src/components/list/ListToolbar.test.tsx`
- Create: `src/main/frontend/src/components/list/ListPagination.test.tsx`

- [ ] **Step 1: Write the failing toolbar and pagination tests**

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListToolbar } from "./ListToolbar"

describe("ListToolbar", () => {
  it("renders search, filters trigger, and view toggle", () => {
    render(
      <ListToolbar
        searchValue=""
        onSearchChange={() => {}}
        filtersOpen={false}
        onFiltersToggle={() => {}}
        view="table"
        onViewChange={() => {}}
      />,
    )

    expect(screen.getByLabelText("Cercar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /filtres/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /taula/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /targetes/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/list/ListToolbar.test.tsx src/components/list/ListPagination.test.tsx`
Expected: FAIL because the new components do not exist yet.

- [ ] **Step 3: Implement the minimal shared list view toggle**

```tsx
import { LayoutGrid, TableProperties } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EntryListView } from "@/lib/list-state/entryListState"

interface ListViewToggleProps {
  value: EntryListView
  onChange: (value: EntryListView) => void
}

export function ListViewToggle({ value, onChange }: ListViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
      <Button type="button" size="sm" variant={value === "table" ? "default" : "ghost"} onClick={() => onChange("table")}>
        <TableProperties data-icon="inline-start" />
        Taula
      </Button>
      <Button type="button" size="sm" variant={value === "cards" ? "default" : "ghost"} onClick={() => onChange("cards")}>
        <LayoutGrid data-icon="inline-start" />
        Targetes
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Implement the minimal shared toolbar and pagination components**

```tsx
import type { ReactNode } from "react"
import { Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListViewToggle } from "./ListViewToggle"
import type { EntryListView } from "@/lib/list-state/entryListState"

interface ListToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filtersOpen: boolean
  onFiltersToggle: () => void
  view: EntryListView
  onViewChange: (value: EntryListView) => void
  actions?: ReactNode
}

export function ListToolbar(props: ListToolbarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input aria-label="Cercar" placeholder="Cercar..." value={props.searchValue} onChange={(event) => props.onSearchChange(event.target.value)} className="h-10 lg:max-w-md" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={props.onFiltersToggle}>
            <Filter data-icon="inline-start" />
            Filtres
          </Button>
          <ListViewToggle value={props.view} onChange={props.onViewChange} />
          {props.actions}
        </div>
      </div>
    </div>
  )
}
```

```tsx
import { Button } from "@/components/ui/button"

interface ListPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ListPagination({ page, totalPages, onPageChange }: ListPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <Button type="button" variant="outline" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
        Anterior
      </Button>
      <p className="text-sm text-muted-foreground">Pàgina {page} de {totalPages}</p>
      <Button type="button" variant="outline" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
        Següent
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/components/list/ListToolbar.test.tsx src/components/list/ListPagination.test.tsx`
Expected: PASS

## Task 3: Migrate Registre to the shared table-first shell

**Files:**
- Create: `src/main/frontend/src/components/entries/EntryListTable.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryList.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryFilters.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryList.test.tsx`

- [ ] **Step 1: Write failing Registre tests for table default and cards fallback**

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EntryList } from "./EntryList"

const setSearchParams = vi.fn()

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams(), setSearchParams],
}))

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    isLoading: false,
    data: {
      data: [
        {
          id: 1,
          type: "TASK",
          title: "Preparar la reunió",
          body: "Resum curt",
          status: "OPEN",
          date: "2026-04-30",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: 3,
          tags: [],
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 50, totalPages: 1 },
    },
  }),
}))

describe("EntryList", () => {
  it("shows the table by default", () => {
    render(<EntryList />)
    expect(screen.getByRole("columnheader", { name: /tipus/i })).toBeInTheDocument()
  })

  it("allows switching to cards view", async () => {
    const user = userEvent.setup()
    render(<EntryList />)
    await user.click(screen.getByRole("button", { name: /targetes/i }))
    expect(setSearchParams).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/entries/EntryList.test.tsx`
Expected: FAIL because the page still renders the old card-first grouped layout.

- [ ] **Step 3: Implement the Registre table renderer**

```tsx
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { Entry } from "@/types"

interface EntryListTableProps {
  entries: Entry[]
}

export function EntryListTable({ entries }: EntryListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipus</TableHead>
          <TableHead>Títol</TableHead>
          <TableHead>Etiquetes</TableHead>
          <TableHead>Estat</TableHead>
          <TableHead>Prioritat</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.type}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{entry.title}</span>
                {entry.body ? <span className="text-sm text-muted-foreground truncate">{entry.body}</span> : null}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{entry.status}</TableCell>
            <TableCell>{entry.priority ? PRIORITY_CONFIG[entry.priority]?.label : "-"}</TableCell>
            <TableCell>{entry.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Replace the old EntryList local state with URL-backed shared state and table-first rendering**

```tsx
const parsedState = parseEntryListState(searchParams)
const [search, setSearch] = useState(parsedState.q)
const [filtersOpen, setFiltersOpen] = useState(Boolean(parsedState.status !== "all" || parsedState.type !== "all" || parsedState.tag || parsedState.dateFrom || parsedState.dateTo || parsedState.pinned || parsedState.priority !== "all"))
const debouncedSearch = useDebounce(search, 300)

const state = {
  ...parsedState,
  q: debouncedSearch,
}

const updateState = (partial: Partial<EntryListUrlState>) => {
  const next = {
    ...parsedState,
    ...partial,
  }

  const nextWithPage = {
    ...next,
    page: partial.page ?? updatePageOnListStateChange(parsedState, next),
  }

  setSearchParams(stringifyEntryListState(nextWithPage))
}
```

```tsx
<ListToolbar
  searchValue={search}
  onSearchChange={setSearch}
  filtersOpen={filtersOpen}
  onFiltersToggle={() => setFiltersOpen((value) => !value)}
  view={parsedState.view}
  onViewChange={(view) => updateState({ view })}
/>

{filtersOpen ? (
  <EntryFilters
    status={parsedState.status}
    setStatus={(status) => updateState({ status })}
    type={parsedState.type}
    setType={(type) => updateState({ type })}
    search={search}
    setSearch={setSearch}
    dateFrom={parsedState.dateFrom}
    setDateFrom={(dateFrom) => updateState({ dateFrom })}
    dateTo={parsedState.dateTo}
    setDateTo={(dateTo) => updateState({ dateTo })}
    tag={parsedState.tag}
    setTag={(tag) => updateState({ tag })}
    pinned={parsedState.pinned}
    setPinned={(pinned) => updateState({ pinned })}
    priority={parsedState.priority}
    setPriority={(priority) => updateState({ priority })}
  />
) : null}
```

```tsx
{parsedState.view === "table" ? (
  <EntryListTable entries={entries} />
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {entries.map((entry) => (
      <EntryCard key={entry.id} entry={entry} />
    ))}
  </div>
)}

<ListPagination page={currentPage + 1} totalPages={totalPages} onPageChange={(page) => updateState({ page })} />
```

- [ ] **Step 5: Run the Registre tests to verify they pass**

Run: `npm test -- src/components/entries/EntryList.test.tsx`
Expected: PASS

## Task 4: Verify the first implementation slice

**Files:**
- Modify as needed based on verification output only

- [ ] **Step 1: Run targeted tests for the first slice**

Run: `npm test -- src/lib/list-state/listState.test.ts src/lib/list-state/entryListState.test.ts src/components/list/ListToolbar.test.tsx src/components/list/ListPagination.test.tsx src/components/entries/EntryList.test.tsx`
Expected: PASS

- [ ] **Step 2: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: exit code 0

- [ ] **Step 3: Run the frontend build**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 4: Fix only issues caused by this slice and re-run verification**

Run again:
- `npm test -- src/lib/list-state/listState.test.ts src/lib/list-state/entryListState.test.ts src/components/list/ListToolbar.test.tsx src/components/list/ListPagination.test.tsx src/components/entries/EntryList.test.tsx`
- `npx tsc --noEmit`
- `npm run build`

Expected: all pass cleanly.
