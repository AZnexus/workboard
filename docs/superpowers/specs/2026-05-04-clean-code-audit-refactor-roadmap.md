# Workboard Clean Code & Refactor Roadmap

> **Purpose:** Preserve the audit context and define a safe, step-by-step refactor plan for frontend + backend without breaking behavior.

## Goal

Run a balanced frontend/backend cleanup across Workboard to reduce hardcoded text/styles/config, improve single-source-of-truth patterns, and move the codebase toward cleaner architecture and maintainability.

## Non-Negotiable Rules

1. **Do not break behavior.**
2. **Refactor in small phases.** Never attempt a project-wide rewrite in one pass.
3. **Each phase must be independently verifiable.**
4. **Prefer extraction and consolidation over redesign.**
5. **Do not mix unrelated cleanup into the same iteration.**
6. **When in doubt, keep behavior identical and improve structure only.**

## Required Safety Protocol For Every Refactor Iteration

Each iteration must follow this sequence:

1. Identify one bounded refactor target.
2. Read the full cluster of related files before editing.
3. Add or update tests when behavior is exposed in UI or API.
4. Implement the smallest structural improvement that removes duplication or centralizes truth.
5. Run targeted verification first.
6. Run broader verification before releasing a validation build.
7. Only prepare validation tag/jar when the iteration is actually complete.

## Verification Checklist Per Iteration

### Frontend refactors
- `lsp_diagnostics` on changed frontend files
- targeted Vitest suite for touched areas
- `npm run build`

### Backend refactors
- Java diagnostics if available
- targeted Spring tests if present
- `./mvnw test` or the narrowest relevant verification
- `./mvnw -DskipTests package` before validation handoff when the change affects the release build

### Release handoff rule
- Once implementation is complete and only user validation remains:
  - create local commits needed to fix the state
  - prepare a unique local version
  - generate jar
  - create local validation tag
  - tell the user exactly what to validate
- Only after user validation:
  - finalize changelog/documentation
  - push commits and tag

## Audit Summary

## Frontend — Main Findings

### High priority
1. **Route/navigation/layout source of truth is split**
   - `src/main/frontend/src/App.tsx`
   - `src/main/frontend/src/components/layout/Sidebar.tsx`
   - `src/main/frontend/src/components/layout/AppShell.tsx`
   - Problem: routes, nav labels, and path-specific layout rules are duplicated.

2. **Theme metadata is duplicated**
   - `src/main/frontend/src/hooks/useTheme.tsx`
   - `src/main/frontend/src/pages/ConfigPage.tsx`
   - Problem: theme IDs/colors/preview metadata are maintained in parallel.

3. **Entry taxonomy is scattered**
   - `src/main/frontend/src/components/entries/entry-status.tsx`
   - `src/main/frontend/src/components/entries/entry-filter-options.ts`
   - `src/main/frontend/src/components/entries/EntryForm.tsx`
   - `src/main/frontend/src/components/entries/EntryCard.tsx`
   - Problem: entry types/status labels/options/styles are partly centralized and partly duplicated.

### Medium priority
4. **Color picker UI is duplicated**
   - `src/main/frontend/src/pages/ProjectsPage.tsx`
   - `src/main/frontend/src/pages/TagsPage.tsx`

5. **Hardcoded UI copy is spread across page-level components**
   - `EntryForm.tsx`
   - `QuickCapture.tsx`
   - `ProjectsPage.tsx`
   - `TagsPage.tsx`
   - `components/dashboard/DailyView.tsx`

6. **Style bundles are repeated in hotspot components**
   - `TopBar.tsx`
   - `QuickCapture.tsx`
   - `Sidebar.tsx`
   - `ProjectsPage.tsx`
   - `TagsPage.tsx`

### Existing good patterns to preserve
- `src/main/frontend/src/components/entries/entry-filter-options.ts`
- `src/main/frontend/src/components/entries/entry-status.tsx`
- `src/main/frontend/src/lib/priorities.ts`
- `src/main/frontend/src/components/layout/PageHeader.tsx`
- `src/main/frontend/src/components/list/ListContainer.tsx`

## Backend — Main Findings

### High priority
1. **Operational policy/config is hardcoded in code**
   - `src/main/java/com/workboard/backup/BackupService.java`
   - `src/main/java/com/workboard/config/WebConfig.java`
   - Problem: backup retention/path/policy and CORS origin require code edits instead of config changes.

2. **Entry entity loads more graph than necessary**
   - `src/main/java/com/workboard/entry/EntryEntity.java`
   - Problem: eager tag loading couples entity shape to read paths.

### Medium priority
3. **Weak module boundaries / cross-feature repository access**
   - `src/main/java/com/workboard/entry/EntryService.java`
   - `src/main/java/com/workboard/timelog/TimeLogService.java`

4. **Route roots and fallback values are duplicated**
   - `EntryController.java`
   - `ProjectController.java`
   - `TagController.java`
   - `TimeLogController.java`
   - `DashboardController.java`
   - `ExportController.java`

