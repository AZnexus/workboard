# Millores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new `Millores` module with its own backend/frontend flow, one unique `Valoració` per `Millora`, and safe integration with existing `TASK`, `Versions`, and `Tags` behavior.

**Architecture:** Implement `Millores` as a dedicated module rather than a new `EntryType`, so the current `entries` model keeps working without regressions. Persist `Millora` and `Valoració` in their own tables, add only one nullable link from `entry` to `improvement`, and reuse existing patterns from `Versions`, `Projects`, `Actes`, and shared list/navigation primitives for the UI. Deliver the feature in four vertical slices: domain/API, usable `Millores` section, `Valoració` read/create flow, and hybrid editor with calculations/templates refinements.

**Tech Stack:** Java 21, Spring Boot 3.4.5, Spring Data JPA, Flyway, SQLite, React 19, TypeScript, TanStack Query, React Router, Vitest.

---

## Non-negotiable invariants

- `Millora` and `Valoració` are not implemented as new `EntryType` values.
- A `Millora` can have zero or one `Valoració`, never more.
- A `Valoració` can only be created from an existing `Millora`.
- `Valoració.version` is inherited and not editable.
- `Valoració.tags` are inherited and not editable.
- `Valoració.priority` starts inherited but becomes editable on the `Valoració`.
- `completion_percentage` is always manual for `Millora`, `Valoració`, and linked normal tasks.
- A normal `TASK` can link to at most one `Millora`, and non-task entries cannot hold that relation.
- Existing `Tasks`, `Notes`, `Actes`, `Versions`, `Registre`, and top-bar quick-create flows must keep working during and after the rollout.
- Before the feature is declared finished, re-read `docs/project/IMPROVEMENTS.md` Item 4 line by line and verify nothing agreed has been missed.

---

## File map

- Keep existing: `src/main/resources/db/migration/V12__add_color_to_version.sql`
- Create: `src/main/resources/db/migration/V13__create_improvement_tables.sql`
- Create: `src/main/resources/db/migration/V14__link_entry_to_improvement.sql`
- Create: `src/main/java/com/workboard/improvement/ImprovementStatus.java`
- Create: `src/main/java/com/workboard/improvement/ValuationStatus.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementEntity.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementTagEntity.java`
- Create: `src/main/java/com/workboard/improvement/ValuationEntity.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementRepository.java`
- Create: `src/main/java/com/workboard/improvement/ValuationRepository.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementSearchCriteria.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementSpecifications.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementService.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementController.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementResponse.java`
- Create: `src/main/java/com/workboard/improvement/ValuationResponse.java`
- Create: `src/main/java/com/workboard/improvement/CreateImprovementRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateImprovementRequest.java`
- Create: `src/main/java/com/workboard/improvement/CreateValuationRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateValuationRequest.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementNotFoundException.java`
- Create: `src/main/java/com/workboard/improvement/ValuationAlreadyExistsException.java`
- Create: `src/test/java/com/workboard/improvement/ImprovementServiceTest.java`
- Create: `src/test/java/com/workboard/improvement/ImprovementControllerIntTest.java`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/UpdateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/EntryResponse.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`
- Create: `src/main/frontend/src/api/improvements.ts`
- Create: `src/main/frontend/src/hooks/useImprovements.ts`
- Create: `src/main/frontend/src/config/improvement-taxonomy.ts`
- Create: `src/main/frontend/src/components/improvements/ImprovementForm.tsx`
- Create: `src/main/frontend/src/components/improvements/ImprovementFilters.tsx`
- Create: `src/main/frontend/src/components/improvements/ImprovementSummaryCard.tsx`
- Create: `src/main/frontend/src/components/improvements/ValuationBootstrapDialog.tsx`
- Create: `src/main/frontend/src/components/improvements/ValuationEditor.tsx`
- Create: `src/main/frontend/src/components/improvements/valuation-textile.ts`
- Create: `src/main/frontend/src/components/improvements/valuation-calculations.ts`
- Create: `src/main/frontend/src/pages/ImprovementsPage.tsx`
- Create: `src/main/frontend/src/pages/ImprovementViewPage.tsx`
- Create: `src/main/frontend/src/pages/ValuationViewPage.tsx`
- Create: `src/main/frontend/src/pages/ValuationEditorPage.tsx`
- Create: `src/main/frontend/src/pages/ImprovementsPage.test.tsx`
- Create: `src/main/frontend/src/pages/ImprovementViewPage.test.tsx`
- Create: `src/main/frontend/src/pages/ValuationViewPage.test.tsx`
- Create: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`
- Modify: `src/main/frontend/src/config/navigation.tsx`
- Modify: `src/main/frontend/src/components/layout/TopBar.tsx`
- Modify: `src/main/frontend/src/hooks/useGlobalCreate.tsx`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/api/entries.ts`
- Modify: `src/main/frontend/src/components/entries/EntryForm.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryForm.test.tsx`
- Modify: `src/main/frontend/src/lib/list-state/entryListState.ts`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx` (only in template phase if needed)
- Modify: `docs/project/GOVERNANCE.md` (only if implementation changes a persistent rule)
- Modify: `docs/project/CHANGELOG.md` (release step, not implementation step)

