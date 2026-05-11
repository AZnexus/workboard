# RETROS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `RETROS` section with a personal editable workspace for `Retro d'equip` and `Retro d'analistes`, archive/regeneration flow, archived search, and register integration.

**Architecture:** Reuse `EntryEntity` as the persistence root with two new entry types (`TEAM_RETRO` and `ANALYST_RETRO`). Store retro metadata (`retroMonth`, `meetingDate`, `sensations`) on `entry` and ordered block items in a dedicated `retro_item` table. Use existing `EntryStatus.OPEN` for the current retro and `EntryStatus.DONE` for archived retros so the feature can reuse the app's existing “closed entry” semantics instead of inventing a new status, but pair that storage choice with retro-aware UI rendering so archived retros never look like generic completed tasks. The service layer must guarantee exactly one open retro per type at all times and must regenerate a truly empty successor when archiving.

**Tech Stack:** Java 21, Spring Boot 3.4, Spring Data JPA, Flyway, React 19, TypeScript, TanStack Query, dnd-kit, Vitest.

---

## Non-negotiable invariants

- There is always exactly one open `TEAM_RETRO` and exactly one open `ANALYST_RETRO`.
- If one is missing, the backend bootstraps an empty replacement of that same type.
- Archiving a retro changes only the archived record to `DONE` and creates one brand-new successor of the same type with no copied metadata and no copied items.
- Archived retros stay editable from the dedicated `RETROS` section.
- `RETROS` never appears in global create flows.
- Archived retros appear in the general register, but opening them from there navigates to `/retros`, not to the generic `EntryForm` sheet.
- Generic register search must remain meaningful for retros; do not rely only on the dedicated RETROS history API.

---

## File map

- Modify: `src/main/java/com/workboard/entry/EntryType.java`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/EntryRepository.java`
- Modify: `src/main/java/com/workboard/entry/EntrySpecifications.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/main/java/com/workboard/entry/EntryQueryPaths.java`
- Create: `src/main/java/com/workboard/entry/RetroItemCategory.java`
- Create: `src/main/java/com/workboard/entry/RetroItemEntity.java`
- Create: `src/main/java/com/workboard/entry/RetrosController.java`
- Create: `src/main/java/com/workboard/entry/RetroWorkspaceResponse.java`
- Create: `src/main/java/com/workboard/entry/RetroHistoryRowResponse.java`
- Create: `src/main/java/com/workboard/entry/SaveRetroRequest.java`
- Create: `src/main/java/com/workboard/entry/SaveRetroItemRequest.java`
- Create: `src/main/resources/db/migration/V12__add_retro_support.sql`
- Create: `src/test/java/com/workboard/entry/RetrosControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`
- Modify: `src/main/frontend/src/types/index.ts`
- Create: `src/main/frontend/src/api/retros.ts`
- Create: `src/main/frontend/src/hooks/useRetros.ts`
- Modify: `src/main/frontend/src/config/navigation.tsx`
- Modify: `src/main/frontend/src/config/entry-taxonomy.ts`
- Modify: `src/main/frontend/src/lib/list-state/entryListState.ts`
- Create: `src/main/frontend/src/pages/RetrosPage.tsx`
- Create: `src/main/frontend/src/pages/RetrosPage.test.tsx`
- Create: `src/main/frontend/src/components/retros/RetroWorkspace.tsx`
- Create: `src/main/frontend/src/components/retros/RetroItemsSection.tsx`
- Create: `src/main/frontend/src/components/retros/RetroHistoryList.tsx`
- Create: `src/main/frontend/src/components/retros/RetroWorkspace.test.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryStatusCell.tsx`
- Modify: `src/main/frontend/src/components/entries/entry-status.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryOpenSheetAction.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryCard.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryList.test.tsx`

---

### Task 1: Backend schema and entry-type support for retros

**Files:**
- Create: `src/main/resources/db/migration/V12__add_retro_support.sql`
- Modify: `src/main/java/com/workboard/entry/EntryType.java`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/EntryQueryPaths.java`
- Create: `src/main/java/com/workboard/entry/RetroItemCategory.java`
- Create: `src/main/java/com/workboard/entry/RetroItemEntity.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`

- [ ] **Step 1: Write the failing model/serialization tests first**

Add tests that prove:
- the new entry types serialize with human-friendly labels later in frontend taxonomy
- retro items can round-trip through the entity/response layer
- archived retros can continue to serialize through the generic entry register response without breaking existing entries

- [ ] **Step 2: Add the retro schema migration**

Create `V12__add_retro_support.sql` with two parts:

```sql
ALTER TABLE entry ADD COLUMN retro_month TEXT;
ALTER TABLE entry ADD COLUMN meeting_date DATE;
ALTER TABLE entry ADD COLUMN sensations TEXT;

CREATE TABLE retro_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL REFERENCES entry(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    recipient TEXT,
    content TEXT NOT NULL,
    position INTEGER NOT NULL
);
```

Use `sensations` as a short text field and keep ordered block items in `retro_item` because reordering is part of the approved design.

- [ ] **Step 3: Extend the entry model**

Update `EntryType` with two new values that match the codebase's English enum style:

```java
TEAM_RETRO,
ANALYST_RETRO
```

Then extend `EntryEntity` with:
- `retroMonth`
- `meetingDate`
- `sensations`
- `List<RetroItemEntity> retroItems`

- [ ] **Step 4: Run the targeted model tests**

Run:

```bash
./mvnw -q -Dtest=EntryResponseTest test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/resources/db/migration/V12__add_retro_support.sql src/main/java/com/workboard/entry/EntryType.java src/main/java/com/workboard/entry/EntryEntity.java src/main/java/com/workboard/entry/EntryQueryPaths.java src/main/java/com/workboard/entry/RetroItemCategory.java src/main/java/com/workboard/entry/RetroItemEntity.java src/test/java/com/workboard/entry/EntryResponseTest.java
git commit -m "feat(retros): add retro schema and entry types"
```

### Task 2: Backend workflow for current retro, history, save, and archive/regeneration

**Files:**
- Modify: `src/main/java/com/workboard/entry/EntryRepository.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Create: `src/main/java/com/workboard/entry/RetrosController.java`
- Create: `src/main/java/com/workboard/entry/RetroWorkspaceResponse.java`
- Create: `src/main/java/com/workboard/entry/RetroHistoryRowResponse.java`
- Create: `src/main/java/com/workboard/entry/SaveRetroRequest.java`
- Create: `src/main/java/com/workboard/entry/SaveRetroItemRequest.java`
- Create: `src/test/java/com/workboard/entry/RetrosControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`

- [ ] **Step 1: Write the failing service/controller tests first**

Cover at least:
- getting the current open retro for `TEAM_RETRO`
- getting the current open retro for `ANALYST_RETRO`
- bootstrapping an empty open retro if one is missing for either type
- saving retro metadata and ordered items
- archiving a retro marks it as `DONE`
- archiving creates a fresh empty replacement of the same type with `OPEN`
- the regenerated retro has no copied month, no copied version, no copied meeting date, no copied sensations, and no copied items
- archived history can be filtered by text, month, and version

- [ ] **Step 2: Reuse existing status semantics instead of adding `ARCHIVED`**

Keep:
- current retro = `OPEN`
- archived retro = `DONE`

This must be explicit in service and controller code. Do **not** add a new enum value to `EntryStatus` for this iteration.

Also make the open-retro invariant explicit:
- every read path for the current workspace must return exactly one open retro for the requested type
- if none exists yet, create one empty retro of that type before returning
- archive paths must reject any operation that would leave two open retros of the same type

- [ ] **Step 3: Implement service methods and repository queries**

Add repository/service support for:
- current open retro by type
- retro by id for direct edit
- archived history by type with filters for `q`, `retroMonth`, `versionId`
- archive/regenerate operation

Also add a deterministic title strategy so retros appear sensibly in the register. Use a generated title based on type + retro month + selected version, and update it whenever those fields change.

Keep the replacement-retro rule explicit in the implementation notes:
- successor starts with empty metadata fields
- successor starts with an empty `retroItems` collection
- successor keeps only the retro `type` and default `OPEN` status

- [ ] **Step 4: Expose a dedicated retros API**

Create `RetrosController` with endpoints dedicated to the section workflow, for example:
- `GET /api/v1/retros/current?type=TEAM_RETRO`
- `GET /api/v1/retros/{id}`
- `PATCH /api/v1/retros/{id}`
- `POST /api/v1/retros/{id}/archive`
- `GET /api/v1/retros/history?type=TEAM_RETRO&q=...&retroMonth=...&versionId=...`

Keep register search on the generic `/api/v1/entries` endpoint.

- [ ] **Step 5: Run the targeted backend workflow tests**

Run:

```bash
./mvnw -q -Dtest=EntryServiceTest,RetrosControllerIntTest test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/workboard/entry/EntryRepository.java src/main/java/com/workboard/entry/EntryService.java src/main/java/com/workboard/entry/RetrosController.java src/main/java/com/workboard/entry/RetroWorkspaceResponse.java src/main/java/com/workboard/entry/RetroHistoryRowResponse.java src/main/java/com/workboard/entry/SaveRetroRequest.java src/main/java/com/workboard/entry/SaveRetroItemRequest.java src/test/java/com/workboard/entry/RetrosControllerIntTest.java src/test/java/com/workboard/entry/EntryServiceTest.java
git commit -m "feat(retros): add current, history, and archive workflow"
```

### Task 3: Frontend API, types, and routing for the RETROS section

**Files:**
- Modify: `src/main/frontend/src/types/index.ts`
- Create: `src/main/frontend/src/api/retros.ts`
- Create: `src/main/frontend/src/hooks/useRetros.ts`
- Modify: `src/main/frontend/src/config/navigation.tsx`
- Modify: `src/main/frontend/src/lib/list-state/entryListState.ts`
- Create: `src/main/frontend/src/pages/RetrosPage.tsx`
- Create: `src/main/frontend/src/pages/RetrosPage.test.tsx`

- [ ] **Step 1: Write the failing page/routing tests first**

Cover at least:
- `RETROS` appears in sidebar navigation
- `RetrosPage` defaults to the team retro tab
- `RetrosPage` can switch to analyst retro
- the page can hydrate from a URL query that targets a specific archived retro id
- register URL state parsing accepts `TEAM_RETRO` and `ANALYST_RETRO` as valid entry types

- [ ] **Step 2: Extend frontend types for retro data**

Update `src/main/frontend/src/types/index.ts` with:
- new `EntryType` members: `TEAM_RETRO`, `ANALYST_RETRO`
- retro workspace DTOs returned by the dedicated retros API
- retro item category types for the list sections

- [ ] **Step 3: Implement retros API and hooks**

Create `api/retros.ts` and `hooks/useRetros.ts` for:
- fetching current retro by type
- fetching a retro by id
- saving a retro
- archiving a retro
- loading archived history with filters

- [ ] **Step 4: Add the route and page shell**

Update `navigation.tsx` to add `/retros` to `SIDEBAR_NAV_ITEMS` and `APP_ROUTES`, update `entryListState.ts` so the register accepts the two new types in URL state, then create `RetrosPage.tsx` with:
- segmented switch between `Retro d'equip` and `Retro d'analistes`
- URL-backed state for selected type
- optional `id` query param to open an archived retro directly from the register

- [ ] **Step 5: Run the routing/page tests**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/RetrosPage.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/types/index.ts src/main/frontend/src/api/retros.ts src/main/frontend/src/hooks/useRetros.ts src/main/frontend/src/config/navigation.tsx src/main/frontend/src/lib/list-state/entryListState.ts src/main/frontend/src/pages/RetrosPage.tsx src/main/frontend/src/pages/RetrosPage.test.tsx
git commit -m "feat(retros): add page routing and data hooks"
```

