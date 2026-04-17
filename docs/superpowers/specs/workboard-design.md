# Workboard — Design Specification

> Webapp personal de gestio de tasques i temps diari per a la feina.

**Data**: 2026-04-16
**Status**: Draft
**Autor**: azarauza + Sisyphus

---

## 1. Objectiu

Construir una webapp local que permeti:

- Captura rapida de tasques, notes de reunions, recordatoris, apunts
- Dashboard diari per preparar dailies (que vaig fer ahir + pla d'avui)
- Vista d'imputacio d'hores (per traslladar a Celoxis)
- Cerca i recuperacio rapida de qualsevol informacio
- Export a Markdown de qualsevol dada

### Restriccions

- Sempre des del PC (no mobil)
- Ha de ser super rapid i comode d'utilitzar
- No pot perdre informacio — backups automatics
- Volum: 10+ captures/dia
- Eines externes: JIRA (incidencies), Redmine (tasques equip), Celoxis (imputacio hores)

---

## 2. Stack Tecnologic

| Component | Tecnologia | Justificacio |
|---|---|---|
| Backend | Spring Boot | Expertesa de l'usuari, ecosystem madur |
| Frontend | React + Vite | SPA rapida, hot reload |
| UI Components | shadcn/ui | Components com a codi font, composables, Tailwind |
| Base de dades | SQLite | Fitxer unic, zero config, portable |
| Migracions | Flyway | Versionat d'esquema, mai DDL manual |
| Empaquetament | Fat JAR (Maven) | `java -jar workboard.jar` i funciona |
| State management | React Query | Server state amb cache, invalidacio automatica |

### Execucio

```bash
java -jar workboard.jar
# → http://localhost:8080
```

---

## 3. Model de Dades

### 3.1 Entry

L'element central. Tot el que captures es una Entry.

| Camp | Tipus | Restriccions | Descripcio |
|---|---|---|---|
| `id` | Long | PK, auto-increment | Identificador |
| `type` | enum | NOT NULL | `TASK`, `NOTE`, `MEETING_NOTE`, `REMINDER` |
| `title` | varchar(200) | NOT NULL | Titol curt |
| `body` | text | nullable | Contingut markdown |
| `status` | enum | NOT NULL, default `OPEN` | `OPEN`, `IN_PROGRESS`, `DONE`, `CANCELLED` |
| `date` | date | NOT NULL, default avui | Dia al qual pertany |
| `external_ref` | varchar(100) | nullable | Referencia externa (JIRA-1234, RED-567) |
| `pinned` | boolean | NOT NULL, default false | Fixar al dashboard |
| `created_at` | timestamp | NOT NULL, auto | `@CreatedDate` |
| `updated_at` | timestamp | NOT NULL, auto | `@LastModifiedDate` |

### 3.2 EntryTag

Taula separada per tags (SQLite no suporta arrays).

| Camp | Tipus | Restriccions | Descripcio |
|---|---|---|---|
| `id` | Long | PK, auto-increment | Identificador |
| `entry_id` | Long | FK → Entry, NOT NULL | Entry associada |
| `tag` | varchar(50) | NOT NULL | Etiqueta |

Unique constraint: `(entry_id, tag)`.

### 3.3 TimeLog

Imputacio d'hores, opcionalment vinculada a una Entry.

| Camp | Tipus | Restriccions | Descripcio |
|---|---|---|---|
| `id` | Long | PK, auto-increment | Identificador |
| `entry_id` | Long | FK → Entry, nullable | Entry relacionada |
| `date` | date | NOT NULL | Dia de la imputacio |
| `hours` | decimal(4,2) | NOT NULL | Hores dedicades |
| `project` | varchar(100) | NOT NULL | Projecte/client (per Celoxis) |
| `description` | text | nullable | Descripcio de la feina |
| `created_at` | timestamp | NOT NULL, auto | `@CreatedDate` |

### 3.4 Relacions

```
Entry 1 ──── 0..N EntryTag    (tags de l'entry)
Entry 1 ──── 0..N TimeLog     (imputacions vinculades)
Date  1 ──── 0..N Entry       (entries del dia)
Date  1 ──── 0..N TimeLog     (imputacions del dia)
```

### 3.5 Indexs

| Index | Columnes | Proposit |
|---|---|---|
| `idx_entry_date` | `entry.date` | Dashboard diari |
| `idx_entry_type` | `entry.type` | Filtrat per tipus |
| `idx_entry_status` | `entry.status` | Filtrat per estat |
| `idx_entry_tag_tag` | `entry_tag.tag` | Cerca per tag |
| `idx_entry_tag_entry` | `entry_tag.entry_id` | Join eficient |
| `idx_timelog_date` | `timelog.date` | Vista d'imputacio |
| FTS5 | `entry.title + entry.body` | Cerca full-text |

### 3.6 Migracions Flyway

```
db/migration/
  V1__create_entry.sql
  V1.1__create_entry_tag.sql
  V1.2__create_time_log.sql
  V1.3__create_fts5_index.sql
```

---

## 4. API REST

### 4.1 Convencions

- **Base path**: `/api/v1/`
- **Format**: JSON, `snake_case` en camps de resposta
- **Dates**: ISO 8601 (`2026-04-16`, `2026-04-16T10:30:00Z`)
- **Paginacio**: Offset (`page` + `size`)

### 4.2 Endpoints

#### Entries

| Metode | Path | Descripcio |
|---|---|---|
| `GET` | `/api/v1/entries` | Llistat amb filtres i paginacio |
| `GET` | `/api/v1/entries/:id` | Detall (amb tags) |
| `POST` | `/api/v1/entries` | Crear entry (amb tags inline) |
| `PUT` | `/api/v1/entries/:id` | Actualitzar completa |
| `PATCH` | `/api/v1/entries/:id` | Actualitzacio parcial |
| `DELETE` | `/api/v1/entries/:id` | Eliminar |

Filtres de llistat:
```
?date=2026-04-16
?date_from=2026-04-14&date_to=2026-04-16
?type=TASK&status=OPEN
?tag=jira
?pinned=true
?q=deploy+produccio          (cerca full-text FTS5)
?sort=-date,title
?page=0&size=20
```

#### Time Logs

| Metode | Path | Descripcio |
|---|---|---|
| `GET` | `/api/v1/timelogs` | Llistat amb filtres |
| `GET` | `/api/v1/timelogs/:id` | Detall |
| `POST` | `/api/v1/timelogs` | Crear imputacio |
| `PUT` | `/api/v1/timelogs/:id` | Actualitzar |
| `DELETE` | `/api/v1/timelogs/:id` | Eliminar |

Filtres:
```
?date=2026-04-16
?date_from=2026-04-14&date_to=2026-04-18
?project=PROJ-A
?entry_id=42
```

#### Dashboard

| Metode | Path | Descripcio |
|---|---|---|
| `GET` | `/api/v1/dashboard/daily?date=2026-04-16` | Resum del dia |
| `GET` | `/api/v1/dashboard/standup` | Prep daily: ahir + avui |
| `GET` | `/api/v1/dashboard/weekly?week=2026-W16` | Resum setmanal hores/projecte |

#### Export

| Metode | Path | Descripcio |
|---|---|---|
| `GET` | `/api/v1/export/markdown?date=2026-04-16` | Export markdown del dia |
| `GET` | `/api/v1/export/markdown?date_from=...&date_to=...` | Export rang |

### 4.3 Format de resposta

**Element individual:**
```json
{
  "data": {
    "id": 42,
    "type": "TASK",
    "title": "Revisar PR #423",
    "body": null,
    "status": "OPEN",
    "date": "2026-04-16",
    "external_ref": "JIRA-1234",
    "pinned": false,
    "tags": ["jira", "backend"],
    "created_at": "2026-04-16T08:30:00Z",
    "updated_at": "2026-04-16T08:30:00Z"
  }
}
```

**Llistat paginat:**
```json
{
  "data": [],
  "meta": {
    "total": 87,
    "page": 0,
    "size": 20,
    "total_pages": 5
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "title", "message": "Must not be blank", "code": "not_blank" }
    ]
  }
}
```

### 4.4 Request body (crear entry)

```json
{
  "type": "MEETING_NOTE",
  "title": "Daily Backend",
  "body": "- Es bloqueja el deploy per X\n- Decidim Y",
  "date": "2026-04-16",
  "tags": ["daily", "backend"],
  "external_ref": null
}
```

Tags es passen inline. El backend gestiona EntryTag internament.

### 4.5 Status codes

| Accio | Status |
|---|---|
| GET exit | `200 OK` |
| POST exit | `201 Created` + header `Location` |
| PUT/PATCH exit | `200 OK` |
| DELETE exit | `204 No Content` |
| Validacio fallida | `422 Unprocessable Entity` |
| No trobat | `404 Not Found` |
| Error intern | `500 Internal Server Error` |

---

## 5. Arquitectura Spring Boot

### 5.1 Estructura per feature

```
src/main/java/com/workboard/
├── config/                        # Flyway, CORS, JPA Auditing
├── entry/
│   ├── EntryController.java       # @RestController
│   ├── EntryService.java          # @Service @Transactional
│   ├── EntryRepository.java       # JpaRepository
│   ├── EntryEntity.java           # @Entity
│   ├── EntryTagEntity.java        # @Entity
│   ├── Entry.java                 # Domain record (immutable)
│   ├── CreateEntryRequest.java    # DTO input (@Valid)
│   ├── UpdateEntryRequest.java    # DTO input parcial
│   └── EntryResponse.java        # DTO output
├── timelog/
│   ├── TimeLogController.java
│   ├── TimeLogService.java
│   ├── TimeLogRepository.java
│   ├── TimeLogEntity.java
│   ├── TimeLog.java
│   ├── CreateTimeLogRequest.java
│   └── TimeLogResponse.java
├── dashboard/
│   ├── DashboardController.java   # Vistes compostes
│   └── DashboardService.java
├── export/
│   ├── ExportController.java
│   └── MarkdownExportService.java
└── shared/
    ├── ApiError.java              # Format d'error estandard
    └── GlobalExceptionHandler.java
```

### 5.2 Decisions

- **Organitzacio per feature** (no per capa)
- **Records per DTOs**: immutables, amb Bean Validation
- **Separacio Entity / Domain / DTO**: Entity mai surt del service
- **`@Transactional`** al service, `readOnly = true` per lectures
- **Constructor injection**: mai `@Autowired` en camps
- **JPA Auditing**: `@EnableJpaAuditing` + `@CreatedDate` / `@LastModifiedDate`

### 5.3 Configuracio

```yaml
server:
  port: ${WORKBOARD_PORT:8080}

spring:
  datasource:
    url: jdbc:sqlite:${WORKBOARD_DB:./workboard.db}
    driver-class-name: org.sqlite.JDBC
  jpa:
    hibernate:
      ddl-auto: validate
    database-platform: org.hibernate.community.dialect.SQLiteDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
```

---

## 6. Components UI

### 6.1 Estructura React

```
src/main/frontend/
├── index.html
├── vite.config.ts
├── package.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── api/
│   │   ├── client.ts              # fetch wrapper
│   │   ├── entries.ts
│   │   ├── timelogs.ts
│   │   └── dashboard.ts
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── entries/
│   │   │   ├── QuickCapture.tsx   # Input rapid (component clau)
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryList.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   └── EntryFilters.tsx
│   │   ├── timelogs/
│   │   │   ├── TimeLogForm.tsx
│   │   │   ├── TimeLogTable.tsx
│   │   │   └── WeeklySummary.tsx
│   │   └── dashboard/
│   │       ├── DailyView.tsx
│   │       ├── StandupCard.tsx
│   │       └── PinnedEntries.tsx
│   ├── hooks/
│   │   ├── useEntries.ts
│   │   ├── useTimeLogs.ts
│   │   ├── useDashboard.ts
│   │   └── useDebounce.ts
│   ├── lib/
│   │   └── utils.ts
│   └── types/
│       └── index.ts
```

### 6.2 Pagines

| Ruta | Vista | Descripcio |
|---|---|---|
| `/` | DailyView | Dashboard: QuickCapture + entries avui + pinned |
| `/standup` | StandupCard | Prep daily: ahir + avui |
| `/timelogs` | TimeLogTable | Imputacio d'hores dia/setmana |
| `/entries` | EntryList | Totes les entries amb filtres i cerca |
| `/export` | ExportView | Previsualitzacio markdown + descarregar |

### 6.3 Components shadcn/ui

| Necessitat | Component |
|---|---|
| QuickCapture | `Input` + `Select` + `Button` |
| Entry cards | `Card` (composicio completa) |
| Tags | `Badge` |
| Filtres | `ToggleGroup` + `Select` |
| Taula d'hores | `Table` |
| Formularis | `FieldGroup` + `Field` + `Input` + `Textarea` + `Select` |
| Navegacio | `Sidebar` |
| Confirmacions | `AlertDialog` |
| Edicio entry | `Sheet` (panell lateral) |
| Notificacions | `sonner` (toast) |
| Estat buit | `Empty` |
| Loading | `Skeleton` |
| Status | `Badge` amb variants |

### 6.4 QuickCapture

El component mes important. Disseny:

```
┌─────────────────────────────────────────────────────┐
│ [TASK v]  [Escriu titol i prem Enter...]    [+ >]  │
└─────────────────────────────────────────────────────┘
```

- Sempre visible a dalt del dashboard
- Select per tipus (TASK per defecte)
- Enter → crea entry al dia actual, status OPEN
- Boto `+` → obre Sheet amb formulari complet
- Zero clics per captura basica

### 6.5 State management

- **React Query** per server state (entries, timelogs, dashboard)
- **useState/useReducer** per UI state local
- **Context** nomes si cal compartir estat UI entre components llunyans

---

## 7. Disseny Visual

### 7.1 Direccio estetica

Industrial-Minimal amb toc d'humanitat. Precisio de Linear + calidesa de Todoist.

### 7.2 Tipografia

| Rol | Font | Raó |
|---|---|---|
| UI / Body | Geist | Neta, moderna, tabular-nums per taules |
| Headings | Geist (semibold/bold) | Cohesio sense complexitat |
| Monospace | Geist Mono | Per refs externes i blocs markdown |

### 7.3 Paleta de colors

**Light mode (tons stone, blanc calid):**

| Token | Hex | Us |
|---|---|---|
| `--background` | `#FAFAF9` | Fons principal |
| `--surface` | `#FFFFFF` | Cards, panells |
| `--border` | `#E7E5E4` | Separadors |
| `--text-primary` | `#1C1917` | Titols, contingut |
| `--text-secondary` | `#78716C` | Metadades, timestamps |
| `--accent` | `#2563EB` | Accions primaries, links |
| `--accent-hover` | `#1D4ED8` | Hover |
| `--success` | `#16A34A` | Status DONE |
| `--warning` | `#D97706` | Recordatoris |
| `--danger` | `#DC2626` | Eliminar, errors |

**Dark mode (negre calid):**

| Token | Hex | Us |
|---|---|---|
| `--background` | `#0C0A09` | Fons principal |
| `--surface` | `#1C1917` | Cards, panells |
| `--border` | `#292524` | Separadors |
| `--text-primary` | `#FAFAF9` | Titols |
| `--text-secondary` | `#A8A29E` | Metadades |
| `--accent` | `#60A5FA` | Accent (mes clar per contrast) |
| `--accent-hover` | `#93C5FD` | Hover |

### 7.4 Status badges

| Status | Color | Estil |
|---|---|---|
| `OPEN` | `--text-secondary` | Outline subtil |
| `IN_PROGRESS` | `--accent` | Solid |
| `DONE` | `--success` | Solid |
| `CANCELLED` | `--text-secondary` | Strikethrough |

### 7.5 Espaiat

- Base unit: `4px` (Tailwind `gap-1`)
- Dins card: `12px`
- Entre cards: `16px`
- Entre seccions: `24px`
- QuickCapture: `48px` d'alcada

### 7.6 Layout

```
┌──────────┬──────────────────────────────────────┐
│          │ TopBar: data + toggle tema + buscar  │
│ Sidebar  │──────────────────────────────────────│
│ (200px)  │                                      │
│          │ Contingut principal                   │
│ · Avui   │ (max-width: 768px centrat)           │
│ · Standup│                                      │
│ · Hores  │                                      │
│ · Tot    │                                      │
│ · Export │                                      │
└──────────┴──────────────────────────────────────┘
```

- Sidebar fixa, col·lapsable a 48px
- Responsive: <1024px sidebar col·lapsada per defecte

### 7.7 Motion

- Toggle tema: `150ms ease`
- Sheet slide-in: `200ms`
- Toast: fade `150ms`, auto-dismiss `3s`
- Status badge: `100ms` transicio color
- Llistes: sense animacio d'entrada

### 7.8 Anti-slop

- Cap gradient a botons o fons
- Max `shadow-sm` en cards
- Max `8px` border-radius en cards, `6px` en badges
- Cap icona decorativa sense funcio

---

## 8. Testing

### 8.1 Estrategia

| Capa | Eina | Cobertura |
|---|---|---|
| Unit (back) | JUnit 5 + Mockito | Services: logica, validacions, mappeigs |
| Integracio (back) | `@SpringBootTest` + SQLite memoria | Request → DB → response |
| Unit (front) | Vitest + Testing Library | Hooks, logica components |
| Component (front) | Vitest + Testing Library | Renderitzat, interaccions |
| E2E | Playwright | Fluxos critics |

### 8.2 Que testem

- QuickCapture: crear amb Enter, canviar tipus, obrir formulari
- CRUD complet entries i timelogs via API
- Filtres: data, tipus, status, tag, cerca FTS
- Dashboard standup: ahir DONE + avui OPEN
- Export markdown: format correcte
- Validacions: titol buit, hores negatives, data invalida

### 8.3 Estructura

```
src/test/java/com/workboard/
├── entry/
│   ├── EntryServiceTest.java
│   ├── EntryControllerIntTest.java
│   └── EntryRepositoryIntTest.java
├── timelog/
│   └── ...
└── dashboard/
    └── DashboardServiceTest.java

src/main/frontend/src/
├── components/entries/__tests__/
│   ├── QuickCapture.test.tsx
│   ├── EntryCard.test.tsx
│   └── EntryList.test.tsx
├── hooks/__tests__/
│   └── useEntries.test.ts
└── e2e/
    ├── quick-capture.spec.ts
    └── daily-standup.spec.ts
```

---

## 9. Build & Deployment

### 9.1 Fat JAR

```bash
./mvnw clean package
java -jar target/workboard-1.0.0.jar
# → http://localhost:8080
```

### 9.2 Empaquetament frontend

Maven frontend-maven-plugin:
1. `npm install`
2. `npm run build` (Vite → `dist/`)
3. Copia `dist/` → `src/main/resources/static/`
4. Maven empaqueta tot al JAR

### 9.3 Configuracio

```yaml
server:
  port: ${WORKBOARD_PORT:8080}
spring:
  datasource:
    url: jdbc:sqlite:${WORKBOARD_DB:./workboard.db}
```

Zero configuracio per defecte. Variables d'entorn per personalitzar.

### 9.4 Backup

- Fitxer unic: `workboard.db`
- Backup automatic: `@Scheduled` copia a `backups/workboard-YYYY-MM-DD.db`
- Retencio: ultims 30 backups (configurable)
