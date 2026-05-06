# Phase 4 Step 3/4 — `EntryEntity.tags` Lazy Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Canviar `EntryEntity.tags` de `EAGER` a `LAZY` sense trencar cap endpoint, serialització, export ni comportament visible.

**Architecture:** El canvi principal és únic i local a `EntryEntity`. La seguretat ve del fet que els read paths crítics ja s'han migrat a `...WithTags`; aquest pla només fa el canvi de model i usa la suite existent com a xarxa de seguretat. Si apareix una regressió, només s'arregla el camí concret afectat i no s'introdueix cap nou refactor paral·lel.

**Tech Stack:** Java 21, Spring Boot 3.4.5, Spring Data JPA, MockMvc, JUnit 5, Mockito, Maven.

---

### Task 1: Canviar `EntryEntity.tags` a `LAZY`

**Files:**
- Modify: `src/main/java/com/workboard/entry/EntryEntity.java`
- Verify with existing regression coverage in:
  - `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
  - `src/test/java/com/workboard/dashboard/DashboardControllerIntTest.java`
  - `src/test/java/com/workboard/export/ExportControllerIntTest.java`
  - `src/test/java/com/workboard/dashboard/DashboardServiceTest.java`
  - `src/test/java/com/workboard/export/MarkdownExportServiceTest.java`
  - `src/test/java/com/workboard/entry/EntryRepositoryIntTest.java`
  - `src/test/java/com/workboard/entry/EntryResponseTest.java`
  - `src/test/java/com/workboard/entry/EntryServiceTest.java`

- [ ] **Step 1: Apply the bounded mapping change**

```java
@OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
private List<EntryTagEntity> tags = new ArrayList<>();
```

- [ ] **Step 2: Run the focused regression slice immediately after the mapping change**

Run:

```bash
./mvnw -Dtest=EntryServiceTest,EntryRepositoryIntTest,EntryControllerIntTest,DashboardControllerIntTest,ExportControllerIntTest,DashboardServiceTest,MarkdownExportServiceTest,EntryResponseTest test
```

Expected:

```text
BUILD SUCCESS
Tests run: <non-zero>, Failures: 0, Errors: 0
```

- [ ] **Step 3: If a regression appears, fix only the exact read path that failed**

Use one of these existing patterns, matching the failing call site exactly:

```java
@EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
@Query("select e from EntryEntity e where e.id = :id")
Optional<EntryEntity> findByIdWithTags(@Param("id") Long id);
```

```java
@EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
@Query("""
        select e
        from EntryEntity e
        where e.date = :date
        order by e.pinned desc, e.createdAt desc
        """)
List<EntryEntity> findByDateOrderByPinnedDescCreatedAtDescWithTags(@Param("date") LocalDate date);
```

```java
return entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
```

Rules:
- Do not revert `LAZY` as the first response.
- Do not introduce a generic eager workaround.
- Fix only the failing path revealed by the tests.

- [ ] **Step 4: Re-run the same focused slice until it is clean**

Run the same command from Step 2 again.

Expected:

```text
BUILD SUCCESS
Failures: 0, Errors: 0
```

### Task 2: Re-verify the full Phase 4 step 3 surface

**Files:**
- Verify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Verify: `src/test/java/com/workboard/dashboard/DashboardControllerIntTest.java`
- Verify: `src/test/java/com/workboard/export/ExportControllerIntTest.java`
- Verify: `src/test/java/com/workboard/dashboard/DashboardServiceTest.java`
- Verify: `src/test/java/com/workboard/export/MarkdownExportServiceTest.java`
- Verify: `src/test/java/com/workboard/entry/EntryRepositoryIntTest.java`
- Verify: `src/test/java/com/workboard/entry/EntryResponseTest.java`
- Verify: `src/test/java/com/workboard/entry/EntryServiceTest.java`

- [ ] **Step 1: Run the expanded verification suite**

Run:

```bash
./mvnw -Dtest=EntryServiceTest,EntryRepositoryIntTest,EntryControllerIntTest,DashboardControllerIntTest,ExportControllerIntTest,DashboardServiceTest,MarkdownExportServiceTest,EntryResponseTest test
```

Expected:

```text
BUILD SUCCESS
Failures: 0, Errors: 0, Skipped: 0
```

- [ ] **Step 2: Run package verification**

Run:

```bash
./mvnw -q -DskipTests package
```

Expected:

```text
exit 0
```

- [ ] **Step 3: Check the diff stays bounded to the lazy-loading cut**

Review only these files unless a failing test forced one extra targeted read-path fix:

```text
src/main/java/com/workboard/entry/EntryEntity.java
src/main/java/com/workboard/entry/EntryRepository.java
src/main/java/com/workboard/entry/EntryRepositoryImpl.java
src/main/java/com/workboard/dashboard/DashboardService.java
src/main/java/com/workboard/export/MarkdownExportService.java
src/test/java/com/workboard/entry/...
src/test/java/com/workboard/dashboard/...
src/test/java/com/workboard/export/...
```

Acceptance rule:
- no unrelated cleanup
- no response-shape changes
- no visual changes

### Task 3: Close Phase 4 step 3/4 and prepare the final global pass

**Files:**
- Update status references if needed after verification:
  - `docs/project/IMPROVEMENTS.md`
  - `docs/project/CHANGELOG.md`

- [ ] **Step 1: Mark the step complete only after fresh verification evidence exists**

Completion checklist:

```text
- `EntryEntity.tags` is `LAZY`
- focused suite passes
- expanded suite passes
- package passes
- no `LazyInitializationException`
- no observable response regressions
```

- [ ] **Step 2: Leave the repo ready for the final project-wide pass requested by the user**

That final pass must verify:

```text
- nothing functional broke
- nothing visible broke
- no pending refactor inside the same cleanup thread was accidentally left half-done
```

Note:
- Do not commit unless the user explicitly asks for it.
