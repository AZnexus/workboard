# DailyView Action Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine `DailyView` task card actions so movement is clearer and more discreet, while the pin action becomes a compact helper control.

**Architecture:** Keep the scope strictly inside the existing `EntryCard` rendering used by `DailyView` for `today` and `backlog`. Reuse the current mutation handlers and only rebalance the action layout: pin moves to the top-right helper area, movement becomes a semantic footer action on the left, and the existing status actions stay grouped on the right.

**Tech Stack:** React 19, TypeScript, shadcn/ui, Tailwind CSS, Vitest, Testing Library.

---

## File map

- Modify: `src/main/frontend/src/components/entries/EntryCard.tsx`
- Modify: `src/main/frontend/src/components/dashboard/DailyView.test.tsx`
- Verify only: `src/main/frontend/src/components/dashboard/DailyView.tsx`

---

### Task 1: Lock visible behavior with tests

**Files:**
- Modify: `src/main/frontend/src/components/dashboard/DailyView.test.tsx`

- [ ] **Step 1: Extend the rendering test data to cover both movement labels**

Use one backlog task and one today task so both footer labels are rendered in the same test run.

```ts
backlog: [
  {
    id: 12,
    type: "TASK",
    title: "Task pendent",
    status: "OPEN",
    scheduled_today: false,
    version: null,
    tags: [],
    date: "2026-04-29",
    due_date: null,
    body: null,
    external_ref: null,
    pinned: false,
    priority: 3,
    created_at: "2026-04-29T09:00:00Z",
    updated_at: "2026-04-29T09:00:00Z",
  },
],
entries: [
  {
    id: 21,
    type: "TASK",
    title: "Task d'avui",
    status: "OPEN",
    scheduled_today: true,
    version: null,
    tags: [],
    date: "2026-04-29",
    due_date: null,
    body: null,
    external_ref: null,
    pinned: false,
    priority: 2,
    created_at: "2026-04-29T10:00:00Z",
    updated_at: "2026-04-29T10:00:00Z",
  },
],
```

- [ ] **Step 2: Assert the new visible footer labels**

Add explicit expectations for the approved copy.

```ts
expect(screen.getByText("→ Avui")).toBeInTheDocument()
expect(screen.getByText("← Pendent")).toBeInTheDocument()
```

- [ ] **Step 3: Run the focused test file**

Run: `npm test -- DailyView.test.tsx`

Expected before implementation: either FAIL because the new labels do not exist yet, or PASS only after the layout change is complete.

---

### Task 2: Rebalance `EntryCard` actions for DailyView contexts

**Files:**
- Modify: `src/main/frontend/src/components/entries/EntryCard.tsx`

- [ ] **Step 1: Add semantic movement affordance for `today` and `backlog`**

Replace the icon-only movement button in `today`/`backlog` contexts with a compact ghost action rendered on the left side of the footer.

```tsx
{columnContext === "backlog" && (
  <Button
    variant="ghost"
    className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-accent-primary"
    onClick={moveTaskToToday}
  >
    <span aria-hidden="true">→</span>
    <span>Avui</span>
  </Button>
)}

{columnContext === "today" && entry.type === "TASK" && (entry.status === "OPEN" || entry.status === "IN_PROGRESS" || entry.status === "PAUSED") && (
  <Button
    variant="ghost"
    className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-accent-primary"
    onClick={moveTaskToBacklog}
  >
    <span aria-hidden="true">←</span>
    <span>Pendent</span>
  </Button>
)}
```

- [ ] **Step 2: Move the pin action to the top-right helper area**

Render the pin control as a compact helper in the card header area instead of inside the footer action cluster.

```tsx
<div className="absolute right-2 top-2 z-10">
  <Button
    variant="ghost"
    size="icon"
    className="h-6 w-6 rounded-full text-data-neutral hover:text-accent-primary"
    onClick={togglePin}
  >
    <Pin size={12} className={cn(entry.pinned && "fill-accent-primary text-accent-primary")} />
  </Button>
</div>
```

- [ ] **Step 3: Keep status actions grouped on the footer right**

Do not change the current status mutations. Only wrap them so the footer becomes a two-sided layout.

```tsx
<div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
  <div>{movementAction}</div>
  <div className="flex items-center gap-1">{statusActions}</div>
</div>
```

- [ ] **Step 4: Ensure non-DailyView contexts are unchanged**

Keep the existing rendering path for `default` and `yesterday` intact. Any new wrapper conditions must be gated by `columnContext === "today" || columnContext === "backlog"`.

- [ ] **Step 5: Run the focused test file again**

Run: `npm test -- DailyView.test.tsx`

Expected: PASS.

---

### Task 3: Full frontend verification

**Files:**
- Verify: `src/main/frontend/src/components/entries/EntryCard.tsx`
- Verify: `src/main/frontend/src/components/dashboard/DailyView.test.tsx`

- [ ] **Step 1: Run frontend diagnostics**

Run the TypeScript/LSP diagnostics on the touched frontend files.

- [ ] **Step 2: Run related frontend tests**

Run: `npm test -- DailyView.test.tsx EntryList.test.tsx`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: Vite build completes successfully.

- [ ] **Step 4: Review the visual scope**

Confirm the diff only changes the DailyView-related card affordances and does not alter unrelated card contexts.

---

## Self-review

- Spec coverage: covered pin relocation, semantic movement labels, discreet visual weight, scope limited to `DailyView`, and verification via tests/build.
- Placeholder scan: no `TODO`, `TBD`, or vague "handle later" items remain.
- Type consistency: labels, file paths, and component names match the current frontend structure.