---

### Task 1: Backend domain, migrations, and safe task link

**Files:**
- Keep existing: `src/main/resources/db/migration/V12__add_color_to_version.sql`
- Create: `src/main/resources/db/migration/V13__create_improvement_tables.sql`
- Create: `src/main/resources/db/migration/V14__link_entry_to_improvement.sql`
- Create: `src/main/java/com/workboard/improvement/ImprovementStatus.java`
- Create: `src/main/java/com/workboard/improvement/ValuationStatus.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementEntity.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementTagEntity.java`
- Create: `src/main/java/com/workboard/improvement/ValuationEntity.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementRepository.java`
- Create: `src/main/java/com/workboard/improvement/ValuationRepository.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementSearchCriteria.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementSpecifications.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementService.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementController.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementResponse.java`
- Create: `src/main/java/com/workboard/improvement/ValuationResponse.java`
- Create: `src/main/java/com/workboard/improvement/CreateImprovementRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateImprovementRequest.java`
- Create: `src/main/java/com/workboard/improvement/CreateValuationRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateValuationRequest.java`
- Create: `src/main/java/com/workboard/improvement/ImprovementNotFoundException.java`
- Create: `src/main/java/com/workboard/improvement/ValuationAlreadyExistsException.java`
- Create: `src/test/java/com/workboard/improvement/ImprovementServiceTest.java`
- Create: `src/test/java/com/workboard/improvement/ImprovementControllerIntTest.java`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/UpdateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/EntryResponse.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`

- [ ] **Step 1: Write the failing backend tests first**

Add `ImprovementServiceTest` and `ImprovementControllerIntTest` using `ProjectServiceTest`, `ProjectControllerIntTest`, `VersionControllerIntTest`, and `EntryControllerIntTest` as direct reference patterns.

Cover at least:
- create improvement persists title, requirements, version, manual percentage, sold hours, and note structure
- create rejects duplicate `jira_ref` case-insensitively when non-null
- create valuation only works for an existing improvement
- creating a second valuation for the same improvement fails with conflict semantics
- valuation creation sets derived title, inherited version, inherited tags, inherited initial priority, status `No començada`, percentage `0`
- patching valuation keeps version non-editable and tags non-editable
- linking `improvementId` to a `TASK` succeeds
- linking `improvementId` to `NOTE`, `MEETING_NOTE`, or `REMINDER` fails server-side
- serializing a task with linked improvement includes enough summary info to render a link later

- [ ] **Step 2: Add Flyway migrations**

Keep the existing `V12__add_color_to_version.sql` from `main`, then create `V13__create_improvement_tables.sql` with a lean but complete first schema. Use the existing SQLite/Flyway patterns already present in the project.

The migration must include:
- `improvement`
- `improvement_tag`
- `improvement_valuation`

Minimum first-pass schema requirements:

```sql
CREATE TABLE improvement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    requirements TEXT,
    redmine_parent_ref TEXT,
    priority INTEGER,
    due_date DATE,
    jira_ref TEXT UNIQUE,
    version_id INTEGER REFERENCES version(id),
    note_context TEXT,
    note_risk_dependency TEXT,
    note_observations TEXT,
    sold_hours REAL,
    status TEXT NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE improvement_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    improvement_id INTEGER NOT NULL REFERENCES improvement(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tag(id),
    tag TEXT NOT NULL
);

