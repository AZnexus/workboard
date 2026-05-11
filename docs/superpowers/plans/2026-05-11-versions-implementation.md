# Versions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `Versions` catalog in `Configuració` and allow assigning one optional version to tasks.

**Architecture:** Implement a small `version` backend module that mirrors the existing `project` patterns for CRUD and active/inactive listing. Persist the version relationship on `EntryEntity` as an optional foreign key so the data model is ready for future RETROS work, but expose the selector only in task flows during this iteration. The backend—not only the UI—must enforce that versions belong exclusively to `TASK` entries, and deleting a version that is still referenced by tasks must fail with a clear conflict instead of silently orphaning data.

**Tech Stack:** Java 21, Spring Boot 3.4, Spring Data JPA, Flyway, React 19, TypeScript, TanStack Query, Vitest.

---

## Non-negotiable invariants

- `versionId` can only be stored on entries whose final type is `TASK`.
- Creating or updating a non-task entry with a non-null `versionId` must be rejected server-side.
- If an existing task changes away from `TASK`, its version relation must be cleared in the same update.
- Deleting a version that is still referenced by any task must be rejected with a clear conflict rule.

---

## File map

- Create: `src/main/java/com/workboard/version/VersionEntity.java`
- Create: `src/main/java/com/workboard/version/VersionRepository.java`
- Create: `src/main/java/com/workboard/version/VersionService.java`
- Create: `src/main/java/com/workboard/version/VersionController.java`
- Create: `src/main/java/com/workboard/version/VersionResponse.java`
- Create: `src/main/java/com/workboard/version/CreateVersionRequest.java`
- Create: `src/main/java/com/workboard/version/UpdateVersionRequest.java`
- Create: `src/main/java/com/workboard/version/VersionNotFoundException.java`
- Create: `src/main/resources/db/migration/V10__create_version.sql`
- Create: `src/test/java/com/workboard/version/VersionServiceTest.java`
- Create: `src/test/java/com/workboard/version/VersionControllerIntTest.java`
- Create: `src/main/frontend/src/api/versions.ts`
- Create: `src/main/frontend/src/hooks/useVersions.ts`
- Create: `src/main/frontend/src/pages/VersionsPage.tsx`
- Create: `src/main/frontend/src/pages/VersionsPage.test.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.test.tsx`
- Modify: `src/main/frontend/src/types/index.ts`
- Create: `src/main/resources/db/migration/V11__add_version_to_entry.sql`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/EntryRepository.java`
- Modify: `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/UpdateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/EntryResponse.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/main/java/com/workboard/version/VersionService.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`
- Modify: `src/test/java/com/workboard/version/VersionServiceTest.java`
- Modify: `src/test/java/com/workboard/version/VersionControllerIntTest.java`
- Modify: `src/main/frontend/src/components/entries/EntryForm.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryForm.test.tsx`

---

### Task 1: Backend catalog for Versions

**Files:**
- Create: `src/main/resources/db/migration/V10__create_version.sql`
- Create: `src/main/java/com/workboard/version/VersionEntity.java`
- Create: `src/main/java/com/workboard/version/VersionRepository.java`
- Create: `src/main/java/com/workboard/version/VersionService.java`
- Create: `src/main/java/com/workboard/version/VersionController.java`
- Create: `src/main/java/com/workboard/version/VersionResponse.java`
- Create: `src/main/java/com/workboard/version/CreateVersionRequest.java`
- Create: `src/main/java/com/workboard/version/UpdateVersionRequest.java`
- Create: `src/main/java/com/workboard/version/VersionNotFoundException.java`
- Test: `src/test/java/com/workboard/version/VersionServiceTest.java`
- Test: `src/test/java/com/workboard/version/VersionControllerIntTest.java`

- [ ] **Step 1: Write the failing backend tests first**

Add `VersionServiceTest` and `VersionControllerIntTest` using `ProjectServiceTest` and `ProjectControllerIntTest` as the direct reference pattern.

Cover at least:
- create rejects case-insensitive duplicates
- update rejects duplicates owned by another version
- list supports `?active=true`
- patch toggles `active`

- [ ] **Step 2: Add the catalog migration**

Create `V10__create_version.sql` with a lean table shape:

```sql
CREATE TABLE version (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL
);
```

Keep this first version intentionally small: no extra fields beyond what the approved design requires.

- [ ] **Step 3: Implement the backend module**

Mirror the current `project` patterns:
- `VersionEntity` with `id`, `name`, `active`, `createdAt`
- `VersionRepository` with ordered listing and case-insensitive lookup
- `VersionService` with `findAll`, `findActive`, `findById`, `create`, `update`, `delete`
- `VersionController` with:
  - `GET /api/v1/versions`
  - `GET /api/v1/versions/{id}`
  - `POST /api/v1/versions`
  - `PATCH /api/v1/versions/{id}`
  - `DELETE /api/v1/versions/{id}`

Follow the same conflict behavior as projects for duplicate names.

- [ ] **Step 4: Run the backend catalog tests**

Run:

```bash
./mvnw -q -Dtest=VersionServiceTest,VersionControllerIntTest test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/resources/db/migration/V10__create_version.sql src/main/java/com/workboard/version src/test/java/com/workboard/version
git commit -m "feat(config): add versions catalog backend"
```

### Task 2: Frontend version management in Configuració

**Files:**
- Create: `src/main/frontend/src/api/versions.ts`
- Create: `src/main/frontend/src/hooks/useVersions.ts`
- Create: `src/main/frontend/src/pages/VersionsPage.tsx`
- Create: `src/main/frontend/src/pages/VersionsPage.test.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.test.tsx`
- Modify: `src/main/frontend/src/types/index.ts`

- [ ] **Step 1: Write the failing frontend tests first**

Add tests that prove:
- `ConfigPage` renders a new `Versions` tab
- `VersionsPage` shows empty state and create affordance similar to `ProjectsPage` / `TagsPage`
- the page can render active and archived versions distinctly once hooks return data

- [ ] **Step 2: Add shared frontend types and data access**

Extend `src/main/frontend/src/types/index.ts` with:

```ts
export interface Version {
  id: number
  name: string
  active: boolean
  created_at: string
}

