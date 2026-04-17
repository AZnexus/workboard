# Workboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local personal task & time management webapp (Spring Boot + React + SQLite) packaged as a fat JAR.

**Architecture:** Feature-based Spring Boot backend with JPA + Flyway + SQLite serving a React SPA (Vite + shadcn/ui + React Query). Frontend builds into `static/` inside the JAR. Single `workboard.db` file for all data with automatic daily backups.

**Tech Stack:** Java 21+, Spring Boot 3.x, SQLite (via xerial), Flyway, React 19, Vite, TypeScript, shadcn/ui, Tailwind CSS 4, React Query v5, React Router v7, Geist font.

**Spec reference:** `docs/superpowers/specs/workboard-design.md`

---

## File Structure

### Backend (`src/main/java/com/workboard/`)

| File | Responsibility |
|---|---|
| `WorkboardApplication.java` | Spring Boot main class |
| `config/JpaConfig.java` | `@EnableJpaAuditing` |
| `config/WebConfig.java` | CORS (dev), SPA forwarding |
| `shared/ApiError.java` | Error response record |
| `shared/GlobalExceptionHandler.java` | `@RestControllerAdvice` |
| `shared/PageResponse.java` | Generic paginated response wrapper |
| `entry/EntryEntity.java` | JPA entity |
| `entry/EntryTagEntity.java` | JPA entity for tags |
| `entry/EntryType.java` | Enum: TASK, NOTE, MEETING_NOTE, REMINDER |
| `entry/EntryStatus.java` | Enum: OPEN, IN_PROGRESS, DONE, CANCELLED |
| `entry/EntryRepository.java` | JpaRepository + custom queries |
| `entry/EntryTagRepository.java` | JpaRepository for tags |
| `entry/CreateEntryRequest.java` | DTO record with validation |
| `entry/UpdateEntryRequest.java` | DTO record partial update |
| `entry/EntryResponse.java` | DTO response record |
| `entry/EntryService.java` | Business logic |
| `entry/EntryController.java` | REST controller |
| `timelog/TimeLogEntity.java` | JPA entity |
| `timelog/TimeLogRepository.java` | JpaRepository |
| `timelog/CreateTimeLogRequest.java` | DTO record |
| `timelog/TimeLogResponse.java` | DTO response record |
| `timelog/TimeLogService.java` | Business logic |
| `timelog/TimeLogController.java` | REST controller |
| `dashboard/DashboardService.java` | Composed queries for daily/standup/weekly |
| `dashboard/DashboardController.java` | REST controller |
| `dashboard/DailyResponse.java` | DTO for daily summary |
| `dashboard/StandupResponse.java` | DTO for standup prep |
| `dashboard/WeeklyResponse.java` | DTO for weekly hours |
| `export/MarkdownExportService.java` | Markdown generation |
| `export/ExportController.java` | REST controller |
| `backup/BackupService.java` | `@Scheduled` daily backup |

### Flyway migrations (`src/main/resources/db/migration/`)

| File | Purpose |
|---|---|
| `V1__create_entry.sql` | Entry table + indexes |
| `V1_1__create_entry_tag.sql` | EntryTag table + indexes |
| `V1_2__create_time_log.sql` | TimeLog table + indexes |

### Frontend (`src/main/frontend/`)

| File | Responsibility |
|---|---|
| `package.json` | Dependencies |
| `vite.config.ts` | Vite config with proxy to :8080 |
| `tsconfig.json` | TypeScript config |
| `index.html` | SPA entry |
| `src/main.tsx` | React mount + QueryClientProvider |
| `src/App.tsx` | Router + layout |
| `src/types/index.ts` | Shared TypeScript types |
| `src/api/client.ts` | Fetch wrapper |
| `src/api/entries.ts` | Entry API functions |
| `src/api/timelogs.ts` | TimeLog API functions |
| `src/api/dashboard.ts` | Dashboard API functions |
| `src/hooks/useEntries.ts` | React Query hooks for entries |
| `src/hooks/useTimeLogs.ts` | React Query hooks for timelogs |
| `src/hooks/useDashboard.ts` | React Query hooks for dashboard |
| `src/hooks/useDebounce.ts` | Debounce hook |
| `src/components/layout/AppShell.tsx` | Main layout with sidebar |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `src/components/layout/TopBar.tsx` | Top bar with search + date + theme |
| `src/components/entries/QuickCapture.tsx` | Fast entry creation |
| `src/components/entries/EntryCard.tsx` | Single entry display |
| `src/components/entries/EntryList.tsx` | Filterable entry list |
| `src/components/entries/EntryForm.tsx` | Full entry form (Sheet) |
| `src/components/entries/EntryFilters.tsx` | Filter controls |
| `src/components/timelogs/TimeLogForm.tsx` | TimeLog creation form |
| `src/components/timelogs/TimeLogTable.tsx` | TimeLog table view |
| `src/components/timelogs/WeeklySummary.tsx` | Weekly hours per project |
| `src/components/dashboard/DailyView.tsx` | Main dashboard page |
| `src/components/dashboard/StandupCard.tsx` | Standup prep view |
| `src/components/dashboard/PinnedEntries.tsx` | Pinned entries section |

### Test files

| File | Tests |
|---|---|
| `src/test/java/.../entry/EntryServiceTest.java` | Unit tests for EntryService |
| `src/test/java/.../entry/EntryControllerIntTest.java` | Integration tests for Entry API |
| `src/test/java/.../timelog/TimeLogServiceTest.java` | Unit tests for TimeLogService |
| `src/test/java/.../timelog/TimeLogControllerIntTest.java` | Integration tests for TimeLog API |
| `src/test/java/.../dashboard/DashboardServiceTest.java` | Unit tests for dashboard logic |
| `src/test/java/.../export/MarkdownExportServiceTest.java` | Unit tests for markdown export |

---

## Task 0: Install Java and Verify Environment

**Files:**
- None (system setup)

- [ ] **Step 1: Install Java 21 via SDKMAN**

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 21.0.7-tem
```

- [ ] **Step 2: Verify Java installation**

Run: `java -version`
Expected: `openjdk version "21.0.7"` (or similar 21.x)

Run: `mvn --version` or note that Maven wrapper will be used (no global install needed).

---

## Task 1: Scaffold Spring Boot Project

**Files:**
- Create: `pom.xml`
- Create: `src/main/java/com/workboard/WorkboardApplication.java`
- Create: `src/main/resources/application.yml`
- Create: `.gitignore`
- Create: `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`

- [ ] **Step 1: Generate project with Spring Initializr**

Run:
```bash
curl -s "https://start.spring.io/starter.zip" \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.5 \
  -d baseDir=. \
  -d groupId=com.workboard \
  -d artifactId=workboard \
  -d name=workboard \
  -d packageName=com.workboard \
  -d javaVersion=21 \
  -d dependencies=web,data-jpa,flyway,validation,actuator \
  -o workboard-init.zip
unzip workboard-init.zip -d .
```

If `curl` to start.spring.io doesn't work or layout differs, create files manually per steps below.

- [ ] **Step 2: Add SQLite dependencies to `pom.xml`**

Add inside `<dependencies>`:

```xml
<!-- SQLite JDBC -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.49.1.0</version>
</dependency>

<!-- Hibernate Community Dialects (includes SQLiteDialect) -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-community-dialects</artifactId>
</dependency>

<!-- Flyway doesn't have native SQLite support, use JDBC baseline -->
```

- [ ] **Step 3: Configure `application.yml`**

```yaml
server:
  port: ${WORKBOARD_PORT:8080}

spring:
  datasource:
    url: jdbc:sqlite:${WORKBOARD_DB:./workboard.db}
    driver-class-name: org.sqlite.JDBC
    hikari:
      maximum-pool-size: 1
  jpa:
    hibernate:
      ddl-auto: validate
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

logging:
  level:
    com.workboard: DEBUG
    org.hibernate.SQL: DEBUG
```

- [ ] **Step 4: Create `WorkboardApplication.java`**

```java
package com.workboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkboardApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkboardApplication.class, args);
    }
}
```

- [ ] **Step 5: Create `.gitignore`**

```gitignore
# Build
target/
!.mvn/wrapper/maven-wrapper.jar

# IDE
.idea/
*.iml
.vscode/
.project
.classpath
.settings/

# SQLite
*.db
*.db-journal
*.db-wal
*.db-shm

# Backups
backups/

