# Guia de prova — Workboard

## 1. Arrancar l'aplicació

```bash
# Des del directori del projecte
export JAVA_HOME="$HOME/jdk-21.0.10+7"
export PATH="$JAVA_HOME/bin:$PATH"

java -jar target/workboard-0.0.1-SNAPSHOT.jar
```

Espera ~20 segons fins veure: `Started WorkboardApplication in X seconds`
Obre al navegador: **http://localhost:8080**

> Per canviar el port: `java -jar target/workboard-0.0.1-SNAPSHOT.jar --server.port=9090`

## 2. Què veuràs al navegador

La interfície React amb:
- **Sidebar** esquerra: navegació (Dashboard, Entries, Time Logs, Standup, Export)
- **TopBar** superior
- **QuickCapture**: barra de captura ràpida d'entries

## 3. API — Referència ràpida per provar

Totes les rutes comencen per `/api/v1/`. Pots provar amb curl o directament des del navegador.

### Entries (tasques, notes, etc.)

| Acció | Mètode | URL | Body |
|-------|--------|-----|------|
| Crear | POST | `/api/v1/entries` | `{"title":"...", "type":"TASK", "body":"...", "tags":["x"]}` |
| Llistar | GET | `/api/v1/entries?page=0&size=20` | — |
| Per data | GET | `/api/v1/entries?date=2026-04-17` | — |
| Detall | GET | `/api/v1/entries/{id}` | — |
| Editar | PATCH | `/api/v1/entries/{id}` | `{"title":"nou títol", "status":"DONE"}` |
| Pin | PATCH | `/api/v1/entries/{id}` | `{"pinned": true}` |
| Esborrar | DELETE | `/api/v1/entries/{id}` | — |

**Tipus**: `TASK`, `NOTE`, `MEETING_NOTE`, `REMINDER`
**Estatus**: `OPEN`, `IN_PROGRESS`, `DONE`, `CANCELLED`

### Time Logs (imputació d'hores)

| Acció | Mètode | URL | Body |
|-------|--------|-----|------|
| Crear | POST | `/api/v1/timelogs` | `{"date":"2026-04-17", "project":"Alpha", "hours":3.5, "description":"..."}` |
| Per data | GET | `/api/v1/timelogs?date=2026-04-17` | — |
| Esborrar | DELETE | `/api/v1/timelogs/{id}` | — |

### Dashboard

| Vista | URL |
|-------|-----|
| Diari | `/api/v1/dashboard/daily?date=2026-04-17` |
| Standup | `/api/v1/dashboard/standup` |
| Weekly | `/api/v1/dashboard/weekly` |

### Export

| Format | URL |
|--------|-----|
| Markdown (dia) | `/api/v1/export/markdown?date=2026-04-17` |
| Markdown (rang) | `/api/v1/export/markdown?from=2026-04-17&to=2026-04-18` |

## 4. Coses a validar

- [ ] **Captura ràpida**: el QuickCapture crea entries sense recarregar?
- [ ] **Navegació SPA**: canviar entre Dashboard/Entries/TimeLogs funciona sense recarregar pàgina?
- [ ] **Pinned entries**: apareixen primer a la llista?
- [ ] **Standup**: mostra yesterday/today correctament?
- [ ] **Export**: el Markdown és còmode per copiar/pegar?
- [ ] **Dades persistents**: atura l'app (Ctrl+C), rearranca, i les dades segueixen allà?
- [ ] **Look & feel**: la UI és còmoda? Els colors, espaiats i fonts agraden?

## 5. On es guarden les dades

- **BD**: `workboard.db` (SQLite) al directori d'on arrenquis el JAR
- **Backups automàtics**: `backups/` (cada hora, reté 7 dies)

## 6. Reconstruir després de canvis

```bash
export JAVA_HOME="$HOME/jdk-21.0.10+7" && export PATH="$JAVA_HOME/bin:$PATH"
./mvnw clean package -DskipTests
java -jar target/workboard-0.0.1-SNAPSHOT.jar
```

## 7. Bugs trobats durant la verificació

1. **`task_code` als time logs no es guarda** — el model backend no té aquest camp. Si el necessites per Celoxis, l'afegirem.
2. **Els tipus del frontend** podrien no coincidir amb el backend si els subagents anteriors van generar noms diferents — verificar la UI.

## 8. Millores futures a considerar

- FTS5 full-text search (ja preparat al spec)
- `task_code` als time logs per imputació Celoxis
- Filtre per tipus/status/tags a la UI
- Keyboard shortcuts (Ctrl+N per nova entry, etc.)
- Dark mode
- Tests frontend (Vitest) + E2E (Playwright)
