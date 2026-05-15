# Millores Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable valuation templates to `Millores`, including template CRUD in `Configuració`, a global default template, template selection when creating a `Valoració`, template-driven Textile generation, unknown-placeholder support, and manual Textile override with explicit regeneration from guided blocks.

**Architecture:** Persist valuation templates as first-class backend entities and store the chosen template on each `Valoració`. Keep the current guided valuation model for comfortable editing, but route Textile generation through the selected template using a placeholder engine. Add a manual Textile mode in the valuation editor so generated output can be overridden safely without silent regeneration.

**Tech Stack:** Java 21, Spring Boot 3.4.5, Spring Data JPA, Flyway, SQLite, React 19, TypeScript, TanStack Query, React Router, Vitest.

---

## Scope and decomposition

This phase is a new vertical slice after the original `Millores` plan. It covers four coupled areas that must ship together:

1. backend template model + CRUD + default selection
2. template-aware valuation creation flow
3. template-driven valuation Textile generation
4. manual Textile override + regeneration in the editor

The phase deliberately does **not** include a full DSL for arbitrary repeated section families beyond the built-in guided model. Unknown placeholders are supported as simple auto-created blocks only.

---

## File map

### Backend
- Create: `src/main/resources/db/migration/V15__create_valuation_template_tables.sql`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateEntity.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateRepository.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateResponse.java`
- Create: `src/main/java/com/workboard/improvement/CreateValuationTemplateRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateValuationTemplateRequest.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateNotFoundException.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationEntity.java`
- Modify: `src/main/java/com/workboard/improvement/CreateValuationRequest.java`
- Modify: `src/main/java/com/workboard/improvement/UpdateValuationRequest.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationResponse.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementService.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementController.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationRepository.java`
- Modify: `src/test/java/com/workboard/improvement/ImprovementServiceTest.java`
- Modify: `src/test/java/com/workboard/improvement/ImprovementControllerIntTest.java`

### Frontend contracts/hooks
- Modify: `src/main/frontend/src/api/improvements.ts`
- Modify: `src/main/frontend/src/hooks/useImprovements.ts`
- Modify: `src/main/frontend/src/types/index.ts`

### Frontend settings/templates UI
- Create: `src/main/frontend/src/components/improvements/ValuationTemplateForm.tsx`
- Create: `src/main/frontend/src/components/improvements/ValuationTemplatesSection.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.test.tsx`

### Frontend valuation create/editor flow
- Modify: `src/main/frontend/src/components/improvements/ValuationBootstrapDialog.tsx`
- Modify: `src/main/frontend/src/pages/ImprovementViewPage.tsx`
- Modify: `src/main/frontend/src/pages/ImprovementViewPage.test.tsx`
- Modify: `src/main/frontend/src/components/improvements/valuation-textile.ts`
- Modify: `src/main/frontend/src/components/improvements/ValuationEditor.tsx`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.tsx`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`

---

## Task 1: Persisted valuation-template model and backend CRUD

**Files:**
- Create: `src/main/resources/db/migration/V15__create_valuation_template_tables.sql`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateEntity.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateRepository.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateResponse.java`
- Create: `src/main/java/com/workboard/improvement/CreateValuationTemplateRequest.java`
- Create: `src/main/java/com/workboard/improvement/UpdateValuationTemplateRequest.java`
- Create: `src/main/java/com/workboard/improvement/ValuationTemplateNotFoundException.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationEntity.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationResponse.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementService.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementController.java`
- Modify: `src/main/java/com/workboard/improvement/ValuationRepository.java`
- Modify: `src/test/java/com/workboard/improvement/ImprovementServiceTest.java`
- Modify: `src/test/java/com/workboard/improvement/ImprovementControllerIntTest.java`

- [ ] **Step 1: Write the failing backend tests first**

Add or extend backend tests to prove:
- the system seeds one initial valuation template from the current baseline Textile
- exactly one template is marked as default at a time
- template CRUD works
- a template in use by an existing valuation cannot be destructively deleted without protection
- `ValuationResponse` exposes template metadata

Run targeted tests first and confirm failure because the template model/endpoints do not exist yet.

- [ ] **Step 2: Add the Flyway migration**

Create `V15__create_valuation_template_tables.sql` to add:
- `valuation_template`
- a nullable template reference on `improvement_valuation`

The migration must seed the current baseline template as the initial row and mark it as the default template.

Minimum schema requirements:

```sql
CREATE TABLE valuation_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    textile_template TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

ALTER TABLE improvement_valuation ADD COLUMN valuation_template_id INTEGER REFERENCES valuation_template(id);
```

Seed one row using the current baseline template from `IMPROVEMENTS.md` and set `is_default = 1`.

- [ ] **Step 3: Implement the template entity/repository/service/controller flow**

Mirror the existing configurable-entity patterns used by `Project`/`Version` where practical:
- list templates
- create template
- update template
- delete template with safety checks
- set one template as default