CREATE TABLE improvement_valuation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    improvement_id INTEGER NOT NULL UNIQUE REFERENCES improvement(id) ON DELETE CASCADE,
    derived_title TEXT NOT NULL,
    redmine_child_ref TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    priority INTEGER,
    version_id INTEGER REFERENCES version(id),
    textile_body TEXT,
    structured_content_json TEXT,
    analysis_hours REAL,
    total_estimated_hours REAL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

Create `V14__link_entry_to_improvement.sql`:

```sql
ALTER TABLE entry ADD COLUMN improvement_id INTEGER REFERENCES improvement(id);
```

- [ ] **Step 3: Implement the new backend module**

Mirror the current `project` and `version` backend structure:
- entities with Spring Data auditing
- request/response DTOs
- repository + service + controller layering
- conflict handling through clear exceptions/messages

Implement:
- `GET /api/v1/improvements`
- `POST /api/v1/improvements`
- `GET /api/v1/improvements/{id}`
- `PATCH /api/v1/improvements/{id}`
- `DELETE /api/v1/improvements/{id}`
- `POST /api/v1/improvements/{id}/valuation`
- `GET /api/v1/improvements/{id}/valuation`
- `PATCH /api/v1/improvements/{id}/valuation`
- `GET /api/v1/improvements/{id}/entries`

Search criteria for the list must support the agreed first-pass filters:
- `q`
- `status`
- `priority`
- `versionId`
- `tag`
- `hasValuation`
- `completionFrom`
- `completionTo`
- `dueDateFrom`
- `dueDateTo`

- [ ] **Step 4: Extend the existing `entry` model safely**

Add optional `improvementId` support to the existing entry layer, but only allow it on `TASK` entries.

Required behavior in `EntryService`:
- creating a task with `improvementId` links it
- patching a task with `improvementId` links or clears it
- if an entry’s final type is not `TASK`, any non-null `improvementId` is rejected
- if an existing `TASK` changes away from `TASK`, its `improvement` relation is cleared in the same update

Expose linked improvement summary on `EntryResponse` as a minimal nested object:

```java
record LinkedImprovementSummary(Long id, String title) {}
```

- [ ] **Step 5: Run the backend verification**

Run:

```bash
./mvnw -q -Dtest=ImprovementServiceTest,ImprovementControllerIntTest,EntryServiceTest,EntryControllerIntTest,EntryResponseTest test
./mvnw clean package
```

Expected: both commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/resources/db/migration/V13__create_improvement_tables.sql src/main/resources/db/migration/V14__link_entry_to_improvement.sql src/main/java/com/workboard/improvement src/main/java/com/workboard/entry/EntryEntity.java src/main/java/com/workboard/entry/CreateEntryRequest.java src/main/java/com/workboard/entry/UpdateEntryRequest.java src/main/java/com/workboard/entry/EntryResponse.java src/main/java/com/workboard/entry/EntryService.java src/test/java/com/workboard/improvement src/test/java/com/workboard/entry/EntryServiceTest.java src/test/java/com/workboard/entry/EntryControllerIntTest.java src/test/java/com/workboard/entry/EntryResponseTest.java
git commit -m "feat(millores): add backend domain and task links"
```

### Task 2: Frontend data model, routing, global create, and list page

**Files:**
- Create: `src/main/frontend/src/api/improvements.ts`
- Create: `src/main/frontend/src/hooks/useImprovements.ts`
- Create: `src/main/frontend/src/config/improvement-taxonomy.ts`
- Create: `src/main/frontend/src/components/improvements/ImprovementFilters.tsx`
- Create: `src/main/frontend/src/components/improvements/ImprovementSummaryCard.tsx`
- Create: `src/main/frontend/src/pages/ImprovementsPage.tsx`
- Create: `src/main/frontend/src/pages/ImprovementsPage.test.tsx`
- Modify: `src/main/frontend/src/config/navigation.tsx`
- Modify: `src/main/frontend/src/components/layout/TopBar.tsx`
- Modify: `src/main/frontend/src/hooks/useGlobalCreate.tsx`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/api/entries.ts`

- [ ] **Step 1: Write the failing frontend tests first**

Add tests that prove:
- the sidebar renders a new `Millores` entry
- the top-bar `Nou` dropdown exposes `Nova Millora`
- selecting `Nova Millora` navigates to `/millores/new` instead of opening the entry dialog
- `ImprovementsPage` renders empty state, search, filters, and list rows/cards from API data

- [ ] **Step 2: Add shared frontend types and API client**

Extend `src/main/frontend/src/types/index.ts` with dedicated models:

```ts
export type ImprovementStatus =
  | "NOVA"
  | "EN_VALORACIO"
  | "VALORADA"
  | "ENVIADA_A_CLIENT"
  | "APROVADA"
  | "EN_DESENVOLUPAMENT"
  | "VALIDANT"
  | "PENDENT_DE_REVISIO"
  | "FINALITZADA"
  | "PENDENT_D_INTEGRAR"
  | "INTEGRADA"
  | "BLOQUEJADA"
  | "CANCEL_LADA"

export type ValuationStatus =
  | "NO_COMENCADA"
  | "EN_CURS"
  | "PER_REVISAR"
  | "PENDENT_DE_CANVIS"
  | "REVISADA"
  | "ENVIADA"
  | "TANCADA"
  | "BLOQUEJADA"
  | "CANCEL_LADA"

export interface ImprovementNote {
  context: string
  risk_dependency: string
  observations: string
}

export interface Improvement {
  id: number
  title: string
  requirements: string | null
  redmine_parent_ref: string | null
  priority: number | null
  due_date: string | null
  jira_ref: string | null
  version: Version | null
  tags: Tag[]
  sold_hours: number | null
  status: ImprovementStatus
  completion_percentage: number
  note: ImprovementNote
  valuation_summary: {
    id: number
    status: ValuationStatus
    completion_percentage: number
    analysis_hours: number | null
    total_estimated_hours: number | null
  } | null
  created_at: string
  updated_at: string
}
```

Then add `api/improvements.ts` and `hooks/useImprovements.ts` following the style used in `api/entries.ts`, `api/versions.ts`, and `hooks/useEntries.ts`.

- [ ] **Step 3: Add routing and navigation**

Update `navigation.tsx` to add:
- sidebar item `Millores`
- routes for list, create, detail, valuation read, valuation edit

Update `TopBar.tsx` and `useGlobalCreate.tsx` so the top bar can handle `Nova Millora` as a route-based creation action instead of an `EntryType` dialog.

Do not mutate the existing entry create dialog into accepting a fake `MILLORA` type.

- [ ] **Step 4: Implement the first list page**

Use `ActesPage.tsx` and `EntryList.tsx` as the primary references.

The first usable `ImprovementsPage` must include:
- page header
- debounced text search
- filters for `status`, `priority`, `version`, `tag`, `has valuation`, `percentage`, and date range
- table/cards switch if cheap to reuse now; otherwise table first and cards in the same task if already straightforward
- empty state and pagination

The list must show only parent `Millores`, never standalone `Valoracions`.