### Task 4: Frontend workspace and archived history UI

**Files:**
- Create: `src/main/frontend/src/components/retros/RetroWorkspace.tsx`
- Create: `src/main/frontend/src/components/retros/RetroItemsSection.tsx`
- Create: `src/main/frontend/src/components/retros/RetroHistoryList.tsx`
- Create: `src/main/frontend/src/components/retros/RetroWorkspace.test.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryStatusCell.tsx`
- Modify: `src/main/frontend/src/components/entries/entry-status.tsx`
- Modify: `src/main/frontend/src/pages/RetrosPage.tsx`

- [ ] **Step 1: Write the failing workspace tests first**

Cover at least:
- one long editable screen with metadata on top and blocks below
- `TEAM_RETRO` shows `Floretes` but not `Comentaris/Propostes`
- `ANALYST_RETRO` shows `Comentaris/Propostes` but not `Floretes`
- all block items are individually editable and reorderable
- floreta recipient is rendered as a badge-like element separate from the positive text
- archived retros render with retro-specific archived wording in generic status badges instead of the default `Fet`

- [ ] **Step 2: Build the editable workspace**

Implement `RetroWorkspace` so it always stays in edit mode for both open and archived retros.

Metadata fields:
- retro month
- version selector (using `useVersions(true)` from the already-completed Versions work)
- meeting date
- sensations text

Block rules:
- `Mantenir/Potenciar` and `Millorar/Mitigar` exist for both types
- `Floretes` only for team retro
- `Comentaris/Propostes` only for analyst retro

- [ ] **Step 3: Implement ordered item editing**

Use `@dnd-kit/sortable` for manual ordering.

Each item must support:
- create
- inline edit
- delete
- drag reorder

- [ ] **Step 4: Implement archived history list and simple filters**

Create `RetroHistoryList` with exactly these visible summary fields:
- retro type
- month
- version
- meeting date