Add controller endpoints under the existing improvements namespace or a tightly related config namespace, but keep them clearly dedicated to valuation templates.

- [ ] **Step 4: Expose template metadata in valuation reads**

Update valuation fetches so a valuation response includes enough template metadata to:
- show which template was used
- know whether the valuation is still using generated Textile or a customized Textile body later in the frontend

- [ ] **Step 5: Run the backend verification**

Run:

```bash
./mvnw test -Dtest=ImprovementServiceTest,ImprovementControllerIntTest
./mvnw package -DskipTests
```

Expected: all commands pass.

---

## Task 2: Template selection during valuation creation

**Files:**
- Modify: `src/main/java/com/workboard/improvement/CreateValuationRequest.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementService.java`
- Modify: `src/main/java/com/workboard/improvement/ImprovementController.java`
- Modify: `src/main/frontend/src/api/improvements.ts`
- Modify: `src/main/frontend/src/hooks/useImprovements.ts`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/components/improvements/ValuationBootstrapDialog.tsx`
- Modify: `src/main/frontend/src/pages/ImprovementViewPage.tsx`
- Modify: `src/main/frontend/src/pages/ImprovementViewPage.test.tsx`

- [ ] **Step 1: Write the failing create-flow tests first**

Add tests that prove:
- the create-valuation dialog loads available templates
- the global default template is preselected
- the user can choose a non-default template
- the create request sends the selected template id
- if the user does not change the select, the default template still applies

Run the targeted frontend and backend tests and confirm they fail because no template selection exists yet.

- [ ] **Step 2: Extend the create valuation contract**

Add `templateId` to the create valuation request contract in both backend and frontend.

If `templateId` is omitted, backend must resolve the current global default template.

- [ ] **Step 3: Update the bootstrap dialog UI**

Extend `ValuationBootstrapDialog.tsx` to:
- load templates
- display a template selector
- preselect the global default
- keep the rest of the existing bootstrap flow intact

The dialog still gathers DB/APIs/WEBs structure and due date/redmine info as before.

- [ ] **Step 4: Store the chosen template on the created valuation**

When a valuation is created, persist the chosen template reference on the valuation record.

- [ ] **Step 5: Run the create-flow verification**

Run:

```bash
cd src/main/frontend && npm run test -- src/pages/ImprovementViewPage.test.tsx
./mvnw test -Dtest=ImprovementServiceTest,ImprovementControllerIntTest
```

Expected: all commands pass.

---

## Task 3: Template-driven Textile generation with known and unknown placeholders

**Files:**
- Modify: `src/main/frontend/src/components/improvements/valuation-textile.ts`
- Modify: `src/main/frontend/src/types/index.ts`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`

- [ ] **Step 1: Write the failing generation tests first**

Add tests that prove:
- the baseline template can be rendered using explicit placeholders
- `{{analysis}}`, `{{taskSummary}}`, `{{preAnalysis}}`, `{{db}}`, `{{apis}}`, `{{webs}}`, and `{{valuation}}` are replaced correctly
- unknown placeholders create auto-block definitions in the parsed editor model
- empty unknown placeholders are visibly marked as pending content
- the generated `{{valuation}}` fragment includes automatic breakdown derived from `DB`, `APIs`, and `WEBs`

- [ ] **Step 2: Replace hardcoded baseline generation with template rendering**

Refactor `valuation-textile.ts` so that:
- the current baseline template becomes data, not hardcoded layout logic
- generation uses the selected template body plus placeholder replacement
- the `valuation` fragment is still generated centrally by the system

Known placeholders map to current guided blocks. Unknown placeholders must be collected during template parsing.

- [ ] **Step 3: Implement auto-block derivation for unknown placeholders**

When parsing/bootstrapping a valuation from a template:
- detect placeholders not in the known contract
- create simple auto-blocks keyed by placeholder name
- include them in the structured content model so the editor can render and persist them

Do **not** add a generic repeated-section DSL in this task.

- [ ] **Step 4: Keep the default template faithful to the original reference**

Adapt the default seeded template so it respects the original baseline from `IMPROVEMENTS.md`, especially the fact that:
- `DB`, `APIs`, and `WEBs` appear in the document body
- `Valoració` includes the itemized breakdown generated from those sections
- hours stay represented inside the valuation summary, not moved arbitrarily into section bodies

- [ ] **Step 5: Run the rendering verification**

Run:

```bash
cd src/main/frontend && npm run test -- src/pages/ValuationEditorPage.test.tsx
cd src/main/frontend && npx tsc --noEmit
```

Expected: all commands pass.

---

## Task 4: Manual Textile override and explicit regeneration

