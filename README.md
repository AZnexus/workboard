# Workboard

Aplicació web personal de gestió de feina i seguiment del dia a dia. Workboard combina planificació de tasques, notes, actes de reunió, registre d'hores, projectes, etiquetes i exportació Markdown en una sola aplicació Spring Boot + React.

## Funcionalitats principals

- Dashboard diari amb columnes com **Ahir**, **Avui**, **Pendents** i **Recordatoris**
- Gestió d'entrades amb tipus **Task**, **Note**, **Meeting Note** i **Reminder**
- Estats de tasca (`OPEN`, `IN_PROGRESS`, `PAUSED`, `DONE`, `CANCELLED`)
- Prioritats i `dueDate` visibles a la UI amb semàntica visual
- Drag and drop i accions ràpides entre **Avui** i **Pendents**
- Gestió de projectes i etiquetes
- Registre d'hores per projecte i resum setmanal
- Exportació a Markdown per dia o rang de dates
- SPA servida des de Spring Boot amb frontend empaquetat dins `src/main/resources/static`

## Stack tècnic

### Backend

- Java 21
- Spring Boot 3.4
- Spring Web
- Spring Data JPA
- Flyway
- SQLite

### Frontend

- React 19
- TypeScript
- Vite
- TanStack Query
- dnd-kit
- Tailwind CSS 4
- Radix UI primitives
- Sonner

## Estructura del projecte

```text
.
├── pom.xml
├── src/main/java/com/workboard/        # backend Spring Boot
├── src/main/resources/db/migration/    # migracions Flyway
├── src/main/resources/static/          # assets frontend empaquetats
├── src/main/frontend/                  # projecte React + Vite
└── src/test/java/com/workboard/        # tests backend
```

## Requisits

- Java 21
- Git
- Entorn Unix/Linux/macOS recomanat

No cal instal·lar Node manualment per generar el jar: el plugin Maven del frontend ja el gestiona dins del projecte quan cal.

## Execució en desenvolupament

### Opció 1: backend + frontend per separat

Backend:

```bash
./mvnw spring-boot:run
```

Frontend dev server:

```bash
cd src/main/frontend
npm install
npm run dev
```

URLs habituals:

- Frontend dev: `http://localhost:5173`
- Backend API: `http://localhost:8080`

El frontend en desenvolupament fa proxy de `/api` cap a `localhost:8080`.

### Opció 2: build complet empaquetat

```bash
./mvnw clean package
```

Això genera el jar executable a `target/` i empaqueta el frontend dins l'aplicació Spring Boot.

Per executar el jar:

```bash
java -jar target/workboard-<versio>.jar
```

## Validació bàsica

### Frontend

```bash
cd src/main/frontend
npx tsc --noEmit
npm run build
```

### Backend + package complet

```bash
./mvnw clean package
```

## API principal

Rutes disponibles sota `/api/v1`:

- `/entries`
- `/dashboard`
- `/projects`
- `/tags`
- `/timelogs`
- `/export/markdown`

També hi ha `/actuator` per a observabilitat bàsica.

## Base de dades

L'aplicació fa servir SQLite i esquema versionat amb Flyway.

Migracions a:

```text
src/main/resources/db/migration/
```

## Notes de repositori

- Els assets de `src/main/resources/static/` formen part del codi versionat perquè el backend serveix la SPA empaquetada.
- Els artefactes generats localment com `target/`, `node_modules/` o el runtime local de Node del plugin Maven no s'han de versionar.
- `GOVERNANCE.md` és la font de veritat de protocols, normes persistents i decisions de treball del projecte.
- `CHANGELOG.md` és la referència principal de versions publicades.

## Flux recomanat de desenvolupament

1. Implementar canvis al backend o frontend
2. Verificar frontend (`npx tsc --noEmit`, `npm run build`) si afecta UI
3. Verificar backend amb `./mvnw clean package`
4. Actualitzar `GOVERNANCE.md` si s'ha canviat una norma o decisió persistent
5. Actualitzar `CHANGELOG.md` si toca release
6. Generar jar i etiquetar versió quan el canvi estigui llest

## Llicència

Aquest repositori no defineix encara una llicència pública explícita.
