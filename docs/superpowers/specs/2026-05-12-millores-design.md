# Millores Design

## Goal

Definir la nova secció `Millores` com un mòdul específic dins Workboard per gestionar millores de producte i la seva única `Valoració` associada, preservant la intenció funcional documentada a `docs/project/IMPROVEMENTS.md` però aterrant-la sobre l'estat real del projecte actual perquè no trenqui els fluxos vigents de `Tasks`, `Notes`, `Actes`, `Versions` ni `Registre`.

## Source of truth and adaptation rule

- `docs/project/IMPROVEMENTS.md` és la font de veritat de la **intenció funcional**.
- L'estat actual del repo és la font de veritat del **punt de partida tècnic**.
- Si la documentació antiga suggereix encaixar la feature en una zona que avui faria regressar comportaments existents, s'ha de preservar la intenció funcional però adaptant la implementació.
- Per tant, `Millora` es manté com a **nou tipus d'input visible a l'usuari**, però tècnicament s'implementa com a **mòdul propi**, no com un nou `EntryType` dins del model actual d'`entries`.

---

## Why a dedicated module is the correct implementation

La documentació d'`Item 4` defineix un domini nou amb restriccions específiques que no encaixen bé dins del model genèric d'`entries` actual:

- `Millora` i `Valoració` són entitats separades
- `Millora` té com a màxim una sola `Valoració`
- `Valoració` té estats propis, percentatge manual propi, herència parcial i editor híbrid propi
- les tasks tècniques derivades només es referencien, no es converteixen en un tipus nou

En canvi, el model actual d'`entries` està optimitzat per `TASK`, `NOTE`, `MEETING_NOTE` i `REMINDER`, amb regles actuals que quedarien tensionades:

- `EntryType` està tancat a aquests quatre tipus
- la versió només es permet avui a `TASK`
- els filtres del registre són genèrics i no contemplen el domini de `Millores`
- `Actes` ja tenen editor i navegació pròpies, però continuen essent `entries`

Afegir `Millora` i `Valoració` com a nous `EntryType` faria més difícil mantenir netes les regles de negoci i multiplicaria els condicionals al backend i frontend. Per això la solució recomanada és:

- **domini propi** per a `Millora` i `Valoració`
- **integració explícita** amb `Versions`, `Tags` i `Tasks`
- **navegació pròpia** per a la secció `Millores`

---

## Functional scope

La nova secció ha de permetre:

- veure l'estat global de cada millora d'un cop d'ull
- centralitzar requisits, context, tags, versió i enllaços externs
- redactar i revisar la valoració dins una experiència d'edició còmoda
- conservar informació clau d'hores, percentatges i seguiment

La primera implementació ha de cobrir el flux mínim usable ja definit al document:

- llista de millores
- detall/resum
- creació de valoració
- lectura i edició de valoració

Els refinaments més fins d'estats, plantilles avançades i automatitzacions poden entrar per fases posteriors, però sense perdre la traça del conjunt de funcionalitats acordades.

---

## Domain model

### `Millora`

Entitat pare del mòdul.

#### Fields

- `id`
- `title`
- `requirements`
- `redmine_parent_ref`
- `priority`
- `due_date`
- `jira_ref`
- `version_id`
- `note_context`
- `note_risk_dependency`
- `note_observations`
- `sold_hours`
- `status`
- `completion_percentage`
- timestamps

#### Agreed rules

- `JIRA` és únic i opcional
- `completion_percentage` és manual
- `sold_hours` és manual
- la nota associada no és un blob lliure gran: s'estructura en tres camps curts
  - `Context`
  - `Risc / dependència`
  - `Observacions`

### `Valoració`

Entitat filla associada 1:1 a una `Millora`.

#### Fields

- `id`
- `improvement_id` (unique)
- `derived_title`
- `redmine_child_ref`
- `due_date`
- `status`
- `completion_percentage`
- `priority`
- `version_id`
- `textile_body`
- `structured_content_json`
- `analysis_hours`
- `total_estimated_hours`
- timestamps

#### Agreed rules