**Files:**
- Modify: `src/main/frontend/src/components/improvements/ValuationEditor.tsx`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.tsx`
- Modify: `src/main/frontend/src/pages/ValuationEditorPage.test.tsx`
- Modify: `src/main/frontend/src/types/index.ts`

- [ ] **Step 1: Write the failing editor-mode tests first**

Add tests that prove:
- the valuation editor offers both guided editing and Textile manual editing
- switching to manual Textile mode lets the user edit the full Textile body directly
- once manually edited, the valuation is marked as customized
- auto-regeneration does not silently overwrite customized Textile
- pressing “Regenerar des de blocs” replaces the customized Textile with the generated version

- [ ] **Step 2: Extend the structured model with template/manual state**

Add the minimum extra state needed to know:
- chosen template id and/or template metadata
- whether the current Textile body is still generated or customized
- values for unknown auto-blocks

Keep this extension minimal and compatible with existing saved valuations.

- [ ] **Step 3: Add manual Textile mode to the valuation editor page**

Update `ValuationEditorPage.tsx` so the user can:
- edit by blocks
- inspect preview
- switch to manual Textile editing
- see clearly when the Textile is customized
- explicitly regenerate from blocks

Use the current split-editor layout and extend it rather than replacing it.

- [ ] **Step 4: Persist manual override safely**

Save flow must persist:
- structured content JSON
- final Textile body (customized or generated)
- analysis/total hours as before
- template metadata/reference as needed

Do not silently discard manual Textile edits on refetch or save.

- [ ] **Step 5: Run the editor-mode verification**

Run:

```bash
cd src/main/frontend && npm run test -- src/pages/ValuationEditorPage.test.tsx
cd src/main/frontend && npx tsc --noEmit
./mvnw package -DskipTests
```

Expected: all commands pass.

---

## Task 5: Configuració templates section frontend

**Files:**
- Create: `src/main/frontend/src/components/improvements/ValuationTemplateForm.tsx`
- Create: `src/main/frontend/src/components/improvements/ValuationTemplatesSection.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.tsx`
- Modify: `src/main/frontend/src/pages/ConfigPage.test.tsx`
- Modify: `src/main/frontend/src/api/improvements.ts`
- Modify: `src/main/frontend/src/hooks/useImprovements.ts`
- Modify: `src/main/frontend/src/types/index.ts`

- [ ] **Step 1: Write the failing Configuració tests first**

Add tests that prove:
- `Configuració` shows a new templates section/tab
- templates can be listed
- a new template can be created
- an existing template can be edited
- a template can be marked as default
- destructive delete is blocked or clearly protected for templates in use

- [ ] **Step 2: Build the templates section UI**

Add a new templates section to `ConfigPage.tsx` using the existing tabs/settings style.

The section must support:
- listing templates
- opening create/edit flows
- toggling one default template

- [ ] **Step 3: Add template CRUD hooks and API contracts**

Implement the frontend API and query hooks needed by the templates section.

- [ ] **Step 4: Run the Configuració verification**

Run:

```bash
cd src/main/frontend && npm run test -- src/pages/ConfigPage.test.tsx
cd src/main/frontend && npx tsc --noEmit
```

Expected: all commands pass.

---

## Task 6: Final verification for the templates phase

**Files:**
- Review all files touched in Tasks 1-5

- [ ] **Step 1: Run the full targeted suite**

Run:

```bash
cd src/main/frontend && npm run test -- src/pages/ImprovementViewPage.test.tsx src/pages/ValuationEditorPage.test.tsx src/pages/ConfigPage.test.tsx
cd src/main/frontend && npx tsc --noEmit
./mvnw clean package
```

Expected: all commands pass.

- [ ] **Step 2: Perform a functional checklist pass**

Verify manually or with tests where practical:
- default template exists on clean database
- template CRUD works from `Configuració`
- only one default exists at a time
- new valuation uses default template unless user chooses another one
- unknown placeholder in a template produces an auto-block in the editor
- `DB/APIs/WEBs` still generate the valuation breakdown automatically
- full Textile can be edited manually
- “Regenerar des de blocs” restores the generated Textile
- existing valuations are not auto-migrated unexpectedly

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/V15__create_valuation_template_tables.sql src/main/java/com/workboard/improvement src/main/frontend/src/components/improvements src/main/frontend/src/pages/ConfigPage.tsx src/main/frontend/src/pages/ConfigPage.test.tsx src/main/frontend/src/pages/ImprovementViewPage.tsx src/main/frontend/src/pages/ImprovementViewPage.test.tsx src/main/frontend/src/pages/ValuationEditorPage.tsx src/main/frontend/src/pages/ValuationEditorPage.test.tsx src/main/frontend/src/api/improvements.ts src/main/frontend/src/hooks/useImprovements.ts src/main/frontend/src/types/index.ts
git commit -m "feat(millores): add valuation templates"
```

---

## Plan self-check

- Backend template CRUD + default selection → Task 1
- Template selection during valuation creation → Task 2
- Template-driven Textile generation → Task 3
- Manual Textile override + regenerate from blocks → Task 4
- Configuració management UI → Task 5
- Final verification → Task 6

No agreed requirement from the templates design spec is intentionally omitted. The only explicit limitation kept in scope is that unknown placeholders become simple auto-blocks, not arbitrary new repeated section families.