5. **Stringly-typed query/sort logic**
   - `EntryController.java`
   - `EntrySpecifications.java`

6. **PATCH handling leaks transport concerns into controller logic**
   - `EntryController.java`

7. **Duplicated business rules / labels**
   - `DashboardService.java`
   - `MarkdownExportService.java`

8. **Repeated uniqueness policy**
   - `ProjectService.java`
   - `TagService.java`

### Low priority
9. **Default colors duplicated in multiple layers**
   - `ProjectEntity.java`
   - `TagEntity.java`
   - `EntryResponse.java`

10. **Global exception handler repeats not-found mapping shape**
    - `shared/GlobalExceptionHandler.java`

## Refactor Phases

## Phase 1 — Safe SSOT and Config Extraction (recommended first)

### Objective
Reduce duplication and scattered truth without changing user-facing behavior.

### Frontend scope
1. Create a single **route/navigation config** used by:
   - `App.tsx`
   - `Sidebar.tsx`
   - `AppShell.tsx`

2. Create a single **theme metadata config** used by:
   - `useTheme.tsx`
   - `ConfigPage.tsx`

3. Create a single **entry taxonomy config** for:
   - types
   - statuses
   - labels
   - filter options
   - display metadata
   - form options

4. Extract duplicated **color picker** into a shared component used by:
   - `ProjectsPage.tsx`
   - `TagsPage.tsx`

### Backend scope
5. Move operational settings into config/properties for:
   - backup policy
   - backup retention
   - backup path/prefix
   - allowed CORS origins

6. Extract shared constants for:
   - route roots if appropriate
   - default colors
   - sentinel/fallback values scheduled for removal later

### Why this phase comes first
- Highest maintainability gain
- Lowest regression risk
- Establishes reusable foundations for later cleanup

## Phase 2 — Text and Style Hardcoding Cleanup

### Objective
Centralize repeated UI copy and repeated visual bundles.

### Scope
1. Move repeated user-facing text into shared text/config modules.
2. Extract repeated style bundles/class sets into:
   - shared components
   - helper class builders
   - reusable variants

### Candidate hotspots
- `EntryForm.tsx`
- `QuickCapture.tsx`
- `ProjectsPage.tsx`
- `TagsPage.tsx`
- `DailyView.tsx`
- `TopBar.tsx`
- `Sidebar.tsx`

### Warning
Do **not** introduce premature i18n architecture unless there is a clear project decision to do so. Centralized text modules are enough as a first step.

## Phase 3 — Controller/Query/Boundary Cleanup

### Objective
Reduce fragile backend logic and transport leakage.

### Scope
1. Replace hand-rolled PATCH parsing with explicit DTO strategy.
2. Reduce stringly-typed sort/specification paths.
3. Consolidate repeated domain business labels/constants.
4. Start clarifying service/repository boundaries where risk is low.

## Phase 4 — Architecture Deep Cleanup

### Objective
Address the riskier architectural hotspots after foundations are stable.

### Scope
1. Revisit `EntryEntity.tags` eager loading and migrate to fetch-specific read paths.
2. Reassess service boundaries across entry/tag/timelog modules.
3. Simplify exception mapping if the hierarchy grows.

### Warning
This phase has the highest regression risk. Do it only after Phases 1–3 are stable and verified.

## Recommended Order Of Execution

1. **Phase 1A** — frontend routes/navigation/layout SSOT
2. **Phase 1B** — frontend themes SSOT
3. **Phase 1C** — frontend entry taxonomy SSOT
4. **Phase 1D** — shared color picker extraction
5. **Phase 1E** — backend config extraction
6. **Phase 1F** — backend shared constants/defaults
7. **Phase 2** — hardcoded text and repeated styles
8. **Phase 3** — controller/query cleanup
9. **Phase 4** — deeper architecture cleanup

## Definition Of Done For Each Phase

A phase is complete only when:

1. All targeted duplication for that phase is removed or intentionally documented.
2. Shared abstractions are actually consumed by all intended callers.
3. Diagnostics are clean.
4. Targeted tests pass.
5. Build/package passes when the change affects the shipped artifact.
6. A validation build/tag is prepared for the user if the phase has visible or meaningful behavior impact.

## What Not To Do

- Do not rewrite frontend styling into one giant CSS file just because styles are currently hardcoded.
  - Prefer **shared components / variants / config-driven tokens** over a monolithic stylesheet.
- Do not introduce abstraction layers without at least two real consumers.
- Do not mix backend architecture changes with UI text cleanup in the same iteration.
- Do not touch eager/lazy entity loading until the safer phases are finished.

## Immediate Next Step

Start with **Phase 1A: frontend route/navigation/layout single source of truth**.

Why:
- high duplication
- visible maintainability gain
- behavior-preserving when done carefully
- unblocks cleaner follow-up phases

## Session Continuity Note

If a future session resumes this work:

1. Read this roadmap first.
2. Confirm the current phase/subphase before editing anything.
3. Keep the refactor bounded to one phase at a time.
4. Re-run verification before preparing any validation build.