- només es pot crear des de la `Millora`
- només n'hi pot haver una per `Millora`
- el títol és automàtic, derivat de la `Millora` i no editable
- estat inicial = `No començada`
- percentatge inicial = `0`
- `version` és heretada i no editable
- `tags` són heretats i no editables
- `priority` és heretada inicialment però editable a la `Valoració`

### Relació amb tasques normals

Les tasques normals continuen existint com ara. No es redefiniran.

S'afegeix una relació opcional:

- una `TASK` es podrà relacionar amb una sola `Millora`
- aquesta relació és opcional
- la task continua sent una task normal del sistema actual

Per suportar-ho, l'`entry` actual guanyarà una FK nullable cap a `improvement`.

---

## Persistence design

### New tables

#### `improvement`

Taula principal per les millores pare.

Responsabilitats:

- guardar les dades funcionals visibles de la millora
- actuar com a root aggregate del mòdul
- exposar la relació amb `version`, `tags` i tasks vinculades

#### `improvement_valuation`

Taula filla única per la valoració.

Responsabilitats:

- persistir la valoració editable
- guardar tant el Textile final com l'estructura editable interna
- guardar les hores calculades/relevants visibles al resum

### Existing table extension

#### `entry`

Nova columna nullable:

- `improvement_id`

Responsabilitat:

- permetre que una `TASK` normal apunti opcionalment a una `Millora`

### Versions

No es crea cap model nou de versions.

Es reutilitza íntegrament la infraestructura existent:

- backend: `version` module
- frontend: `VersionsPage`, `useVersions`, tipus `Version`

### Tags

`Millora` i `Valoració` necessiten etiquetes, però sense rebentar el model actual.

La implementació podrà optar per:

- join tables específiques del mòdul
- o un patró relacional equivalent al que avui fan servir les entries

La decisió s'ha de prendre al pla tècnic segons el patró JPA més net del projecte, però funcionalment queda fixat que:

- `Millora` té tags propis
- `Valoració` hereta els tags de `Millora` i no els edita manualment

---

## Navigation and pages

La secció `Millores` entra com a secció pròpia al sidebar, no com a subsecció de `Configuració`.

### Main routes

- `/millores`
- `/millores/new`
- `/millores/:id`
- `/millores/:id/edit`
- `/millores/:id/valoracio`
- `/millores/:id/valoracio/edit`

### Main list

La llista principal mostra només les `Millores` pare.

No hi ha una secció principal separada de `Valoracions`.

La `Valoració` s'accedeix des de la fitxa de cada `Millora`.

### Improvement summary page

La vista resum de `Millora` ha de mostrar:

- requisits
- estat
- percentatge
- tags
- versió
- Redmines relacionats
- JIRA
- hores d'anàlisi
- hores totals valorades
- hores venudes
- tasques tècniques referenciades

#### Links and references

- Redmine i JIRA es mostren com `ID + enllaç clickable`
- les tasques referenciades mostren:
  - ID
  - títol
  - estat
  - enllaç

### Valuation pages

La `Valoració` segueix el patró conceptual de `Actes`:

- primer vista de lectura
- després entrada explícita a l'editor
- editor en pantalla partida amb editor + preview

---

## Creation flows

### Global create integration

La documentació diu que `Millora` ha d'aparèixer al desplegable de creació de nous inputs.

A nivell d'UX això es respecta així:

- al global create hi haurà una opció `Millora`
- aquesta opció no crearà una `entry`
- redirigirà al formulari de creació de `/millores/new`

Això preserva la intenció del producte sense forçar `Millora` dins `EntryType`.

### Improvement creation form

El formulari de `Millora` ha d'incloure:

- títol
- descripció / requisits
- Redmine ID pare
- prioritat
- due date
- JIRA
- versió
- tags
- hores venudes
- percentatge manual
- estat
- nota estructurada curta

### Valuation creation flow

La `Valoració` només es pot crear des de la `Millora`.

En crear-la, es demanarà com a mínim:

- ID Redmine fill
- due date propi
- prioritat inicial
- si hi ha afectació `DB`
- si hi ha `APIs`
- si hi ha `WEBs`
- llista inicial de subblocs `API`
- llista inicial de subblocs `WEB`

Aquest pas generarà l'estructura base de l'editor.

---

## Valuation editor

### UX intent

L'editor de `Valoració` no és un textarea Textile lliure. Ha de ser una experiència híbrida, propera a `ActaEditorPage`, però guiada.

### Shape

- pantalla partida
- barra de format al damunt
- zona d'edició a l'esquerra
- preview Textile a la dreta
- accions de guardar i copiar/exportar

### Internal model

L'editor guarda dues representacions:

- `structured_content_json`
- `textile_body`

### Guided blocks

Blocs fixos:

- `Anàlisi`
- `Resum de tasques`
- `Pre-anàlisi`
- `Valoració`

Blocs estructurals obligatoris:

- `DB`
- `APIs`
- `WEBs`

Regles:

- `DB` és bloc únic
- `APIs` pot tenir `N` subblocs
- `WEBs` pot tenir `N` subblocs
- si no aplica, s'ha de representar explícitament amb `_No aplica_` o `_Sense afectació_`

### Initial generated structure

El formulari inicial de creació ha de deixar l'editor amb una estructura usable des del minut zero:

- si `DB` no aplica, es crea igualment amb `_No aplica_`
- si `APIs` no aplica, es crea igualment amb `_No aplica_`
- si `WEBs` no aplica, es crea igualment amb `_No aplica_`
- si hi ha `APIs`, es creen els seus subblocs inicials
- si hi ha `WEBs`, es creen els seus subblocs inicials

### Textile template baseline

La primera plantilla de referència és la que ja documenta `IMPROVEMENTS.md`.

S'ha de preservar com a base funcional inicial, no com a simple exemple descartable.

---

## Automatic calculations

L'editor de `Valoració` ha d'ajudar amb el càlcul d'hores.

### Live calculation rules

- el càlcul és automàtic en viu
- no depèn d'un botó manual com a flux principal

### Required calculated outputs

- hores d'anàlisi
- subtotal de DB
- subtotal de cada API
- subtotal de cada WEB
- proves
- disseny
- gestió
- gestió + jiras
- seguiment
- total final

### Formula rules

- `Gestió = (Analisi + BO + APIs + WEBs + Proves) / 2`
- `Gestió + jiras = Gestió / 4`
- `Total = suma de tots els blocs finals aplicables`

### Scope note

La documentació marca encara tres punts a concretar més endavant:

- què és exactament `BO`
- com s'editen les línies individuals de cada API/WEB
- com es resolen arrodoniments i format final d'hores

Aquestes decisions s'han de tancar dins del pla d'implementació abans de picar la Fase 4, però no bloquegen la definició del mòdul.

---

## Templates

El sistema no ha de quedar lligat a una sola plantilla.

### Agreed template model

- hi haurà una plantilla global per defecte
- en crear una `Valoració` es podrà triar una altra plantilla
- el model és mixt:
  - default global
  - selecció puntual a la creació
- la gestió de plantilles es farà des de `Configuració`

### Migration rules

- les valoracions ja entregades es deixen com estan
- les valoracions en curs es poden migrar manualment
- no hi ha migració automàtica per defecte

---

## Status models

### `Millora` statuses

Ordre principal:

`Nova` → `En valoració` → `Valorada` → `Enviada a client` → `Aprovada` → `En desenvolupament` → `Validant` → `Pendent de revisió` → `Finalitzada` → `Pendent d'integrar` → `Integrada`

Regles:

- `Integrada` és terminal positiu
- `Bloquejada` i `Cancel·lada` són estats especials accessibles des de qualsevol estat no terminal
- en sortir de `Bloquejada`, la `Millora` ha de tornar a l'últim estat actiu anterior
- `Cancel·lada` és terminal

### `Valoració` statuses

Ordre principal:

`No començada` → `En curs` → `Per revisar` → `Revisada` → `Enviada` → `Tancada`

Branques:

- `Per revisar` → `Pendent de canvis`
- `Pendent de canvis` → `En curs` o `Revisada`

Regles:

- `Tancada` és terminal positiu
- `Bloquejada` i `Cancel·lada` són estats especials accessibles des de qualsevol estat no terminal
- en sortir de `Bloquejada`, la `Valoració` ha de tornar a l'últim estat actiu anterior
- `Cancel·lada` és terminal

---

## Search and filters

La llista de `Millores` ha de suportar com a mínim:

- text lliure global
- estat
- prioritat
- versió
- tags
- due date / temporalitat
- té valoració / no té valoració
- percentatge

No cal un filtre específic inicial per JIRA o Redmine si el cercador global ja els cobreix bé.

---

## API shape

El mòdul exposa API pròpia sota `/api/v1/improvements`.

### Core endpoints

- `GET /api/v1/improvements`
- `POST /api/v1/improvements`
- `GET /api/v1/improvements/{id}`
- `PATCH /api/v1/improvements/{id}`
- `DELETE /api/v1/improvements/{id}`

### Valuation endpoints

- `POST /api/v1/improvements/{id}/valuation`
- `GET /api/v1/improvements/{id}/valuation`
- `PATCH /api/v1/improvements/{id}/valuation`

### Linked tasks endpoint

- `GET /api/v1/improvements/{id}/entries`

### Core business constraints

- no es pot crear una segona `Valoració`
- la `Valoració` no es pot crear sense `Millora`
- el títol derivat de `Valoració` no és editable
- les `TASK` relacionades continuen essent tasks normals

---

## Implementation phases

### Phase 1 — Domain, persistence and API

- models `Millora` i `Valoració`
- migracions Flyway
- relació opcional des de `TASK`
- enums/statusos
- CRUD base i contractes API

### Phase 2 — Usable Millores section

- sidebar + rutes
- nova acció `Millora` al global create
- formulari de `Millora`
- llista principal
- resum/detall de `Millora`
- creació de `Valoració`
- lectura de `Valoració`

### Phase 3 — Hybrid valuation editor

- editor en pantalla partida
- blocs guiats
- subblocs `API` / `WEB`
- persistència doble (`json` + `textile`)
- còpia/exportació usable a Redmine

### Phase 4 — Calculations, templates and refinements

- càlculs automàtics en viu
- plantilla global per defecte
- selecció de plantilla en crear
- configuració de plantilles
- refinaments d'estats i UX

---

## Candidate implementation zones

### Backend

- nous paquets `improvement` i `improvement/valuation`
- `src/main/resources/db/migration/*`
- `src/main/java/com/workboard/entry/EntryEntity.java`
- `src/main/java/com/workboard/entry/EntryService.java`
- `src/main/java/com/workboard/entry/CreateEntryRequest.java`
- `src/main/java/com/workboard/entry/UpdateEntryRequest.java`

### Frontend

- `src/main/frontend/src/config/navigation.tsx`
- global create flow actual
- noves pàgines i components de `Millores`
- `src/main/frontend/src/pages/ActesPage.tsx` (patró de llista)
- `src/main/frontend/src/pages/ActaViewPage.tsx` (patró de lectura)
- `src/main/frontend/src/pages/ActaEditorPage.tsx` (patró d'editor)
- `src/main/frontend/src/pages/ConfigPage.tsx` (plantilles en futures fases)
- `src/main/frontend/src/types/index.ts`

---

## Validation guidance

La validació final ha de cobrir com a mínim:

- verificació funcional completa front + back
- comprovació de persistència correcta dels nous tipus i camps
- proves del flux `llista -> lectura -> editar`
- proves del percentatge manual
- proves de la relació opcional entre task normal i `Millora`
- comprovació que la còpia/exportació a Redmine és usable de veritat

## Final review requirement

Abans de donar la feature per tancada, s'ha de rellegir sencera la part d'`Item 4` de `docs/project/IMPROVEMENTS.md` i validar explícitament que no s'ha deixat cap funcionalitat acordada fora de l'abast final implementat.