- [ ] **Step 5: Run the frontend verification for routing and list**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ImprovementsPage.test.tsx
npx tsc --noEmit
npm run build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/api/improvements.ts src/main/frontend/src/hooks/useImprovements.ts src/main/frontend/src/config/improvement-taxonomy.ts src/main/frontend/src/components/improvements/ImprovementFilters.tsx src/main/frontend/src/components/improvements/ImprovementSummaryCard.tsx src/main/frontend/src/pages/ImprovementsPage.tsx src/main/frontend/src/pages/ImprovementsPage.test.tsx src/main/frontend/src/config/navigation.tsx src/main/frontend/src/components/layout/TopBar.tsx src/main/frontend/src/hooks/useGlobalCreate.tsx src/main/frontend/src/types/index.ts src/main/frontend/src/api/entries.ts
git commit -m "feat(millores): add navigation and list page"
```

### Task 3: Improvement form, detail view, and valuation bootstrap flow

**Files:**
- Create: `src/main/frontend/src/components/improvements/ImprovementForm.tsx`
- Create: `src/main/frontend/src/components/improvements/ValuationBootstrapDialog.tsx`
- Create: `src/main/frontend/src/pages/ImprovementViewPage.tsx`
- Create: `src/main/frontend/src/pages/ValuationViewPage.tsx`
- Create: `src/main/frontend/src/pages/ImprovementViewPage.test.tsx`
- Create: `src/main/frontend/src/pages/ValuationViewPage.test.tsx`
- Modify: `src/main/frontend/src/pages/ImprovementsPage.tsx`
- Modify: `src/main/frontend/src/hooks/useImprovements.ts`

- [ ] **Step 1: Write the failing page/component tests first**

Add tests that prove:
- `/millores/new` renders a creation form with all agreed fields
- `/millores/:id` renders summary info including requirements, status, percentage, tags, version, Redmine, JIRA, sold hours, valuation summary, and linked tasks
- the summary page shows a create-valuation CTA only when valuation is missing
- creating valuation requires `redmine_child_ref`, `due_date`, and the structural bootstrap choices (`DB`, `APIs`, `WEBs`, subblocks)
- `/millores/:id/valoracio` renders read-only view first, not edit mode

- [ ] **Step 2: Implement the `Millora` form**

Create `ImprovementForm.tsx` with fields:
- title
- requirements
- redmine parent
- priority
- due date
- JIRA
- version
- tags
- sold hours
- manual completion percentage
- status
- note fields:
  - `Context`
  - `Risc / dependència`
  - `Observacions`

Use `EntryForm.tsx` and config pages as references for form layout, selectors, and save handling.

- [ ] **Step 3: Implement the improvement detail page**

Create `ImprovementViewPage.tsx` that shows:
- summary header and navigation back to the list
- clickable Redmine + JIRA references
- valuation summary data if available
- linked task list using the new backend endpoint
- CTA to create valuation when missing

Reuse the visual principles from `ActaViewPage.tsx`, but build a card/summary layout, not a markdown document viewer.

- [ ] **Step 4: Implement valuation bootstrap flow and read-only valuation page**

Create `ValuationBootstrapDialog.tsx` (or route-first equivalent) that collects:
- redmine child ID
- valuation due date
- initial priority
- whether DB applies
- whether APIs apply
- whether WEBs apply
- initial list of API subblocks
- initial list of WEB subblocks

Then create `ValuationViewPage.tsx` that reads the persisted valuation and shows the generated Textile/read-only structured content before editing.

- [ ] **Step 5: Run the targeted frontend verification**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ImprovementsPage.test.tsx src/pages/ImprovementViewPage.test.tsx src/pages/ValuationViewPage.test.tsx
npx tsc --noEmit
npm run build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/components/improvements/ImprovementForm.tsx src/main/frontend/src/components/improvements/ValuationBootstrapDialog.tsx src/main/frontend/src/pages/ImprovementViewPage.tsx src/main/frontend/src/pages/ValuationViewPage.tsx src/main/frontend/src/pages/ImprovementViewPage.test.tsx src/main/frontend/src/pages/ValuationViewPage.test.tsx src/main/frontend/src/pages/ImprovementsPage.tsx src/main/frontend/src/hooks/useImprovements.ts
git commit -m "feat(millores): add detail view and valuation creation"
```

### Task 4: Hybrid valuation editor with structured persistence

**Files:**
- Create: `src/main/frontend/src/components/improvements/ValuationEditor.tsx`
- Create: `src/main/frontend/src/components/improvements/valuation-textile.ts`
- Create: `src/main/frontend/src/pages/ValuationEditorPage.tsx`
- Create: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`
- Modify: `src/main/frontend/src/hooks/useImprovements.ts`

- [ ] **Step 1: Write the failing editor tests first**

Add tests that prove:
- valuation edit page renders split editor + preview layout
- fixed blocks always exist: `Anàlisi`, `Resum de tasques`, `Pre-anàlisi`, `Valoració`
- structural blocks always exist: `DB`, `APIs`, `WEBs`
- when DB/APIs/WEBs do not apply, generated Textile shows `_No aplica_` or `_Sense afectació_`
- users can add API and WEB subblocks without editing raw Textile manually
- saving persists both `structured_content_json` and `textile_body`

- [ ] **Step 2: Implement the structured editor state**

Create a typed editor model in `ValuationEditor.tsx` (or a dedicated local type module if the file grows too large) that includes:
- fixed text blocks
- one DB block
- array of API blocks
- array of WEB blocks
- valuation section fields

Do not make the primary authoring experience a raw Textile textarea.

- [ ] **Step 3: Implement Textile generation**

Create `valuation-textile.ts` that turns the structured editor model into the baseline Textile template shape already approved in `IMPROVEMENTS.md`.

The generated output must always contain:
- `h1. Anàlisi`
- `h3. Resum de tasques`
- `h1. Pre-anàlisi`
- `h2. DB`
- `h2. APIS`
- `h2. WEBS`
- `h2. Valoració`

Even when DB/APIs/WEBs do not apply, the corresponding sections must remain present with `_No aplica_` / `_Sense afectació_` content.

- [ ] **Step 4: Implement the route page and persistence wiring**

Create `ValuationEditorPage.tsx` using `ActaEditorPage.tsx` as the interaction reference:
- split layout
- save action
- copy/export action
- preview panel
- route-based explicit editing

Saving must send both:
- structured JSON
- generated Textile body

- [ ] **Step 5: Run the targeted editor verification**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ValuationEditorPage.test.tsx
npx tsc --noEmit
npm run build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/components/improvements/ValuationEditor.tsx src/main/frontend/src/components/improvements/valuation-textile.ts src/main/frontend/src/pages/ValuationEditorPage.tsx src/main/frontend/src/pages/ValuationEditorPage.test.tsx src/main/frontend/src/hooks/useImprovements.ts
git commit -m "feat(millores): add hybrid valuation editor"
```