# Node (frontend)
src/main/frontend/node_modules/
src/main/frontend/dist/

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 6: Initialize git repo and commit**

```bash
git init
git add .
git commit -m "chore: scaffold Spring Boot project with SQLite + Flyway"
```

- [ ] **Step 7: Verify project compiles**

Run: `./mvnw compile`
Expected: `BUILD SUCCESS` (may fail on Flyway validation since no migrations yet - that's OK at this stage)

---

## Task 2: Flyway Migrations

**Files:**
- Create: `src/main/resources/db/migration/V1__create_entry.sql`
- Create: `src/main/resources/db/migration/V1_1__create_entry_tag.sql`
- Create: `src/main/resources/db/migration/V1_2__create_time_log.sql`

- [ ] **Step 1: Create `V1__create_entry.sql`**

```sql
CREATE TABLE entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    date DATE NOT NULL DEFAULT (date('now')),
    external_ref VARCHAR(100),
    pinned BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_entry_date ON entry(date);
CREATE INDEX idx_entry_type ON entry(type);
CREATE INDEX idx_entry_status ON entry(status);
```

- [ ] **Step 2: Create `V1_1__create_entry_tag.sql`**

```sql
CREATE TABLE entry_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entry(id) ON DELETE CASCADE,
    UNIQUE(entry_id, tag)
);

CREATE INDEX idx_entry_tag_tag ON entry_tag(tag);
CREATE INDEX idx_entry_tag_entry ON entry_tag(entry_id);
```

- [ ] **Step 3: Create `V1_2__create_time_log.sql`**

```sql
CREATE TABLE time_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    project VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES entry(id) ON DELETE SET NULL
);

CREATE INDEX idx_timelog_date ON time_log(date);
```

- [ ] **Step 4: Temporarily set ddl-auto to none and test migrations**

Flyway with SQLite needs the `flyway-database-sqlite` dependency or manual SQL. Verify:

Run: `./mvnw spring-boot:run`
Expected: Application starts, Flyway runs 3 migrations, tables created in `workboard.db`. Then Ctrl+C.

If Flyway lacks SQLite support, add:
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-sqlite</artifactId>
</dependency>
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Flyway migrations for entry, entry_tag, time_log"
```

---

## Task 3: JPA Config + Entry Entity

**Files:**
- Create: `src/main/java/com/workboard/config/JpaConfig.java`
- Create: `src/main/java/com/workboard/entry/EntryType.java`
- Create: `src/main/java/com/workboard/entry/EntryStatus.java`
- Create: `src/main/java/com/workboard/entry/EntryEntity.java`
- Create: `src/main/java/com/workboard/entry/EntryTagEntity.java`
- Create: `src/main/java/com/workboard/entry/EntryRepository.java`
- Create: `src/main/java/com/workboard/entry/EntryTagRepository.java`
- Test: `src/test/java/com/workboard/entry/EntryRepositoryIntTest.java`

- [ ] **Step 1: Create `JpaConfig.java`**

```java
package com.workboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
```

- [ ] **Step 2: Create enums**

`EntryType.java`:
```java
package com.workboard.entry;

public enum EntryType {
    TASK, NOTE, MEETING_NOTE, REMINDER
}
```

`EntryStatus.java`:
```java
package com.workboard.entry;

public enum EntryStatus {
    OPEN, IN_PROGRESS, DONE, CANCELLED
}
```

- [ ] **Step 3: Create `EntryEntity.java`**

```java
package com.workboard.entry;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entry")
@EntityListeners(AuditingEntityListener.class)
public class EntryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntryType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntryStatus status = EntryStatus.OPEN;

    @Column(nullable = false)
    private LocalDate date = LocalDate.now();

    @Column(name = "external_ref", length = 100)
    private String externalRef;

    @Column(nullable = false)
    private boolean pinned = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntryTagEntity> tags = new ArrayList<>();

    // Getters and setters

    public Long getId() { return id; }

    public EntryType getType() { return type; }
    public void setType(EntryType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public EntryStatus getStatus() { return status; }
    public void setStatus(EntryStatus status) { this.status = status; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getExternalRef() { return externalRef; }
    public void setExternalRef(String externalRef) { this.externalRef = externalRef; }

    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<EntryTagEntity> getTags() { return tags; }

    public void addTag(String tag) {
        var entryTag = new EntryTagEntity();
        entryTag.setEntry(this);
        entryTag.setTag(tag);
        this.tags.add(entryTag);
    }

    public void clearTags() {
        this.tags.clear();
    }
}
```

- [ ] **Step 4: Create `EntryTagEntity.java`**

```java
package com.workboard.entry;

import jakarta.persistence.*;

@Entity
@Table(name = "entry_tag", uniqueConstraints = @UniqueConstraint(columnNames = {"entry_id", "tag"}))
public class EntryTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private EntryEntity entry;

    @Column(nullable = false, length = 50)
    private String tag;

    public Long getId() { return id; }

    public EntryEntity getEntry() { return entry; }
    public void setEntry(EntryEntity entry) { this.entry = entry; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
}
```

- [ ] **Step 5: Create `EntryRepository.java`**

```java
package com.workboard.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EntryRepository extends JpaRepository<EntryEntity, Long> {

    Page<EntryEntity> findByDate(LocalDate date, Pageable pageable);

    Page<EntryEntity> findByDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    Page<EntryEntity> findByType(EntryType type, Pageable pageable);

    Page<EntryEntity> findByStatus(EntryStatus status, Pageable pageable);

    Page<EntryEntity> findByPinnedTrue(Pageable pageable);

    List<EntryEntity> findByDateAndStatusIn(LocalDate date, List<EntryStatus> statuses);

    @Query("SELECT e FROM EntryEntity e JOIN e.tags t WHERE t.tag = :tag")
    Page<EntryEntity> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT e FROM EntryEntity e WHERE e.date = :date ORDER BY e.pinned DESC, e.createdAt DESC")
    List<EntryEntity> findByDateOrderByPinnedDescCreatedAtDesc(@Param("date") LocalDate date);
}
```

- [ ] **Step 6: Create `EntryTagRepository.java`**

```java
package com.workboard.entry;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EntryTagRepository extends JpaRepository<EntryTagEntity, Long> {
}
```

- [ ] **Step 7: Write integration test**

`src/test/java/com/workboard/entry/EntryRepositoryIntTest.java`:

```java
package com.workboard.entry;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:sqlite::memory:",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false"
})
class EntryRepositoryIntTest {

    @Autowired
    private EntryRepository entryRepository;

    @Test
    void shouldSaveAndRetrieveEntry() {
        var entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Test task");
        entry.setDate(LocalDate.of(2026, 4, 17));
        entry.addTag("backend");
        entry.addTag("urgent");

        var saved = entryRepository.save(entry);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Test task");
        assertThat(saved.getTags()).hasSize(2);
        assertThat(saved.getStatus()).isEqualTo(EntryStatus.OPEN);
    }

    @Test
    void shouldFindByDate() {
        var today = LocalDate.of(2026, 4, 17);

        var entry1 = new EntryEntity();
        entry1.setType(EntryType.TASK);
        entry1.setTitle("Today task");
        entry1.setDate(today);
        entryRepository.save(entry1);

        var entry2 = new EntryEntity();
        entry2.setType(EntryType.NOTE);
        entry2.setTitle("Yesterday note");
        entry2.setDate(today.minusDays(1));
        entryRepository.save(entry2);

        var results = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(today);
        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getTitle()).isEqualTo("Today task");
    }
}
```

- [ ] **Step 8: Run tests**

Run: `./mvnw test -pl . -Dtest=EntryRepositoryIntTest`
Expected: 2 tests PASS

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add JPA config, Entry + EntryTag entities and repository"
```

---

## Task 4: Entry DTOs + Service

