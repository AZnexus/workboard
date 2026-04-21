# Decisions i Protocols — Workboard

Document de context amb decisions preses i protocols establerts durant el desenvolupament.

---

## Protocol de Versionat

**Format**: `MAJOR.MINOR.PATCH` (Semantic Versioning)

| Tipus | Quan pujar | Exemple |
|---|---|---|
| **PATCH** (x.x.+1) | Fix petit, canvi cosmètic, correcció d'un bug concret | 1.3.0 → 1.3.1 |
| **MINOR** (x.+1.0) | Funcionalitat nova, millora significativa, bloc de canvis | 1.3.0 → 1.4.0 |
| **MAJOR** (+1.0.0) | Canvi molt gros, reestructuració, breaking changes | 1.3.0 → 2.0.0 |

**Regles**:
- Cada canvi que es commiteja ha de pujar la versió al `pom.xml`
- Documentar cada versió al `CHANGELOG.md` amb el que incorpora
- El JAR resultant porta el número de versió al nom: `workboard-X.Y.Z.jar`

---

## Protocol de Revisió (FB)

Cada cop que l'usuari prova una versió i dona feedback:
1. Documentar cada ítem com FB-XXX a `PETICIONS.md`
2. Implementar tots els canvis
3. Generar taula de revisió amb TOTES les peticions per a validació

---

## Decisions Tècniques

### Stack
- **Backend**: Spring Boot 3.4 + Java 21 + SQLite + Flyway
- **Frontend**: React + Vite + TypeScript + Tailwind v4 + shadcn/ui (new-york, stone)
- **Empaquetament**: Fat JAR — `java -jar workboard.jar` → `localhost:8080`

### API
- Rutes: `/api/v1/...`
- Update entries: `PATCH` (no PUT)
- JSON responses: `snake_case` (via `@JsonNaming(SnakeCaseStrategy.class)` a response classes)
- JSON requests: `camelCase` (records Java estàndard)
- NO wrapper `{ data: ... }` excepte `PageResponse` (entries list)

### Frontend
- Tailwind v4: NO hi ha `tailwind.config.js`, config via `@theme inline` a `index.css`
- Radix UI Select NO suporta `value=""` — usar sentinels com `"all"`
- shadcn: `npx shadcn@latest add` crea a `frontend/@/` — copiar manualment a `src/components/ui/` i NO commitejar `@/`
- Toast library: Sonner — usar `!important` via prefix `!` de Tailwind per sobreescriure defaults

### Build & Deploy
- Build: `export JAVA_HOME="$HOME/jdk-21.0.10+7" && export PATH="$JAVA_HOME/bin:$PATH" && ./mvnw clean package -DskipTests`
- Commit: `git add ':!src/main/frontend/@/' ':!replace_toasts.py' -A && git commit -m "..."`
- BD neta: esborrar `workboard.db` manualment quan hi ha migracions noves

### UX
- Idioma: Català (ca-ES)
- "Ha de ser còmode d'utilitzar — si necessito entrar alguna cosa, que sigui super ràpid i còmode"
- "Es importantíssim que no esborri res i que guardi bé la informació"
- Criteri de qualitat per skills/llibreries: mínim 30K instal·lacions/estrelles
- L'usuari vol provar al FINAL quan estigui TOT — no cal demanar feedback intermedi

---

## Bugs Importants Resolts

### FB-048: UNIQUE constraint violation als tags
- **Problema**: `clearTags()` + `addTag()` sense flush entremig → JPA intenta inserir nous tags abans d'esborrar els antics
- **Solució**: `entryRepository.flush()` entre clear i insert a `EntryService.update()`

### Temporal Dead Zone a DailyView
- **Problema**: `const today` declarat després del seu ús → pantalla negra
- **Solució**: Moure declaració abans del seu ús

### SQLite no suporta ALTER COLUMN
- Necessita recrear taula per canviar tipus columna
