# Phase 4 Step 4/4 — TimeLog / Entry Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fer que `TimeLogService` deixi de dependre directament d'`EntryRepository` sense canviar el comportament observable de create/update de timelogs.

**Architecture:** El tall és mínim: encapsular la resolució opcional d'`EntryEntity` dins d'`EntryService` i fer que `TimeLogService` depengui d'aquesta frontera en lloc del repositori. No canvia la semàntica actual: `entryId == null` continua sense enllaç i un `entryId` inexistent continua sense fer fallar el create/update.

**Tech Stack:** Java 21, Spring Boot 3.4.5, Spring Data JPA, JUnit 5, Mockito, MockMvc, Maven.

---

### Task 1: Afegir cobertura de servei per la semàntica actual de `entryId`

**Files:**
- Create: `src/test/java/com/workboard/timelog/TimeLogServiceTest.java`
- Modify: `src/main/java/com/workboard/timelog/TimeLogService.java` (després del RED)

- [ ] **Step 1: Write the failing tests**

```java
@ExtendWith(MockitoExtension.class)
class TimeLogServiceTest {

    @Mock
    private TimeLogRepository timeLogRepository;

    @Mock
    private EntryService entryService;

    @InjectMocks
    private TimeLogService timeLogService;

    @Test
    void create_withExistingEntryId_linksEntryThroughServiceBoundary() {
        EntryEntity entry = new EntryEntity();
        entry.setId(7L);

        CreateTimeLogRequest request = new CreateTimeLogRequest(
                7L,
                LocalDate.of(2026, 4, 17),
                new BigDecimal("2.5"),
                "ProjectX",
                "Some work",
                null);

        when(entryService.findOptionalForReference(7L)).thenReturn(Optional.of(entry));
        when(timeLogRepository.save(any(TimeLogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TimeLogEntity created = timeLogService.create(request);

        assertThat(created.getEntry()).isSameAs(entry);
        verify(entryService).findOptionalForReference(7L);
    }

    @Test
    void create_withMissingEntryId_preservesCurrentBehavior() {
        CreateTimeLogRequest request = new CreateTimeLogRequest(
                99L,
                LocalDate.of(2026, 4, 17),
                new BigDecimal("2.5"),
                "ProjectX",
                "Some work",
                null);

        when(entryService.findOptionalForReference(99L)).thenReturn(Optional.empty());
        when(timeLogRepository.save(any(TimeLogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TimeLogEntity created = timeLogService.create(request);

        assertThat(created.getEntry()).isNull();
        verify(entryService).findOptionalForReference(99L);
    }

    @Test
    void update_withExistingEntryId_linksEntryThroughServiceBoundary() {
        TimeLogEntity existing = new TimeLogEntity();
        existing.setId(3L);

        EntryEntity entry = new EntryEntity();
        entry.setId(8L);

        UpdateTimeLogRequest request = new UpdateTimeLogRequest(
                8L,
                null,
                null,
                null,
                null,
                null);

        when(timeLogRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(entryService.findOptionalForReference(8L)).thenReturn(Optional.of(entry));
        when(timeLogRepository.save(existing)).thenReturn(existing);

        TimeLogEntity updated = timeLogService.update(3L, request);

        assertThat(updated.getEntry()).isSameAs(entry);
        verify(entryService).findOptionalForReference(8L);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
./mvnw -Dtest=TimeLogServiceTest test
```

Expected:

```text
BUILD FAILURE
cannot find symbol
symbol:   method findOptionalForReference(...)
```

### Task 2: Moure la resolució opcional d'entry a la frontera d'`EntryService`

**Files:**
- Modify: `src/main/java/com/workboard/entry/EntryService.java`
- Modify: `src/main/java/com/workboard/timelog/TimeLogService.java`
- Test: `src/test/java/com/workboard/timelog/TimeLogServiceTest.java`

- [ ] **Step 1: Add the minimal boundary method in `EntryService`**

```java
@Transactional(readOnly = true)
public Optional<EntryEntity> findOptionalForReference(Long id) {
    return entryRepository.findById(id);
}
```

- [ ] **Step 2: Switch `TimeLogService` to the service boundary**

```java
private final EntryService entryService;

public TimeLogService(TimeLogRepository timeLogRepository, EntryService entryService) {
    this.timeLogRepository = timeLogRepository;
    this.entryService = entryService;
}
```

```java
if (request.entryId() != null) {
    entryService.findOptionalForReference(request.entryId())
            .ifPresent(entity::setEntry);
}
```

Apply the same replacement in both `create()` and `update()`.

- [ ] **Step 3: Run test to verify it passes**

Run:

```bash
./mvnw -Dtest=TimeLogServiceTest test
```

Expected:

```text
BUILD SUCCESS
Tests run: 3, Failures: 0, Errors: 0
```

### Task 3: Verificar que el comportament extern no canvia

**Files:**
- Verify: `src/test/java/com/workboard/timelog/TimeLogControllerIntTest.java`
- Verify: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`
- Verify: `src/test/java/com/workboard/dashboard/DashboardControllerIntTest.java`
- Verify: `src/test/java/com/workboard/export/ExportControllerIntTest.java`

- [ ] **Step 1: Run the timelog safety slice**

Run:

```bash
./mvnw -Dtest=TimeLogServiceTest,TimeLogControllerIntTest test
```

Expected:

```text
BUILD SUCCESS
Failures: 0, Errors: 0
```

- [ ] **Step 2: Run the broader regression slice for the Phase 4 thread**

Run:

```bash
./mvnw -Dtest=TimeLogServiceTest,TimeLogControllerIntTest,EntryControllerIntTest,DashboardControllerIntTest,ExportControllerIntTest,DashboardServiceTest,MarkdownExportServiceTest,EntryRepositoryIntTest,EntryServiceTest,EntryResponseTest test
```

Expected:

```text
BUILD SUCCESS
Failures: 0, Errors: 0, Skipped: 0
```

- [ ] **Step 3: Run package verification**

Run:

```bash
./mvnw -q -DskipTests package
```

Expected:

```text
exit 0
```

### Task 4: Tancar la Fase 4 i deixar pas a la passada global final

**Files:**
- Update if needed: `docs/project/IMPROVEMENTS.md`
- Update if needed: `docs/project/CHANGELOG.md`

- [ ] **Step 1: Mark the step complete only if all fresh verification passed**

Checklist:

```text
- `TimeLogService` ja no depèn d'`EntryRepository`
- la semàntica actual d'`entryId` es manté
- timelog continua funcionant externament igual
- no hi ha regressions en entry/dashboard/export
- package passa
```

- [ ] **Step 2: Prepare the final global pass requested by the user**

The next pass after closing this step must verify:

```text
- cap regressió funcional
- cap regressió visible
- cap refactor pendent dins aquest mateix fil de neteja
```

Note:
- No commit unless the user explicitly asks for it.