export interface CreateVersionRequest {
  name: string
}

export interface UpdateVersionRequest {
  name?: string
  active?: boolean
}
```

Then add `api/versions.ts` and `hooks/useVersions.ts` following the existing `projects` and `tags` patterns.

- [ ] **Step 3: Implement `VersionsPage`**

Use `ProjectsPage.tsx` as the main reference, but keep the model lean:
- create version by name
- inline edit by name
- archive/reactivate through `active`
- delete support
- no color picker
- no description field

- [ ] **Step 4: Wire the new tab into `ConfigPage`**

Update `ConfigPage.tsx` to add a new tab trigger and content panel for `Versions` alongside `Projectes`, `Etiquetes`, `Tema` and `Export`.

- [ ] **Step 5: Run the targeted frontend verification**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ConfigPage.test.tsx src/pages/VersionsPage.test.tsx
npm run build
```

Expected: both commands succeed.

- [ ] **Step 6: Commit**

```bash
git add src/main/frontend/src/api/versions.ts src/main/frontend/src/hooks/useVersions.ts src/main/frontend/src/pages/VersionsPage.tsx src/main/frontend/src/pages/VersionsPage.test.tsx src/main/frontend/src/pages/ConfigPage.tsx src/main/frontend/src/pages/ConfigPage.test.tsx src/main/frontend/src/types/index.ts
git commit -m "feat(config): add versions management UI"
```

### Task 3: Persist optional version on entries, but expose it only for tasks