And exactly these filters:
- free-text query
- retro type
- month
- version

- [ ] **Step 5: Run the workspace/history frontend tests**

Run from `src/main/frontend`:

```bash
npm run test -- src/components/retros/RetroWorkspace.test.tsx src/pages/RetrosPage.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/components/retros src/main/frontend/src/components/entries/EntryStatusCell.tsx src/main/frontend/src/components/entries/entry-status.tsx src/main/frontend/src/pages/RetrosPage.tsx src/main/frontend/src/pages/RetrosPage.test.tsx
git commit -m "feat(retros): implement workspace and archived history UI"
```

### Task 5: Register integration and generic entry UI compatibility

**Files:**
- Modify: `src/main/frontend/src/config/entry-taxonomy.ts`
- Modify: `src/main/frontend/src/lib/list-state/entryListState.ts`
- Modify: `src/main/java/com/workboard/entry/EntryQueryPaths.java`
- Modify: `src/main/java/com/workboard/entry/EntrySpecifications.java`
- Modify: `src/main/frontend/src/components/entries/EntryOpenSheetAction.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryCard.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryStatusCell.tsx`
- Modify: `src/main/frontend/src/components/entries/entry-status.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryList.test.tsx`

- [ ] **Step 1: Add retro labels and icons to entry taxonomy**

Extend `ENTRY_TYPE_CONFIG` and `ENTRY_TYPE_FILTER_OPTIONS` so retros render correctly in the register and can be filtered by type.

Do **not** add retros to:
- `ENTRY_FORM_TYPE_OPTIONS`
- top-bar global create actions

Also add a retro-specific archived status presentation for generic register surfaces:
- archived retro rows/cards should read as `Arxivada` or equivalent retro wording, not generic `Fet`
- archived retro cards must not use task-style completed affordances like strike-through title styling

- [ ] **Step 2: Route retro open actions to the RETROS page**

The generic register cannot open retros inside `EntryForm`.

Update:
- `EntryOpenSheetAction.tsx` for table mode
- `EntryCard.tsx` for card mode

Rule:
- non-retro entries continue opening the existing sheet
- retro entries navigate to `/retros?id=<entryId>&type=<entryType>`

- [ ] **Step 3: Keep register search meaningful for retros**

The current generic register free-text search only checks `title` and `body`.

Update the generic search layer so `q` also remains useful for archived retros by including retro-relevant text in the searchable surface. At minimum, search should match against:
- generated retro title
- `retroMonth`
- retro item `content`
- floreta `recipient`

Implement this in the existing specification-based search path (`EntrySpecifications` + `EntryQueryPaths`) instead of creating a parallel `/entries` search flow.

- [ ] **Step 4: Update the register tests**

Add assertions that a retro entry:
- renders with the new type label
- does not break the register table/card rendering
- uses the dedicated RETROS navigation path when opened
- can be hydrated from a `type=TEAM_RETRO` or `type=ANALYST_RETRO` register URL state
- uses retro-specific archived wording instead of generic `Fet`

- [ ] **Step 5: Run the register-facing frontend tests**

Run from `src/main/frontend`:

```bash
npm run test -- src/components/entries/EntryList.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/config/entry-taxonomy.ts src/main/frontend/src/lib/list-state/entryListState.ts src/main/java/com/workboard/entry/EntryQueryPaths.java src/main/java/com/workboard/entry/EntrySpecifications.java src/main/frontend/src/components/entries/EntryStatusCell.tsx src/main/frontend/src/components/entries/entry-status.tsx src/main/frontend/src/components/entries/EntryOpenSheetAction.tsx src/main/frontend/src/components/entries/EntryCard.tsx src/main/frontend/src/components/entries/EntryList.test.tsx
git commit -m "feat(retros): integrate retros with register navigation"
```

### Task 6: Final verification for the RETROS improvement

**Files:**
- Verify only; no new files

- [ ] **Step 1: Run the backend suite relevant to retro workflows**

Run:

```bash
./mvnw -q -Dtest=EntryServiceTest,EntryResponseTest,RetrosControllerIntTest,EntryControllerIntTest test
```

Expected: PASS.

- [ ] **Step 2: Run the frontend suite relevant to retros and register compatibility**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/RetrosPage.test.tsx src/components/retros/RetroWorkspace.test.tsx src/components/entries/EntryList.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 3: Run shipped-artifact verification**

Run from repo root:

```bash
./mvnw clean package
```

Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "chore(retros): verify shipped integration"
```

If the repo policy forbids empty commits, skip this commit and keep verification in the implementation notes only.