### Task 5: Live calculations, template selection, and configuration support

**Files:**
- Create: `src/main/frontend/src/components/improvements/valuation-calculations.ts`
- Modify: `src/main/frontend/src/components/improvements/ValuationEditor.tsx`
- Modify: `src/main/frontend/src/components/improvements/valuation-textile.ts`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx` (only if template selection/config lands now)

- [ ] **Step 1: Write the failing calculation tests first**

Add tests that prove:
- analysis, DB, API, WEB, test, design, management, management + jiras, follow-up, and total values recalculate live
- `Gestió = (Analisi + BO + APIs + WEBs + Proves) / 2`
- `Gestió + jiras = Gestió / 4`
- Textile output reflects the calculated values

If template selection is included in the same vertical slice, also add tests that prove:
- valuation creation can select a non-default template
- default template still works with no explicit override

- [ ] **Step 2: Implement the calculation helpers**

Create `valuation-calculations.ts` with pure functions for:
- block subtotals
- management formula
- management + jiras formula
- final total

Keep this code isolated from React so it is easy to unit test.

- [ ] **Step 3: Wire live calculations into the editor**

Update the editor so calculated outputs refresh immediately when base values change.

The UI must keep visible:
- individual line values
- block subtotals
- final totals

Do not require a manual “recalculate” button as the primary flow.

- [ ] **Step 4: Add first-pass template support only if still in scope**

If the feature remains manageable in this iteration, add a minimal template model:
- one global default template
- one explicit template choice at valuation creation

If this step threatens the rest of the feature scope, stop here and leave template configuration for the next plan, but note that the editor and storage model must stay compatible with later template expansion.

- [ ] **Step 5: Run the calculation/template verification**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ValuationEditorPage.test.tsx
npx tsc --noEmit
npm run build
```

Run backend package once more from repo root:

```bash
./mvnw clean package
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/components/improvements/valuation-calculations.ts src/main/frontend/src/components/improvements/ValuationEditor.tsx src/main/frontend/src/components/improvements/valuation-textile.ts src/main/frontend/src/pages/ValuationEditorPage.test.tsx src/main/frontend/src/types/index.ts src/main/frontend/src/pages/ConfigPage.tsx
git commit -m "feat(millores): add valuation calculations"
```

---

## Final verification checklist

- [ ] `./mvnw clean package`
- [ ] `cd src/main/frontend && npx tsc --noEmit`
- [ ] `cd src/main/frontend && npm run build`
- [ ] Run targeted Vitest suites for `Millores`
- [ ] Verify `llista -> lectura -> editar` flow for `Millora`
- [ ] Verify `Millora -> crear valoració -> lectura -> editar` flow
- [ ] Verify manual percentage on `Millora`, `Valoració`, and normal task link flows
- [ ] Verify normal `TASK` can link to one `Millora`
- [ ] Verify non-task entries cannot keep `improvementId`
- [ ] Verify Textile copy/export is actually usable
- [ ] Re-read `docs/project/IMPROVEMENTS.md` Item 4 and tick every agreed requirement against shipped behavior

---

## Spec coverage self-check

- Domain split (`Millora` + unique `Valoració`) → Task 1
- Optional link from normal `TASK` to `Millora` → Task 1
- Dedicated `Millores` navigation/list → Task 2
- `Millora` summary/detail with linked data → Task 3
- `Valoració` bootstrap and read view → Task 3
- Hybrid editor with guided blocks and Textile output → Task 4
- Automatic calculations and template-ready structure → Task 5
- Final documentation reread against Item 4 → Final verification checklist

No spec section is intentionally dropped. The only constrained area is template configuration depth, which may be reduced if it threatens delivery of the usable core, but the storage/editor model must remain compatible with later completion.