**Files:**
- Create: `src/main/resources/db/migration/V11__add_version_to_entry.sql`
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Modify: `src/main/java/com/workboard/entry/EntryRepository.java`
- Modify: `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/UpdateEntryRequest.java`
- Modify: `src/main/java/com/workboard/entry/EntryResponse.java`
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/main/java/com/workboard/version/VersionService.java`
- Modify: `src/test/java/com/workboard/entry/EntryServiceTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Modify: `src/test/java/com/workboard/entry/EntryResponseTest.java`
- Modify: `src/test/java/com/workboard/version/VersionServiceTest.java`
- Modify: `src/test/java/com/workboard/version/VersionControllerIntTest.java`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/components/entries/EntryForm.tsx`
- Modify: `src/main/frontend/src/components/entries/EntryForm.test.tsx`

- [ ] **Step 1: Write the failing task-version tests first**

Backend tests must cover:
- create task with `versionId`
- patch task to change or clear `versionId`
- create or patch a non-task entry with `versionId` is rejected
- patching an existing task to a non-task type clears the version relation in the same update
- response serializes version metadata for entries that have it
- deleting a version referenced by a task is rejected with a conflict

Frontend tests must cover:
- `EntryForm` shows the version selector for `TASK`
- `EntryForm` does not show the version selector for `NOTE` or `MEETING_NOTE`

- [ ] **Step 2: Add the entry migration and entity relation**

Create `V11__add_version_to_entry.sql`:

```sql
ALTER TABLE entry ADD COLUMN version_id INTEGER REFERENCES version(id);
```

Then add an optional `@ManyToOne(fetch = FetchType.LAZY)` relation on `EntryEntity`.

**Important:** this relation lives on `EntryEntity` now because the future RETROS feature will reuse it, but this iteration only exposes it in task flows.

- [ ] **Step 3: Extend entry requests, response, and service mapping**

Add optional `versionId` to:
- `CreateEntryRequest`
- `UpdateEntryRequest`

Add optional serialized version metadata to `EntryResponse` and the frontend `Entry` type.

Update `EntryService` so create/update resolves `versionId` through `VersionService` when present.

Apply these explicit backend rules:
- if the final entry type is `TASK`, `versionId` may be `null` or a real version id
- if the final entry type is not `TASK`, any non-null `versionId` must be rejected server-side instead of being silently accepted
- if an existing entry changes from `TASK` to another type, its version relation must be cleared automatically even if the request omits `versionId`
- `VersionService.delete(...)` must check `EntryRepository` and reject deletion when any task still references that version

Use a dedicated repository helper such as `existsByVersionId(...)` instead of relying on a raw foreign-key failure.

- [ ] **Step 4: Add the task-only selector to `EntryForm`**

Use `useVersions(true)` to populate a single-select field.

Rules:
- visible only when `type === "TASK"`
- optional field
- single value only
- do **not** add it to note, reminder, or meeting-note forms in this iteration

- [ ] **Step 5: Run the targeted verification for task assignment**

Run:

```bash
./mvnw -q -Dtest=VersionServiceTest,VersionControllerIntTest,EntryServiceTest,EntryControllerIntTest,EntryResponseTest test
```

Then from `src/main/frontend` run:

```bash
npm run test -- src/components/entries/EntryForm.test.tsx
npm run build
```

Expected: all commands succeed.

- [ ] **Step 6: Commit**

```bash
git add src/main/resources/db/migration/V11__add_version_to_entry.sql src/main/java/com/workboard/entry/EntryEntity.java src/main/java/com/workboard/entry/EntryRepository.java src/main/java/com/workboard/entry/CreateEntryRequest.java src/main/java/com/workboard/entry/UpdateEntryRequest.java src/main/java/com/workboard/entry/EntryResponse.java src/main/java/com/workboard/entry/EntryService.java src/main/java/com/workboard/version/VersionService.java src/test/java/com/workboard/entry/EntryServiceTest.java src/test/java/com/workboard/entry/EntryControllerIntTest.java src/test/java/com/workboard/entry/EntryResponseTest.java src/test/java/com/workboard/version/VersionServiceTest.java src/test/java/com/workboard/version/VersionControllerIntTest.java src/main/frontend/src/types/index.ts src/main/frontend/src/components/entries/EntryForm.tsx src/main/frontend/src/components/entries/EntryForm.test.tsx
git commit -m "feat(tasks): allow optional single version assignment"
```

### Task 4: End-to-end verification for the Versions improvement

**Files:**
- Verify only; no new files

- [ ] **Step 1: Run the backend suite relevant to catalog + task integration**

Run:

```bash
./mvnw -q -Dtest=VersionServiceTest,VersionControllerIntTest,EntryServiceTest,EntryControllerIntTest,EntryResponseTest test
```

Expected: PASS.

- [ ] **Step 2: Run the frontend suite relevant to config + entry form**

Run from `src/main/frontend`:

```bash
npm run test -- src/pages/ConfigPage.test.tsx src/pages/VersionsPage.test.tsx src/components/entries/EntryForm.test.tsx
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
git commit --allow-empty -m "chore(versions): verify shipped integration"
```

If the repo policy forbids empty commits, skip this commit and keep verification in the implementation notes only.