**Files:**
- Create: `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- Create: `src/main/java/com/workboard/entry/UpdateEntryRequest.java`
- Create: `src/main/java/com/workboard/entry/EntryResponse.java`
- Create: `src/main/java/com/workboard/entry/EntryService.java`
- Test: `src/test/java/com/workboard/entry/EntryServiceTest.java`

- [ ] **Step 1: Create `CreateEntryRequest.java`**

```java
package com.workboard.entry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateEntryRequest(
    @NotNull EntryType type,
    @NotBlank @Size(max = 200) String title,
    String body,
    LocalDate date,
    List<String> tags,
    String externalRef
) {
    public CreateEntryRequest {
        if (date == null) date = LocalDate.now();
        if (tags == null) tags = List.of();
    }
}
```

- [ ] **Step 2: Create `UpdateEntryRequest.java`**

```java
package com.workboard.entry;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdateEntryRequest(
    EntryType type,
    @Size(max = 200) String title,
    String body,
    EntryStatus status,
    LocalDate date,
    List<String> tags,
    String externalRef,
    Boolean pinned
) {}
```

- [ ] **Step 3: Create `EntryResponse.java`**

```java
package com.workboard.entry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record EntryResponse(
    Long id,
    EntryType type,
    String title,
    String body,
    EntryStatus status,
    LocalDate date,
    String externalRef,
    boolean pinned,
    List<String> tags,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static EntryResponse from(EntryEntity entity) {
        return new EntryResponse(
            entity.getId(),
            entity.getType(),
            entity.getTitle(),
            entity.getBody(),
            entity.getStatus(),
            entity.getDate(),
            entity.getExternalRef(),
            entity.isPinned(),
            entity.getTags().stream().map(EntryTagEntity::getTag).toList(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
```

- [ ] **Step 4: Create `EntryService.java`**

```java
package com.workboard.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class EntryService {

    private final EntryRepository entryRepository;

    public EntryService(EntryRepository entryRepository) {
        this.entryRepository = entryRepository;
    }

    @Transactional(readOnly = true)
    public Page<EntryResponse> findAll(Pageable pageable) {
        return entryRepository.findAll(pageable).map(EntryResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<EntryResponse> findByDate(LocalDate date, Pageable pageable) {
        return entryRepository.findByDate(date, pageable).map(EntryResponse::from);
    }

    @Transactional(readOnly = true)
    public EntryResponse findById(Long id) {
        return entryRepository.findById(id)
            .map(EntryResponse::from)
            .orElseThrow(() -> new EntryNotFoundException(id));
    }

    @Transactional
    public EntryResponse create(CreateEntryRequest request) {
        var entity = new EntryEntity();
        entity.setType(request.type());
        entity.setTitle(request.title());
        entity.setBody(request.body());
        entity.setDate(request.date());
        entity.setExternalRef(request.externalRef());
        request.tags().forEach(entity::addTag);

        return EntryResponse.from(entryRepository.save(entity));
    }

    @Transactional
    public EntryResponse update(Long id, UpdateEntryRequest request) {
        var entity = entryRepository.findById(id)
            .orElseThrow(() -> new EntryNotFoundException(id));

        if (request.type() != null) entity.setType(request.type());
        if (request.title() != null) entity.setTitle(request.title());
        if (request.body() != null) entity.setBody(request.body());
        if (request.status() != null) entity.setStatus(request.status());
        if (request.date() != null) entity.setDate(request.date());
        if (request.externalRef() != null) entity.setExternalRef(request.externalRef());
        if (request.pinned() != null) entity.setPinned(request.pinned());
        if (request.tags() != null) {
            entity.clearTags();
            request.tags().forEach(entity::addTag);
        }

        return EntryResponse.from(entryRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!entryRepository.existsById(id)) {
            throw new EntryNotFoundException(id);
        }
        entryRepository.deleteById(id);
    }
}
```

- [ ] **Step 5: Create `EntryNotFoundException.java`**

```java
package com.workboard.entry;

public class EntryNotFoundException extends RuntimeException {
    public EntryNotFoundException(Long id) {
        super("Entry not found: " + id);
    }
}
```

- [ ] **Step 6: Write unit tests for `EntryService`**

`src/test/java/com/workboard/entry/EntryServiceTest.java`:

```java
package com.workboard.entry;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntryServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @InjectMocks
    private EntryService entryService;

    @Test
    void shouldCreateEntry() {
        var request = new CreateEntryRequest(
            EntryType.TASK, "Test task", null,
            LocalDate.of(2026, 4, 17), List.of("backend"), null
        );

        var entity = new EntryEntity();
        entity.setType(EntryType.TASK);
        entity.setTitle("Test task");
        entity.setDate(LocalDate.of(2026, 4, 17));

        when(entryRepository.save(any())).thenReturn(entity);

        var result = entryService.create(request);

        assertThat(result.title()).isEqualTo("Test task");
        assertThat(result.type()).isEqualTo(EntryType.TASK);
        verify(entryRepository).save(any());
    }

    @Test
    void shouldThrowWhenEntryNotFound() {
        when(entryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> entryService.findById(999L))
            .isInstanceOf(EntryNotFoundException.class)
            .hasMessageContaining("999");
    }

    @Test
    void shouldDeleteEntry() {
        when(entryRepository.existsById(1L)).thenReturn(true);

        entryService.delete(1L);

        verify(entryRepository).deleteById(1L);
    }

    @Test
    void shouldThrowWhenDeletingNonExistent() {
        when(entryRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> entryService.delete(999L))
            .isInstanceOf(EntryNotFoundException.class);
    }
}
```

- [ ] **Step 7: Run tests**

Run: `./mvnw test -Dtest=EntryServiceTest`
Expected: 4 tests PASS

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add Entry DTOs, service with CRUD operations"
```

---

## Task 5: Error Handling + Entry Controller

**Files:**
- Create: `src/main/java/com/workboard/shared/ApiError.java`
- Create: `src/main/java/com/workboard/shared/GlobalExceptionHandler.java`
- Create: `src/main/java/com/workboard/shared/PageResponse.java`
- Create: `src/main/java/com/workboard/entry/EntryController.java`
- Create: `src/main/java/com/workboard/config/WebConfig.java`
- Test: `src/test/java/com/workboard/entry/EntryControllerIntTest.java`

- [ ] **Step 1: Create `ApiError.java`**

```java
package com.workboard.shared;

import java.util.List;

public record ApiError(
    String code,
    String message,
    List<FieldError> details
) {
    public record FieldError(String field, String message, String code) {}

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, List.of());
    }

    public static ApiError validation(List<FieldError> details) {
        return new ApiError("validation_error", "Request validation failed", details);
    }
}
```

- [ ] **Step 2: Create `GlobalExceptionHandler.java`**

```java
package com.workboard.shared;

import com.workboard.entry.EntryNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, ApiError>> handleValidation(MethodArgumentNotValidException ex) {
        var details = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ApiError.FieldError(fe.getField(), fe.getDefaultMessage(), fe.getCode()))
            .toList();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(Map.of("error", ApiError.validation(details)));
    }

    @ExceptionHandler(EntryNotFoundException.class)
    public ResponseEntity<Map<String, ApiError>> handleNotFound(EntryNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", ApiError.of("not_found", ex.getMessage())));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, ApiError>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", ApiError.of("internal_error", "An unexpected error occurred")));
    }
}
```

- [ ] **Step 3: Create `PageResponse.java`**

```java
package com.workboard.shared;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
    List<T> data,
    Meta meta
) {
    public record Meta(long total, int page, int size, int totalPages) {}

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            new Meta(page.getTotalElements(), page.getNumber(), page.getSize(), page.getTotalPages())
        );
    }
}
```

- [ ] **Step 4: Create `WebConfig.java`**

```java
package com.workboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE");
    }
}
```

- [ ] **Step 5: Create `EntryController.java`**

```java
package com.workboard.entry;

import com.workboard.shared.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/entries")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @GetMapping
    public PageResponse<EntryResponse> list(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (date != null) {
            return PageResponse.from(entryService.findByDate(date, pageable));
        }
        return PageResponse.from(entryService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public Map<String, EntryResponse> get(@PathVariable Long id) {
        return Map.of("data", entryService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, EntryResponse>> create(@Valid @RequestBody CreateEntryRequest request) {
        var entry = entryService.create(request);
        return ResponseEntity
            .created(URI.create("/api/v1/entries/" + entry.id()))
            .body(Map.of("data", entry));
    }

    @PatchMapping("/{id}")
    public Map<String, EntryResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateEntryRequest request) {
        return Map.of("data", entryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 6: Write integration test**

`src/test/java/com/workboard/entry/EntryControllerIntTest.java`:

```java
package com.workboard.entry;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:sqlite::memory:",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false"
})
class EntryControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateAndGetEntry() throws Exception {
        var request = new CreateEntryRequest(
            EntryType.TASK, "Test task", "Body text",
            LocalDate.of(2026, 4, 17), List.of("backend"), "JIRA-123"
        );

        var result = mockMvc.perform(post("/api/v1/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.title").value("Test task"))
            .andExpect(jsonPath("$.data.tags[0]").value("backend"))
            .andReturn();

        // Extract ID from response
        var body = objectMapper.readTree(result.getResponse().getContentAsString());
        var id = body.get("data").get("id").asLong();

        mockMvc.perform(get("/api/v1/entries/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title").value("Test task"));
    }

    @Test
    void shouldReturn404ForNonExistent() throws Exception {
        mockMvc.perform(get("/api/v1/entries/99999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void shouldReturn422ForInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/v1/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"TASK\"}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void shouldDeleteEntry() throws Exception {
        var request = new CreateEntryRequest(
            EntryType.NOTE, "To delete", null,
            LocalDate.of(2026, 4, 17), List.of(), null
        );

        var result = mockMvc.perform(post("/api/v1/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andReturn();

        var body = objectMapper.readTree(result.getResponse().getContentAsString());
        var id = body.get("data").get("id").asLong();

        mockMvc.perform(delete("/api/v1/entries/" + id))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/entries/" + id))
            .andExpect(status().isNotFound());
    }
}
```

- [ ] **Step 7: Run tests**

Run: `./mvnw test`
Expected: All tests PASS (EntryServiceTest + EntryRepositoryIntTest + EntryControllerIntTest)

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add Entry REST API with error handling and integration tests"
```

---

## Task 6: TimeLog CRUD

**Files:**
- Create: `src/main/java/com/workboard/timelog/TimeLogEntity.java`
- Create: `src/main/java/com/workboard/timelog/TimeLogRepository.java`
- Create: `src/main/java/com/workboard/timelog/CreateTimeLogRequest.java`
- Create: `src/main/java/com/workboard/timelog/TimeLogResponse.java`
- Create: `src/main/java/com/workboard/timelog/TimeLogService.java`
- Create: `src/main/java/com/workboard/timelog/TimeLogNotFoundException.java`
- Create: `src/main/java/com/workboard/timelog/TimeLogController.java`
- Test: `src/test/java/com/workboard/timelog/TimeLogServiceTest.java`
- Test: `src/test/java/com/workboard/timelog/TimeLogControllerIntTest.java`
- Modify: `src/main/java/com/workboard/shared/GlobalExceptionHandler.java` (add TimeLogNotFoundException handler)

- [ ] **Step 1: Create `TimeLogEntity.java`**

```java
package com.workboard.timelog;

import com.workboard.entry.EntryEntity;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_log")
@EntityListeners(AuditingEntityListener.class)
public class TimeLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id")
    private EntryEntity entry;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal hours;

    @Column(nullable = false, length = 100)
    private String project;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and setters
    public Long getId() { return id; }
    public EntryEntity getEntry() { return entry; }
    public void setEntry(EntryEntity entry) { this.entry = entry; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getHours() { return hours; }
    public void setHours(BigDecimal hours) { this.hours = hours; }
    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 2: Create `TimeLogRepository.java`**

```java
package com.workboard.timelog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLogEntity, Long> {

    List<TimeLogEntity> findByDate(LocalDate date);

    List<TimeLogEntity> findByDateBetween(LocalDate from, LocalDate to);

    List<TimeLogEntity> findByProject(String project);

    List<TimeLogEntity> findByEntryId(Long entryId);

    @Query("SELECT t.project, SUM(t.hours) FROM TimeLogEntity t WHERE t.date BETWEEN :from AND :to GROUP BY t.project")
    List<Object[]> sumHoursByProjectBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
```

- [ ] **Step 3: Create DTOs**

`CreateTimeLogRequest.java`:
```java
package com.workboard.timelog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTimeLogRequest(
    Long entryId,
    @NotNull LocalDate date,
    @NotNull @DecimalMin("0.01") BigDecimal hours,
    @NotBlank @Size(max = 100) String project,
    String description
) {}
```

`TimeLogResponse.java`:
```java
package com.workboard.timelog;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TimeLogResponse(
    Long id,
    Long entryId,
    LocalDate date,
    BigDecimal hours,
    String project,
    String description,
    LocalDateTime createdAt
) {
    public static TimeLogResponse from(TimeLogEntity entity) {
        return new TimeLogResponse(
            entity.getId(),
            entity.getEntry() != null ? entity.getEntry().getId() : null,
            entity.getDate(),
            entity.getHours(),
            entity.getProject(),
            entity.getDescription(),
            entity.getCreatedAt()
        );
    }
}
```

- [ ] **Step 4: Create `TimeLogNotFoundException.java`**

```java
package com.workboard.timelog;

public class TimeLogNotFoundException extends RuntimeException {
    public TimeLogNotFoundException(Long id) {
        super("TimeLog not found: " + id);
    }
}
```

- [ ] **Step 5: Create `TimeLogService.java`**

```java
package com.workboard.timelog;

import com.workboard.entry.EntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final EntryRepository entryRepository;

    public TimeLogService(TimeLogRepository timeLogRepository, EntryRepository entryRepository) {
        this.timeLogRepository = timeLogRepository;
        this.entryRepository = entryRepository;
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> findByDate(LocalDate date) {
        return timeLogRepository.findByDate(date).stream().map(TimeLogResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> findByDateRange(LocalDate from, LocalDate to) {
        return timeLogRepository.findByDateBetween(from, to).stream().map(TimeLogResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TimeLogResponse findById(Long id) {
        return timeLogRepository.findById(id)
            .map(TimeLogResponse::from)
            .orElseThrow(() -> new TimeLogNotFoundException(id));
    }

    @Transactional
    public TimeLogResponse create(CreateTimeLogRequest request) {
        var entity = new TimeLogEntity();
        entity.setDate(request.date());
        entity.setHours(request.hours());
        entity.setProject(request.project());
        entity.setDescription(request.description());

        if (request.entryId() != null) {
            entryRepository.findById(request.entryId())
                .ifPresent(entity::setEntry);
        }

        return TimeLogResponse.from(timeLogRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!timeLogRepository.existsById(id)) {
            throw new TimeLogNotFoundException(id);
        }
        timeLogRepository.deleteById(id);
    }
}
```

- [ ] **Step 6: Create `TimeLogController.java`**

```java
package com.workboard.timelog;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/timelogs")
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @GetMapping
    public Map<String, List<TimeLogResponse>> list(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo) {

        List<TimeLogResponse> results;
        if (date != null) {
            results = timeLogService.findByDate(date);
        } else if (dateFrom != null && dateTo != null) {
            results = timeLogService.findByDateRange(dateFrom, dateTo);
        } else {
            results = timeLogService.findByDate(LocalDate.now());
        }
        return Map.of("data", results);
    }

    @GetMapping("/{id}")
    public Map<String, TimeLogResponse> get(@PathVariable Long id) {
        return Map.of("data", timeLogService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, TimeLogResponse>> create(@Valid @RequestBody CreateTimeLogRequest request) {
        var timeLog = timeLogService.create(request);
        return ResponseEntity
            .created(URI.create("/api/v1/timelogs/" + timeLog.id()))
            .body(Map.of("data", timeLog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 7: Add TimeLogNotFoundException to GlobalExceptionHandler**

Add to `GlobalExceptionHandler.java`:
```java
@ExceptionHandler(TimeLogNotFoundException.class)
public ResponseEntity<Map<String, ApiError>> handleTimeLogNotFound(TimeLogNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", ApiError.of("not_found", ex.getMessage())));
}
```

- [ ] **Step 8: Write tests**

`src/test/java/com/workboard/timelog/TimeLogControllerIntTest.java`:

```java
package com.workboard.timelog;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:sqlite::memory:",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false"
})
class TimeLogControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateAndGetTimeLog() throws Exception {
        var request = new CreateTimeLogRequest(
            null, LocalDate.of(2026, 4, 17),
            new BigDecimal("2.50"), "PROJ-A", "Backend work"
        );

        var result = mockMvc.perform(post("/api/v1/timelogs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.project").value("PROJ-A"))
            .andExpect(jsonPath("$.data.hours").value(2.50))
            .andReturn();

        var body = objectMapper.readTree(result.getResponse().getContentAsString());
        var id = body.get("data").get("id").asLong();

        mockMvc.perform(get("/api/v1/timelogs/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.project").value("PROJ-A"));
    }

    @Test
    void shouldReturn422ForInvalidTimeLog() throws Exception {
        mockMvc.perform(post("/api/v1/timelogs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"date\":\"2026-04-17\",\"hours\":0,\"project\":\"\"}"))
            .andExpect(status().isUnprocessableEntity());
    }
}
```

- [ ] **Step 9: Run all tests**

Run: `./mvnw test`
Expected: All tests PASS

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: add TimeLog CRUD with REST API and tests"
```

---

## Task 7: Dashboard + Export APIs

**Files:**
- Create: `src/main/java/com/workboard/dashboard/DailyResponse.java`
- Create: `src/main/java/com/workboard/dashboard/StandupResponse.java`
- Create: `src/main/java/com/workboard/dashboard/WeeklyResponse.java`
- Create: `src/main/java/com/workboard/dashboard/DashboardService.java`
- Create: `src/main/java/com/workboard/dashboard/DashboardController.java`
- Create: `src/main/java/com/workboard/export/MarkdownExportService.java`
- Create: `src/main/java/com/workboard/export/ExportController.java`
- Test: `src/test/java/com/workboard/dashboard/DashboardServiceTest.java`
- Test: `src/test/java/com/workboard/export/MarkdownExportServiceTest.java`

- [ ] **Step 1: Create Dashboard DTOs**

`DailyResponse.java`:
```java
package com.workboard.dashboard;

import com.workboard.entry.EntryResponse;
import com.workboard.timelog.TimeLogResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailyResponse(
    LocalDate date,
    List<EntryResponse> entries,
    List<EntryResponse> pinned,
    List<TimeLogResponse> timeLogs,
    BigDecimal totalHours
) {}
```

`StandupResponse.java`:
```java
package com.workboard.dashboard;

import com.workboard.entry.EntryResponse;

import java.time.LocalDate;
import java.util.List;

public record StandupResponse(
    LocalDate yesterday,
    LocalDate today,
    List<EntryResponse> yesterdayDone,
    List<EntryResponse> todayPlan
) {}
```

`WeeklyResponse.java`:
```java
package com.workboard.dashboard;

import java.math.BigDecimal;
import java.util.Map;

public record WeeklyResponse(
    String week,
    Map<String, BigDecimal> hoursByProject,
    BigDecimal totalHours
) {}
```

- [ ] **Step 2: Create `DashboardService.java`**

```java
package com.workboard.dashboard;

import com.workboard.entry.*;
import com.workboard.timelog.TimeLogRepository;
import com.workboard.timelog.TimeLogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final EntryRepository entryRepository;
    private final TimeLogRepository timeLogRepository;

    public DashboardService(EntryRepository entryRepository, TimeLogRepository timeLogRepository) {
        this.entryRepository = entryRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public DailyResponse getDaily(LocalDate date) {
        var entries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)
            .stream().map(EntryResponse::from).toList();
        var pinned = entries.stream().filter(EntryResponse::pinned).toList();
        var timeLogs = timeLogRepository.findByDate(date).stream().map(TimeLogResponse::from).toList();
        var totalHours = timeLogs.stream().map(TimeLogResponse::hours).reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DailyResponse(date, entries, pinned, timeLogs, totalHours);
    }

    @Transactional(readOnly = true)
    public StandupResponse getStandup() {
        var today = LocalDate.now();
        var yesterday = today.minusDays(today.getDayOfWeek() == DayOfWeek.MONDAY ? 3 : 1);

        var yesterdayDone = entryRepository.findByDateAndStatusIn(yesterday, List.of(EntryStatus.DONE))
            .stream().map(EntryResponse::from).toList();
        var todayPlan = entryRepository.findByDateAndStatusIn(today, List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS))
            .stream().map(EntryResponse::from).toList();

        return new StandupResponse(yesterday, today, yesterdayDone, todayPlan);
    }

    @Transactional(readOnly = true)
    public WeeklyResponse getWeekly(LocalDate weekStart) {
        var weekEnd = weekStart.plusDays(6);
        var rows = timeLogRepository.sumHoursByProjectBetween(weekStart, weekEnd);

        var hoursByProject = new LinkedHashMap<String, BigDecimal>();
        var totalHours = BigDecimal.ZERO;
        for (var row : rows) {
            var project = (String) row[0];
            var hours = (BigDecimal) row[1];
            hoursByProject.put(project, hours);
            totalHours = totalHours.add(hours);
        }

        var wf = WeekFields.of(Locale.getDefault());
        var weekLabel = weekStart.getYear() + "-W" + String.format("%02d", weekStart.get(wf.weekOfWeekBasedYear()));

        return new WeeklyResponse(weekLabel, hoursByProject, totalHours);
    }
}
```

- [ ] **Step 3: Create `DashboardController.java`**

```java
package com.workboard.dashboard;

import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/daily")
    public Map<String, DailyResponse> daily(@RequestParam(required = false) LocalDate date) {
        return Map.of("data", dashboardService.getDaily(date != null ? date : LocalDate.now()));
    }

    @GetMapping("/standup")
    public Map<String, StandupResponse> standup() {
        return Map.of("data", dashboardService.getStandup());
    }

    @GetMapping("/weekly")
    public Map<String, WeeklyResponse> weekly(@RequestParam(required = false) LocalDate weekStart) {
        if (weekStart == null) {
            weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        return Map.of("data", dashboardService.getWeekly(weekStart));
    }
}
```

- [ ] **Step 4: Create `MarkdownExportService.java`**

```java
package com.workboard.export;

import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryResponse;
import com.workboard.timelog.TimeLogRepository;
import com.workboard.timelog.TimeLogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
public class MarkdownExportService {

    private final EntryRepository entryRepository;
    private final TimeLogRepository timeLogRepository;

    public MarkdownExportService(EntryRepository entryRepository, TimeLogRepository timeLogRepository) {
        this.entryRepository = entryRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public String exportDay(LocalDate date) {
        var entries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)
            .stream().map(EntryResponse::from).toList();
        var timeLogs = timeLogRepository.findByDate(date)
            .stream().map(TimeLogResponse::from).toList();

        var sb = new StringBuilder();
        sb.append("# ").append(date.format(DateTimeFormatter.ISO_LOCAL_DATE)).append("\n\n");

        if (!entries.isEmpty()) {
            sb.append("## Entries\n\n");
            for (var entry : entries) {
                var statusIcon = switch (entry.status()) {
                    case DONE -> "[x]";
                    case IN_PROGRESS -> "[-]";
                    case CANCELLED -> "[~]";
                    default -> "[ ]";
                };
                sb.append("- ").append(statusIcon).append(" **").append(entry.title()).append("**");
                sb.append(" (").append(entry.type()).append(")");
                if (entry.externalRef() != null) {
                    sb.append(" `").append(entry.externalRef()).append("`");
                }
                if (!entry.tags().isEmpty()) {
                    sb.append(" ").append(entry.tags().stream().map(t -> "#" + t).collect(Collectors.joining(" ")));
                }
                sb.append("\n");
                if (entry.body() != null && !entry.body().isBlank()) {
                    sb.append("  ").append(entry.body().replace("\n", "\n  ")).append("\n");
                }
            }
            sb.append("\n");
        }

        if (!timeLogs.isEmpty()) {
            sb.append("## Time Log\n\n");
            sb.append("| Project | Hours | Description |\n");
            sb.append("|---|---|---|\n");
            for (var tl : timeLogs) {
                sb.append("| ").append(tl.project())
                    .append(" | ").append(tl.hours())
                    .append(" | ").append(tl.description() != null ? tl.description() : "")
                    .append(" |\n");
            }
        }

        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String exportRange(LocalDate from, LocalDate to) {
        var sb = new StringBuilder();
        var current = from;
        while (!current.isAfter(to)) {
            sb.append(exportDay(current));
            sb.append("\n---\n\n");
            current = current.plusDays(1);
        }
        return sb.toString();
    }
}
```

- [ ] **Step 5: Create `ExportController.java`**

```java
package com.workboard.export;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final MarkdownExportService markdownExportService;

    public ExportController(MarkdownExportService markdownExportService) {
        this.markdownExportService = markdownExportService;
    }

    @GetMapping("/markdown")
    public ResponseEntity<String> exportMarkdown(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo) {

        String markdown;
        if (date != null) {
            markdown = markdownExportService.exportDay(date);
        } else if (dateFrom != null && dateTo != null) {
            markdown = markdownExportService.exportRange(dateFrom, dateTo);
        } else {
            markdown = markdownExportService.exportDay(LocalDate.now());
        }

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_PLAIN)
            .body(markdown);
    }
}
```

- [ ] **Step 6: Write dashboard test**

`src/test/java/com/workboard/dashboard/DashboardServiceTest.java`:

```java
package com.workboard.dashboard;

import com.workboard.entry.*;
import com.workboard.timelog.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private TimeLogRepository timeLogRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void shouldReturnDailyDashboard() {
        var date = LocalDate.of(2026, 4, 17);

        var entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Test task");
        entry.setDate(date);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        var result = dashboardService.getDaily(date);

        assertThat(result.date()).isEqualTo(date);
        assertThat(result.entries()).hasSize(1);
        assertThat(result.entries().getFirst().title()).isEqualTo("Test task");
    }

    @Test
    void shouldReturnStandup() {
        when(entryRepository.findByDateAndStatusIn(any(), eq(List.of(EntryStatus.DONE)))).thenReturn(List.of());
        when(entryRepository.findByDateAndStatusIn(any(), eq(List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS)))).thenReturn(List.of());

        var result = dashboardService.getStandup();

        assertThat(result.today()).isEqualTo(LocalDate.now());
        assertThat(result.yesterdayDone()).isEmpty();
        assertThat(result.todayPlan()).isEmpty();
    }
}
```

- [ ] **Step 7: Write export test**

`src/test/java/com/workboard/export/MarkdownExportServiceTest.java`:

```java
package com.workboard.export;

import com.workboard.entry.*;
import com.workboard.timelog.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarkdownExportServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private TimeLogRepository timeLogRepository;

    @InjectMocks
    private MarkdownExportService markdownExportService;

    @Test
    void shouldExportDayAsMarkdown() {
        var date = LocalDate.of(2026, 4, 17);

        var entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Deploy to prod");
        entry.setDate(date);
        entry.setStatus(EntryStatus.DONE);
        entry.addTag("backend");

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        var markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("# 2026-04-17");
        assertThat(markdown).contains("[x] **Deploy to prod**");
        assertThat(markdown).contains("#backend");
    }
}
```

- [ ] **Step 8: Run all tests**

Run: `./mvnw test`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add Dashboard, Standup, Weekly, and Markdown export APIs"
```

---

## Task 8: Backup Service

**Files:**
- Create: `src/main/java/com/workboard/backup/BackupService.java`
- Modify: `src/main/resources/application.yml` (add backup config)

- [ ] **Step 1: Create `BackupService.java`**

```java
package com.workboard.backup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    @Value("${workboard.backup.dir:./backups}")
    private String backupDir;

    @Value("${workboard.backup.retention:30}")
    private int retention;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Scheduled(cron = "0 0 2 * * *")
    public void dailyBackup() {
        try {
            var dbPath = datasourceUrl.replace("jdbc:sqlite:", "");
            var source = Path.of(dbPath);
            if (!Files.exists(source)) {
                log.warn("Database file not found for backup: {}", source);
                return;
            }

            var backupPath = Path.of(backupDir);
            Files.createDirectories(backupPath);

            var backupFile = backupPath.resolve(
                "workboard-" + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".db"
            );
            Files.copy(source, backupFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Backup created: {}", backupFile);

            cleanOldBackups(backupPath);
        } catch (IOException e) {
            log.error("Backup failed", e);
        }
    }

    private void cleanOldBackups(Path backupPath) throws IOException {
        try (Stream<Path> files = Files.list(backupPath)) {
            var backups = files
                .filter(p -> p.getFileName().toString().startsWith("workboard-"))
                .filter(p -> p.getFileName().toString().endsWith(".db"))
                .sorted(Comparator.reverseOrder())
                .toList();

            for (int i = retention; i < backups.size(); i++) {
                Files.delete(backups.get(i));
                log.info("Deleted old backup: {}", backups.get(i));
            }
        }
    }
}
```

- [ ] **Step 2: Enable scheduling in `WorkboardApplication.java`**

Add `@EnableScheduling`:
```java
@SpringBootApplication
@EnableScheduling
public class WorkboardApplication {
```

Add import: `import org.springframework.scheduling.annotation.EnableScheduling;`

- [ ] **Step 3: Add backup config to `application.yml`**

```yaml
workboard:
  backup:
    dir: ${WORKBOARD_BACKUP_DIR:./backups}
    retention: ${WORKBOARD_BACKUP_RETENTION:30}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add scheduled daily backup with configurable retention"
```

---

## Task 9: SPA Forwarding + Verify Backend Standalone

**Files:**
- Modify: `src/main/java/com/workboard/config/WebConfig.java`

- [ ] **Step 1: Add SPA forwarding to `WebConfig.java`**

Spring Boot needs to forward non-API routes to `index.html` for the React SPA:

```java
@Override
public void addViewControllers(ViewControllerRegistry registry) {
    // Forward SPA routes to index.html
    registry.addViewController("/").setViewName("forward:/index.html");
    registry.addViewController("/{path:^(?!api|actuator).*}").setViewName("forward:/index.html");
    registry.addViewController("/{path:^(?!api|actuator).*}/**").setViewName("forward:/index.html");
}
```

Add import: `import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;`

- [ ] **Step 2: Verify entire backend starts and APIs work**

Run: `./mvnw spring-boot:run`

Test in another terminal:
```bash
curl -s http://localhost:8080/api/v1/entries | python3 -m json.tool
curl -s -X POST http://localhost:8080/api/v1/entries \
  -H "Content-Type: application/json" \
  -d '{"type":"TASK","title":"First task","tags":["test"]}' | python3 -m json.tool
curl -s http://localhost:8080/api/v1/dashboard/standup | python3 -m json.tool
```

Expected: All return valid JSON responses.

- [ ] **Step 3: Run all backend tests**

Run: `./mvnw test`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add SPA forwarding, backend complete"
```

---

## Task 10: Scaffold React Frontend

**Files:**
- Create: `src/main/frontend/package.json`
- Create: `src/main/frontend/vite.config.ts`
- Create: `src/main/frontend/tsconfig.json`
- Create: `src/main/frontend/tsconfig.app.json`
- Create: `src/main/frontend/index.html`
- Create: `src/main/frontend/src/main.tsx`
- Create: `src/main/frontend/src/App.tsx`
- Create: `src/main/frontend/postcss.config.js`
- Create: `src/main/frontend/src/index.css`

- [ ] **Step 1: Create React project with Vite**

```bash
cd src/main/frontend
npm create vite@latest . -- --template react-ts
```

If directory already exists, use:
```bash
npm create vite@latest frontend-temp -- --template react-ts
cp -r frontend-temp/* src/main/frontend/
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @tanstack/react-query react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure `vite.config.ts`**

```typescript
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
})
```

- [ ] **Step 4: Set up `src/index.css` with Tailwind + Geist**

```css
@import "tailwindcss";

@font-face {
  font-family: 'Geist';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.4.1/dist/fonts/geist-sans/Geist-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.4.1/dist/fonts/geist-mono/GeistMono-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

:root {
  --background: #FAFAF9;
  --surface: #FFFFFF;
  --border: #E7E5E4;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
}

.dark {
  --background: #0C0A09;
  --surface: #1C1917;
  --border: #292524;
  --text-primary: #FAFAF9;
  --text-secondary: #A8A29E;
  --accent: #60A5FA;
  --accent-hover: #93C5FD;
}

body {
  font-family: var(--font-sans);
  background-color: var(--background);
  color: var(--text-primary);
}
```

- [ ] **Step 5: Set up `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: Set up `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Routes>
        <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Workboard</h1><p style={{ color: 'var(--text-secondary)' }}>Setup complete. Frontend scaffold ready.</p></div>} />
      </Routes>
    </div>
  )
}

export default App
```

- [ ] **Step 7: Verify frontend dev server**

```bash
cd src/main/frontend
npm run dev
```

Expected: Opens at http://localhost:5173, shows "Workboard" heading. API calls proxy to :8080.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold React frontend with Vite, Tailwind, React Query"
```

---

## Task 11: Initialize shadcn/ui

**Files:**
- Create: `src/main/frontend/components.json`
- Create: `src/main/frontend/src/lib/utils.ts`
- Create: `src/main/frontend/src/components/ui/` (various shadcn components)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd src/main/frontend
npx shadcn@latest init
```

When prompted:
- Style: New York
- Base color: Stone
- CSS variables: yes

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add input select button card badge table sheet sidebar alert-dialog skeleton sonner toggle-group textarea
```

- [ ] **Step 3: Verify components installed**

Check `src/main/frontend/src/components/ui/` contains the component files.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize shadcn/ui with required components"
```

---

## Task 12: TypeScript Types + API Client

**Files:**
- Create: `src/main/frontend/src/types/index.ts`
- Create: `src/main/frontend/src/api/client.ts`
- Create: `src/main/frontend/src/api/entries.ts`
- Create: `src/main/frontend/src/api/timelogs.ts`
- Create: `src/main/frontend/src/api/dashboard.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export type EntryType = 'TASK' | 'NOTE' | 'MEETING_NOTE' | 'REMINDER'
export type EntryStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface Entry {
  id: number
  type: EntryType
  title: string
  body: string | null
  status: EntryStatus
  date: string
  external_ref: string | null
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CreateEntryRequest {
  type: EntryType
  title: string
  body?: string
  date?: string
  tags?: string[]
  externalRef?: string
}

export interface UpdateEntryRequest {
  type?: EntryType
  title?: string
  body?: string
  status?: EntryStatus
  date?: string
  tags?: string[]
  externalRef?: string
  pinned?: boolean
}

export interface TimeLog {
  id: number
  entryId: number | null
  date: string
  hours: number
  project: string
  description: string | null
  created_at: string
}

export interface CreateTimeLogRequest {
  entryId?: number
  date: string
  hours: number
  project: string
  description?: string
}

export interface PageMeta {
  total: number
  page: number
  size: number
  totalPages: number
}

export interface PageResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface DataResponse<T> {
  data: T
}

export interface DailyDashboard {
  date: string
  entries: Entry[]
  pinned: Entry[]
  timeLogs: TimeLog[]
  totalHours: number
}

export interface StandupData {
  yesterday: string
  today: string
  yesterdayDone: Entry[]
  todayPlan: Entry[]
}

export interface WeeklyData {
  week: string
  hoursByProject: Record<string, number>
  totalHours: number
}
```

- [ ] **Step 2: Create `src/api/client.ts`**

```typescript
const BASE = '/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'unknown',
      body?.error?.message ?? res.statusText,
    )
  }

  if (res.status === 204) return undefined as T

  return res.json()
}
```

- [ ] **Step 3: Create `src/api/entries.ts`**

```typescript
import type { CreateEntryRequest, DataResponse, Entry, PageResponse, UpdateEntryRequest } from '@/types'
import { request } from './client'

export function fetchEntries(params?: Record<string, string>): Promise<PageResponse<Entry>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return request(`/entries${query}`)
}

export function fetchEntry(id: number): Promise<DataResponse<Entry>> {
  return request(`/entries/${id}`)
}

export function createEntry(data: CreateEntryRequest): Promise<DataResponse<Entry>> {
  return request('/entries', { method: 'POST', body: JSON.stringify(data) })
}

export function updateEntry(id: number, data: UpdateEntryRequest): Promise<DataResponse<Entry>> {
  return request(`/entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteEntry(id: number): Promise<void> {
  return request(`/entries/${id}`, { method: 'DELETE' })
}
```

- [ ] **Step 4: Create `src/api/timelogs.ts`**

```typescript
import type { CreateTimeLogRequest, DataResponse, TimeLog } from '@/types'
import { request } from './client'

export function fetchTimeLogs(params?: Record<string, string>): Promise<{ data: TimeLog[] }> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return request(`/timelogs${query}`)
}

export function createTimeLog(data: CreateTimeLogRequest): Promise<DataResponse<TimeLog>> {
  return request('/timelogs', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteTimeLog(id: number): Promise<void> {
  return request(`/timelogs/${id}`, { method: 'DELETE' })
}
```

- [ ] **Step 5: Create `src/api/dashboard.ts`**

```typescript
import type { DailyDashboard, DataResponse, StandupData, WeeklyData } from '@/types'
import { request } from './client'

export function fetchDaily(date?: string): Promise<DataResponse<DailyDashboard>> {
  const query = date ? `?date=${date}` : ''
  return request(`/dashboard/daily${query}`)
}

export function fetchStandup(): Promise<DataResponse<StandupData>> {
  return request('/dashboard/standup')
}

export function fetchWeekly(weekStart?: string): Promise<DataResponse<WeeklyData>> {
  const query = weekStart ? `?weekStart=${weekStart}` : ''
  return request(`/dashboard/weekly${query}`)
}

export function fetchMarkdownExport(params: Record<string, string>): Promise<string> {
  const query = '?' + new URLSearchParams(params).toString()
  return fetch(`/api/v1/export/markdown${query}`).then(r => r.text())
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add TypeScript types and API client layer"
```

---

## Task 13: React Query Hooks

**Files:**
- Create: `src/main/frontend/src/hooks/useEntries.ts`
- Create: `src/main/frontend/src/hooks/useTimeLogs.ts`
- Create: `src/main/frontend/src/hooks/useDashboard.ts`
- Create: `src/main/frontend/src/hooks/useDebounce.ts`

- [ ] **Step 1: Create `useEntries.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEntry, deleteEntry, fetchEntries, updateEntry } from '@/api/entries'
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types'

export function useEntries(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => fetchEntries(params),
  })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEntryRequest) => createEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEntryRequest }) => updateEntry(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  })
}
```

- [ ] **Step 2: Create `useTimeLogs.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTimeLog, deleteTimeLog, fetchTimeLogs } from '@/api/timelogs'
import type { CreateTimeLogRequest } from '@/types'

export function useTimeLogs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['timelogs', params],
    queryFn: () => fetchTimeLogs(params),
  })
}

export function useCreateTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTimeLogRequest) => createTimeLog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timelogs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTimeLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timelogs'] }),
  })
}
```

- [ ] **Step 3: Create `useDashboard.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchDaily, fetchStandup, fetchWeekly } from '@/api/dashboard'

export function useDaily(date?: string) {
  return useQuery({
    queryKey: ['dashboard', 'daily', date],
    queryFn: () => fetchDaily(date),
  })
}

export function useStandup() {
  return useQuery({
    queryKey: ['dashboard', 'standup'],
    queryFn: fetchStandup,
  })
}

export function useWeekly(weekStart?: string) {
  return useQuery({
    queryKey: ['dashboard', 'weekly', weekStart],
    queryFn: () => fetchWeekly(weekStart),
  })
}
```

- [ ] **Step 4: Create `useDebounce.ts`**

```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add React Query hooks for entries, timelogs, dashboard"
```

---

## Task 14: Layout Components (AppShell, Sidebar, TopBar)

**Files:**
- Create: `src/main/frontend/src/components/layout/AppShell.tsx`
- Create: `src/main/frontend/src/components/layout/Sidebar.tsx`
- Create: `src/main/frontend/src/components/layout/TopBar.tsx`
- Modify: `src/main/frontend/src/App.tsx`

This task creates the main layout. **Delegate to `visual-engineering` category with `frontend-design`, `shadcn`, `ui-ux-pro-max` skills** at execution time for high-quality UI implementation.

- [ ] **Step 1: Create `Sidebar.tsx`**

Sidebar with navigation links: Avui (/), Standup (/standup), Hores (/timelogs), Tot (/entries), Export (/export). Use shadcn Sidebar component. 200px wide, collapsible to 48px. Active route highlighted with accent color.

- [ ] **Step 2: Create `TopBar.tsx`**

Top bar with: current date display, search input (debounced), theme toggle button (light/dark). Height 48px.

- [ ] **Step 3: Create `AppShell.tsx`**

Combine Sidebar + TopBar + main content area. Content area max-width 768px, centered. Use CSS variables from the design spec.

- [ ] **Step 4: Update `App.tsx` with layout and routes**

Wrap all routes in AppShell. Add placeholder pages for each route.

- [ ] **Step 5: Verify layout renders correctly**

Run: `npm run dev`
Expected: Sidebar + TopBar visible, navigation works between routes.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add AppShell layout with Sidebar and TopBar"
```

---

## Task 15: QuickCapture Component

**Files:**
- Create: `src/main/frontend/src/components/entries/QuickCapture.tsx`

The most important component. **Delegate to `visual-engineering`** at execution time.

- [ ] **Step 1: Create `QuickCapture.tsx`**

Design per spec section 6.4:
- Type select dropdown (TASK default) + title input + submit button
- Enter key creates entry with selected type, today's date, OPEN status
- `+` button opens Sheet with full EntryForm
- 48px height, always visible at top of dashboard
- Uses `useCreateEntry` mutation
- Shows success toast via sonner on creation
- Clears input after successful creation

- [ ] **Step 2: Add QuickCapture to DailyView page**

- [ ] **Step 3: Verify QuickCapture works end-to-end**

Start backend (`./mvnw spring-boot:run`) and frontend (`npm run dev`).
Type a title, press Enter. Entry should appear in the list below.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add QuickCapture component for fast entry creation"
```

---

## Task 16: Entry Components (Card, List, Filters, Form)

**Files:**
- Create: `src/main/frontend/src/components/entries/EntryCard.tsx`
- Create: `src/main/frontend/src/components/entries/EntryList.tsx`
- Create: `src/main/frontend/src/components/entries/EntryFilters.tsx`
- Create: `src/main/frontend/src/components/entries/EntryForm.tsx`

**Delegate to `visual-engineering`** at execution time.

- [ ] **Step 1: Create `EntryCard.tsx`**

Card showing: status badge, title, type badge, tags as Badge components, external_ref in mono font, date, pinned indicator. Click opens Sheet with EntryForm for editing. Status badge colors per spec section 7.4.

- [ ] **Step 2: Create `EntryFilters.tsx`**

Filter controls: type ToggleGroup, status ToggleGroup, date picker, tag filter, search input. Filters update URL params and trigger useEntries refetch.

- [ ] **Step 3: Create `EntryList.tsx`**

Renders EntryFilters + list of EntryCard. Handles empty state with shadcn Empty. Loading state with Skeleton. Pagination controls.

- [ ] **Step 4: Create `EntryForm.tsx`**

Full form in a Sheet (slide-in panel). Fields: type, title, body (textarea), date, tags (comma-separated input), external_ref, status, pinned toggle. Save + Cancel buttons. Uses useCreateEntry or useUpdateEntry depending on mode.

- [ ] **Step 5: Wire up `/entries` route**

- [ ] **Step 6: Verify entries CRUD works in UI**

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add Entry components - Card, List, Filters, Form"
```

---

## Task 17: Dashboard (DailyView, PinnedEntries, StandupCard)

**Files:**
- Create: `src/main/frontend/src/components/dashboard/DailyView.tsx`
- Create: `src/main/frontend/src/components/dashboard/PinnedEntries.tsx`
- Create: `src/main/frontend/src/components/dashboard/StandupCard.tsx`

**Delegate to `visual-engineering`** at execution time.

- [ ] **Step 1: Create `PinnedEntries.tsx`**

Section showing pinned entries as compact cards. Always visible at top of dashboard.

- [ ] **Step 2: Create `DailyView.tsx`**

Main dashboard page (`/`): QuickCapture at top, PinnedEntries section, today's entries list, today's time log summary (total hours). Uses useDaily hook.

- [ ] **Step 3: Create `StandupCard.tsx`**

Standup prep page (`/standup`): Two columns - "Yesterday (Done)" and "Today (Plan)". Uses useStandup hook. Copy-to-clipboard button for standup text.

- [ ] **Step 4: Verify dashboard and standup pages**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Dashboard with DailyView, PinnedEntries, StandupCard"
```

---

## Task 18: TimeLog Components

**Files:**
- Create: `src/main/frontend/src/components/timelogs/TimeLogForm.tsx`
- Create: `src/main/frontend/src/components/timelogs/TimeLogTable.tsx`
- Create: `src/main/frontend/src/components/timelogs/WeeklySummary.tsx`

**Delegate to `visual-engineering`** at execution time.

- [ ] **Step 1: Create `TimeLogForm.tsx`**

Form: date, hours (decimal input), project (text with autocomplete from previous projects), description, optional entry link. Uses useCreateTimeLog.

- [ ] **Step 2: Create `TimeLogTable.tsx`**

Table view of time logs for selected day/range. Columns: Project, Hours, Description, Entry link, Actions (delete). Uses shadcn Table.

- [ ] **Step 3: Create `WeeklySummary.tsx`**

Weekly summary showing hours per project in a table. Total hours row. Uses useWeekly hook.

- [ ] **Step 4: Wire up `/timelogs` page**

Page combines: TimeLogForm + TimeLogTable (today) + WeeklySummary.

- [ ] **Step 5: Verify time logging works end-to-end**

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add TimeLog components - Form, Table, WeeklySummary"
```

---

## Task 19: Export Page

**Files:**
- Create: `src/main/frontend/src/components/export/ExportView.tsx`

- [ ] **Step 1: Create `ExportView.tsx`**

Page at `/export`: Date picker (single day or range), preview area showing rendered markdown, "Copy to Clipboard" button, "Download .md" button. Uses fetchMarkdownExport.

- [ ] **Step 2: Verify export works**

Create some entries and time logs, navigate to /export, select date, verify markdown renders correctly.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Markdown export page with preview and download"
```

---

## Task 20: Fat JAR Build with Frontend

**Files:**
- Modify: `pom.xml` (add frontend-maven-plugin)

- [ ] **Step 1: Add frontend-maven-plugin to `pom.xml`**

```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.15.1</version>
    <configuration>
        <workingDirectory>src/main/frontend</workingDirectory>
        <nodeVersion>v24.13.0</nodeVersion>
    </configuration>
    <executions>
        <execution>
            <id>install-node-and-npm</id>
            <goals><goal>install-node-and-npm</goal></goals>
        </execution>
        <execution>
            <id>npm-install</id>
            <goals><goal>npm</goal></goals>
            <configuration>
                <arguments>install</arguments>
            </configuration>
        </execution>
        <execution>
            <id>npm-build</id>
            <goals><goal>npm</goal></goals>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```

- [ ] **Step 2: Build fat JAR**

Run: `./mvnw clean package -DskipTests`
Expected: `target/workboard-0.0.1-SNAPSHOT.jar` exists

- [ ] **Step 3: Test fat JAR**

```bash
java -jar target/workboard-0.0.1-SNAPSHOT.jar
```

Expected: Application starts, http://localhost:8080 serves the React SPA with working API.

- [ ] **Step 4: Run full test suite**

Run: `./mvnw test`
Expected: All backend tests pass.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add frontend-maven-plugin for fat JAR build"
```

---

## Task 21: Final Polish + Verify

- [ ] **Step 1: End-to-end manual verification**

1. Start with `java -jar target/workboard-0.0.1-SNAPSHOT.jar`
2. QuickCapture: create 3 entries (TASK, NOTE, MEETING_NOTE)
3. Edit one entry via sheet form
4. Mark one as DONE, one as IN_PROGRESS
5. Pin one entry
6. Navigate to Standup - verify yesterday/today split
7. Add 2 time logs for different projects
8. Check weekly summary shows correct totals
9. Export today as markdown, verify content
10. Stop and restart - verify all data persisted

- [ ] **Step 2: Commit final state**

```bash
git add .
git commit -m "chore: final verification pass"
```

---

## Summary

| Task | Description | Estimated Time |
|---|---|---|
| 0 | Install Java | 5 min |
| 1 | Scaffold Spring Boot | 15 min |
| 2 | Flyway migrations | 10 min |
| 3 | JPA Config + Entry entities | 20 min |
| 4 | Entry DTOs + Service | 15 min |
| 5 | Error handling + Entry Controller | 20 min |
| 6 | TimeLog CRUD | 20 min |
| 7 | Dashboard + Export APIs | 20 min |
| 8 | Backup Service | 10 min |
| 9 | SPA Forwarding + Backend verify | 10 min |
| 10 | Scaffold React frontend | 15 min |
| 11 | Initialize shadcn/ui | 10 min |
| 12 | Types + API client | 15 min |
| 13 | React Query hooks | 10 min |
| 14 | Layout (AppShell, Sidebar, TopBar) | 25 min |
| 15 | QuickCapture | 20 min |
| 16 | Entry components | 30 min |
| 17 | Dashboard UI | 25 min |
| 18 | TimeLog UI | 25 min |
| 19 | Export page | 15 min |
| 20 | Fat JAR build | 15 min |
| 21 | Final polish | 15 min |
| **Total** | | **~5.5 hours** |
